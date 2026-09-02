'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { EmailOtpType } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

const SUPPORTED_TYPES: EmailOtpType[] = [
  'signup',
  'invite',
  'magiclink',
  'recovery',
  'email_change',
  'email',
];

function parseType(raw: string | null): EmailOtpType | null {
  return SUPPORTED_TYPES.find((type) => type === raw) ?? null;
}

function ConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<'verifying' | 'success' | 'error'>('verifying');
  // Supabase invalidates the token on first use, so React's double-invoked
  // effects in development must not fire the request twice.
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) {
      return;
    }
    startedRef.current = true;

    const tokenHash = searchParams.get('token_hash');
    const type = parseType(searchParams.get('type'));

    if (!tokenHash || !type) {
      setState('error');
      return;
    }

    supabase.auth
      .verifyOtp({ token_hash: tokenHash, type })
      .then(({ error }) => {
        if (error) {
          console.error('[podilo] Ověření e-mailu selhalo:', error.message);
          setState('error');
          return;
        }

        setState('success');
        router.refresh();
      })
      .catch((verifyError) => {
        console.error('[podilo] Ověření e-mailu selhalo:', verifyError);
        setState('error');
      });
  }, [router, searchParams]);

  if (state === 'verifying') {
    return (
      <div className={styles.page}>
        <div className={styles.spinner} />
        <h1 className={styles.title}>Ověřujeme váš e-mail</h1>
        <p className={styles.text}>Chvilku strpení, hned to bude.</p>
      </div>
    );
  }

  if (state === 'success') {
    return (
      <div className={styles.page}>
        <span className={styles.eyebrow}>Hotovo</span>
        <h1 className={styles.title}>Účet je aktivní</h1>
        <p className={styles.text}>
          E-mail je potvrzený a rovnou jste přihlášení. Můžete si ukládat nabídky, zobrazit kontakty
          na prodávající a spravovat vlastní inzeráty.
        </p>
        <div className={styles.actions}>
          <Link href="/listings" className={styles.primaryLink}>
            Prohlížet nabídky
          </Link>
          <Link href="/add" className={styles.secondaryLink}>
            Přidat inzerát
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <span className={styles.eyebrow}>Odkaz nefunguje</span>
      <h1 className={styles.title}>Tenhle potvrzovací odkaz už neplatí</h1>
      <p className={styles.text}>
        Odkaz má omezenou platnost a jde použít jen jednou — je taky možné, že už účet potvrzený je.
        Zkuste se přihlásit, a pokud to nepůjde, zaregistrujte se znovu a pošleme nový odkaz.
      </p>
      <div className={styles.actions}>
        <Link href="/login" className={styles.primaryLink}>
          Přihlásit se
        </Link>
        <Link href="/register" className={styles.secondaryLink}>
          Registrovat znovu
        </Link>
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.page}>
          <div className={styles.spinner} />
          <h1 className={styles.title}>Ověřujeme váš e-mail</h1>
        </div>
      }
    >
      <ConfirmContent />
    </Suspense>
  );
}
