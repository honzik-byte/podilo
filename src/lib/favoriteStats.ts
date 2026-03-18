import 'server-only';

import { createServerSupabaseAdmin } from '@/lib/serverSupabase';
import { isDatabaseListingId } from '@/lib/listingIds';

export async function getFavoriteCount(listingId: string) {
  if (!isDatabaseListingId(listingId)) {
    return 0;
  }

  const adminClient = createServerSupabaseAdmin();
  const { count, error } = await adminClient
    .from('listing_favorites')
    .select('visitor_id', { count: 'exact', head: true })
    .eq('listing_id', listingId);

  if (error) {
    console.error('[FavoriteStats] Failed to load favorite count', { listingId, error });
    return 0;
  }

  return count || 0;
}

export async function getFavoriteCounts(listingIds: string[]) {
  const dbIds = listingIds.filter(isDatabaseListingId);

  if (dbIds.length === 0) {
    return Object.fromEntries(listingIds.map((id) => [id, 0]));
  }

  const adminClient = createServerSupabaseAdmin();
  const { data, error } = await adminClient
    .from('listing_favorites')
    .select('listing_id')
    .in('listing_id', dbIds);

  if (error) {
    console.error('[FavoriteStats] Failed to load favorite counts', { listingIds: dbIds, error });
    return Object.fromEntries(listingIds.map((id) => [id, 0]));
  }

  const counts = new Map<string, number>();

  for (const row of data || []) {
    counts.set(row.listing_id, (counts.get(row.listing_id) || 0) + 1);
  }

  return Object.fromEntries(listingIds.map((id) => [id, counts.get(id) || 0]));
}

export async function toggleFavoriteStat(listingId: string, visitorId: string, action: 'save' | 'unsave') {
  if (!isDatabaseListingId(listingId) || !visitorId) {
    return 0;
  }

  const adminClient = createServerSupabaseAdmin();

  if (action === 'save') {
    const { error } = await adminClient.from('listing_favorites').upsert(
      {
        listing_id: listingId,
        visitor_id: visitorId,
      },
      { onConflict: 'listing_id,visitor_id', ignoreDuplicates: true }
    );

    if (error) {
      console.error('[FavoriteStats] Failed to save favorite', { listingId, visitorId, error });
    }
  } else {
    const { error } = await adminClient
      .from('listing_favorites')
      .delete()
      .eq('listing_id', listingId)
      .eq('visitor_id', visitorId);

    if (error) {
      console.error('[FavoriteStats] Failed to remove favorite', { listingId, visitorId, error });
    }
  }

  return getFavoriteCount(listingId);
}
