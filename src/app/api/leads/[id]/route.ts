import { NextResponse } from 'next/server';
import { createLead, getLeadsByListingId } from '@/lib/leads';
import { trackListingEvent } from '@/lib/listingAnalytics';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
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
  };

  if (!payload.name || !payload.email || !payload.message) {
    return NextResponse.json({ error: 'Chybí povinné údaje.' }, { status: 400 });
  }

  const lead = await createLead({
    listingId: resolvedParams.id,
    name: payload.name.trim(),
    email: payload.email.trim(),
    phone: payload.phone?.trim() || '',
    message: payload.message.trim(),
  });

  await trackListingEvent(resolvedParams.id, 'lead_submit');

  return NextResponse.json({ ok: true, lead });
}
