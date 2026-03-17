'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Listing } from '@/types';
import styles from './ListingsMap.module.css';
import { formatCzechCurrency } from '@/lib/formatting';

const defaultCenter: [number, number] = [49.8175, 15.473];

function createPriceIcon(label: string, isCluster = false) {
  const className = isCluster ? styles.clusterPin : styles.premiumPin;

  return L.divIcon({
    html: `<div class="${className}">${label}${isCluster ? '' : `<span class="${styles.pinPulse}"></span>`}</div>`,
    className: '',
    iconSize: isCluster ? [52, 52] : [96, 36],
    iconAnchor: isCluster ? [26, 26] : [48, 36],
    popupAnchor: [0, -28],
  });
}

function formatMarkerPrice(price: number) {
  if (price >= 1_000_000) {
    return `${Number((price / 1_000_000).toFixed(price % 1_000_000 === 0 ? 0 : 1))
      .toString()
      .replace('.', ',')} mil.`;
  }

  return `${Math.round(price / 1_000)} tis.`;
}

function getMapCenter(listings: Listing[]): [number, number] {
  const points = listings.filter((listing) => typeof listing.lat === 'number' && typeof listing.lng === 'number');

  if (points.length === 0) {
    return defaultCenter;
  }

  const lat = points.reduce((sum, listing) => sum + (listing.lat || 0), 0) / points.length;
  const lng = points.reduce((sum, listing) => sum + (listing.lng || 0), 0) / points.length;

  return [lat, lng];
}

function ClusteredMarkers({ listings }: { listings: Listing[] }) {
  const map = useMapEvents({
    zoomend: () => {
      map.invalidateSize();
    },
  });

  const groupedListings = useMemo(() => {
    const zoom = map.getZoom();
    const precision = zoom >= 13 ? 3 : zoom >= 10 ? 2 : 1;
    const groups = new Map<string, Listing[]>();

    listings.forEach((listing) => {
      if (typeof listing.lat !== 'number' || typeof listing.lng !== 'number') {
        return;
      }

      const key = `${listing.lat.toFixed(precision)}:${listing.lng.toFixed(precision)}`;
      const current = groups.get(key) || [];
      current.push(listing);
      groups.set(key, current);
    });

    return Array.from(groups.values());
  }, [listings, map]);

  return (
    <>
      {groupedListings.map((group) => {
        const primary = group[0];
        const lat = primary.lat || defaultCenter[0];
        const lng = primary.lng || defaultCenter[1];
        const position: [number, number] = [lat, lng];

        if (group.length === 1) {
          return (
            <Marker
              key={primary.id}
              position={position}
              icon={createPriceIcon(formatMarkerPrice(primary.price))}
            >
              <Popup className={styles.customPopup}>
                <Link href={`/listings/${primary.id}`} className={styles.popupLink}>
                  <div className={styles.popupImageWrapper}>
                    {primary.images[0] ? (
                      <img src={primary.images[0]} alt={primary.title} className={styles.popupImage} />
                    ) : null}
                  </div>
                  <div className={styles.popupContent}>
                    <div className={styles.popupPrice}>{formatCzechCurrency(primary.price)}</div>
                    <div className={styles.popupTitle}>{primary.title}</div>
                    <div className={styles.popupLocation}>{primary.location}</div>
                  </div>
                </Link>
              </Popup>
            </Marker>
          );
        }

        return (
          <Marker
            key={`${primary.id}-cluster`}
            position={position}
            icon={createPriceIcon(String(group.length), true)}
          >
            <Popup className={styles.customPopup}>
              <div className={styles.clusterPopup}>
                <strong>{group.length} nabídek v této oblasti</strong>
                <div className={styles.clusterList}>
                  {group.slice(0, 6).map((listing) => (
                    <Link key={listing.id} href={`/listings/${listing.id}`} className={styles.clusterLink}>
                      <span>{listing.title}</span>
                      <strong>{formatCzechCurrency(listing.price)}</strong>
                    </Link>
                  ))}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

interface ListingsMapProps {
  listings: Listing[];
}

export default function ListingsMap({ listings }: ListingsMapProps) {
  const validListings = listings.filter(
    (listing) => typeof listing.lat === 'number' && typeof listing.lng === 'number'
  );

  if (validListings.length === 0) {
    return <div className={styles.emptyMap}>U těchto nabídek zatím není dostupná poloha pro zobrazení v mapě.</div>;
  }

  return (
    <MapContainer center={getMapCenter(validListings)} zoom={8} scrollWheelZoom className={styles.mapContainer}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClusteredMarkers listings={validListings} />
    </MapContainer>
  );
}
