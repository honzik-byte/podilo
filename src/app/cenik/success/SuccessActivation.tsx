'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import styles from '../page.module.css';

interface SuccessActivationProps {
  sessionId: string;
}

interface ActivationResult {
  ok: boolean;
  result?: {
    listingId: string;
    listingTitle: string;
    plan: {
      title: string;
    };
  };
  error?: string;
}

export default function SuccessActivation({ sessionId }: SuccessActivationProps) {
  const [state, setState] = useState<ActivationResult | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function confirmPromotion() {
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;

      if (!accessToken) {
        if (isMounted) {
          setState({ ok: false, error: 'Pro potvrzení propagace je potřeba být přihlášený.' });
        }
        return;
      }

      const response = await fetch('/api/stripe/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ sessionId }),
      });

      const json = (await response.json()) as ActivationResult;

      if (isMounted) {
        setState(json);
      }
    }

    void confirmPromotion();

    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  if (!state) {
    return (
      <div className="container">
        <div className={styles.statusCard}>
          <p className={styles.statusEyebrow}>Platba dokončena</p>
          <h1>Potvrzuji aktivaci propagace</h1>
          <p>Zpracovávám propagaci vašeho inzerátu. To může trvat několik sekund.</p>
        </div>
      </div>
    );
  }

  if (!state.ok || !state.result) {
    return (
      <div className="container">
        <div className={styles.statusCard}>
          <h1>Platbu se nepodařilo potvrdit</h1>
          <p>{state.error || 'Zkuste stránku obnovit nebo se vraťte do ceníku.'}</p>
          <Link href="/cenik" className={styles.inlineLink}>Zpět na ceník</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className={styles.statusCard}>
        <p className={styles.statusEyebrow}>Platba dokončena</p>
        <h1>{state.result.plan.title} je aktivní</h1>
        <p>
          Inzerát <strong>{state.result.listingTitle || 'vybraná nabídka'}</strong> má nyní zapnuté zvýšení viditelnosti.
          Změna se propíše do výpisu po nejbližším načtení stránky.
        </p>
        <div className={styles.statusActions}>
          <Link href="/my-listings" className={styles.primaryLink}>Zpět do mých inzerátů</Link>
          <Link href={`/listings/${state.result.listingId}`} className={styles.secondaryLink}>Otevřít detail nabídky</Link>
        </div>
      </div>
    </div>
  );
}
