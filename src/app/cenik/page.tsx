import styles from './page.module.css';
import Link from 'next/link';
import PricingCheckout from './PricingCheckout';

interface PricingPageProps {
  searchParams: Promise<{ listing?: string; cancelled?: string }>;
}

export default async function PricingPage({ searchParams }: PricingPageProps) {
  const resolvedParams = await searchParams;

  return (
    <div className="container">
      <div className={styles.header}>
        <h1 className={styles.title}>Zvýšení viditelnosti inzerátu</h1>
        <p className={styles.intro}>
          Na portálu Podilo mohou uživatelé zvýšit viditelnost svého inzerátu pomocí doplňkových služeb. Tyto služby pomáhají zobrazit nabídku na lepších pozicích ve výpisu a zvýšit šanci na kontakt od zájemců.
        </p>
      </div>

      <PricingCheckout
        initialListingId={resolvedParams.listing}
        cancelled={resolvedParams.cancelled === '1'}
        selectorMode="header"
      />

      <div className={styles.disclaimerBox}>
        <p className={styles.disclaimerText}>
          Podilo je inzertní platforma, která umožňuje uživatelům zveřejňovat nabídky spoluvlastnických podílů na nemovitostech. Platforma nezprostředkovává samotné transakce mezi uživateli.
        </p>
        <p className={styles.linkLine}>
          Pro aktivní kupující připravujeme také plán <Link href="/premium">Investor Pro</Link>.
        </p>
      </div>
    </div>
  );
}
