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
  const [shareSize, setShareSize] = useState(searchParams.get('shareSize') || '');
  const [occupancy, setOccupancy] = useState(searchParams.get('occupancy') || '');
  const [listingStatus, setListingStatus] = useState(searchParams.get('status') || '');
  const [valuationAvailability, setValuationAvailability] = useState(searchParams.get('valuation') || '');
  const [opportunityType, setOpportunityType] = useState(searchParams.get('opportunity') || '');
  const [topOnly, setTopOnly] = useState(searchParams.get('topOnly') === 'true');
  const [highlightedOnly, setHighlightedOnly] = useState(searchParams.get('highlightedOnly') === 'true');

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

  const handleApplyFilters = (event: React.FormEvent) => {
    event.preventDefault();

    const queryString = createQueryString({
      location,
      type: propertyType,
      minPrice,
      maxPrice,
      shareSize,
      occupancy,
      status: listingStatus,
      valuation: valuationAvailability,
      opportunity: opportunityType,
      topOnly: topOnly ? 'true' : '',
      highlightedOnly: highlightedOnly ? 'true' : '',
    });

    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  const clearFilters = () => {
    setLocation('');
    setPropertyType('');
    setMinPrice('');
    setMaxPrice('');
    setShareSize('');
    setOccupancy('');
    setListingStatus('');
    setValuationAvailability('');
    setOpportunityType('');
    setTopOnly(false);
    setHighlightedOnly(false);
    router.push(pathname);
  };

  const hasFilters =
    Boolean(location) ||
    Boolean(propertyType) ||
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    Boolean(shareSize) ||
    Boolean(occupancy) ||
    Boolean(listingStatus) ||
    Boolean(valuationAvailability) ||
    Boolean(opportunityType) ||
    topOnly ||
    highlightedOnly;

  return (
    <form className={styles.filterForm} onSubmit={handleApplyFilters}>
      <div className={styles.headerRow}>
        <div>
          <p className={styles.eyebrow}>Filtry pro kupující a investory</p>
          <h2 className={styles.title}>Najděte nabídky podle situace, ne jen podle ceny</h2>
        </div>
        {hasFilters && (
          <button type="button" onClick={clearFilters} className={styles.clearBtn}>
            Reset filtrů
          </button>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.filterGroup}>
          <label htmlFor="location" className={styles.label}>Lokalita</label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            className="input"
            placeholder="Praha, Brno, Ostrava..."
          />
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="propertyType" className={styles.label}>Typ nemovitosti</label>
          <select
            id="propertyType"
            value={propertyType}
            onChange={(event) => setPropertyType(event.target.value)}
            className="select"
          >
            <option value="">Všechny typy</option>
            <option value="Byt">Byt</option>
            <option value="Rodinný dům">Rodinný dům</option>
            <option value="Pozemek">Pozemek</option>
            <option value="Komerční objekt">Komerční objekt</option>
            <option value="Garáž">Garáž</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="shareSize" className={styles.label}>Velikost podílu</label>
          <select
            id="shareSize"
            value={shareSize}
            onChange={(event) => setShareSize(event.target.value)}
            className="select"
          >
            <option value="">Jakýkoli podíl</option>
            <option value="1/2">1/2</option>
            <option value="1/3">1/3</option>
            <option value="1/4">1/4</option>
            <option value="1/6">1/6</option>
            <option value="jiný">Jiný</option>
          </select>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.priceGroup}>
          <div className={styles.filterGroup}>
            <label htmlFor="minPrice" className={styles.label}>Cena od</label>
            <input
              type="number"
              id="minPrice"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              className="input"
              placeholder="Např. 500000"
              min="0"
            />
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="maxPrice" className={styles.label}>Cena do</label>
            <input
              type="number"
              id="maxPrice"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              className="input"
              placeholder="Např. 3500000"
              min="0"
            />
          </div>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="occupancy" className={styles.label}>Obsazenost</label>
          <select
            id="occupancy"
            value={occupancy}
            onChange={(event) => setOccupancy(event.target.value)}
            className="select"
          >
            <option value="">Libovolná</option>
            <option value="Volné">Volné</option>
            <option value="Pronajato">Pronajaté</option>
            <option value="Obsazeno spoluvlastníkem">Obsazené spoluvlastníkem</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="listingStatus" className={styles.label}>Stav nabídky</label>
          <select
            id="listingStatus"
            value={listingStatus}
            onChange={(event) => setListingStatus(event.target.value)}
            className="select"
          >
            <option value="">Všechny stavy</option>
            <option value="Aktivní">Aktivní</option>
            <option value="V jednání">V jednání</option>
            <option value="Rezervováno">Rezervováno</option>
          </select>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.filterGroup}>
          <label htmlFor="valuationAvailability" className={styles.label}>Odhad ceny celé nemovitosti</label>
          <select
            id="valuationAvailability"
            value={valuationAvailability}
            onChange={(event) => setValuationAvailability(event.target.value)}
            className="select"
          >
            <option value="">Nevyhodnocovat</option>
            <option value="available">Pouze s odhadem</option>
            <option value="missing">Pouze bez odhadu</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="opportunityType" className={styles.label}>Typ příležitosti</label>
          <select
            id="opportunityType"
            value={opportunityType}
            onChange={(event) => setOpportunityType(event.target.value)}
            className="select"
          >
            <option value="">Všechny</option>
            <option value="Investiční">Investiční</option>
            <option value="Rychlý prodej">Rychlý prodej</option>
            <option value="Spoluvlastnické vypořádání">Spoluvlastnické vypořádání</option>
          </select>
        </div>

        <div className={styles.checkboxGrid}>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={topOnly}
              onChange={(event) => setTopOnly(event.target.checked)}
            />
            <span>Pouze TOP nabídky</span>
          </label>

          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={highlightedOnly}
              onChange={(event) => setHighlightedOnly(event.target.checked)}
            />
            <span>Pouze zvýrazněné</span>
          </label>
        </div>
      </div>

      <div className={styles.actionsGroup}>
        <Button type="submit">Použít filtry</Button>
        <p className={styles.helperText}>
          Filtry jsou navržené tak, aby šlo rychle najít investičně zajímavé podíly bez zbytečného zahlcení.
        </p>
      </div>
    </form>
  );
}
