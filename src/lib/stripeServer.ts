import Stripe from 'stripe';

export function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error('Chybí STRIPE_SECRET_KEY v prostředí.');
  }

  return new Stripe(secretKey, {
    apiVersion: '2026-02-25.clover',
  });
}
