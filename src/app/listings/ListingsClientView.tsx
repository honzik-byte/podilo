'use client';

import { useMemo, useState } from 'react';
import { Listing } from '@/types';
import ListingCard from '@/components/ListingCard';
import styles from './page.module.css';
import dynamic from 'next/dynamic';
import ListingsFilter from './ListingsFilter';
import {
  getListingStatus,
  getOpportunityType,
  matchesText,
  parseListing,
} from '@/lib/listingMetadata';
import { sortListings } from '@/lib/listingSort';

const ListingsMap = dynamic(() => import('@/components/ListingsMap'), {
  ssr: false,
  loading: () => <div className={styles.mapLoading}>Načítání interaktivní mapy...</div>,
});

interface ListingsClientViewProps {
  listings: Listing[];
  maxPriceCap: number;
  initialSearchParams: { [key: string]: string | string[] | undefined };
  hasError?: boolean;
}

function getFirstQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value || '';
}

export default function ListingsClientView({
  listings,
  maxPriceCap,
  initialSearchParams,
  hasError = false,
}: ListingsClientViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const filteredListings = useMemo(() => {
    const location = getFirstQueryValue(initialSearchParams.location).toLowerCase();
    const propertyType = getFirstQueryValue(initialSearchParams.type);
    const minPrice = Number(getFirstQueryValue(initialSearchParams.minPrice) || 0);
    const maxPrice = Number(getFirstQueryValue(initialSearchParams.maxPrice) || 0);
    const shareSize = getFirstQueryValue(initialSearchParams.shareSize);
    const occupancy = getFirstQueryValue(initialSearchParams.occupancy).toLowerCase();
    const listingStatus = getFirstQueryValue(initialSearchParams.status).toLowerCase();
    const valuation = getFirstQueryValue(initialSearchParams.valuation);
    const opportunity = getFirstQueryValue(initialSearchParams.opportunity).toLowerCase();
    const topOnly = getFirstQueryValue(initialSearchParams.topOnly) === 'true';
    const highlightedOnly = getFirstQueryValue(initialSearchParams.highlightedOnly) === 'true';

    return sortListings(listings.filter((listing) => {
      const parsed = parseListing(listing);
      const normalizedOccupancy = (listing.occupancy || parsed.details.currentUse || '').toLowerCase();
      const normalizedStatus = getListingStatus(listing, parsed.details).toLowerCase();
      const normalizedOpportunity = getOpportunityType(parsed.details).toLowerCase();

      if (location && !matchesText(`${listing.location} ${listing.street_address || ''}`, location)) {
        return false;
      }

      if (propertyType && listing.property_type !== propertyType) {
        return false;
      }

      if (minPrice > 0 && listing.price < minPrice) {
        return false;
      }

      if (maxPrice > 0 && listing.price > maxPrice) {
        return false;
      }

      if (shareSize) {
        if (shareSize === 'jiný') {
          if (['1/2', '1/3', '1/4', '1/6'].includes(listing.share_size)) {
            return false;
          }
        } else if (listing.share_size !== shareSize) {
          return false;
        }
      }

      if (occupancy && !normalizedOccupancy.includes(occupancy)) {
        return false;
      }

      if (listingStatus && normalizedStatus !== listingStatus) {
        return false;
      }

      if (valuation === 'available' && !listing.full_property_value) {
        return false;
      }

      if (valuation === 'missing' && listing.full_property_value) {
        return false;
      }

      if (opportunity && !normalizedOpportunity.includes(opportunity)) {
        return false;
      }

      if (topOnly && !listing.is_top) {
        return false;
      }

      if (highlightedOnly && !listing.is_highlighted) {
        return false;
      }

      return true;
    }));
  }, [initialSearchParams, listings]);

  return (
    <div>
      <ListingsFilter maxPriceCap={maxPriceCap} />

      <div className={styles.viewToggle}>
        <button
          className={`${styles.toggleBtn} ${viewMode === 'grid' ? styles.activeBtn : ''}`}
          onClick={() => setViewMode('grid')}
        >
          Seznam
        </button>
        <button
          className={`${styles.toggleBtn} ${viewMode === 'map' ? styles.activeBtn : ''}`}
          onClick={() => setViewMode('map')}
        >
          Mapa
        </button>
        <div className={styles.resultCount}>
          {filteredListings.length} odpovídajících nabídek
        </div>
      </div>

      {filteredListings.length > 0 ? (
        viewMode === 'grid' ? (
          <div className={styles.grid}>
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <ListingsMap listings={filteredListings} />
        )
      ) : (
        <div className={styles.emptyState}>
          <h3>Nepodařilo se najít odpovídající nabídky</h3>
          <p>
            Zkuste rozšířit cenový rozsah, vypnout některý z investor filtrů nebo ponechat libovolnou obsazenost.
          </p>
          {hasError && <p className={styles.errorText}>Při načítání dat došlo k chybě. Zkuste stránku obnovit.</p>}
        </div>
      )}
    </div>
  );
}
