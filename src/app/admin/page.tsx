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

export default function AdminDashboard() {
  const router = useRouter();
  const [displayListings, setDisplayListings] = useState<Listing[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);
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
