import 'server-only';

import { createServerSupabaseAdmin } from '@/lib/serverSupabase';

interface PaymentEventInput {
  stripeEventId: string;
  eventType: string;
  objectId?: string | null;
  listingId?: string | null;
  promotionId?: string | null;
  payload?: Record<string, unknown>;
}

export async function recordPaymentEvent(input: PaymentEventInput) {
  try {
    const adminClient = createServerSupabaseAdmin();
    const { error } = await adminClient.from('payment_events').upsert({
      stripe_event_id: input.stripeEventId,
      event_type: input.eventType,
      object_id: input.objectId || null,
      listing_id: input.listingId || null,
      promotion_id: input.promotionId || null,
      payload: input.payload || {},
    }, { onConflict: 'stripe_event_id' });

    if (error) {
      console.error('[PaymentEvent] Failed to persist payment event', { input, error });
    }
  } catch (error) {
    console.error('[PaymentEvent] Unexpected failure', { input, error });
  }
}

export async function getRecentPaymentEvents(limit = 25) {
  const adminClient = createServerSupabaseAdmin();
  const { data, error } = await adminClient
    .from('payment_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[PaymentEvent] Failed to load recent payment events', error);
    return [];
  }

  return data || [];
}
