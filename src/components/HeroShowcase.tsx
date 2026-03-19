'use client';

import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import type { Listing } from '@/types';
import ClientImage from '@/components/ClientImage';
import FavoriteButton from '@/components/FavoriteButton';
import {
  formatPrice,
  getDiscountLabel,
  getEnergyClass,
  getOpportunityType,
  parseListing,
} from '@/lib/listingMetadata';
import styles from './HeroShowcase.module.css';

interface HeroShowcaseProps {
  listings: Listing[];
}

function getHeroLabel(listing: Listing) {
  if (listing.is_top) {
    return 'TOP nabídka';
  }

  if (listing.is_highlighted) {
    return 'Zvýrazněná nabídka';
  }

  return 'Živá nabídka';
}

function getHeroChips(listing: Listing) {
  const parsed = parseListing(listing);
  const chips = [
    `Podíl ${listing.share_size}`,
    listing.occupancy || parsed.details.currentUse || 'Stav neuveden',
    `PENB ${getEnergyClass(listing, parsed.details)}`,
  ].filter(Boolean);

  return chips.slice(0, 3);
}

export default function HeroShowcase({ listings }: HeroShowcaseProps) {
  const showcaseListings = useMemo(() => listings.slice(0, 3), [listings]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (showcaseListings.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % showcaseListings.length);
    }, 4200);

    return () => window.clearInterval(interval);
  }, [showcaseListings.length]);

  if (showcaseListings.length === 0) {
    return null;
  }

  const active = showcaseListings[activeIndex] || showcaseListings[0];
  const chips = getHeroChips(active);
  const parsed = parseListing(active);
  const priceInsight = getDiscountLabel(active);
  const opportunityType = getOpportunityType(parsed.details);
  const fallbackImage =
    'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%25%22%20height%3D%22100%25%22%20viewBox%3D%220%200%20800%20600%22%20preserveAspectRatio%3D%22none%22%3E%3Crect%20width%3D%22800%22%20height%3D%22600%22%20fill%3D%22%23ececf1%22%2F%3E%3Ctext%20x%3D%22400%22%20y%3D%22300%22%20fill%3D%22%23999999%22%20font-family%3D%22sans-serif%22%20font-size%3D%2224%22%20text-anchor%3D%22middle%22%3ENen%C3%AD%20fotografie%3C%2Ftext%3E%3C%2Fsvg%3E';

  const handlePointerMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const bounds = wrapRef.current?.getBoundingClientRect();

    if (!bounds) {
      return;
    }

    const relativeX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const relativeY = (event.clientY - bounds.top) / bounds.height - 0.5;

    setParallax({
      x: relativeX,
      y: relativeY,
    });
  };

  const handlePointerLeave = () => {
    setParallax({ x: 0, y: 0 });
  };

  const orbStyle = {
    transform: `translate3d(${parallax.x * -22}px, ${parallax.y * -18}px, 0)`,
  } satisfies CSSProperties;

  const cardStyle = {
    transform: `translate3d(${parallax.x * 14}px, ${parallax.y * 12}px, 0)`,
  } satisfies CSSProperties;

  const imageStyle = {
    transform: `scale(1.04) translate3d(${parallax.x * -10}px, ${parallax.y * -8}px, 0)`,
  } satisfies CSSProperties;

  return (
    <div
      ref={wrapRef}
      className={styles.wrap}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
    >
      <div className={styles.orb} style={orbStyle} />

      <div className={styles.surface}>
        <div className={styles.floatingTop}>
          <span className={styles.signal}>Živé tržiště</span>
        </div>

        <div
          className={[
            styles.card,
            active.is_top ? styles.cardTop : '',
            active.is_highlighted ? styles.cardHighlighted : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={cardStyle}
        >
          <div className={styles.imageShell}>
            <ClientImage
              src={active.images?.[0] || fallbackImage}
              alt={active.title}
              className={styles.image}
              fallbackSrc={fallbackImage}
            />
            <div className={styles.imageOverlay} style={imageStyle} />
            <div className={styles.imageBadgeWrap}>
              <span className={styles.badge}>{getHeroLabel(active)}</span>
            </div>
            <FavoriteButton listingId={active.id} />
          </div>

          <div className={styles.cardBody}>
            <div className={styles.cardHeader}>
              <div className={styles.metaRow}>
                <span className={styles.location}>{active.location}</span>
                <span className={styles.type}>{active.property_type}</span>
              </div>
              <div className={styles.tabs}>
                {showcaseListings.map((listing, index) => (
                  <button
                    key={listing.id}
                    type="button"
                    className={`${styles.tab} ${index === activeIndex ? styles.tabActive : ''}`}
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Zobrazit nabídku ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <h3 className={styles.title}>{active.title}</h3>

            <div className={styles.tags}>
              {chips.map((chip) => (
                <span key={chip} className={styles.chip}>
                  {chip}
                </span>
              ))}
              {opportunityType && <span className={styles.chipMuted}>{opportunityType}</span>}
            </div>

            <div className={styles.priceBlock}>
              <div>
                <span className={styles.priceLabel}>Cena za nabízený podíl</span>
                <strong className={styles.price}>{formatPrice(active.price)}</strong>
              </div>
              <div className={styles.secondaryPrice}>
                <span>Odhad ceny celé nemovitosti</span>
                <strong>{formatPrice(active.full_property_value)}</strong>
              </div>
            </div>

            {priceInsight && <p className={styles.insight}>{priceInsight}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
