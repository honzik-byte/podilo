import 'server-only';

import { createServerSupabaseAdmin } from '@/lib/serverSupabase';
import { isDatabaseListingId } from '@/lib/listingIds';

export type ListingAnalyticsEvent = 'detail_view' | 'phone_click' | 'share_click' | 'lead_submit';

export interface ListingAnalyticsRecord {
  detailViews: number;
  phoneClicks: number;
  shareClicks: number;
  leadSubmissions: number;
  viewers: string[];
}

function createEmptyRecord(): ListingAnalyticsRecord {
  return {
    detailViews: 0,
    phoneClicks: 0,
    shareClicks: 0,
    leadSubmissions: 0,
    viewers: [],
  };
}

export async function getListingAnalytics(listingId: string) {
  if (!isDatabaseListingId(listingId)) {
    return createEmptyRecord();
  }

  const adminClient = createServerSupabaseAdmin();
  const { data, error } = await adminClient
    .from('listing_events')
    .select('event_type, visitor_id')
    .eq('listing_id', listingId);

  if (error) {
    console.error('[ListingAnalytics] Failed to load listing analytics', { listingId, error });
    return createEmptyRecord();
  }

  const record = createEmptyRecord();

  for (const event of data || []) {
    if (event.event_type === 'detail_view') {
      record.detailViews += 1;
      if (event.visitor_id && !record.viewers.includes(event.visitor_id)) {
        record.viewers.push(event.visitor_id);
      }
    }

    if (event.event_type === 'phone_click') {
      record.phoneClicks += 1;
    }

    if (event.event_type === 'share_click') {
      record.shareClicks += 1;
    }

    if (event.event_type === 'lead_submit') {
      record.leadSubmissions += 1;
    }
  }

  return record;
}

export async function trackListingEvent(listingId: string, event: ListingAnalyticsEvent, visitorId?: string) {
  if (!isDatabaseListingId(listingId)) {
    return createEmptyRecord();
  }

  const adminClient = createServerSupabaseAdmin();

  if (event === 'detail_view' && visitorId) {
    const { data: existingView } = await adminClient
      .from('listing_events')
      .select('id')
      .eq('listing_id', listingId)
      .eq('event_type', 'detail_view')
      .eq('visitor_id', visitorId)
      .limit(1)
      .maybeSingle();

    if (existingView) {
      return getListingAnalytics(listingId);
    }
  }

  const { error } = await adminClient.from('listing_events').insert({
    listing_id: listingId,
    event_type: event,
    visitor_id: visitorId || null,
  });

  if (error) {
    console.error('[ListingAnalytics] Failed to track listing event', { listingId, event, visitorId, error });
  }

  return getListingAnalytics(listingId);
}
