import type Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createAuditLog } from '@/lib/auditLogs';
import { reportError } from '@/lib/errorReporting';
import { upsertListingPromotion } from '@/lib/listingPromotions';
import { enqueueNotificationJob } from '@/lib/notificationJobs';
import { getPromotionPlan } from '@/lib/promotionPlans';
import { createServerSupabaseAdmin, hasServerSupabaseServiceRole } from '@/lib/serverSupabase';

interface ActivatePromotionOptions {
  listingClient?: SupabaseClient;
  skipOps?: boolean;
}

function getPromotionContext(session: Stripe.Checkout.Session) {
  const listingId = session.metadata?.listing_id || session.client_reference_id;
  const promotionType = session.metadata?.promotion_type || session.metadata?.plan_id;
  const plan = getPromotionPlan(promotionType);

  if (session.payment_status !== 'paid' || !listingId || !plan) {
    throw new Error('Platba není potvrzená nebo chybí metadata k inzerátu.');
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

  return {
    listingId,
    plan,
    activatedAt,
    expiresAt,
    expiresAtIso,
    paidAtIso,
    updatePayload,
  };
}

async function recordPromotionOps(
  session: Stripe.Checkout.Session,
  listing: { id: string; title: string },
  plan: NonNullable<ReturnType<typeof getPromotionPlan>>,
  activatedAt: Date,
  expiresAtIso: string,
  paidAtIso: string,
  updatePayload: {
    is_top: boolean;
    is_highlighted: boolean;
    top_until: string | null;
    highlighted_until: string | null;
  },
  skipOps?: boolean
) {
  const allowOps = !skipOps && hasServerSupabaseServiceRole();
  let promotionRecord: Awaited<ReturnType<typeof upsertListingPromotion>> | null = null;

  if (allowOps) {
    promotionRecord = await upsertListingPromotion({
      listingId: listing.id,
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
      entityId: listing.id,
      action: 'promotion_activated',
      payload: {
        sessionId: session.id,
        promotionType: plan.id,
        promotionId: promotionRecord?.id || null,
        updatePayload,
      },
    });
  }

  const recipientEmail = session.customer_details?.email;

  if (recipientEmail && allowOps) {
    await enqueueNotificationJob({
      type: 'promotion_activated',
      userId: session.metadata?.user_id || null,
      listingId: listing.id,
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
      listingId: listing.id,
      recipientEmail,
      subject: `Zvýraznění brzy končí: ${listing.title}`,
      payload: {
        listingTitle: listing.title,
        endsAt: expiresAtIso,
        ctaUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://podilo.cz'}/cenik?listing=${listing.id}`,
      },
      sendAt: new Date(new Date(expiresAtIso).getTime() - 24 * 60 * 60 * 1000).toISOString(),
    });

    await enqueueNotificationJob({
      type: 'promotion_expired',
      userId: session.metadata?.user_id || null,
      listingId: listing.id,
      recipientEmail,
      subject: `Zvýšení viditelnosti skončilo: ${listing.title}`,
      payload: {
        listingTitle: listing.title,
        endsAt: expiresAtIso,
        ctaUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://podilo.cz'}/cenik?listing=${listing.id}`,
      },
      sendAt: expiresAtIso,
    });
  }

  return { allowOps, promotionRecord };
}

export async function activatePromotionFromSession(
  session: Stripe.Checkout.Session,
  options: ActivatePromotionOptions = {}
) {
  const { listingId, plan, activatedAt, expiresAtIso, paidAtIso, updatePayload } = getPromotionContext(session);

  console.info('[StripePromotion] Activating promotion from session', {
    sessionId: session.id,
    eventPaymentStatus: session.payment_status,
    listingId,
    promotionType: plan.id,
    metadata: session.metadata,
  });

  const adminClient = createServerSupabaseAdmin();
  const listingClient = options.listingClient || adminClient;
  const { data: listing, error: listingError } = await listingClient
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

  const { error: updateError } = await listingClient
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

  const { allowOps } = await recordPromotionOps(
    session,
    { id: listing.id, title: listing.title },
    plan,
    activatedAt,
    expiresAtIso,
    paidAtIso,
    updatePayload,
    options.skipOps
  );

  console.info('[StripePromotion] Supabase promotion update succeeded', {
    sessionId: session.id,
    listingId,
    updatePayload,
    listingTitle: listing.title,
    allowOps,
  });

  return {
    listingId,
    listingTitle: listing.title,
    plan,
    expiresAt: expiresAtIso,
  };
}

export async function activatePromotionWithUserAccessToken(
  session: Stripe.Checkout.Session,
  accessToken: string
) {
  const { listingId, plan, activatedAt, expiresAtIso, paidAtIso, updatePayload } = getPromotionContext(session);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error('Chybí Supabase konfigurace v prostředí.');
  }

  const commonHeaders = {
    apikey: anonKey,
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  const listingResponse = await fetch(
    `${supabaseUrl}/rest/v1/listings?id=eq.${listingId}&select=id,title,user_id`,
    {
      headers: commonHeaders,
      cache: 'no-store',
    }
  );

  const listingRows = listingResponse.ok ? ((await listingResponse.json()) as Array<{ id: string; title: string; user_id: string | null }>) : [];
  const listing = listingRows[0];

  if (!listingResponse.ok || !listing) {
    const text = await listingResponse.text().catch(() => '');
    await reportError({
      source: 'promotion_activation_rest',
      message: 'Listing lookup failed via REST fallback',
      context: {
        sessionId: session.id,
        listingId,
        status: listingResponse.status,
        body: text,
      },
    });
    throw new Error('Nepodařilo se ověřit inzerát pro aktivaci propagace.');
  }

  const updateResponse = await fetch(`${supabaseUrl}/rest/v1/listings?id=eq.${listingId}`, {
    method: 'PATCH',
    headers: {
      ...commonHeaders,
      Prefer: 'return=representation',
    },
    body: JSON.stringify(updatePayload),
  });

  if (!updateResponse.ok) {
    const text = await updateResponse.text().catch(() => '');
    await reportError({
      source: 'promotion_activation_rest',
      message: 'Listing promotion update failed via REST fallback',
      context: {
        sessionId: session.id,
        listingId,
        updatePayload,
        status: updateResponse.status,
        body: text,
      },
    });
    throw new Error(`Aktivace propagace selhala: ${text || updateResponse.statusText}`);
  }

  const { allowOps } = await recordPromotionOps(
    session,
    { id: listing.id, title: listing.title },
    plan,
    activatedAt,
    expiresAtIso,
    paidAtIso,
    updatePayload
  );

  console.info('[StripePromotion] REST fallback promotion update succeeded', {
    sessionId: session.id,
    listingId,
    updatePayload,
    allowOps,
  });

  return {
    listingId,
    listingTitle: listing.title,
    plan,
    expiresAt: expiresAtIso,
  };
}
