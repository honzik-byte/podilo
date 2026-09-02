'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { translateAuthError } from '@/lib/authErrors';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import Link from 'next/link';
import styles from '../auth.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(translateAuthError(error.message));
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>Přihlášení</p>
          <h1 className={styles.title}>Vraťte se ke svým uloženým nabídkám a kontaktům</h1>
          <p className={styles.subtitle}>
            Přihlášený účet vám zpřístupní uložené nabídky, telefonní čísla na prodávající a správu vlastních inzerátů.
          </p>
          <ul className={styles.bulletList}>
            <li>Uložené nabídky a budoucí watchlist</li>
            <li>Telefonní kontakt na prodávajícího</li>
            <li>Správa vlastních inzerátů na jednom místě</li>
          </ul>
        </div>

        <form onSubmit={handleLogin} className={styles.formCard}>
          {error && <div className={styles.error}>{error}</div>}

          <div className="form-group">
            <label htmlFor="login-email" className="label">E-mail</label>
            <input
              type="email"
              id="login-email"
              name="email"
              autoComplete="email"
              className="input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password" className="label">Heslo</label>
            <input
              type="password"
              id="login-password"
              name="password"
              autoComplete="current-password"
              className="input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <Button fullWidth type="submit" disabled={loading}>
            {loading ? 'Přihlašuji...' : 'Přihlásit se'}
          </Button>

          <div className={styles.footerText}>
            Nemáte účet? <Link href="/register">Zaregistrujte se</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
