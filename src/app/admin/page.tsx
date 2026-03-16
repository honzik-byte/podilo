'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Listing } from '@/types';
import styles from './page.module.css';
import DeleteButton from './DeleteButton';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [displayListings, setDisplayListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
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

    setIsAdmin(true);
    fetchListings();
  };

  const fetchListings = async () => {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (data) {
      setDisplayListings(data as Listing[]);
    }
    setLoading(false);
  };

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
          Správa inzerátů. Zde můžete smazat nevhodné příspěvky.
        </p>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Název</th>
              <th>Vlastník (Email)</th>
              <th>Cena</th>
              <th>Akce</th>
            </tr>
          </thead>
          <tbody>
            {displayListings.map((listing) => (
              <tr key={listing.id}>
                <td>{listing.title}</td>
                <td>{listing.contact_email}</td>
                <td>{listing.price.toLocaleString('cs-CZ')} Kč</td>
                <td>
                  <DeleteButton listingId={listing.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {displayListings.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-text)' }}>
            Žádné inzeráty k zobrazení.
          </div>
        )}
      </div>
    </div>
  );
}
