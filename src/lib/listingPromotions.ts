import 'server-only';

import { createServerSupabaseAdmin } from '@/lib/serverSupabase';
import type { PromotionPlanId } from '@/lib/promotionPlans';

interface UpsertPromotionInput {
  listingId: string;
  userId?: string | null;
  stripeSessionId: string;
  stripePaymentIntentId?: string | null;
  stripeEventId?: string | null;
  promotionType: PromotionPlanId;
  status: 'pending' | 'active' | 'expired' | 'failed' | 'refunded' | 'chargeback';
  amountCzk?: number | null;
  startsAt?: string | null;
  endsAt?: string | null;
  paidAt?: string | null;
  failureReason?: string | null;
  metadata?: Record<string, unknown>;
}

export async function upsertListingPromotion(input: UpsertPromotionInput) {
  const adminClient = createServerSupabaseAdmin();
  const payload = {
    listing_id: input.listingId,
    user_id: input.userId || null,
    stripe_session_id: input.stripeSessionId,
    stripe_payment_intent_id: input.stripePaymentIntentId || null,
    stripe_event_id: input.stripeEventId || null,
    promotion_type: input.promotionType,
    status: input.status,
    amount_czk: input.amountCzk || null,
    starts_at: input.startsAt || null,
    ends_at: input.endsAt || null,
    paid_at: input.paidAt || null,
    failure_reason: input.failureReason || null,
    metadata: input.metadata || {},
  };

  const { data, error } = await adminClient
    .from('listing_promotions')
    .upsert(payload, { onConflict: 'stripe_session_id' })
    .select()
    .single();

  if (error) {
    console.error('[ListingPromotion] Failed to upsert promotion', { payload, error });
    return null;
  }

  return data;
}

export async function getAdminPromotionSnapshot() {
  const adminClient = createServerSupabaseAdmin();
  const [{ data: promotions, error: promotionsError }, { data: paymentEvents, error: eventsError }] = await Promise.all([
    adminClient
      .from('listing_promotions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30),
    adminClient
      .from('payment_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30),
  ]);

  if (promotionsError) {
    console.error('[ListingPromotion] Failed to load promotions for admin', promotionsError);
  }

  if (eventsError) {
    console.error('[ListingPromotion] Failed to load payment events for admin', eventsError);
  }

  return {
    promotions: promotions || [],
    paymentEvents: paymentEvents || [],
  };
}
