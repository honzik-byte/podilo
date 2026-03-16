import styles from '../content.module.css';

export default function TermsPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Obchodní podmínky</h1>
      <p className={styles.subtitle}>Platné od 1. března 2024</p>
      
      <div className={styles.prose}>
        <h2>1. Úvodní ustanovení</h2>
        <p>
          Tyto obchodní podmínky upravují práva a povinnosti uživatelů inzertního portálu Podilo. 
          Provozovatelem portálu Podilo je Jan Průcha, IČO: 21989982.
        </p>

        <h2>2. Podstata služby</h2>
        <p>
          Podilo je výhradně inzertní portál, který umožňuje uživatelům bezplatně nebo za úplatu 
          nabízet k prodeji spoluvlastnické podíly nemovitostí a vyhledávat tyto nabídky. 
          Provozovatel <strong>není účastníkem</strong> smluvních vztahů mezi uživateli a 
          neposkytuje v této souvislosti žádné realitní ani právní služby.
        </p>

        <h2>3. Přidávání inzerátů</h2>
        <p>
          Uživatel se zavazuje přidávat pouze pravdivé a aktuální informace. Je zakázáno inzerovat 
          zjevně nepravdivé nabídky, nabídky porušující zákony ČR, nebo inzeráty obsahující nevhodný obsah. 
          Provozovatel si vyhrazuje právo jakýkoliv inzerát bez udání důvodu smazat, zejména pokud 
          porušuje tyto podmínky.
        </p>

        <h2>4. Odpovědnost za obsah</h2>
        <p>
          Za obsah inzerátu odpovídá výlučně uživatel, který jej na portál nahrál. Provozovatel neručí 
          za správnost údajů uvedených v inzerátech, ani za samotnou existenci, kvalitu či právní stav 
          nabízených nemovitostí.
        </p>

        <h2>5. Závěrečná ustanovení</h2>
        <p>
          Provozovatel si vyhrazuje právo tyto podmínky kdykoliv jednostranně měnit. Vztahy 
          neupravené těmito podmínkami se řídí platnými zákony České republiky.
        </p>
      </div>
    </div>
  );
}
