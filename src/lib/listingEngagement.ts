import 'server-only';

import { createServerSupabaseAdmin } from '@/lib/serverSupabase';
import { getFavoriteCounts } from '@/lib/favoriteStats';
import { getListingAnalytics } from '@/lib/listingAnalytics';
import { getLeadsByListingId } from '@/lib/leads';

export async function getListingEngagementSummary(listingIds: string[]) {
  const [favoriteCounts, leadsEntries, analyticsEntries] = await Promise.all([
    getFavoriteCounts(listingIds),
    Promise.all(listingIds.map(async (listingId) => [listingId, await getLeadsByListingId(listingId)] as const)),
    Promise.all(listingIds.map(async (listingId) => [listingId, await getListingAnalytics(listingId)] as const)),
  ]);

  return {
    favoriteCounts,
    leads: Object.fromEntries(leadsEntries),
    analytics: Object.fromEntries(analyticsEntries),
  };
}

export async function getAdminEngagementSnapshot(limit = 10) {
  const adminClient = createServerSupabaseAdmin();
  const [{ data: leadRows }, { data: favoriteRows }, { data: eventRows }] = await Promise.all([
    adminClient
      .from('listing_leads')
      .select('listing_id, created_at')
      .order('created_at', { ascending: false })
      .limit(limit * 8),
    adminClient
      .from('listing_favorites')
      .select('listing_id, created_at')
      .order('created_at', { ascending: false })
      .limit(limit * 8),
    adminClient
      .from('listing_events')
      .select('listing_id, event_type, created_at')
      .order('created_at', { ascending: false })
      .limit(limit * 12),
  ]);

  return {
    recentLeads: leadRows || [],
    recentFavorites: favoriteRows || [],
    recentEvents: eventRows || [],
  };
}
