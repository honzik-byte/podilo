'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { Listing } from '@/types';
import Button from '@/components/Button';
import { promotionPlans, type PromotionPlanId } from '@/lib/promotionPlans';
import styles from './page.module.css';

interface PricingCheckoutProps {
  initialListingId?: string;
  cancelled?: boolean;
  selectorMode?: 'stacked' | 'header';
}

export default function PricingCheckout({
  initialListingId = '',
  cancelled = false,
  selectorMode = 'stacked',
}: PricingCheckoutProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedListingId, setSelectedListingId] = useState(initialListingId);
  const [loadingListings, setLoadingListings] = useState(true);
  const [checkoutPlan, setCheckoutPlan] = useState<PromotionPlanId | null>(null);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function loadOwnListings() {
      const { data: sessionData } = await supabase.auth.getSession();
      setIsLoggedIn(Boolean(sessionData.session));

      if (!sessionData.session) {
        setLoadingListings(false);
        return;
      }

      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', sessionData.session.user.id)
        .order('created_at', { ascending: false });

      const nextListings = (data as Listing[]) || [];
      setListings(nextListings);

      if (!initialListingId && nextListings[0]) {
        setSelectedListingId(nextListings[0].id);
      }

      setLoadingListings(false);
    }

    loadOwnListings();
  }, [initialListingId]);

  const selectedListing = useMemo(
    () => listings.find((listing) => listing.id === selectedListingId) || null,
    [listings, selectedListingId]
  );

  const handleCheckout = async (planId: PromotionPlanId) => {
    setError('');
    setCheckoutPlan(planId);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError('Pro spuštění platby se nejdřív přihlaste.');
        return;
      }

      if (!selectedListingId) {
        setError('Nejdřív vyberte inzerát, který chcete propagovat.');
        return;
      }

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          listingId: selectedListingId,
          planId,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.url) {
        throw new Error(json.error || 'Nepodařilo se vytvořit platební stránku.');
      }

      window.location.href = json.url;
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : 'Platbu se nepodařilo zahájit.');
      setCheckoutPlan(null);
      return;
    }
  };

  const selectorCard = (
    <div className={`${styles.selectorCard} ${selectorMode === 'header' ? styles.selectorCardHeader : ''}`}>
        <div>
          <p className={styles.selectorEyebrow}>Výběr inzerátu</p>
          <h2 className={styles.selectorTitle}>Vyberte nabídku, kterou chcete zviditelnit</h2>
          <p className={styles.selectorText}>
            Po úspěšné platbě se u vybraného inzerátu automaticky zapne odpovídající forma zvýšení viditelnosti.
          </p>
        </div>

        {!isLoggedIn ? (
          <div className={styles.selectorActions}>
            <Link href="/login">
              <Button>Přihlásit se</Button>
            </Link>
          </div>
        ) : loadingListings ? (
          <p className={styles.selectorInfo}>Načítám vaše inzeráty...</p>
        ) : listings.length === 0 ? (
          <div className={styles.selectorActions}>
            <p className={styles.selectorInfo}>Nejdřív musíte mít aktivní inzerát, který chcete propagovat.</p>
            <Link href="/add">
              <Button>Přidat inzerát</Button>
            </Link>
          </div>
        ) : (
          <div className={styles.selectorGrid}>
            <div className={styles.selectorField}>
              <label htmlFor="listingId" className={styles.selectorLabel}>Můj inzerát</label>
              <select
                id="listingId"
                className="select"
                value={selectedListingId}
                onChange={(event) => setSelectedListingId(event.target.value)}
              >
                <option value="">Vyberte inzerát</option>
                {listings.map((listing) => (
                  <option key={listing.id} value={listing.id}>
                    {listing.title}
                  </option>
                ))}
              </select>
            </div>

            {selectedListing && (
              <div className={styles.selectedListingCard}>
                <strong>{selectedListing.title}</strong>
                <span>{selectedListing.location}</span>
                <span>{selectedListing.price.toLocaleString('cs-CZ')} Kč</span>
              </div>
            )}
          </div>
        )}

        {cancelled && <p className={styles.notice}>Platba byla zrušena. Výběr inzerátu zůstal beze změny.</p>}
        {error && <p className={styles.error}>{error}</p>}
      </div>
  );

  return (
    <>
      {selectorCard}

      <div className={styles.pricingGrid}>
        {promotionPlans.map((plan) => (
          <div key={plan.id} className={`${styles.card} ${plan.isPopular ? styles.popular : ''}`}>
            <div className={styles.cardHeader}>
              {plan.isPopular && <div className={styles.popularBadge}>Nejčastější volba</div>}
              <h2 className={styles.cardTitle}>{plan.title}</h2>
              <div className={styles.price}>
                {plan.priceCzk} Kč<span> / {plan.durationDays} dní</span>
              </div>
            </div>
            <div className={styles.cardBody}>
              <p>{plan.description}</p>
              <ul className={styles.featureList}>
                <li>{plan.apply.is_top ? 'Přední pozice ve výpisu' : 'Vizuální odlišení v gridu'}</li>
                <li>{plan.apply.is_highlighted ? 'Jemné zvýraznění karty' : 'Štítek TOP nabídka'}</li>
                <li>Aktivace hned po úspěšné platbě</li>
              </ul>
            </div>
            <div className={styles.cardAction}>
              <Button
                type="button"
                fullWidth
                onClick={() => handleCheckout(plan.id)}
                disabled={!isLoggedIn || loadingListings || listings.length === 0 || !selectedListingId || checkoutPlan !== null}
              >
                {checkoutPlan === plan.id ? 'Přesměrovávám…' : 'Zaplatit přes Stripe'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
