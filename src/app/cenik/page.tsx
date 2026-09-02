import styles from './page.module.css';
import Link from 'next/link';
import PricingCheckout from './PricingCheckout';
import { paymentsEnabled } from '@/lib/paymentsEnabled';

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

      {paymentsEnabled ? (
        <PricingCheckout
          initialListingId={resolvedParams.listing}
          cancelled={resolvedParams.cancelled === '1'}
          selectorMode="header"
        />
      ) : (
        <div className={styles.selectorCard}>
          <div className={styles.selectorCardHeader}>
            <p className={styles.selectorEyebrow}>Připravujeme</p>
            <h2 className={styles.selectorTitle}>Placené zvýraznění zatím nespouštíme</h2>
          </div>
          <p className={styles.selectorText}>
            Podilo teď běží jako beta verze. TOP pozice a zvýraznění inzerátů zatím nejde zaplatit — pořádně to
            doděláváme, aby to dávalo smysl a fungovalo spolehlivě. Jakmile bude placené zvýraznění dostupné,
            dáme to jasně vědět všem uživatelům s aktivním inzerátem.
          </p>
        </div>
      )}

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
