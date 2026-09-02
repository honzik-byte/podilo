'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import styles from './not-found.module.css';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[podilo] Neošetřená chyba stránky:', error);
  }, [error]);

  return (
    <div className={styles.page}>
      <span className={styles.code}>Něco se pokazilo</span>
      <h1 className={styles.title}>Stránku se nepodařilo načíst</h1>
      <p className={styles.text}>
        Narazili jsme na neočekávanou chybu. Zkuste to prosím znovu — pokud potíže přetrvají, dejte
        nám vědět na podpora@podilo.cz.
      </p>

      <div className={styles.actions}>
        <button type="button" onClick={reset} className={styles.primaryLink}>
          Zkusit znovu
        </button>
        <Link href="/" className={styles.secondaryLink}>
          Zpět na úvod
        </Link>
      </div>

      {error.digest && (
        <div className={styles.linkList}>
          <span>Kód chyby: {error.digest}</span>
        </div>
      )}
    </div>
  );
}
