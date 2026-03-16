import styles from '../content.module.css';
import Link from 'next/link';
import Button from '@/components/Button';

export default function AboutPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Co je Podilo?</h1>
      <p className={styles.subtitle}>Minimalistické tržiště zaměřené na spoluvlastnické podíly nemovitostí.</p>
      
      <div className={styles.prose}>
        <p>
          Vlastnictví zlomku nemovitosti (např. 1/2, 1/4 nebo klidně 1/12) může být často komplikované. Ať už jste podíl 
          zdědili, získali v rámci rodinného vypořádání, nebo jste investor, klasický realitní trh není na tyto 
          specifické transakce úplně stavěný.
        </p>

        <h2>Náš cíl</h2>
        <p>
          Podilo vzniklo s jasnou vizí: <strong>zjednodušit a zprůhlednit trh se spoluvlastnickými podíly</strong> v 
          České republice. Nejsme realitní kancelář ani aukční portál. Jsme jednoduchý a přehledný inzertní prostor, 
          kde se mohou přímo potkat majitelé podílů s potenciálními zájemci.
        </p>

        <h2>Pro koho je Podilo určeno?</h2>
        <ul>
          <li><strong>Pro majitele</strong>, kteří chtějí svůj podíl prodat, ale nechtějí platit obrovské provize realitkám.</li>
          <li><strong>Pro spoluvlastníky</strong>, kteří hledají partnera k odkupu zbytku domu.</li>
          <li><strong>Pro investory</strong>, kteří hledají zajímavé příležitosti na realitním trhu, ke kterým by se jinde nedostali.</li>
        </ul>

        <h2>Transparentní a přímý kontakt</h2>
        <p>
          U nás nevstupuje do transakce žádný prostředník. Uživatelé si mezi sebou inzeráty prohlíží naprosto zdarma a 
          spojují se napřímo prostřednictvím emailu nebo kontaktního formuláře.
        </p>

        <div className={styles.disclaimerBox} style={{ marginTop: '2rem' }}>
          <p className={styles.disclaimerText}>
            <strong>Důležité upozornění:</strong> Podilo slouží výhradně jako inzertní portál (nástěnka). 
            Nejsme zprostředkovatelem transakcí, neúčastníme se prodeje a nijak neověřujeme právní ani faktický 
            stav nabízených nemovitostí. Veškeré dohody a transakce probíhají výhradně mezi prodejcem a kupujícím.
          </p>
        </div>

        <div style={{ marginTop: '3rem', textAlign: 'center' }}>
          <Link href="/listings">
            <Button>Prohlédnout nabídky</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
