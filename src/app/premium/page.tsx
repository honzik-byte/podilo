import Link from 'next/link';
import styles from './page.module.css';

export const metadata = {
  title: 'Investor Pro - Podilo',
  description: 'Prémiový plán Podilo Investor Pro pro aktivní kupující a investory do spoluvlastnických podílů.',
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
          <p className={styles.eyebrow}>Prémiový plán</p>
          <h1 className={styles.title}>Podilo Investor Pro</h1>
          <p className={styles.subtitle}>
            Návrh placeného členství pro investory a aktivní kupující, kteří chtějí mít rychlejší přístup k trhu a lepší pracovní nástroje nad uloženými příležitostmi.
          </p>
        </div>

        <div className={styles.priceCard}>
          <span className={styles.badge}>Investor plán</span>
          <div className={styles.price}>1 490 Kč <span>/ měsíc</span></div>
          <p className={styles.priceText}>
            Navržené tak, aby plán dával ekonomický smysl jen těm, kdo s trhem pracují pravidelně. Ne pro každého návštěvníka, ale pro seriózní kupující.
          </p>
          <Link href="/register" className={styles.primaryLink}>Požádat o přístup</Link>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h2>Co plán řeší</h2>
          <p>
            Investor Pro není generický subscription balíček. Je postavený kolem problémů, které mají aktivní kupující na tomto trhu: rychlost, přehled, srovnání a včasná informace.
          </p>
          <ul>
            <li>Neztratit zajímavé nabídky v průběhu týdne</li>
            <li>Mít watchlist a poznámky na jednom místě</li>
            <li>Reagovat dřív na nové vhodné příležitosti</li>
            <li>Pracovat s regionálními a typovými alerty</li>
          </ul>
        </div>

        <div className={styles.card}>
          <h2>Co člen získá</h2>
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
