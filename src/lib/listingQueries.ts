import 'server-only';

import { Listing } from '@/types';
import { supabase } from '@/lib/supabase';
import { getLocalListingById, mergeWithLocalListings } from '@/lib/localListings';
import { syncExpiredPromotions } from '@/lib/promotionExpirations';
import { Article } from '@/lib/articleContent';
import { czechRegions, getPropertyTypeLabelFromSlug, getPropertyTypeSlug, getRegionForListing } from '@/lib/listingTaxonomy';

async function getMergedListingsFromDatabase() {
  await syncExpiredPromotions();

  const { data } = await supabase
    .from('listings')
    .select('*')
    .order('is_top', { ascending: false })
    .order('is_highlighted', { ascending: false })
    .order('created_at', { ascending: false });

  return mergeWithLocalListings((data as Listing[]) || []);
}

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
  return getMergedListingsFromDatabase();
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

export async function getListingsByRegionSlug(regionSlug: string) {
  const allListings = await getAllListings();
  const region = czechRegions.find((item) => item.slug === regionSlug);

  if (!region) {
    return { region: null, listings: [] as Listing[] };
  }

  return {
    region,
    listings: allListings.filter((listing) => getRegionForListing(listing)?.slug === regionSlug),
  };
}

export async function getListingsByPropertyTypeSlug(propertyTypeSlug: string) {
  const allListings = await getAllListings();
  const propertyType = getPropertyTypeLabelFromSlug(propertyTypeSlug, allListings);

  if (!propertyType) {
    return { propertyType: null, listings: [] as Listing[] };
  }

  return {
    propertyType,
    listings: allListings.filter((listing) => getPropertyTypeSlug(listing.property_type) === propertyTypeSlug),
  };
}

export async function getListingLandingTaxonomy() {
  const allListings = await getAllListings();
  const regions = czechRegions
    .map((region) => ({
      ...region,
      count: allListings.filter((listing) => getRegionForListing(listing)?.slug === region.slug).length,
    }))
    .filter((region) => region.count > 0);

  const propertyTypeMap = new Map<string, { slug: string; label: string; count: number }>();

  for (const listing of allListings) {
    const slug = getPropertyTypeSlug(listing.property_type);
    const current = propertyTypeMap.get(slug);
    propertyTypeMap.set(slug, {
      slug,
      label: listing.property_type,
      count: (current?.count || 0) + 1,
    });
  }

  return {
    regions,
    propertyTypes: [...propertyTypeMap.values()].sort((a, b) => b.count - a.count),
  };
}

export async function getRelevantListingsForArticle(article: Article, limit = 3) {
  const allListings = await getAllListings();
  const normalizedText = `${article.title} ${article.excerpt} ${article.category}`.toLowerCase();

  return allListings
    .map((listing) => {
      let score = 0;
      const propertyType = listing.property_type.toLowerCase();
      const occupancy = (listing.occupancy || '').toLowerCase();

      if (normalizedText.includes('investor') || normalizedText.includes('investování')) {
        if (listing.is_top || listing.is_highlighted) {
          score += 2;
        }
      }

      if (normalizedText.includes('prodat')) {
        score += 1;
      }

      if (normalizedText.includes(propertyType)) {
        score += 3;
      }

      if (normalizedText.includes('obsazen') && occupancy.includes('obsazen')) {
        score += 2;
      }

      if (normalizedText.includes('volné') && occupancy.includes('volné')) {
        score += 2;
      }

      if (listing.full_property_value) {
        score += 1;
      }

      return { listing, score };
    })
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return new Date(b.listing.created_at).getTime() - new Date(a.listing.created_at).getTime();
    })
    .map((entry) => entry.listing)
    .slice(0, limit);
}
