'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Listing } from '@/types';
import L from 'leaflet';
import { useEffect } from 'react';
import Link from 'next/link';
import ClientImage from './ClientImage';
import styles from './ListingsMap.module.css';

const createCustomIcon = (price: number) => {
  const formatter = new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    maximumFractionDigits: 0,
  });
  
  return L.divIcon({
    className: 'custom-pin-wrapper',
    html: `<div class="${styles.premiumPin}"><div class="${styles.pinContent}">${formatter.format(price)}</div><div class="${styles.pinPulse}"></div></div>`,
    iconSize: [100, 40],
    iconAnchor: [50, 40],
    popupAnchor: [0, -40] // Center top so it hovers slightly above
  });
};

interface ListingsMapProps {
  listings: Listing[];
}

export default function ListingsMap({ listings }: ListingsMapProps) {
  // Filter out listings without coordinates
  const validListings = listings.filter((l) => l.lat && l.lng);

  // If no valid listings, default to center of Czech Republic
  const center: [number, number] = validListings.length > 0 
    ? [validListings[0].lat as number, validListings[0].lng as number] 
    : [49.8175, 15.4730]; // Exact center of CZ

  // Fix for React-Leaflet window dependency issue in SSR
  useEffect(() => {
    // Force Leaflet map resize after container mounts
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }, []);

  const formatter = new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    maximumFractionDigits: 0,
  });

  if (validListings.length === 0) {
    return (
       <div className={styles.emptyMap}>
         <p>Zatím zde nejsou žádné nabídky s přesnou lokací na mapě.</p>
       </div>
    );
  }

  return (
    <div className={styles.mapContainer}>
      <MapContainer 
        center={center} 
        zoom={8} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {validListings.map((listing) => (
          <Marker 
            key={listing.id} 
            position={[listing.lat as number, listing.lng as number]}
            icon={createCustomIcon(listing.price)}
          >
            <Popup className={styles.customPopup}>
              <Link href={`/listings/${listing.id}`} className={styles.popupLink}>
                {listing.images && listing.images.length > 0 && (
                  <div className={styles.popupImageWrapper}>
                    <ClientImage 
                      src={listing.images[0]} 
                      alt={listing.title} 
                      className={styles.popupImage}
                      fallbackSrc="/placeholder.jpg"
                    />
                  </div>
                )}
                <div className={styles.popupContent}>
                  <div className={styles.popupPrice}>{formatter.format(listing.price)}</div>
                  <div className={styles.popupTitle}>{listing.title}</div>
                  {listing.street_address && (
                    <div className={styles.popupLocation}>{listing.street_address}</div>
                  )}
                  <div className={styles.popupLocation}>{listing.location}</div>
                </div>
              </Link>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
