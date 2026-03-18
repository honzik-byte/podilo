import styles from './page.module.css';
import ListingsClientView from './ListingsClientView';
import { getAllListings } from '@/lib/listingQueries';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ListingsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const displayListings = await getAllListings();
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
        hasError={false}
      />
    </div>
  );
}
