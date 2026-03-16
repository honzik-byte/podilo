import styles from '../content.module.css';

export default function PrivacyPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Zásady ochrany osobních údajů</h1>
      <p className={styles.subtitle}>Informace o tom, jak nakládáme s vašimi daty</p>
      
      <div className={styles.prose}>
        <h2>1. Kdo zpracovává vaše údaje</h2>
        <p>
          Správcem osobních údajů je provozovatel portálu Podilo, Jan Průcha, IČO: 21989982.
        </p>

        <h2>2. Jaké údaje zpracováváme</h2>
        <p>
          Při používání portálu zpracováváme následující údaje:
        </p>
        <ul>
          <li><strong>Při registraci:</strong> E-mailová adresa a zašifrované heslo.</li>
          <li><strong>Při vložení inzerátu:</strong> Vaše jméno, telefonní číslo, e-mail, obsah inzerátu včetně adresy a fotografií nemovitosti.</li>
          <li><strong>Technická data:</strong> IP logy serveru, standardní analytická cookies nezbytná pro fungování sítě.</li>
        </ul>

        <h2>3. Účel zpracování</h2>
        <p>
          Vaše údaje zpracováváme primárně za účelem poskytnutí inzertního prostoru (naplnění smlouvy/služby). 
          Kontaktní údaje vložené do inzerátu jsou veřejně prezentovány zájemcům (telefonní číslo výhradně 
          přihlášeným uživatelům) s cílem vás propojit ohledně prodeje.
        </p>

        <h2>4. Poskytování údajů třetím stranám</h2>
        <p>
          Osobní údaje neprodáváme žádným třetím stranám. Údaje mohou být zabezpečeně sdíleny 
          pouze se subdodavateli nezbytnými k provozu portálu (serverhosting Supabase, analytika).
        </p>

        <h2>5. Vaše práva</h2>
        <p>
          Máte právo na přístup, úpravu, nebo výmaz vašich osobních údajů z našeho systému. Můžete 
          tak učinit buď smazáním svého inzerátu v profilu, nebo nás kontaktovat na adrese 
          podpora@podilo.cz s žádostí o úplné odstranění účtu.
        </p>
      </div>
    </div>
  );
}
