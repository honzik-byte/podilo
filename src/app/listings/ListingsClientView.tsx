'use client';

import { useState } from 'react';
import { Listing } from '@/types';
import ListingCard from '@/components/ListingCard';
import styles from './page.module.css';
import dynamic from 'next/dynamic';

// Leaflet needs window object, so we load the map dynamically and disable SSR
const ListingsMap = dynamic(() => import('@/components/ListingsMap'), {
  ssr: false,
  loading: () => <div className={styles.mapLoading}>Načítání interaktivní mapy...</div>
});

interface ListingsClientViewProps {
  listings: Listing[];
}

export default function ListingsClientView({ listings }: ListingsClientViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  return (
    <div>
      <div className={styles.viewToggle}>
        <button 
          className={`${styles.toggleBtn} ${viewMode === 'grid' ? styles.activeBtn : ''}`}
          onClick={() => setViewMode('grid')}
        >
          Seznam (Mřížka)
        </button>
        <button 
          className={`${styles.toggleBtn} ${viewMode === 'map' ? styles.activeBtn : ''}`}
          onClick={() => setViewMode('map')}
        >
          Mapa
        </button>
      </div>

      {viewMode === 'grid' ? (
        <div className={styles.grid}>
          {listings.map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <ListingsMap listings={listings} />
      )}
    </div>
  );
}
