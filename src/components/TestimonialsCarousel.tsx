'use client';

import { useEffect, useState } from 'react';
import styles from './TestimonialsCarousel.module.css';

const testimonials = [
  {
    quote:
      'Konečně místo, kde je hned jasné, jestli koukám na cenu celku nebo cenu podílu. Na podobném trhu to výrazně zvyšuje důvěru.',
    author: 'Aktivní kupující z Prahy',
    role: 'Sleduje podíly dlouhodobě',
  },
  {
    quote:
      'Na Podilo rychle poznám, jestli jde o investiční příležitost nebo komplikovanější vypořádání. To mi na jiných webech chybělo.',
    author: 'Investor z Brna',
    role: 'Zaměření na menšinové podíly',
  },
  {
    quote:
      'Pro prodávajícího je příjemné, že inzerát může být stručný, ale přitom pořád působí důvěryhodně a profesionálně.',
    author: 'Majitel podílu z Ostravy',
    role: 'Prodávající po dědictví',
  },
];

export default function TestimonialsCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length);
    }, 4200);

    return () => window.clearInterval(interval);
  }, []);

  const active = testimonials[activeIndex];

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.badge}>Zkušenost uživatelů</span>
        <div className={styles.dots}>
          {testimonials.map((testimonial, index) => (
            <button
              key={testimonial.author}
              type="button"
              className={`${styles.dot} ${index === activeIndex ? styles.dotActive : ''}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Zobrazit referenci ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <div className={styles.quoteMark}>“</div>
      <p className={styles.quote}>{active.quote}</p>
      <div className={styles.footer}>
        <div className={styles.avatar}>{active.author.charAt(0)}</div>
        <div>
          <strong className={styles.author}>{active.author}</strong>
          <span className={styles.role}>{active.role}</span>
        </div>
      </div>
    </div>
  );
}
