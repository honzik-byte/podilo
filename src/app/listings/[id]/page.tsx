import { notFound } from 'next/navigation';
import ListingDetailClient from '@/components/ListingDetailClient';
import { parseListing } from '@/lib/listingMetadata';
import { getListingById, getRelatedListings } from '@/lib/listingQueries';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const listing = await getListingById(resolvedParams.id);

  if (!listing) {
    return {};
  }

  const title = `${listing.title} | Podilo`;
  const description = `${listing.location}, podíl ${listing.share_size}, cena ${new Intl.NumberFormat('cs-CZ').format(listing.price)} Kč. Prohlédněte si detail nabídky na Podilo.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: listing.images?.[0] ? [listing.images[0]] : [],
    },
  };
}

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const listing = await getListingById(resolvedParams.id);

  if (!listing) {
    notFound();
  }

  const relatedListings = await getRelatedListings(listing, 3);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://podilo.cz';
  const parsed = parseListing(listing);
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: listing.title,
    description: parsed.description || `${listing.property_type}, podíl ${listing.share_size}, lokalita ${listing.location}`,
    image: listing.images || [],
    url: `${baseUrl}/listings/${listing.id}`,
    category: 'Spoluvlastnický podíl nemovitosti',
    offers: {
      '@type': 'Offer',
      priceCurrency: 'CZK',
      price: listing.price,
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ListingDetailClient listing={listing} relatedListings={relatedListings} />
    </>
  );
}
