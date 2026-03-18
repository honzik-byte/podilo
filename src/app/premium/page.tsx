import Link from 'next/link';
import styles from './page.module.css';

export const metadata = {
  title: 'Investor Pro - Podilo',
  description: 'Investor Pro na Podilo připravujeme. Chystáme nástroje pro aktivní kupující a investory do spoluvlastnických podílů.',
};

const features = [
  'Uložená hledání a upozornění podle regionu',
  'Alerty na nové nabídky a změny ceny',
  'Dřívější přístup k čerstvě zveřejněným inzerátům',
  'Watchlist s poznámkami a porovnáním příležitostí',
  'Více detailů u vybraných nabídek',
  'Měsíční digest nových investor příležitostí',
  'Prioritní podpora pro aktivní kupující',
];

export default function PremiumPage() {
  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Připravujeme</p>
          <h1 className={styles.title}>Podilo Investor Pro</h1>
          <p className={styles.subtitle}>
            Pracujeme na sadě nástrojů pro aktivní kupující a investory, kteří chtějí trh sledovat systematičtěji, rychleji reagovat a mít lepší přehled nad příležitostmi.
          </p>
        </div>

        <div className={styles.priceCard}>
          <span className={styles.badge}>Brzy dostupné</span>
          <div className={styles.price}>Investor Pro <span>ve vývoji</span></div>
          <p className={styles.priceText}>
            Zatím plán veřejně nespouštíme. Nejdřív chceme doladit funkce, které budou dávat reálnou hodnotu těm, kdo s podíly pracují pravidelně.
          </p>
          <Link href="/register" className={styles.primaryLink}>Vytvořit účet</Link>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h2>Co chystáme</h2>
          <p>
            Investor Pro nemá být generický subscription balíček. Stavíme ho kolem problémů, které mají aktivní kupující na tomto trhu: rychlost, přehled, srovnání a včasná informace.
          </p>
          <ul>
            <li>Neztratit zajímavé nabídky v průběhu týdne</li>
            <li>Mít watchlist a poznámky na jednom místě</li>
            <li>Reagovat dřív na nové vhodné příležitosti</li>
            <li>Pracovat s regionálními a typovými alerty</li>
          </ul>
        </div>

        <div className={styles.card}>
          <h2>Plánované funkce</h2>
          <ul>
            {features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
