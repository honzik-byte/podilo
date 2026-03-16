import Link from 'next/link';
import styles from './WhyRegisterCard.module.css';

interface WhyRegisterCardProps {
  compact?: boolean;
  title?: string;
}

export default function WhyRegisterCard({
  compact = false,
  title = 'Proč mít účet na Podilo?',
}: WhyRegisterCardProps) {
  return (
    <div className={`${styles.card} ${compact ? styles.compact : ''}`}>
      <div>
        <p className={styles.eyebrow}>Výhody registrace</p>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.text}>
          Registrovaní uživatelé si mohou ukládat nabídky, zobrazit telefon na prodejce, spravovat vlastní inzeráty a později dostávat důležitá upozornění na nové příležitosti.
        </p>
      </div>

      <ul className={styles.list}>
        <li>Uložení inzerátů do watchlistu</li>
        <li>Zobrazení telefonního čísla prodejce</li>
        <li>Správa vlastních nabídek na jednom místě</li>
        <li>Budoucí upozornění na nové a upravené nabídky</li>
      </ul>

      <div className={styles.actions}>
        <Link href="/register" className={styles.primaryLink}>
          Vytvořit účet
        </Link>
        <Link href="/login" className={styles.secondaryLink}>
          Přihlásit se
        </Link>
      </div>
    </div>
  );
}
