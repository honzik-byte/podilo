'use client';

import { useEffect, useState } from 'react';
import styles from './HeroShowcase.module.css';

const scenarios = [
  {
    label: 'Investiční příležitost',
    location: 'Brno • rodinný dům',
    title: '1/2 domu s jasnou cenovou logikou',
    price: '4 000 000 Kč',
    insight: 'Cena podílu je pod odhadem hodnoty podílu o 11 %.',
    chips: ['Podíl 1/2', 'Volné', 'TOP nabídka'],
  },
  {
    label: 'Rychlé vyhodnocení',
    location: 'Praha • byt',
    title: 'Nabídka s odhadem celku i energií',
    price: '2 350 000 Kč',
    insight: 'Kupující hned ví, jestli srovnává cenu podílu nebo celé nemovitosti.',
    chips: ['PENB C', 'Byt 2+kk', 'Zvýrazněno'],
  },
  {
    label: 'Spoluvlastnické vypořádání',
    location: 'Olomouc • pozemek',
    title: 'Podíl s popsaným právním kontextem',
    price: '890 000 Kč',
    insight: 'V inzerátu je jasně vysvětlená situace i další postup pro zájemce.',
    chips: ['Pozemek', '1/3', 'Ověřený kontakt'],
  },
];

export default function HeroShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % scenarios.length);
    }, 4200);

    return () => window.clearInterval(interval);
  }, []);

  const active = scenarios[activeIndex];

  return (
    <div className={styles.wrap}>
      <div className={styles.orb} />
      <div className={styles.surface}>
        <div className={styles.floatingTop}>
          <span className={styles.signal}>Živé tržiště</span>
          <span className={styles.signalMuted}>Nové nabídky průběžně</span>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.badge}>{active.label}</span>
            <div className={styles.tabs}>
              {scenarios.map((scenario, index) => (
                <button
                  key={scenario.label}
                  type="button"
                  className={`${styles.tab} ${index === activeIndex ? styles.tabActive : ''}`}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Zobrazit scénář ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className={styles.location}>{active.location}</div>
          <h3 className={styles.title}>{active.title}</h3>

          <div className={styles.priceBlock}>
            <span className={styles.priceLabel}>Cena za nabízený podíl</span>
            <strong className={styles.price}>{active.price}</strong>
          </div>

          <div className={styles.chips}>
            {active.chips.map((chip) => (
              <span key={chip} className={styles.chip}>
                {chip}
              </span>
            ))}
          </div>

          <p className={styles.insight}>{active.insight}</p>
        </div>

        <div className={styles.floatingBottom}>
          <div className={styles.miniCard}>
            <strong>Jasná cena</strong>
            <span>Podíl a celek odděleně</span>
          </div>
          <div className={styles.miniCard}>
            <strong>Přímý kontakt</strong>
            <span>Bez realitního prostředníka</span>
          </div>
        </div>
      </div>
    </div>
  );
}
