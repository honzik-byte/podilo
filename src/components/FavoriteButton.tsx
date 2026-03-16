'use client';

import { useEffect, useState } from 'react';
import { readFavorites, toggleFavorite } from '@/lib/favorites';
import styles from './FavoriteButton.module.css';

interface FavoriteButtonProps {
  listingId: string;
  variant?: 'overlay' | 'inline';
}

export default function FavoriteButton({ listingId, variant = 'overlay' }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const sync = () => {
      setIsFavorite(readFavorites().includes(listingId));
    };

    sync();
    window.addEventListener('storage', sync);
    window.addEventListener('podilo-favorites-updated', sync as EventListener);

    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('podilo-favorites-updated', sync as EventListener);
    };
  }, [listingId]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const nextFavorites = toggleFavorite(listingId);
    setIsFavorite(nextFavorites.includes(listingId));
  };

  return (
    <button
      type="button"
      className={`${styles.button} ${styles[variant]} ${isFavorite ? styles.active : ''}`}
      onClick={handleClick}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? 'Odebrat z uložených' : 'Uložit inzerát'}
    >
      <span className={styles.icon}>{isFavorite ? '★' : '☆'}</span>
      <span className={styles.label}>{isFavorite ? 'Uloženo' : 'Uložit'}</span>
    </button>
  );
}
