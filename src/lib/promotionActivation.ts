import type Stripe from 'stripe';
import { getPromotionPlan } from '@/lib/promotionPlans';
import { upsertPromotionExpiration } from '@/lib/promotionExpirations';
import { createServerSupabaseAdmin } from '@/lib/serverSupabase';

export async function activatePromotionFromSession(session: Stripe.Checkout.Session) {
  const listingId = session.metadata?.listing_id || session.client_reference_id;
  const promotionType = session.metadata?.promotion_type || session.metadata?.plan_id;
  const plan = getPromotionPlan(promotionType);

  console.info('[StripePromotion] Activating promotion from session', {
    sessionId: session.id,
    eventPaymentStatus: session.payment_status,
    listingId,
    promotionType,
    metadata: session.metadata,
  });

  if (session.payment_status !== 'paid' || !listingId || !plan) {
    throw new Error('Platba není potvrzená nebo chybí metadata k inzerátu.');
  }

  const adminClient = createServerSupabaseAdmin();
  const { data: listing, error: listingError } = await adminClient
    .from('listings')
    .select('id, title')
    .eq('id', listingId)
    .single();

  if (listingError || !listing) {
    console.error('[StripePromotion] Listing lookup failed', {
      sessionId: session.id,
      listingId,
      error: listingError,
    });
    throw new Error('Nepodařilo se dohledat inzerát pro aktivaci zvýraznění.');
  }

  const activatedAt = new Date();
  const expiresAt = new Date(activatedAt.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
  const expiresAtIso = expiresAt.toISOString();
  const updatePayload = {
    is_top: plan.apply.is_top,
    is_highlighted: plan.apply.is_highlighted,
    top_until: plan.apply.is_top ? expiresAtIso : null,
    highlighted_until: plan.apply.is_highlighted ? expiresAtIso : null,
  };

  const { error: updateError } = await adminClient
    .from('listings')
    .update({
      ...updatePayload,
    })
    .eq('id', listingId);

  if (updateError) {
    console.error('[StripePromotion] Supabase promotion update failed', {
      sessionId: session.id,
      listingId,
      updatePayload,
      error: updateError,
    });
    throw new Error(updateError.message);
  }

  await upsertPromotionExpiration({
    listingId,
    planId: plan.id,
    stripeSessionId: session.id,
    activatedAt: activatedAt.toISOString(),
    expiresAt: expiresAtIso,
  });

  console.info('[StripePromotion] Supabase promotion update succeeded', {
    sessionId: session.id,
    listingId,
    updatePayload,
    listingTitle: listing.title,
  });

  return {
    listingId,
    listingTitle: listing.title,
    plan,
    expiresAt: expiresAtIso,
  };
}
