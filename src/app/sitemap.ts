import type { MetadataRoute } from 'next';
import { articles } from '@/lib/articleContent';
import { getAllListings, getListingLandingTaxonomy } from '@/lib/listingQueries';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://podilo.cz';
  const [listings, taxonomy] = await Promise.all([getAllListings(), getListingLandingTaxonomy()]);

  const staticRoutes = [
    '',
    '/listings',
    '/poradna',
    '/faq',
    '/how-it-works',
    '/contact',
    '/cenik',
    '/about',
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
  }));

  const articleRoutes = articles.map((article) => ({
    url: `${baseUrl}/poradna/${article.slug}`,
    lastModified: new Date(),
  }));

  const listingRoutes = listings.map((listing) => ({
    url: `${baseUrl}/listings/${listing.id}`,
    lastModified: new Date(listing.updated_at || listing.created_at),
  }));

  const regionRoutes = taxonomy.regions.map((region) => ({
    url: `${baseUrl}/lokality/${region.slug}`,
    lastModified: new Date(),
  }));

  const propertyTypeRoutes = taxonomy.propertyTypes.map((propertyType) => ({
    url: `${baseUrl}/typ-nemovitosti/${propertyType.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...articleRoutes, ...listingRoutes, ...regionRoutes, ...propertyTypeRoutes];
}
