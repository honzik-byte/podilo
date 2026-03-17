import { notFound } from 'next/navigation';
import ListingDetailClient from '@/components/ListingDetailClient';
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

  return <ListingDetailClient listing={listing} relatedListings={relatedListings} />;
}
