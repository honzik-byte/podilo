import 'server-only';

import { createServerSupabaseAdmin } from '@/lib/serverSupabase';
import { isDatabaseListingId } from '@/lib/listingIds';

export interface LeadRecord {
  id: string;
  listingId: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  created_at: string;
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

export async function createLead(input: Omit<LeadRecord, 'id' | 'created_at'>) {
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
