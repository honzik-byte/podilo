import { supabase } from '@/lib/supabase';
import styles from './page.module.css';
import { Listing } from '@/types';
import ListingsClientView from './ListingsClientView';
import { mergeWithLocalListings } from '@/lib/localListings';
import { syncExpiredPromotions } from '@/lib/promotionExpirations';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ListingsPage({ searchParams }: PageProps) {
  await syncExpiredPromotions();

  const resolvedParams = await searchParams;
  const { data: listings, error } = await supabase
    .from('listings')
    .select('*')
    .order('is_top', { ascending: false })
    .order('is_highlighted', { ascending: false })
    .order('created_at', { ascending: false });

  const displayListings = await mergeWithLocalListings((listings as Listing[]) || []);
  const maxPriceCap = displayListings.reduce((highest, listing) => Math.max(highest, listing.price || 0), 0);

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <p className={styles.eyebrow}>Investor marketplace</p>
            <h1 className={styles.title}>Nabídky spoluvlastnických podílů</h1>
            <p className={styles.subtitle}>
              Porovnejte cenu za nabízený podíl, odhad hodnoty celé nemovitosti i charakter příležitosti na jednom místě.
            </p>
          </div>

          <div className={styles.headerNote}>
            <strong>{displayListings.length}</strong>
            <span>aktivních nabídek</span>
          </div>
        </div>
      </div>

      <ListingsClientView
        listings={displayListings}
        maxPriceCap={maxPriceCap}
        initialSearchParams={resolvedParams}
        hasError={Boolean(error)}
      />
    </div>
  );
}
