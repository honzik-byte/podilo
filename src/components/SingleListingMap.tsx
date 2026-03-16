'use client';

import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Listing } from '@/types';
import L from 'leaflet';
import { useEffect } from 'react';
import styles from './SingleListingMap.module.css';

// Premium custom marker using HTML/CSS instead of default image
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
  });
};

interface SingleListingMapProps {
  listing: Listing;
}

export default function SingleListingMap({ listing }: SingleListingMapProps) {
  useEffect(() => {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }, []);

  if (!listing.lat || !listing.lng) {
    return null; // Don't show map if no coordinates
  }

  const position: [number, number] = [listing.lat, listing.lng];

  return (
    <div className={styles.mapContainer}>
      <MapContainer 
        center={position} 
        zoom={14} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        {/* Cleaner, premium map tiles from CartoDB */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <Marker 
          position={position}
          icon={createCustomIcon(listing.price)}
        />
      </MapContainer>
    </div>
  );
}
