import { supabase } from '@/lib/supabase';
import ListingCard from '@/components/ListingCard';
import ListingsFilter from './ListingsFilter';
import styles from './page.module.css';
import { Listing } from '@/types';
import dynamic from 'next/dynamic';
import ListingsClientView from './ListingsClientView';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ListingsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const locationFilter = typeof resolvedParams.location === 'string' ? resolvedParams.location : '';
  const typeFilter = typeof resolvedParams.type === 'string' ? resolvedParams.type : '';
  const minPriceFilter = typeof resolvedParams.minPrice === 'string' ? Number(resolvedParams.minPrice) : 0;
  const maxPriceFilter = typeof resolvedParams.maxPrice === 'string' ? Number(resolvedParams.maxPrice) : 0;

  let query = supabase
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false });

  if (locationFilter) {
    query = query.ilike('location', `%${locationFilter}%`);
  }
  
  if (typeFilter) {
    query = query.eq('property_type', typeFilter);
  }

  if (minPriceFilter > 0) {
    query = query.gte('price', minPriceFilter);
  }

  if (maxPriceFilter > 0) {
    query = query.lte('price', maxPriceFilter);
  }

  const { data: listings, error } = await query;

  const displayListings = (listings as Listing[]) || [];

  return (
    <div className="container">
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <h1 className={styles.title}>Všechny nabídky</h1>
            <p className={styles.subtitle}>
              Procházejte aktuálně dostupné spoluvlastnické podíly nemovitostí.
            </p>
          </div>
        </div>
      </div>

      <ListingsFilter />

      {displayListings.length > 0 ? (
        <ListingsClientView listings={displayListings} />
      ) : (
        <div className={styles.emptyState}>
          <p>Zatím zde nejsou žádné inzeráty odpovídající filtrům.</p>
          {error && <p className={styles.errorText}>Došlo k chybě při načítání.</p>}
        </div>
      )}
    </div>
  );
}
