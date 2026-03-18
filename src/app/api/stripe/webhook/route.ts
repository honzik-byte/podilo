import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { createAuditLog } from '@/lib/auditLogs';
import { reportError } from '@/lib/errorReporting';
import { activatePromotionFromSession } from '@/lib/promotionActivation';
import { recordPaymentEvent } from '@/lib/paymentEvents';
import { upsertListingPromotion } from '@/lib/listingPromotions';
import { createServerSupabaseAdmin } from '@/lib/serverSupabase';
import { getStripeClient } from '@/lib/stripeServer';

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    console.error('[StripePromotion] Webhook rejected before verification', {
      hasSignature: Boolean(signature),
      hasWebhookSecret: Boolean(webhookSecret),
    });
    return NextResponse.json(
      { error: 'Chybí stripe-signature nebo STRIPE_WEBHOOK_SECRET.' },
      { status: 400 }
    );
  }

  try {
    const stripe = getStripeClient();
    const body = await request.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    const adminClient = createServerSupabaseAdmin();
    const session = event.data.object as Stripe.Checkout.Session;
    const listingId = session?.metadata?.listing_id || session?.client_reference_id || null;
    const promotionType = session?.metadata?.promotion_type || session?.metadata?.plan_id || null;

    console.info('[StripePromotion] Webhook received', {
      eventType: event.type,
      eventId: event.id,
    });

    await recordPaymentEvent({
      stripeEventId: event.id,
      eventType: event.type,
      objectId: 'id' in event.data.object ? String(event.data.object.id) : null,
      listingId,
      payload: {
        livemode: event.livemode,
        type: event.type,
      },
    });

    if (
      event.type === 'checkout.session.completed' ||
      event.type === 'checkout.session.async_payment_succeeded'
    ) {
      console.info('[StripePromotion] Webhook session metadata', {
        eventType: event.type,
        sessionId: session.id,
        listingId,
        promotionType,
        metadata: session.metadata,
      });

      await activatePromotionFromSession(session);
    } else if (event.type === 'checkout.session.expired') {
      if (listingId && promotionType) {
        await upsertListingPromotion({
          listingId,
          userId: session?.metadata?.user_id || null,
          stripeSessionId: session.id,
          stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : null,
          stripeEventId: event.id,
          promotionType: promotionType as 'top' | 'highlighted' | 'combo',
          status: 'failed',
          failureReason: 'checkout_session_expired',
          metadata: session.metadata || {},
        });
      }
    } else if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const { data: existingPromotion } = await adminClient
        .from('listing_promotions')
        .select('id, listing_id, stripe_session_id, metadata')
        .eq('stripe_payment_intent_id', paymentIntent.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingPromotion) {
        await adminClient
          .from('listing_promotions')
          .update({
            status: 'failed',
            failure_reason: paymentIntent.last_payment_error?.message || 'payment_intent.payment_failed',
            stripe_event_id: event.id,
            metadata: {
              ...(existingPromotion.metadata || {}),
              last_payment_error: paymentIntent.last_payment_error?.message || null,
            },
          })
          .eq('id', existingPromotion.id);

        await createAuditLog({
          entityType: 'payment',
          entityId: paymentIntent.id,
          action: 'payment_intent.payment_failed',
          payload: {
            eventId: event.id,
            listingId: existingPromotion.listing_id,
            lastPaymentError: paymentIntent.last_payment_error?.message || null,
          },
        });
      }
    } else if (event.type === 'charge.refunded' || event.type === 'charge.dispute.created') {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : null;

      if (paymentIntentId) {
        const { data: existingPromotion } = await adminClient
          .from('listing_promotions')
          .select('id, listing_id, promotion_type, metadata')
          .eq('stripe_payment_intent_id', paymentIntentId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existingPromotion) {
          await adminClient
            .from('listing_promotions')
            .update({
              status: event.type === 'charge.refunded' ? 'refunded' : 'chargeback',
              failure_reason: event.type,
              stripe_event_id: event.id,
              metadata: {
                ...(existingPromotion.metadata || {}),
                amount_refunded: charge.amount_refunded,
              },
            })
            .eq('id', existingPromotion.id);

          if (event.type === 'charge.refunded' || event.type === 'charge.dispute.created') {
            const resetPayload: Record<string, boolean | null | string> = {};

            if (existingPromotion.promotion_type === 'top' || existingPromotion.promotion_type === 'combo') {
              resetPayload.is_top = false;
              resetPayload.top_until = null;
            }

            if (existingPromotion.promotion_type === 'highlighted' || existingPromotion.promotion_type === 'combo') {
              resetPayload.is_highlighted = false;
              resetPayload.highlighted_until = null;
            }

            if (Object.keys(resetPayload).length > 0) {
              await adminClient.from('listings').update(resetPayload).eq('id', existingPromotion.listing_id);
            }
          }
        }
      }

      await createAuditLog({
        entityType: 'payment',
        entityId: paymentIntentId || event.id,
        action: event.type,
        payload: {
          eventId: event.id,
          amountRefunded: 'amount_refunded' in charge ? charge.amount_refunded : null,
        },
      });
    } else {
      console.info('[StripePromotion] Webhook event ignored', {
        eventType: event.type,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[StripePromotion] Webhook processing failed', error);
    await reportError({
      source: 'stripe_webhook',
      message: error instanceof Error ? error.message : 'Webhook processing failed',
      severity: 'critical',
      context: {
        path: '/api/stripe/webhook',
      },
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook se nepodařilo zpracovat.' },
      { status: 400 }
    );
  }
}
