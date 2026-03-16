'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) checkAdminRole(session.user.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        checkAdminRole(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminRole = async (userId: string) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
    
    if (data && data.role === 'admin') {
      setIsAdmin(true);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className={styles.header}>
      <div className={`container ${styles.navContainer}`}>
        <Link href="/" className={styles.logo}>
          Podilo
        </Link>
        <nav className={styles.navLinks}>
          <Link href="/listings" className={styles.link}>
            Nabídky
          </Link>
          {session ? (
            <>
              {isAdmin && (
                <Link href="/admin" className={styles.link} style={{ color: '#d32f2f', fontWeight: 600 }}>
                  Admin
                </Link>
              )}
              <Link href="/add" className={styles.ctaButton}>
                Přidat inzerát
              </Link>
              <button 
                onClick={handleLogout} 
                className={styles.link} 
                style={{background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', padding: 0}}
              >
                Odhlásit se
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.link}>
                Přihlásit se
              </Link>
              <Link href="/register" className={styles.ctaButton}>
                Registrace
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
