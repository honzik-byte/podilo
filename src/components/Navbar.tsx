'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsMenuOpen(false);
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.navContainer}`}>
        <Link href="/" className={styles.logo} onClick={closeMenu}>
          Podilo
        </Link>
        <button
          type="button"
          className={styles.menuButton}
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-expanded={isMenuOpen}
          aria-controls="site-navigation"
          aria-label={isMenuOpen ? 'Zavřít menu' : 'Otevřít menu'}
        >
          <span className={styles.menuButtonLine} />
          <span className={styles.menuButtonLine} />
          <span className={styles.menuButtonLine} />
        </button>
        <nav
          id="site-navigation"
          className={`${styles.navLinks} ${isMenuOpen ? styles.navLinksOpen : ''}`}
        >
          <Link href="/poradna" className={styles.link} onClick={closeMenu}>
            Poradna
          </Link>
          <Link href="/saved" className={styles.link} onClick={closeMenu}>
            Uložené
          </Link>
          <Link href="/listings" className={styles.link} onClick={closeMenu}>
            Nabídky
          </Link>
          {session ? (
            <>
              <Link href="/my-listings" className={styles.link} onClick={closeMenu}>
                Mé inzeráty
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className={styles.link}
                  style={{ color: '#d32f2f', fontWeight: 600 }}
                  onClick={closeMenu}
                >
                  Admin
                </Link>
              )}
              <Link href="/add" className={styles.ctaButton} onClick={closeMenu}>
                Přidat inzerát
              </Link>
              <button
                onClick={handleLogout}
                className={styles.link}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                  padding: 0,
                }}
              >
                Odhlásit se
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.link} onClick={closeMenu}>
                Přihlásit se
              </Link>
              <Link href="/register" className={styles.ctaButton} onClick={closeMenu}>
                Registrace
              </Link>
            </>
          )}
        </nav>
      </div>
      {isMenuOpen && <button type="button" className={styles.backdrop} onClick={closeMenu} aria-label="Zavřít menu" />}
    </header>
  );
}
