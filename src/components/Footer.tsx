import styles from './Footer.module.css';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.content}>
          <div className={styles.brandColumn}>
            <div className={styles.title}>Podilo</div>
            <p className={styles.text}>
              Minimalistické a transparentní online tržiště pro nákup a prodej spoluvlastnických podílů k nemovitostem v ČR.
            </p>
            <p className={styles.text}>
              <strong>Provozovatel:</strong> Jan Průcha<br/>
              <strong>IČO:</strong> 21989982<br/>
              Českolipská 388/11, 190 00 Praha 9
            </p>
          </div>

          <div>
            <div className={styles.title}>O portálu</div>
            <ul className={styles.linkList}>
              <li><Link href="/about" className={styles.link}>Co je Podilo?</Link></li>
              <li><Link href="/how-it-works" className={styles.link}>Jak to funguje</Link></li>
              <li><Link href="/cenik" className={styles.link}>Ceník zvýšení viditelnosti</Link></li>
              <li><Link href="/faq" className={styles.link}>Často kladené dotazy (FAQ)</Link></li>
              <li><Link href="/contact" className={styles.link}>Kontakt a podpora</Link></li>
            </ul>
          </div>

          <div>
            <div className={styles.title}>Právní informace</div>
            <ul className={styles.linkList}>
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
          <p className={styles.copyright}>
            &copy; {new Date().getFullYear()} Podilo.cz. Všechna práva vyhrazena.
          </p>
        </div>
      </div>
    </footer>
  );
}
