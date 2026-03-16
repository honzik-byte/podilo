'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Listing } from '@/types';
import ListingCard from '@/components/ListingCard';
import styles from './page.module.css';

export default function MyListingsPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOwnListings() {
      const { data: sessionData } = await supabase.auth.getSession();
      setSession(sessionData.session);

      if (!sessionData.session) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', sessionData.session.user.id)
        .order('created_at', { ascending: false });

      setListings((data as Listing[]) || []);
      setLoading(false);
    }

    loadOwnListings();
  }, []);

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Správa inzerátů</p>
        <h1 className={styles.title}>Moje nabídky</h1>
        <p className={styles.subtitle}>
          Přehled vašich aktivních inzerátů a rychlý návrat k nabídkám, které už na Podilo běží.
        </p>
      </div>

      {loading ? (
        <div className={styles.card}>Načítám vaše inzeráty...</div>
      ) : !session ? (
        <div className={styles.card}>
          <h2>Pro správu inzerátů se přihlaste</h2>
          <p>Účet vám umožní mít vlastní nabídky pohromadě a postupně nad nimi získat více nástrojů správy.</p>
          <div className={styles.actions}>
            <Link href="/login" className={styles.primaryLink}>Přihlásit se</Link>
            <Link href="/register" className={styles.secondaryLink}>Registrace</Link>
          </div>
        </div>
      ) : listings.length === 0 ? (
        <div className={styles.card}>
          <h2>Zatím nemáte žádný inzerát</h2>
          <p>Po vytvoření nabídky se zde zobrazí vaše podíly a později i další nástroje pro jejich správu.</p>
          <div className={styles.actions}>
            <Link href="/add" className={styles.primaryLink}>Přidat inzerát</Link>
          </div>
        </div>
      ) : (
        <div className={styles.grid}>
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
