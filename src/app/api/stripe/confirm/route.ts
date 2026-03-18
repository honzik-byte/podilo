import { NextResponse } from 'next/server';
import { activatePromotionFromSession } from '@/lib/promotionActivation';
import { reportError } from '@/lib/errorReporting';
import { createServerSupabaseAuth, createServerSupabaseUser } from '@/lib/serverSupabase';
import { getStripeClient } from '@/lib/stripeServer';

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get('authorization');
    const token = authorization?.replace(/^Bearer\s+/i, '');

    if (!token) {
      return NextResponse.json({ error: 'Chybí přihlášení.' }, { status: 401 });
    }

    const { sessionId } = (await request.json()) as { sessionId?: string };

    if (!sessionId) {
      return NextResponse.json({ error: 'Chybí sessionId.' }, { status: 400 });
    }

    const authClient = createServerSupabaseAuth();
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Nepodařilo se ověřit uživatele.' }, { status: 401 });
    }

    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Platba zatím není potvrzená.' }, { status: 400 });
    }

    if (session.metadata?.user_id !== user.id) {
      return NextResponse.json({ error: 'Tato platba nepatří přihlášenému uživateli.' }, { status: 403 });
    }

    const result = await activatePromotionFromSession(session, {
      listingClient: createServerSupabaseUser(token),
    });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    await reportError({
      source: 'stripe_confirm',
      message: error instanceof Error ? error.message : 'Stripe confirm route failed',
      context: {
        path: '/api/stripe/confirm',
      },
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Nepodařilo se potvrdit propagaci.' },
      { status: 500 }
    );
  }
}
