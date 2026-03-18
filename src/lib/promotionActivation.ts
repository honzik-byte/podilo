import type Stripe from 'stripe';
import { createAuditLog } from '@/lib/auditLogs';
import { reportError } from '@/lib/errorReporting';
import { upsertListingPromotion } from '@/lib/listingPromotions';
import { enqueueNotificationJob } from '@/lib/notificationJobs';
import { getPromotionPlan } from '@/lib/promotionPlans';
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
    await reportError({
      source: 'promotion_activation',
      message: 'Listing lookup failed during promotion activation',
      context: {
        sessionId: session.id,
        listingId,
        error: listingError?.message || null,
      },
    });
    throw new Error('Nepodařilo se dohledat inzerát pro aktivaci zvýraznění.');
  }

  const activatedAt = new Date();
  const expiresAt = new Date(activatedAt.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
  const expiresAtIso = expiresAt.toISOString();
  const paidAtIso =
    typeof session.created === 'number'
      ? new Date(session.created * 1000).toISOString()
      : activatedAt.toISOString();
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
    await reportError({
      source: 'promotion_activation',
      message: updateError.message,
      context: {
        sessionId: session.id,
        listingId,
        updatePayload,
      },
    });
    throw new Error(updateError.message);
  }

  const promotionRecord = await upsertListingPromotion({
    listingId,
    userId: session.metadata?.user_id || null,
    stripeSessionId: session.id,
    stripePaymentIntentId:
      typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id || null,
    promotionType: plan.id,
    status: 'active',
    amountCzk: typeof session.amount_total === 'number' ? Math.round(session.amount_total / 100) : null,
    startsAt: activatedAt.toISOString(),
    endsAt: expiresAtIso,
    paidAt: paidAtIso,
    metadata: session.metadata || {},
  });

  await createAuditLog({
    actorUserId: session.metadata?.user_id || null,
    entityType: 'listing',
    entityId: listingId,
    action: 'promotion_activated',
    payload: {
      sessionId: session.id,
      promotionType: plan.id,
      promotionId: promotionRecord?.id || null,
      updatePayload,
    },
  });

  const recipientEmail = session.customer_details?.email;

  if (recipientEmail) {
    await enqueueNotificationJob({
      type: 'promotion_activated',
      userId: session.metadata?.user_id || null,
      listingId,
      recipientEmail,
      subject: `Zvýšení viditelnosti je aktivní: ${listing.title}`,
      payload: {
        listingTitle: listing.title,
        endsAt: expiresAtIso,
        ctaUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://podilo.cz'}/my-listings`,
      },
    });

    await enqueueNotificationJob({
      type: 'promotion_expiring',
      userId: session.metadata?.user_id || null,
      listingId,
      recipientEmail,
      subject: `Zvýraznění brzy končí: ${listing.title}`,
      payload: {
        listingTitle: listing.title,
        endsAt: expiresAtIso,
        ctaUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://podilo.cz'}/cenik?listing=${listingId}`,
      },
      sendAt: new Date(expiresAt.getTime() - 24 * 60 * 60 * 1000).toISOString(),
    });

    await enqueueNotificationJob({
      type: 'promotion_expired',
      userId: session.metadata?.user_id || null,
      listingId,
      recipientEmail,
      subject: `Zvýšení viditelnosti skončilo: ${listing.title}`,
      payload: {
        listingTitle: listing.title,
        endsAt: expiresAtIso,
        ctaUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://podilo.cz'}/cenik?listing=${listingId}`,
      },
      sendAt: expiresAtIso,
    });
  }

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
