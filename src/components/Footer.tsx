import styles from './Footer.module.css';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.content}>
          <div className={styles.brandColumn}>
            <div className={styles.wordmark}>Podilo</div>
            <div className={styles.brandRule} />
            <p className={styles.text}>
              Minimalistické a transparentní online tržiště pro nákup a prodej spoluvlastnických podílů k nemovitostem v ČR.
            </p>
          </div>

          <div>
            <div className={styles.title}>O portálu</div>
            <ul className={styles.linkList}>
              <li><Link href="/about" className={styles.link}>Co je Podilo?</Link></li>
              <li><Link href="/how-it-works" className={styles.link}>Jak to funguje</Link></li>
              <li><Link href="/poradna" className={styles.link}>Poradna</Link></li>
              <li><Link href="/faq" className={styles.link}>Často kladené dotazy</Link></li>
            </ul>
          </div>

          <div>
            <div className={styles.title}>Služby</div>
            <ul className={styles.linkList}>
              <li><Link href="/premium" className={styles.link}>Investor Pro</Link></li>
              <li><Link href="/cenik" className={styles.link}>Ceník zvýšení viditelnosti</Link></li>
              <li><Link href="/contact" className={styles.link}>Kontakt a podpora</Link></li>
            </ul>
          </div>

          <div>
            <div className={styles.title}>Uživatel</div>
            <ul className={styles.linkList}>
              <li><Link href="/saved" className={styles.link}>Uložené nabídky</Link></li>
              <li><Link href="/my-listings" className={styles.link}>Moje inzeráty</Link></li>
              <li><Link href="/terms" className={styles.link}>Obchodní podmínky</Link></li>
              <li><Link href="/privacy" className={styles.link}>Ochrana osobních údajů</Link></li>
            </ul>
          </div>
        </div>

        <div className={styles.disclaimer}>
          <p className={styles.disclaimerText}>
            <strong>Upozornění:</strong> Podilo funguje výhradně jako inzertní portál. 
            Nejsme realitní kanceláří a do obchodních vztahů mezi kupujícím a prodávajícím 
            nijak nezasahujeme. Veškeré informace v nabídkách jsou poskytovány samotnými 
            inzerenty a platforma Podilo jejich správnost ani právní stav nemovitostí neověřuje.
          </p>
          <div className={styles.meta}>
            <span>&copy; {new Date().getFullYear()} Podilo.cz. Všechna práva vyhrazena.</span>
            <span className={styles.credit}>
              Vytvořila{' '}
              <a
                href="https://hopumedia.cz"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.creditLink}
              >
                HopuMedia
              </a>{' '}
              s <span className={styles.heart}>🤍</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
