import styles from '../content.module.css';
import Link from 'next/link';

export default function HowItWorksPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Jak to funguje</h1>
      <p className={styles.subtitle}>Čtyři jednoduché kroky k úspěšnému obchodu na Podilo.</p>
      
      <div className={styles.prose}>
        <div className={styles.stepBlock}>
          <div className={styles.stepNumber}>1</div>
          <div className={styles.stepTitle}>Přidání inzerátu</div>
          <p className={styles.stepDesc}>
            Vlastníte spoluvlastnický podíl? Jednoduše vytvořte nový inzerát. Zadejte základní údaje jako 
            velikost podílu, cenu, nahrajte pár fotek a přesnou lokaci pro zobrazení na mapě. 
            Je to rychlé a zdarma.
          </p>
        </div>

        <div className={styles.stepBlock}>
          <div className={styles.stepNumber}>2</div>
          <div className={styles.stepTitle}>Zobrazení nabídky zájemcům</div>
          <p className={styles.stepDesc}>
            Váš inzerát se okamžitě zobrazí na hlavní stránce a v detailním výpisu nabídek, kde v něm mohou 
            vyhledávat a filtrovat potenciální investoři i ostatní běžní uživatelé.
          </p>
        </div>

        <div className={styles.stepBlock}>
          <div className={styles.stepNumber}>3</div>
          <div className={styles.stepTitle}>Kontaktování zájemce</div>
          <p className={styles.stepDesc}>
            Pokud někoho váš podíl zaujme, ozve se vám přímo. Registrovaní uživatelé vidí vaše telefonní 
            číslo, ostatní vám mohou poslat zprávu přímo na email jedním kliknutím.
          </p>
        </div>

        <div className={styles.stepBlock}>
          <div className={styles.stepNumber}>4</div>
          <div className={styles.stepTitle}>Dohoda mezi stranami</div>
          <p className={styles.stepDesc}>
            Zbytek už je jen na vás. Domluvíte si prohlídku, připravíte s právníkem kupní smlouvu a dotáhnete 
            obchod do konce. Podilo si nebere absolutně žádnou provizi.
          </p>
        </div>

        <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/add" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', background: 'var(--foreground)', color: 'white', borderRadius: 'var(--radius)', textDecoration: 'none', fontWeight: 600 }}>
            Přidat inzerát
          </Link>
          <Link href="/listings" className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', textDecoration: 'none', color: 'var(--foreground)', fontWeight: 600 }}>
            Procházet nabídky
          </Link>
        </div>
      </div>
    </div>
  );
}
