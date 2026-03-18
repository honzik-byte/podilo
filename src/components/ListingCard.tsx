import Link from 'next/link';
import { Listing } from '@/types';
import ClientImage from '@/components/ClientImage';
import FavoriteButton from '@/components/FavoriteButton';
import {
  formatPrice,
  getDiscountLabel,
  getEnergyClass,
  getOpportunityType,
  parseListing,
} from '@/lib/listingMetadata';
import { getVerificationDetails } from '@/lib/listingVerification';
import styles from './ListingCard.module.css';

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const mainImage = listing.images && listing.images.length > 0 ? listing.images[0] : '/placeholder.jpg';
  const parsed = parseListing(listing);
  const priceInsight = getDiscountLabel(listing);
  const opportunityType = getOpportunityType(parsed.details);
  const energyClass = getEnergyClass(listing, parsed.details);
  const verification = getVerificationDetails(listing);
  const promotionEndsAt = listing.top_until || listing.highlighted_until;
  const promotionLabel = promotionEndsAt
    ? new Intl.DateTimeFormat('cs-CZ', {
        day: 'numeric',
        month: 'numeric',
      }).format(new Date(promotionEndsAt))
    : null;

  return (
    <article className={styles.card}>
      <div className={styles.imageArea}>
        <Link href={`/listings/${listing.id}`} className={styles.imageLink}>
          <div className={styles.imageWrapper}>
            <div className={styles.imagePlaceholder}>
              <ClientImage
                src={mainImage}
                alt={listing.title}
                className={styles.image}
                fallbackSrc="data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%25%22%20height%3D%22100%25%22%20viewBox%3D%220%200%20800%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23ececf1%22%2F%3E%3Ctext%20x%3D%22400%22%20y%3D%22200%22%20fill%3D%22%23999999%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20text-anchor%3D%22middle%22%3EBez fotografie%3C%2Ftext%3E%3C%2Fsvg%3E"
              />
            </div>
          </div>
        </Link>

        <div className={styles.badges}>
          {listing.is_top && <span className={styles.topBadge}>TOP nabídka</span>}
          {listing.is_highlighted && <span className={styles.highlightBadge}>Zvýrazněno</span>}
          {verification.verified && <span className={styles.verifiedBadge}>Ověřený inzerent</span>}
          {promotionLabel && promotionEndsAt && (
            <span className={styles.expiryBadge}>
              Do {promotionLabel}
            </span>
          )}
        </div>

        <FavoriteButton listingId={listing.id} />
      </div>

      <div className={styles.content}>
        <Link href={`/listings/${listing.id}`} className={styles.contentLink}>
          <div className={styles.metaRow}>
            <span className={styles.location}>{listing.location}</span>
            <span className={styles.type}>{listing.property_type}</span>
          </div>

          <h3 className={styles.title}>{listing.title}</h3>

          <div className={styles.tags}>
            <span className={styles.tag}>Podíl {listing.share_size}</span>
            <span className={styles.tag}>
              {listing.occupancy || parsed.details.currentUse || 'Stav neuveden'}
            </span>
            <span className={styles.tagMuted}>PENB {energyClass}</span>
            {opportunityType && <span className={styles.tagMuted}>{opportunityType}</span>}
          </div>

          <div className={styles.priceBlock}>
            <div>
              <p className={styles.priceLabel}>Cena za nabízený podíl</p>
              <p className={styles.price}>{formatPrice(listing.price)}</p>
            </div>
            <div className={styles.secondaryPrice}>
              <span>Odhad ceny celé nemovitosti</span>
              <strong>{formatPrice(listing.full_property_value)}</strong>
            </div>
          </div>

          {priceInsight && <p className={styles.insight}>{priceInsight}</p>}
        </Link>
      </div>
    </article>
  );
}
