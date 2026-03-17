import 'server-only';

import { Listing } from '@/types';
import { supabase } from '@/lib/supabase';
import { getLocalListingById, mergeWithLocalListings } from '@/lib/localListings';
import { syncExpiredPromotions } from '@/lib/promotionExpirations';

export async function getListingById(id: string) {
  await syncExpiredPromotions();

  const { data } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .single();

  if (data) {
    return data as Listing;
  }

  return getLocalListingById(id);
}

export async function getAllListings() {
  await syncExpiredPromotions();

  const { data } = await supabase
    .from('listings')
    .select('*')
    .order('is_top', { ascending: false })
    .order('is_highlighted', { ascending: false })
    .order('created_at', { ascending: false });

  return mergeWithLocalListings((data as Listing[]) || []);
}

export async function getRelatedListings(target: Listing, limit = 3) {
  const allListings = await getAllListings();
  const normalizedLocation = target.location.toLowerCase();

  return allListings
    .filter((listing) => listing.id !== target.id)
    .sort((a, b) => {
      const aScore =
        Number(a.property_type === target.property_type) * 3 +
        Number(a.location.toLowerCase().includes(normalizedLocation) || normalizedLocation.includes(a.location.toLowerCase())) * 2;
      const bScore =
        Number(b.property_type === target.property_type) * 3 +
        Number(b.location.toLowerCase().includes(normalizedLocation) || normalizedLocation.includes(b.location.toLowerCase())) * 2;

      if (bScore !== aScore) {
        return bScore - aScore;
      }

      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    })
    .slice(0, limit);
}
