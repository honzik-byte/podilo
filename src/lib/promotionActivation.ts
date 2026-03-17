import type Stripe from 'stripe';
import { getPromotionPlan } from '@/lib/promotionPlans';
import { upsertPromotionExpiration } from '@/lib/promotionExpirations';
import { createServerSupabaseAdmin } from '@/lib/serverSupabase';

export async function activatePromotionFromSession(session: Stripe.Checkout.Session) {
  const listingId = session.metadata?.listing_id;
  const plan = getPromotionPlan(session.metadata?.plan_id);

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
    throw new Error('Nepodařilo se dohledat inzerát pro aktivaci zvýraznění.');
  }

  const { error: updateError } = await adminClient
    .from('listings')
    .update({
      is_top: plan.apply.is_top,
      is_highlighted: plan.apply.is_highlighted,
      updated_at: new Date().toISOString(),
    })
    .eq('id', listingId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  const activatedAt = new Date();
  const expiresAt = new Date(activatedAt.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

  await upsertPromotionExpiration({
    listingId,
    planId: plan.id,
    stripeSessionId: session.id,
    activatedAt: activatedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  });

  return {
    listingId,
    listingTitle: listing.title,
    plan,
    expiresAt: expiresAt.toISOString(),
  };
}
