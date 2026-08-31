import { NextResponse } from 'next/server';
import { canAccessListingPrivateData } from '@/lib/apiAuth';
import { countRecentLeadsByIp, createLead, getLeadsByListingId, isLeadIpRateLimited, notifyListingOwnerOfLead } from '@/lib/leads';
import { trackListingEvent } from '@/lib/listingAnalytics';
import { isValidEmail, isValidListingPhone } from '@/lib/listingFormValidation';
import { checkInMemoryRateLimit, getClientIp } from '@/lib/rateLimit';

const MAX_NAME_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 4000;
const MAX_PHONE_LENGTH = 20;

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const access = await canAccessListingPrivateData(request, resolvedParams.id);

  if (!access.allowed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const leads = await getLeadsByListingId(resolvedParams.id);
  return NextResponse.json({
    count: leads.length,
    leads,
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const payload = (await request.json()) as {
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
    website?: string; // honeypot: real users never fill this hidden field
  };

  // Bots that blindly fill every field trip the honeypot; pretend success so they don't retry.
  if (payload.website) {
    return NextResponse.json({ ok: true });
  }

  const name = (payload.name || '').trim();
  const email = (payload.email || '').trim();
  const phone = (payload.phone || '').trim();
  const message = (payload.message || '').trim();

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Chybí povinné údaje.' }, { status: 400 });
  }

  if (name.length > MAX_NAME_LENGTH || message.length > MAX_MESSAGE_LENGTH || phone.length > MAX_PHONE_LENGTH) {
    return NextResponse.json({ error: 'Některé pole je příliš dlouhé.' }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Zadejte platný e-mail.' }, { status: 400 });
  }

  if (phone && !isValidListingPhone(phone)) {
    return NextResponse.json({ error: 'Telefon zadejte v platném formátu.' }, { status: 400 });
  }

  const clientIp = getClientIp(request);

  if (!checkInMemoryRateLimit(`lead:${clientIp}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Příliš mnoho poptávek, zkuste to prosím později.' }, { status: 429 });
  }

  const recentLeadCount = await countRecentLeadsByIp(clientIp);
  if (isLeadIpRateLimited(recentLeadCount)) {
    return NextResponse.json({ error: 'Příliš mnoho poptávek, zkuste to prosím později.' }, { status: 429 });
  }

  const lead = await createLead({
    listingId: resolvedParams.id,
    name,
    email,
    phone,
    message,
    ipAddress: clientIp,
  });

  await trackListingEvent(resolvedParams.id, 'lead_submit');

  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  await notifyListingOwnerOfLead({
    listingId: resolvedParams.id,
    leadName: name,
    leadEmail: email,
    leadPhone: phone,
    leadMessage: message,
    origin,
  });

  return NextResponse.json({ ok: true, lead });
}
