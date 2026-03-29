'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Listing } from '@/types';
import ListingCard from '@/components/ListingCard';
import { getListingQualityChecklist } from '@/lib/listingQuality';
import styles from './page.module.css';

interface LeadSummary {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  created_at: string;
}

export default function MyListingsPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [savedCounts, setSavedCounts] = useState<Record<string, number>>({});
  const [leadCounts, setLeadCounts] = useState<Record<string, number>>({});
  const [recentLeads, setRecentLeads] = useState<Record<string, LeadSummary[]>>({});
  const [analytics, setAnalytics] = useState<Record<string, { detailViews: number; phoneClicks: number; shareClicks: number; leadSubmissions: number }>>({});
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

      const nextListings = (data as Listing[]) || [];
      setListings(nextListings);
      const authHeaders = sessionData.session.access_token
        ? { Authorization: `Bearer ${sessionData.session.access_token}` }
        : undefined;

      const countsEntries = await Promise.all(
        nextListings.map(async (listing) => {
          const [favoritesResponse, leadsResponse, analyticsResponse] = await Promise.all([
            fetch(`/api/favorite-stats/${listing.id}`),
            fetch(`/api/leads/${listing.id}`, { headers: authHeaders }),
            fetch(`/api/listing-analytics/${listing.id}`, { headers: authHeaders }),
          ]);

          const favoritesJson = favoritesResponse.ok ? await favoritesResponse.json() : { count: 0 };
          const leadsJson = leadsResponse.ok ? await leadsResponse.json() : { count: 0, leads: [] };
          const analyticsJson = analyticsResponse.ok
            ? await analyticsResponse.json()
            : { detailViews: 0, phoneClicks: 0, shareClicks: 0, leadSubmissions: 0 };

          return {
            listingId: listing.id,
            savedCount: favoritesJson.count,
            leadCount: leadsJson.count,
            leads: (leadsJson.leads || []).slice(0, 3) as LeadSummary[],
            analytics: analyticsJson,
          };
        })
      );

      setSavedCounts(
        Object.fromEntries(countsEntries.map((item) => [item.listingId, item.savedCount]))
      );
      setLeadCounts(
        Object.fromEntries(countsEntries.map((item) => [item.listingId, item.leadCount]))
      );
      setRecentLeads(
        Object.fromEntries(countsEntries.map((item) => [item.listingId, item.leads]))
      );
      setAnalytics(
        Object.fromEntries(countsEntries.map((item) => [item.listingId, item.analytics]))
      );
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
        <div className={styles.list}>
          {listings.map((listing) => (
            <section key={listing.id} className={styles.listingRow}>
              <div className={styles.listingColumn}>
                <ListingCard listing={listing} />
              </div>

              <div className={styles.asideColumn}>
                <div className={styles.promotionPanel}>
                  <div className={styles.promotionTop}>
                    <div>
                      <span className={styles.metaLabel}>Viditelnost</span>
                      <strong className={styles.panelTitle}>Zvýšení pozice inzerátu</strong>
                    </div>
                    <div className={styles.visibilityBadges}>
                      {listing.is_top ? <span className={styles.liveBadge}>TOP aktivní</span> : null}
                      {listing.is_highlighted ? <span className={styles.liveBadgeAlt}>Zvýraznění aktivní</span> : null}
                      {!listing.is_top && !listing.is_highlighted ? (
                        <span className={styles.idleBadge}>Bez propagace</span>
                      ) : null}
                    </div>
                  </div>
                  <p className={styles.panelText}>
                    Když chceš víc zobrazení nebo rychlejší reakce, zapni na 7 dní TOP pozici nebo zvýraznění.
                  </p>
                  {(listing.top_until || listing.highlighted_until) && (
                    <p className={styles.promotionEnds}>
                      Aktivní do{' '}
                      {new Date(listing.top_until || listing.highlighted_until || '').toLocaleDateString('cs-CZ')}
                    </p>
                  )}
                  <div className={styles.metaActions}>
                    <Link href={`/cenik?listing=${listing.id}`} className={styles.secondaryLink}>
                      Zviditelnit
                    </Link>
                    <Link href={`/admin/edit/${listing.id}`} className={styles.editLink}>
                      Upravit
                    </Link>
                    <Link href={`/listings/${listing.id}`} className={styles.detailLink}>
                      Otevřít detail
                    </Link>
                  </div>
                </div>

                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <span className={styles.metaLabel}>Uloženo uživateli</span>
                    <strong className={styles.metaValue}>{savedCounts[listing.id] || 0}×</strong>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.metaLabel}>Nové kontakty</span>
                    <strong className={styles.metaValue}>{leadCounts[listing.id] || 0}×</strong>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.metaLabel}>Zobrazení detailu</span>
                    <strong className={styles.metaValue}>{analytics[listing.id]?.detailViews || 0}×</strong>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.metaLabel}>Sdílení / telefon</span>
                    <strong className={styles.metaValue}>
                      {(analytics[listing.id]?.shareClicks || 0) + (analytics[listing.id]?.phoneClicks || 0)}×
                    </strong>
                  </div>
                </div>

                <div className={styles.leadsPanel}>
                  <div className={styles.leadsHeader}>
                    <span className={styles.metaLabel}>Checklist kvality</span>
                    <strong className={styles.leadsCount}>{getListingQualityChecklist(listing).score} %</strong>
                  </div>
                  <div className={styles.qualityList}>
                    {getListingQualityChecklist(listing).checks.map((item) => (
                      <div key={item.label} className={styles.qualityItem}>
                        <span>{item.done ? '✓' : '•'}</span>
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.leadsPanel}>
                  <div className={styles.leadsHeader}>
                    <span className={styles.metaLabel}>Lead inbox</span>
                    <strong className={styles.leadsCount}>{leadCounts[listing.id] || 0} kontaktů</strong>
                  </div>
                  {recentLeads[listing.id]?.length ? (
                    <div className={styles.leadsList}>
                      {recentLeads[listing.id].map((lead) => (
                        <div key={lead.id} className={styles.leadItem}>
                          <div className={styles.leadTop}>
                            <strong>{lead.name}</strong>
                            <span>{new Date(lead.created_at).toLocaleString('cs-CZ')}</span>
                          </div>
                          <div className={styles.leadContacts}>
                            <span>{lead.email}</span>
                            {lead.phone && <span>{lead.phone}</span>}
                          </div>
                          <p>{lead.message}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.leadsEmpty}>Zatím žádné kontakty k tomuto inzerátu.</p>
                  )}
                  <div className={styles.analyticsRow}>
                    <span>Sdílení: {analytics[listing.id]?.shareClicks || 0}</span>
                    <span>Kliky na telefon: {analytics[listing.id]?.phoneClicks || 0}</span>
                    <span>Odeslané leady: {analytics[listing.id]?.leadSubmissions || 0}</span>
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
