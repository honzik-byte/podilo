import { NextResponse } from 'next/server';
import { getPromotionPlan } from '@/lib/promotionPlans';
import { createServerSupabaseAdmin, createServerSupabaseAuth } from '@/lib/serverSupabase';
import { getStripeClient } from '@/lib/stripeServer';
import { Listing } from '@/types';

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get('authorization');
    const token = authorization?.replace(/^Bearer\s+/i, '');

    if (!token) {
      return NextResponse.json({ error: 'Pro platbu je potřeba být přihlášen.' }, { status: 401 });
    }

    const payload = (await request.json()) as { listingId?: string; planId?: string };
    const plan = getPromotionPlan(payload.planId);

    if (!payload.listingId || !plan) {
      return NextResponse.json({ error: 'Chybí inzerát nebo balíček.' }, { status: 400 });
    }

    const authClient = createServerSupabaseAuth();
    const adminClient = createServerSupabaseAdmin();
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Nepodařilo se ověřit uživatele.' }, { status: 401 });
    }

    const { data: listing, error: listingError } = await adminClient
      .from('listings')
      .select('*')
      .eq('id', payload.listingId)
      .single();

    if (listingError || !listing) {
      return NextResponse.json({ error: 'Vybraný inzerát nebyl nalezen.' }, { status: 404 });
    }

    if ((listing as Listing).user_id !== user.id) {
      return NextResponse.json({ error: 'Tento inzerát nemůžete propagovat.' }, { status: 403 });
    }

    const stripePriceId = process.env[plan.stripeEnvKey];

    if (!stripePriceId) {
      return NextResponse.json(
        { error: `V prostředí chybí ${plan.stripeEnvKey}.` },
        { status: 500 }
      );
    }

    const stripe = getStripeClient();
    const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: `${origin}/cenik/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cenik?listing=${payload.listingId}&cancelled=1`,
      client_reference_id: payload.listingId,
      metadata: {
        listing_id: payload.listingId,
        listing_title: (listing as Listing).title,
        plan_id: plan.id,
        user_id: user.id,
      },
      line_items: [
        {
          quantity: 1,
          price: stripePriceId,
        },
      ],
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Stripe checkout se nepodařilo vytvořit.' },
      { status: 500 }
    );
  }
}
