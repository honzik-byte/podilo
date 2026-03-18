'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './ListingsFilter.module.css';
import Button from '@/components/Button';
import { formatCzechCurrency } from '@/lib/formatting';

const SAVED_FILTERS_KEY = 'podilo-saved-filters';

type SavedFilter = {
  id: string;
  name: string;
  queryString: string;
};

function hasAnyAdvancedFilters(params: URLSearchParams) {
  return Boolean(
    params.get('occupancy') ||
      params.get('status') ||
      params.get('valuation') ||
      params.get('opportunity') ||
      params.get('topOnly') === 'true' ||
      params.get('highlightedOnly') === 'true'
  );
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

function parsePrice(value: string) {
  const numericValue = Number(onlyDigits(value));
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function formatPriceInput(value: string) {
  const digits = onlyDigits(value);
  return digits ? new Intl.NumberFormat('cs-CZ').format(Number(digits)) : '';
}

function clampPrice(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

interface ListingsFilterProps {
  maxPriceCap: number;
}

export default function ListingsFilter({ maxPriceCap }: ListingsFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const safeMaxPriceCap = Math.max(maxPriceCap, 100_000);
  const sliderStep = safeMaxPriceCap <= 2_000_000 ? 25_000 : 50_000;

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
  const [showAdvanced, setShowAdvanced] = useState(hasAnyAdvancedFilters(searchParams));
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

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

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const stored = window.localStorage.getItem(SAVED_FILTERS_KEY);
      if (stored) {
        setSavedFilters(JSON.parse(stored));
      }
    } catch {
      setSavedFilters([]);
    }
  }, []);

  const persistSavedFilters = useCallback((nextFilters: SavedFilter[]) => {
    setSavedFilters(nextFilters);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(nextFilters));
    }
  }, []);

  const minPriceValue = useMemo(() => clampPrice(parsePrice(minPrice), 0, safeMaxPriceCap), [minPrice, safeMaxPriceCap]);
  const maxPriceValue = useMemo(() => {
    const parsedValue = parsePrice(maxPrice);
    const fallbackValue = parsedValue > 0 ? parsedValue : safeMaxPriceCap;
    return clampPrice(fallbackValue, minPriceValue, safeMaxPriceCap);
  }, [maxPrice, minPriceValue, safeMaxPriceCap]);

  const handleApplyFilters = (event: React.FormEvent) => {
    event.preventDefault();

    const normalizedMin = minPriceValue > 0 ? String(minPriceValue) : '';
    const normalizedMax = maxPriceValue < safeMaxPriceCap ? String(maxPriceValue) : '';

    const queryString = createQueryString({
      location,
      type: propertyType,
      minPrice: normalizedMin,
      maxPrice: normalizedMax,
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
    setShowAdvanced(false);
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

  const saveCurrentFilter = () => {
    const normalizedMin = minPriceValue > 0 ? String(minPriceValue) : '';
    const normalizedMax = maxPriceValue < safeMaxPriceCap ? String(maxPriceValue) : '';

    const queryString = createQueryString({
      location,
      type: propertyType,
      minPrice: normalizedMin,
      maxPrice: normalizedMax,
      shareSize,
      occupancy,
      status: listingStatus,
      valuation: valuationAvailability,
      opportunity: opportunityType,
      topOnly: topOnly ? 'true' : '',
      highlightedOnly: highlightedOnly ? 'true' : '',
    });

    if (!queryString) {
      return;
    }

    const suggestedName = [
      location || 'Trh',
      propertyType || 'všechny typy',
      shareSize || '',
      opportunityType || '',
    ]
      .filter(Boolean)
      .slice(0, 3)
      .join(' • ');

    const name = window.prompt('Název hlídacího filtru', suggestedName || 'Uložený filtr');

    if (!name) {
      return;
    }

    const nextFilters = [
      {
        id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}`,
        name: name.trim(),
        queryString,
      },
      ...savedFilters.filter((filter) => filter.queryString !== queryString),
    ].slice(0, 6);

    persistSavedFilters(nextFilters);
  };

  const applySavedFilter = (queryString: string) => {
    router.push(`${pathname}?${queryString}`);
  };

  const removeSavedFilter = (id: string) => {
    persistSavedFilters(savedFilters.filter((filter) => filter.id !== id));
  };

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

      <div className={styles.savedFiltersBar}>
        <div>
          <p className={styles.savedFiltersTitle}>Uložené filtry a hlídací psi</p>
          <p className={styles.savedFiltersText}>Uložte si vlastní kombinaci filtrů a vraťte se k ní jedním klikem.</p>
        </div>
        <button
          type="button"
          onClick={saveCurrentFilter}
          className={styles.saveFilterButton}
          disabled={!hasFilters}
        >
          Uložit aktuální filtr
        </button>
      </div>

      {savedFilters.length > 0 && (
        <div className={styles.savedFiltersList}>
          {savedFilters.map((filter) => (
            <div key={filter.id} className={styles.savedFilterChip}>
              <button type="button" onClick={() => applySavedFilter(filter.queryString)} className={styles.savedFilterLink}>
                {filter.name}
              </button>
              <button
                type="button"
                onClick={() => removeSavedFilter(filter.id)}
                className={styles.savedFilterRemove}
                aria-label={`Smazat filtr ${filter.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

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
        <div className={styles.filterGroup}>
          <label className={styles.label}>Cena podílu</label>
          <div className={styles.rangeBox}>
            <div className={styles.rangeValues}>
              <span>{minPriceValue > 0 ? `Od ${formatCzechCurrency(minPriceValue)}` : 'Od 0 Kč'}</span>
              <span>{`Do ${formatCzechCurrency(maxPriceValue)}`}</span>
            </div>
            <div className={styles.rangeTrack} />
            <div className={styles.rangeSliders}>
              <input
                type="range"
                min="0"
                max={String(safeMaxPriceCap)}
                step={String(sliderStep)}
                value={String(minPriceValue)}
                onChange={(event) => {
                  const nextValue = clampPrice(Number(event.target.value), 0, maxPriceValue);
                  setMinPrice(String(nextValue));
                }}
                className={styles.rangeInput}
              />
              <input
                type="range"
                min="0"
                max={String(safeMaxPriceCap)}
                step={String(sliderStep)}
                value={String(maxPriceValue)}
                onChange={(event) => {
                  const nextValue = clampPrice(Number(event.target.value), minPriceValue, safeMaxPriceCap);
                  setMaxPrice(nextValue >= safeMaxPriceCap ? '' : String(nextValue));
                }}
                className={styles.rangeInput}
              />
            </div>
          </div>
        </div>

        <div className={styles.priceGroup}>
          <div className={styles.filterGroup}>
            <label htmlFor="minPrice" className={styles.label}>Cena od</label>
            <div className={styles.amountInputWrap}>
              <input
                type="text"
                inputMode="numeric"
                id="minPrice"
                value={formatPriceInput(minPrice)}
                onChange={(event) => setMinPrice(onlyDigits(event.target.value))}
                className={`${styles.amountInput} input`}
                placeholder="500 000"
              />
              <span className={styles.currencySuffix}>Kč</span>
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="maxPrice" className={styles.label}>Cena do</label>
            <div className={styles.amountInputWrap}>
              <input
                type="text"
                inputMode="numeric"
                id="maxPrice"
                value={formatPriceInput(maxPrice)}
                onChange={(event) => setMaxPrice(onlyDigits(event.target.value))}
                className={`${styles.amountInput} input`}
                placeholder={formatPriceInput(String(safeMaxPriceCap))}
              />
              <span className={styles.currencySuffix}>Kč</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.advancedToggleRow}>
        <button
          type="button"
          onClick={() => setShowAdvanced((current) => !current)}
          className={styles.advancedToggle}
        >
          {showAdvanced ? 'Skrýt rozšířené filtry' : 'Rozšířené filtry'}
        </button>
      </div>

      {showAdvanced && (
        <>
          <div className={styles.section}>
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
          </div>

          <div className={styles.section}>
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
        </>
      )}

      <div className={styles.actionsGroup}>
        <Button type="submit">Použít filtry</Button>
        <p className={styles.helperText}>
          Základní filtry slouží pro rychlý průchod. Rozšířené filtry zpřesní investor kontext bez zahlcení.
        </p>
      </div>
    </form>
  );
}
