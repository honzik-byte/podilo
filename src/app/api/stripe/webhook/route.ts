import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { activatePromotionFromSession } from '@/lib/promotionActivation';
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

    console.info('[StripePromotion] Webhook received', {
      eventType: event.type,
      eventId: event.id,
    });

    if (
      event.type === 'checkout.session.completed' ||
      event.type === 'checkout.session.async_payment_succeeded'
    ) {
      const session = event.data.object as Stripe.Checkout.Session;

      console.info('[StripePromotion] Webhook session metadata', {
        eventType: event.type,
        sessionId: session.id,
        listingId: session.metadata?.listing_id || session.client_reference_id,
        promotionType: session.metadata?.promotion_type || session.metadata?.plan_id,
        metadata: session.metadata,
      });

      await activatePromotionFromSession(session);
    } else {
      console.info('[StripePromotion] Webhook event ignored', {
        eventType: event.type,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[StripePromotion] Webhook processing failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook se nepodařilo zpracovat.' },
      { status: 400 }
    );
  }
}
