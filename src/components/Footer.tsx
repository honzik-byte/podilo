import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.content}>
          <div className={styles.brand}>
            <p className={styles.text}>
              &copy; {new Date().getFullYear()} Podilo. Minimalistické tržiště podílů nemovitostí.
            </p>
          </div>
          <div className={styles.ownerInfo}>
            <p className={styles.text}><strong>Provozovatel:</strong> Jan Průcha</p>
            <p className={styles.text}><strong>IČO:</strong> 21989982</p>
            <p className={styles.text}>Praha - Střížkov, Českolipská 388/11, 190 00</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
