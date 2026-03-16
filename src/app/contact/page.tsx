import styles from '../content.module.css';

export default function ContactPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Kontakt</h1>
      <p className={styles.subtitle}>Jsme tu pro vás. Nebojte se ozvat.</p>
      
      <div className={styles.prose}>
        <p>
          Potřebujete poradit s přidáním inzerátu? Narazili jste na technickou chybu, nebo máte návrh 
          na vylepšení portálu Podilo? Rádi od vás uslyšíme.
        </p>

        <div style={{ background: 'var(--muted)', padding: '2rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', margin: '2rem 0' }}>
          <h2 style={{ marginTop: 0 }}>E-mailová podpora</h2>
          <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
            <a href="mailto:podpora@podilo.cz" style={{ color: 'var(--foreground)' }}>podpora@podilo.cz</a>
          </p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--muted-text)' }}>
            Odpovídáme většinou do 24 hodin v pracovní dny.
          </p>
        </div>

        <h2>Základní údaje</h2>
        <p>
          <strong>Název projektu:</strong> Podilo<br/>
          <strong>Provozovatel:</strong> Jan Průcha<br/>
          <strong>IČO:</strong> 21989982<br/>
          <strong>Adresa:</strong> Českolipská 388/11, 190 00 Praha 9 - Střížkov
        </p>

        <div className={styles.disclaimerBox}>
          <p className={styles.disclaimerText}>
            Upozorňujeme, že podpora portálu Podilo nezajišťuje právní poradenství týkající se 
            samotného prodeje podílů. Jsme poskytovatelem inzertního prostoru. Pro právní dotazy 
            ohledně převodu nemovitosti prosím kontaktujte svého advokáta nebo notáře.
          </p>
        </div>
      </div>
    </div>
  );
}
