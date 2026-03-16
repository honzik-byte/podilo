'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import styles from './ListingsFilter.module.css';
import Button from '@/components/Button';

export default function ListingsFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [propertyType, setPropertyType] = useState(searchParams.get('type') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      
      Object.entries(params).forEach(([name, value]) => {
        if (value === null || value === '') {
          newSearchParams.delete(name);
        } else {
          newSearchParams.set(name, value);
        }
      });
      
      return newSearchParams.toString();
    },
    [searchParams]
  );

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    const queryString = createQueryString({
      location,
      type: propertyType,
      minPrice,
      maxPrice,
    });
    router.push(`${pathname}?${queryString}`);
  };

  const clearFilters = () => {
    setLocation('');
    setPropertyType('');
    setMinPrice('');
    setMaxPrice('');
    router.push(pathname);
  };

  return (
    <form className={styles.filterForm} onSubmit={handleApplyFilters}>
      <div className={styles.filtersWrapper}>
        <div className={styles.filterGroup}>
          <label htmlFor="location" className={styles.label}>Lokalita</label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="input"
            placeholder="Město nebo čtvrť"
          />
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="propertyType" className={styles.label}>Typ nemovitosti</label>
          <select
            id="propertyType"
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="select"
          >
            <option value="">Všechny</option>
            <option value="Byt">Byty</option>
            <option value="Rodinný dům">Rodinné domy</option>
            <option value="Pozemek">Pozemky</option>
            <option value="Komerční objekt">Komerční objekty</option>
            <option value="Garáž">Garáže</option>
          </select>
        </div>

        <div className={styles.priceGroupWrapper}>
          <div className={styles.filterGroup}>
            <label htmlFor="minPrice" className={styles.label}>Cena od (Kč)</label>
            <input
              type="number"
              id="minPrice"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="input"
              placeholder="Min"
              min="0"
            />
          </div>
          <div className={styles.filterGroup}>
            <label htmlFor="maxPrice" className={styles.label}>Cena do (Kč)</label>
            <input
              type="number"
              id="maxPrice"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="input"
              placeholder="Max"
              min="0"
            />
          </div>
        </div>

        <div className={styles.actionsGroup}>
          <Button type="submit" className={styles.applyBtn}>Vyhledat</Button>
          {(location || propertyType || minPrice || maxPrice) && (
            <button type="button" onClick={clearFilters} className={styles.clearBtn}>
              Zrušit filtry
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
