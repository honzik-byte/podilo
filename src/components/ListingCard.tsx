import Image from 'next/image';
import Link from 'next/link';
import { Listing } from '@/types';
import ClientImage from '@/components/ClientImage';
import styles from './ListingCard.module.css';

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const formatter = new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    maximumFractionDigits: 0,
  });

  const mainImage = listing.images && listing.images.length > 0 
    ? listing.images[0] 
    : '/placeholder.jpg'; // We will need a placeholder image logic or actual file

  return (
    <Link href={`/listings/${listing.id}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        <div className={styles.imagePlaceholder}>
          <ClientImage 
            src={mainImage} 
            alt={listing.title}
            className={styles.image}
            fallbackSrc="data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%25%22%20height%3D%22100%25%22%20viewBox%3D%220%200%20800%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23eaeaea%22%2F%3E%3Ctext%20x%3D%22400%22%20y%3D%22200%22%20fill%3D%22%23999999%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20text-anchor%3D%22middle%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E"
          />
        </div>
        {listing.is_highlighted && (
          <span className={styles.badge}>Zvýhodněno</span>
        )}
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{listing.title}</h3>
        <p className={styles.location}>{listing.location}</p>
        
        <div className={styles.details}>
          <span className={styles.share}>Podíl: {listing.share_size}</span>
          <span className={styles.type}>{listing.property_type}</span>
        </div>

        <div className={styles.priceContainer}>
          <span className={styles.price}>{formatter.format(listing.price)}</span>
        </div>
      </div>
    </Link>
  );
}
