import 'server-only';

import { promises as fs } from 'fs';
import path from 'path';

export type ListingAnalyticsEvent = 'detail_view' | 'phone_click' | 'share_click' | 'lead_submit';

export interface ListingAnalyticsRecord {
  detailViews: number;
  phoneClicks: number;
  shareClicks: number;
  leadSubmissions: number;
  viewers: string[];
}

type AnalyticsMap = Record<string, ListingAnalyticsRecord>;

const analyticsPath = path.join(process.cwd(), 'src/data/listingAnalytics.json');

function createEmptyRecord(): ListingAnalyticsRecord {
  return {
    detailViews: 0,
    phoneClicks: 0,
    shareClicks: 0,
    leadSubmissions: 0,
    viewers: [],
  };
}

async function readAnalyticsMap() {
  const content = await fs.readFile(analyticsPath, 'utf8');
  return JSON.parse(content) as AnalyticsMap;
}

async function writeAnalyticsMap(data: AnalyticsMap) {
  await fs.writeFile(analyticsPath, JSON.stringify(data, null, 2), 'utf8');
}

export async function getListingAnalytics(listingId: string) {
  const analytics = await readAnalyticsMap();
  return analytics[listingId] || createEmptyRecord();
}

export async function trackListingEvent(listingId: string, event: ListingAnalyticsEvent, visitorId?: string) {
  const analytics = await readAnalyticsMap();
  const current = analytics[listingId] || createEmptyRecord();

  if (event === 'detail_view') {
    if (visitorId && current.viewers.includes(visitorId)) {
      return current;
    }

    current.detailViews += 1;
    if (visitorId) {
      current.viewers.push(visitorId);
    }
  }

  if (event === 'phone_click') {
    current.phoneClicks += 1;
  }

  if (event === 'share_click') {
    current.shareClicks += 1;
  }

  if (event === 'lead_submit') {
    current.leadSubmissions += 1;
  }

  analytics[listingId] = current;
  await writeAnalyticsMap(analytics);
  return current;
}
