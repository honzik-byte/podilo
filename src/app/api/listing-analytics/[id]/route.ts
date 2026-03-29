import { NextResponse } from 'next/server';
import { canAccessListingPrivateData } from '@/lib/apiAuth';
import { getListingAnalytics, trackListingEvent, type ListingAnalyticsEvent } from '@/lib/listingAnalytics';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const access = await canAccessListingPrivateData(request, resolvedParams.id);

  if (!access.allowed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const analytics = await getListingAnalytics(resolvedParams.id);
  return NextResponse.json({
    detailViews: analytics.detailViews,
    phoneClicks: analytics.phoneClicks,
    shareClicks: analytics.shareClicks,
    leadSubmissions: analytics.leadSubmissions,
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const payload = (await request.json()) as { event?: ListingAnalyticsEvent; visitorId?: string };

  if (!payload.event || !['detail_view', 'phone_click', 'share_click', 'lead_submit'].includes(payload.event)) {
    return NextResponse.json({ error: 'Chybí event.' }, { status: 400 });
  }

  const analytics = await trackListingEvent(resolvedParams.id, payload.event, payload.visitorId);
  return NextResponse.json({ ok: true, analytics });
}
