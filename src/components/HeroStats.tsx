'use client';

import { useEffect, useState } from 'react';
import styles from './HeroStats.module.css';

interface HeroStatsProps {
  publishedListings: number;
}

const statsConfig = [
  {
    key: 'publishedListings',
    label: 'publikovaných inzerátů',
    suffix: '+',
  },
  {
    key: 'avgSaleTime',
    label: 'průměrná doba do dohody',
    suffix: ' dní',
    value: 11,
  },
  {
    key: 'marketFocus',
    label: 'specializace jen na podíly',
    suffix: ' %',
    value: 100,
  },
] as const;

function useAnimatedNumber(target: number) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const duration = 900;

    const frame = (timestamp: number) => {
      if (startTime === null) {
        startTime = timestamp;
      }

      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));

      if (progress < 1) {
        window.requestAnimationFrame(frame);
      }
    };

    window.requestAnimationFrame(frame);
  }, [target]);

  return value;
}

function HeroStat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const animated = useAnimatedNumber(value);

  return (
    <div className={styles.stat}>
      <strong>
        {animated}
        {suffix}
      </strong>
      <span>{label}</span>
    </div>
  );
}

export default function HeroStats({ publishedListings }: HeroStatsProps) {
  return (
    <div className={styles.grid}>
      {statsConfig.map((stat) => {
        const value = stat.key === 'publishedListings' ? publishedListings : stat.value;
        return <HeroStat key={stat.label} value={value} suffix={stat.suffix} label={stat.label} />;
      })}
    </div>
  );
}
