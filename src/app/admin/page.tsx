'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Listing } from '@/types';
import styles from './page.module.css';
import DeleteButton from './DeleteButton';
import QuickListingToggles from './QuickListingToggles';
import UserRoleManager from './UserRoleManager';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const supportEmail = 'podpora@podilo.cz';

interface UserSummary {
  user_id: string;
  role: string;
  listingCount: number;
}

interface CommerceOverview {
  promotions: Array<{
    id: string;
    listing_id: string;
    promotion_type: string;
    status: string;
    amount_czk?: number | null;
    ends_at?: string | null;
    created_at: string;
  }>;
  paymentEvents: Array<{
    id: string;
    event_type: string;
    listing_id?: string | null;
    created_at: string;
  }>;
  pendingNotifications: Array<{
    id: string;
    type: string;
    recipient_email: string;
    send_at: string;
  }>;
  auditLogs: Array<{
    id: string;
    entity_type: string;
    action: string;
    created_at: string;
  }>;
  errorReports: Array<{
    id: string;
    source: string;
    message: string;
    severity: string;
    created_at: string;
  }>;
  engagement: {
    recentLeads: Array<{ listing_id: string; created_at: string }>;
    recentFavorites: Array<{ listing_id: string; created_at: string }>;
    recentEvents: Array<{ listing_id: string; event_type: string; created_at: string }>;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [displayListings, setDisplayListings] = useState<Listing[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [commerceOverview, setCommerceOverview] = useState<CommerceOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const init = async () => {
      await fetch('/api/promotions/sync', { method: 'POST' });

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (roleError || !roleData || roleData.role !== 'admin') {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      const localResponse = await fetch('/api/local-listings');
      const localListings = localResponse.ok ? ((await localResponse.json()) as Listing[]) : [];
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role');

      setIsAdmin(true);
      setDisplayListings([...(data as Listing[] || []), ...localListings]);
      const listingCounts = new Map<string, number>();
      ((data as Listing[]) || []).forEach((listing) => {
        const userId = listing.user_id || 'bez přiřazení';
        listingCounts.set(userId, (listingCounts.get(userId) || 0) + 1);
      });
      setUsers(
        ((roles as Array<{ user_id: string; role: string }>) || []).map((role) => ({
          user_id: role.user_id,
          role: role.role,
          listingCount: listingCounts.get(role.user_id) || 0,
        }))
      );

      const accessToken = session.access_token;
      const commerceResponse = await fetch('/api/admin/commerce-overview', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (commerceResponse.ok) {
        setCommerceOverview((await commerceResponse.json()) as CommerceOverview);
      }

      setLoading(false);
    };

    void init();
  }, [router]);

  if (loading) {
    return <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>Načítám...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <h1>Přístup odepřen</h1>
        <p>Nemáte oprávnění k prohlížení této stránky (nejste administrátor).</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBottom: '5rem' }}>
      <div className={styles.header}>
        <h1 className={styles.title}>Administrace</h1>
        <p className={styles.subtitle}>
          Přehled inzerátů i uživatelů. Rychlé změny děláte přímo z jedné obrazovky.
        </p>
      </div>

      {commerceOverview && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionEyebrow}>Commerce a provoz</p>
              <h2 className={styles.sectionTitle}>Platby, promotion a systémové signály</h2>
            </div>
          </div>

          <div className={styles.commerceStats}>
            <div className={styles.commerceStatCard}>
              <span>Aktivní promotion</span>
              <strong>{commerceOverview.promotions.filter((item) => item.status === 'active').length}</strong>
            </div>
            <div className={styles.commerceStatCard}>
              <span>Refund / chargeback</span>
              <strong>{commerceOverview.promotions.filter((item) => item.status === 'refunded' || item.status === 'chargeback').length}</strong>
            </div>
            <div className={styles.commerceStatCard}>
              <span>Pending notifikace</span>
              <strong>{commerceOverview.pendingNotifications.length}</strong>
            </div>
            <div className={styles.commerceStatCard}>
              <span>Poslední chyby</span>
              <strong>{commerceOverview.errorReports.length}</strong>
            </div>
          </div>

          <div className={styles.commerceGrid}>
            <div className={styles.commercePanel}>
              <h3>Aktivní a poslední promotion</h3>
              <div className={styles.timelineList}>
                {commerceOverview.promotions.slice(0, 8).map((promotion) => (
                  <div key={promotion.id} className={styles.timelineItem}>
                    <div>
                      <strong>{promotion.promotion_type}</strong>
                      <p>{promotion.status} · listing {promotion.listing_id}</p>
                    </div>
                    <div className={styles.timelineMeta}>
                      <span>{promotion.amount_czk ? `${promotion.amount_czk.toLocaleString('cs-CZ')} Kč` : 'Bez částky'}</span>
                      <span>{promotion.ends_at ? `do ${new Date(promotion.ends_at).toLocaleDateString('cs-CZ')}` : 'bez konce'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.commercePanel}>
              <h3>Payment eventy</h3>
              <div className={styles.timelineList}>
                {commerceOverview.paymentEvents.slice(0, 8).map((event) => (
                  <div key={event.id} className={styles.timelineItem}>
                    <div>
                      <strong>{event.event_type}</strong>
                      <p>{event.listing_id || 'bez listingu'}</p>
                    </div>
                    <div className={styles.timelineMeta}>
                      <span>{new Date(event.created_at).toLocaleString('cs-CZ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.commercePanel}>
              <h3>Audit log</h3>
              <div className={styles.timelineList}>
                {commerceOverview.auditLogs.slice(0, 8).map((item) => (
                  <div key={item.id} className={styles.timelineItem}>
                    <div>
                      <strong>{item.action}</strong>
                      <p>{item.entity_type}</p>
                    </div>
                    <div className={styles.timelineMeta}>
                      <span>{new Date(item.created_at).toLocaleString('cs-CZ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.commercePanel}>
              <h3>Error reporting</h3>
              <div className={styles.timelineList}>
                {commerceOverview.errorReports.length ? (
                  commerceOverview.errorReports.slice(0, 8).map((item) => (
                    <div key={item.id} className={styles.timelineItem}>
                      <div>
                        <strong>{item.source}</strong>
                        <p>{item.message}</p>
                      </div>
                      <div className={styles.timelineMeta}>
                        <span>{item.severity}</span>
                        <span>{new Date(item.created_at).toLocaleString('cs-CZ')}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={styles.emptyText}>Zatím bez nových systémových chyb.</p>
                )}
              </div>
            </div>

            <div className={styles.commercePanel}>
              <h3>Engagement feed</h3>
              <div className={styles.timelineList}>
                {commerceOverview.engagement.recentEvents.slice(0, 8).map((item) => (
                  <div key={`${item.listing_id}-${item.event_type}-${item.created_at}`} className={styles.timelineItem}>
                    <div>
                      <strong>{item.event_type}</strong>
                      <p>{item.listing_id}</p>
                    </div>
                    <div className={styles.timelineMeta}>
                      <span>{new Date(item.created_at).toLocaleString('cs-CZ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Uživatelé</p>
            <h2 className={styles.sectionTitle}>Role a aktivita</h2>
          </div>
        </div>
        <div className={styles.userGrid}>
          {users.map((user) => (
            <div key={user.user_id} className={styles.userCard}>
              <div className={styles.userTop}>
                <strong>{user.role === 'admin' ? 'Administrátor' : 'Uživatel'}</strong>
                <span>{user.listingCount} inzerátů</span>
              </div>
              <p className={styles.userId}>{user.user_id}</p>
              <div className={styles.userActions}>
                <UserRoleManager userId={user.user_id} role={user.role} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Inzeráty</p>
            <h2 className={styles.sectionTitle}>Rychlá moderace a úpravy</h2>
          </div>
        </div>
        <div className={styles.listingGrid}>
          {displayListings.map((listing) => (
            <article key={listing.id} className={styles.listingCard}>
              <div className={styles.listingTop}>
                <div>
                  <h3 className={styles.listingTitle}>{listing.title}</h3>
                  <p className={styles.listingMeta}>{listing.location} · {listing.property_type} · {listing.share_size}</p>
                </div>
                <strong className={styles.price}>{listing.price.toLocaleString('cs-CZ')} Kč</strong>
              </div>

              <div className={styles.listingInfo}>
                <span>{supportEmail}</span>
                <span>{listing.id.startsWith('local-') ? 'Lokální demo' : 'DB záznam'}</span>
              </div>

              <QuickListingToggles listing={listing} />
              <div className={styles.actions}>
                <Link href={`/admin/edit/${listing.id}`} className={styles.editLink}>
                  Upravit
                </Link>
                <DeleteButton listingId={listing.id} />
              </div>
            </article>
          ))}
        </div>

        {displayListings.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-text)' }}>
            Žádné inzeráty k zobrazení.
          </div>
        )}
      </section>
    </div>
  );
}
