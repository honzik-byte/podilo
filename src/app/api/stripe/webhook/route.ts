import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { activatePromotionFromSession } from '@/lib/promotionActivation';
import { getStripeClient } from '@/lib/stripeServer';

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: 'Chybí stripe-signature nebo STRIPE_WEBHOOK_SECRET.' },
      { status: 400 }
    );
  }

  try {
    const stripe = getStripeClient();
    const body = await request.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    if (
      event.type === 'checkout.session.completed' ||
      event.type === 'checkout.session.async_payment_succeeded'
    ) {
      await activatePromotionFromSession(event.data.object as Stripe.Checkout.Session);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook se nepodařilo zpracovat.' },
      { status: 400 }
    );
  }
}
