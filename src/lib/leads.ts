import 'server-only';

import { renderLeadNotificationEmail, sendEmail } from '@/lib/emailNotifications';
import { reportError } from '@/lib/errorReporting';
import { createServerSupabaseAdmin } from '@/lib/serverSupabase';
import { isDatabaseListingId } from '@/lib/listingIds';

const SUPPORT_EMAIL = 'podpora@podilo.cz';

export interface LeadRecord {
  id: string;
  listingId: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  created_at: string;
}

const LEAD_IP_WINDOW_MINUTES = 10;
const LEAD_IP_LIMIT = 5;

export async function countRecentLeadsByIp(ipAddress: string) {
  if (!ipAddress || ipAddress === 'unknown') {
    return 0;
  }

  const adminClient = createServerSupabaseAdmin();
  const since = new Date(Date.now() - LEAD_IP_WINDOW_MINUTES * 60 * 1000).toISOString();

  const { count, error } = await adminClient
    .from('listing_leads')
    .select('id', { count: 'exact', head: true })
    .eq('ip_address', ipAddress)
    .gte('created_at', since);

  if (error) {
    console.error('[Leads] Failed to count recent leads by IP', { ipAddress, error });
    return 0;
  }

  return count || 0;
}

export function isLeadIpRateLimited(recentCount: number) {
  return recentCount >= LEAD_IP_LIMIT;
}

export async function getLeadsByListingId(listingId: string) {
  if (!isDatabaseListingId(listingId)) {
    return [];
  }

  const adminClient = createServerSupabaseAdmin();
  const { data, error } = await adminClient
    .from('listing_leads')
    .select('*')
    .eq('listing_id', listingId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Leads] Failed to load listing leads', { listingId, error });
    return [];
  }

  return (data || []).map((lead) => ({
    id: lead.id,
    listingId: lead.listing_id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone || '',
    message: lead.message,
    created_at: lead.created_at,
  }));
}

export async function createLead(input: Omit<LeadRecord, 'id' | 'created_at'> & { ipAddress?: string }) {
  if (!isDatabaseListingId(input.listingId)) {
    throw new Error('Lead lze uložit jen k databázovému inzerátu.');
  }

  const adminClient = createServerSupabaseAdmin();
  const { data, error } = await adminClient
    .from('listing_leads')
    .insert({
      listing_id: input.listingId,
      name: input.name,
      email: input.email,
      phone: input.phone || null,
      message: input.message,
      ip_address: input.ipAddress || null,
    })
    .select()
    .single();

  if (error || !data) {
    console.error('[Leads] Failed to create lead', { input, error });
    throw new Error(error?.message || 'Lead se nepodařilo uložit.');
  }

  return {
    id: data.id,
    listingId: data.listing_id,
    name: data.name,
    email: data.email,
    phone: data.phone || '',
    message: data.message,
    created_at: data.created_at,
  };
}

export async function notifyListingOwnerOfLead(input: {
  listingId: string;
  leadName: string;
  leadEmail: string;
  leadPhone?: string;
  leadMessage: string;
  origin: string;
}) {
  const adminClient = createServerSupabaseAdmin();
  const { data: listing, error } = await adminClient
    .from('listings')
    .select('title, user_id')
    .eq('id', input.listingId)
    .maybeSingle();

  if (error || !listing) {
    console.error('[Leads] Failed to load listing for lead notification', { listingId: input.listingId, error });
    return;
  }

  let recipientEmail = SUPPORT_EMAIL;

  if (listing.user_id) {
    const { data: userData, error: userError } = await adminClient.auth.admin.getUserById(listing.user_id);
    if (!userError && userData?.user?.email) {
      recipientEmail = userData.user.email;
    }
  }

  const html = renderLeadNotificationEmail({
    listingTitle: listing.title,
    leadName: input.leadName,
    leadEmail: input.leadEmail,
    leadPhone: input.leadPhone,
    leadMessage: input.leadMessage,
    listingUrl: `${input.origin}/listings/${input.listingId}`,
  });

  try {
    await sendEmail({
      to: recipientEmail,
      subject: `Nová poptávka k inzerátu: ${listing.title}`,
      html,
    });
  } catch (sendError) {
    console.error('[Leads] Failed to send lead notification email', { listingId: input.listingId, error: sendError });
    await reportError({
      source: 'lead_notification',
      message: sendError instanceof Error ? sendError.message : 'Unknown email failure',
      severity: 'warning',
      context: { listingId: input.listingId },
    });
  }
}
