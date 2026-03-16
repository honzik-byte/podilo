'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Button from '@/components/Button';
import Link from 'next/link';
import styles from '../auth.module.css';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Účet vytvořen! Pokud je vyžadováno potvrzení e-mailu vaším Supabase nastavením, zkontrolujte si schránku. Jinak se můžete přihlásit.');
    }
    setLoading(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>Registrace</p>
          <h1 className={styles.title}>Vytvořte si účet pro práci s nabídkami, ne jen pro login</h1>
          <p className={styles.subtitle}>
            Účet na Podilo je užitečný hlavně tehdy, když chcete aktivně sledovat podíly, ukládat si příležitosti a spravovat vlastní nabídky.
          </p>
          <ul className={styles.bulletList}>
            <li>Uložení nabídek do vlastního watchlistu</li>
            <li>Zobrazení telefonního čísla prodávajícího</li>
            <li>Správa vlastních inzerátů</li>
            <li>Připravenost na budoucí upozornění a saved searches</li>
          </ul>
        </div>

        <form onSubmit={handleRegister} className={styles.formCard}>
          {error && <div className={styles.error}>{error}</div>}

          {message && <div className={styles.success}>{message}</div>}

          <div className="form-group">
            <label className="label">E-mail</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="label">Heslo</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
            />
          </div>

          <Button fullWidth type="submit" disabled={loading}>
            {loading ? 'Vytvářím účet...' : 'Zaregistrovat se'}
          </Button>

          <div className={styles.footerText}>
            Již máte účet? <Link href="/login">Přihlaste se</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
