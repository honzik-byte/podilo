'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Listing } from '@/types';
import { parseListing, serializeListingDescription } from '@/lib/listingMetadata';
import styles from './page.module.css';

interface QuickListingTogglesProps {
  listing: Listing;
}

export default function QuickListingToggles({ listing }: QuickListingTogglesProps) {
  const router = useRouter();
  const [isTop, setIsTop] = useState(listing.is_top);
  const [isHighlighted, setIsHighlighted] = useState(listing.is_highlighted);
  const [listingStatus, setListingStatus] = useState(parseListing(listing).details.listingStatus || 'Aktivní');
  const [loadingKey, setLoadingKey] = useState<'top' | 'highlighted' | 'status' | null>(null);

  const persistLocalListing = async (nextListing: Listing) => {
    const response = await fetch(`/api/local-listings/${listing.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nextListing),
    });

    if (!response.ok) {
      throw new Error('Lokální inzerát se nepodařilo uložit.');
    }
  };

  const persistStatus = async (nextStatus: string) => {
    const parsed = parseListing(listing);
    const nextDescription = serializeListingDescription(parsed.description, {
      ...parsed.details,
      listingStatus: nextStatus,
    });

    if (listing.id.startsWith('local-')) {
      await persistLocalListing({
        ...listing,
        description: nextDescription,
      });
      return;
    }

    const { error } = await supabase
      .from('listings')
      .update({ description: nextDescription })
      .eq('id', listing.id);

    if (error) {
      throw error;
    }
  };

  const toggleField = async (field: 'is_top' | 'is_highlighted') => {
    const key = field === 'is_top' ? 'top' : 'highlighted';
    const currentValue = field === 'is_top' ? isTop : isHighlighted;
    const nextValue = !currentValue;

    setLoadingKey(key);
    if (field === 'is_top') {
      setIsTop(nextValue);
    } else {
      setIsHighlighted(nextValue);
    }

    try {
      if (listing.id.startsWith('local-')) {
        await persistLocalListing({
          ...listing,
          is_top: field === 'is_top' ? nextValue : isTop,
          is_highlighted: field === 'is_highlighted' ? nextValue : isHighlighted,
        });
      } else {
        const { error } = await supabase
          .from('listings')
          .update({ [field]: nextValue })
          .eq('id', listing.id);

        if (error) {
          throw error;
        }
      }

      router.refresh();
    } catch (error) {
      if (field === 'is_top') {
        setIsTop(currentValue);
      } else {
        setIsHighlighted(currentValue);
      }
      alert(error instanceof Error ? error.message : 'Změnu se nepodařilo uložit.');
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <div className={styles.toggleRow}>
      <button
        type="button"
        className={`${styles.togglePill} ${isTop ? styles.toggleActive : ''}`}
        onClick={() => toggleField('is_top')}
        disabled={loadingKey !== null}
      >
        {loadingKey === 'top' ? 'Ukládám…' : isTop ? 'TOP zapnuto' : 'TOP vypnuto'}
      </button>
      <button
        type="button"
        className={`${styles.togglePill} ${isHighlighted ? styles.toggleAccent : ''}`}
        onClick={() => toggleField('is_highlighted')}
        disabled={loadingKey !== null}
      >
        {loadingKey === 'highlighted'
          ? 'Ukládám…'
          : isHighlighted
            ? 'Zvýraznění zapnuto'
            : 'Zvýraznění vypnuto'}
      </button>
      <select
        className={styles.statusSelect}
        value={listingStatus}
        disabled={loadingKey !== null}
        onChange={async (event) => {
          const nextStatus = event.target.value;
          const previousStatus = listingStatus;
          setListingStatus(nextStatus);
          setLoadingKey('status');

          try {
            await persistStatus(nextStatus);
            router.refresh();
          } catch (error) {
            setListingStatus(previousStatus);
            alert(error instanceof Error ? error.message : 'Stav nabídky se nepodařilo uložit.');
          } finally {
            setLoadingKey(null);
          }
        }}
      >
        <option value="Aktivní">Aktivní</option>
        <option value="V jednání">V jednání</option>
        <option value="Rezervováno">Rezervováno</option>
        <option value="Prodáno">Prodáno</option>
        <option value="Staženo">Staženo</option>
      </select>
    </div>
  );
}
