'use client';

import { useState } from 'react';
import styles from './ShareListingActions.module.css';

interface ShareListingActionsProps {
  title: string;
  listingId: string;
}

export default function ShareListingActions({ title, listingId }: ShareListingActionsProps) {
  const [message, setMessage] = useState('');
  const trackShare = async () => {
    await fetch(`/api/listing-analytics/${listingId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: 'share_click',
      }),
    });
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className={styles.row}>
      <button
        type="button"
        className={styles.button}
        onClick={async () => {
          if (!currentUrl) {
            return;
          }

          if (navigator.share) {
            await trackShare();
            await navigator.share({
              title,
              url: currentUrl,
            });
            return;
          }

          await navigator.clipboard.writeText(currentUrl);
          await trackShare();
          setMessage('Odkaz zkopírován.');
          window.setTimeout(() => setMessage(''), 2200);
        }}
      >
        Sdílet nabídku
      </button>
      {message && <span className={styles.message}>{message}</span>}
    </div>
  );
}
