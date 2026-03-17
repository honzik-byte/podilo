'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { readFavorites } from '@/lib/favorites';
import { Listing } from '@/types';
import ListingCard from '@/components/ListingCard';
import WhyRegisterCard from '@/components/WhyRegisterCard';
import styles from './page.module.css';

export default function SavedListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFavorites() {
      await fetch('/api/promotions/sync', { method: 'POST' });

      const favorites = readFavorites();

      if (favorites.length === 0) {
        setListings([]);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('listings')
        .select('*')
        .in('id', favorites)
        .order('created_at', { ascending: false });

      setListings((data as Listing[]) || []);
      setLoading(false);
    }

    loadFavorites();
    const sync = () => loadFavorites();
    window.addEventListener('podilo-favorites-updated', sync as EventListener);

    return () => {
      window.removeEventListener('podilo-favorites-updated', sync as EventListener);
    };
  }, []);

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Watchlist</p>
        <h1 className={styles.title}>Uložené nabídky</h1>
        <p className={styles.subtitle}>
          Mějte si pohromadě podíly, které chcete porovnat, vrátit se k nim později nebo sledovat další kroky.
        </p>
      </div>

      {loading ? (
        <div className={styles.emptyState}>Načítám uložené nabídky...</div>
      ) : listings.length > 0 ? (
        <div className={styles.grid}>
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <h2>Zatím nemáte nic uloženého</h2>
          <p>
            Na výpisu nebo detailu klikněte na tlačítko <strong>Uložit inzerát</strong> a začněte si skládat vlastní watchlist příležitostí.
          </p>
          <div className={styles.actions}>
            <Link href="/listings" className={styles.primaryLink}>Prohlížet nabídky</Link>
          </div>
        </div>
      )}

      <div className={styles.registerSection}>
        <WhyRegisterCard title="Pro aktivní investory je účet praktická pracovní plocha" />
      </div>
    </div>
  );
}
