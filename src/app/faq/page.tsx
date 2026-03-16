import styles from '../content.module.css';
import Link from 'next/link';

export default function FAQPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Často kladené dotazy (FAQ)</h1>
      <p className={styles.subtitle}>Odpovědi na nejčastější otázky ohledně fungování Podilo.</p>
      
      <div className={styles.prose}>
        <div className={styles.faqItem}>
          <div className={styles.faqQuestion}>Co je spoluvlastnický podíl nemovitosti?</div>
          <div className={styles.faqAnswer}>
            Spoluvlastnický podíl vyjadřuje míru účasti spoluvlastníka na právech a povinnostech 
            týkajících se společné věci (nemovitosti). Znamená to, že vlastníte určitou část (např. 1/4) 
            ideálního celku, nikoliv konkrétní fyzickou část (např. jeden konkrétní pokoj) nemovitosti.
          </div>
        </div>

        <div className={styles.faqItem}>
          <div className={styles.faqQuestion}>Jak přidám inzerát?</div>
          <div className={styles.faqAnswer}>
            Stačí se zaregistrovat pomocí emailu, přihlásit se a kliknout na tlačítko &quot;Přidat inzerát&quot;.
            Vyplníte jednoduchý formulář, nahrajete fotky, zadáte cenu a vaši nabídku ihned zveřejníme.
          </div>
        </div>

        <div className={styles.faqItem}>
          <div className={styles.faqQuestion}>Kolik stojí přidání nabídky?</div>
          <div className={styles.faqAnswer}>
            Přidání zkušebního i standardního inzerátu na Podilo je v současnosti <strong>zcela zdarma</strong>. 
            Neúčtujeme si žádné poplatky za vložení ani provize z případného prodeje.
          </div>
        </div>

        <div className={styles.faqItem}>
          <div className={styles.faqQuestion}>Je Podilo realitní kancelář?</div>
          <div className={styles.faqAnswer}>
            Ne, Podilo není realitní kancelář ani aukční síň. Jsme čistě softwarová inzertní platforma. 
            Nezastupujeme žádnou ze stran, neposkytujeme právní služby a do samotného obchodu nijak nezasahujeme.
          </div>
        </div>

        <div className={styles.faqItem}>
          <div className={styles.faqQuestion}>Jak probíhá samotný prodej?</div>
          <div className={styles.faqAnswer}>
            Proces závisí plně na dohodě mezi vámi a kupujícím. Zájemce vás zkontaktuje skrz náš portál 
            (nebo napřímo telefonicky). Následně si již po vlastní ose domluvíte prohlídku, odsouhlasíte 
            si podmínky, zajistíte vypracování kupní smlouvy a podáte návrh na vklad do katastru nemovitostí.
          </div>
        </div>

        <div className={styles.faqItem}>
          <div className={styles.faqQuestion}>Proč se vyplatí registrace?</div>
          <div className={styles.faqAnswer}>
            Registrovaní uživatelé si mohou ukládat nabídky, zobrazit telefonní číslo prodávajícího a spravovat vlastní inzeráty. Postupně přidáváme i další funkce pro aktivní investory.
          </div>
        </div>

        <div className={styles.disclaimerBox} style={{ marginTop: '3rem' }}>
          <p className={styles.disclaimerText}>
            Nenašli jste odpověď na svůj dotaz? Napište nám na podporu přes <Link href="/contact" style={{ color: 'inherit', fontWeight: 'bold' }}>kontaktní formulář</Link> nebo si projděte <Link href="/poradna" style={{ color: 'inherit', fontWeight: 'bold' }}>Poradnu</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
