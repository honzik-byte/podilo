import styles from './page.module.css';
import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="container">
      <div className={styles.header}>
        <h1 className={styles.title}>Zvýšení viditelnosti inzerátu</h1>
        <p className={styles.intro}>
          Na portálu Podilo mohou uživatelé zvýšit viditelnost svého inzerátu pomocí doplňkových služeb. Tyto služby pomáhají zobrazit nabídku na lepších pozicích ve výpisu a zvýšit šanci na kontakt od zájemců.
        </p>
      </div>

      <div className={styles.pricingGrid}>
        {/* Card 1 */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>TOP inzerát</h2>
            <div className={styles.price}>199 Kč<span> / 7 dní</span></div>
          </div>
          <div className={styles.cardBody}>
            <p>TOP inzeráty jsou zobrazeny na předních pozicích ve výpisu nabídek a jsou označeny štítkem &quot;TOP&quot;.</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Zvýrazněný inzerát</h2>
            <div className={styles.price}>59 Kč<span> / 7 dní</span></div>
          </div>
          <div className={styles.cardBody}>
            <p>Zvýrazněné inzeráty jsou ve výpisu vizuálně odlišeny (například jemným podbarvením), díky čemuž jsou pro návštěvníky lépe viditelné.</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className={`${styles.card} ${styles.popular}`}>
          <div className={styles.cardHeader}>
            <div className={styles.popularBadge}>Kombinace</div>
            <h2 className={styles.cardTitle}>TOP + zvýraznění</h2>
            <div className={styles.price}>299 Kč<span> / 7 dní</span></div>
          </div>
          <div className={styles.cardBody}>
            <p>Kombinace obou služeb pro maximální viditelnost nabídky. Zahrnuje prémiovou pozici a vizuální odlišení.</p>
          </div>
        </div>
      </div>

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
