import { NextResponse } from 'next/server';
import { getListingAnalytics, trackListingEvent, type ListingAnalyticsEvent } from '@/lib/listingAnalytics';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const analytics = await getListingAnalytics(resolvedParams.id);
  return NextResponse.json(analytics);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const payload = (await request.json()) as { event?: ListingAnalyticsEvent; visitorId?: string };

  if (!payload.event) {
    return NextResponse.json({ error: 'Chybí event.' }, { status: 400 });
  }

  const analytics = await trackListingEvent(resolvedParams.id, payload.event, payload.visitorId);
  return NextResponse.json({ ok: true, analytics });
}
