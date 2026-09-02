import Link from 'next/link';
import styles from './not-found.module.css';

export const metadata = {
  title: 'Stránka nenalezena | Podilo',
  description: 'Tato stránka na Podilo neexistuje nebo byla odstraněna.',
};

export default function NotFound() {
  return (
    <div className={styles.page}>
      <span className={styles.code}>Chyba 404</span>
      <h1 className={styles.title}>Tuhle stránku jsme nenašli</h1>
      <p className={styles.text}>
        Odkaz může být zastaralý, nebo byl inzerát mezitím stažen z nabídky. Zkuste se podívat na
        aktuální nabídky podílů, nebo se vraťte na úvodní stránku.
      </p>

      <div className={styles.actions}>
        <Link href="/listings" className={styles.primaryLink}>
          Prohlížet nabídky
        </Link>
        <Link href="/" className={styles.secondaryLink}>
          Zpět na úvod
        </Link>
      </div>

      <div className={styles.linkList}>
        <Link href="/poradna">Poradna</Link>
        <Link href="/how-it-works">Jak to funguje</Link>
        <Link href="/faq">Časté dotazy</Link>
        <Link href="/contact">Kontakt</Link>
      </div>
    </div>
  );
}
