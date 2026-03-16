import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ListingCard from '@/components/ListingCard';
import Button from '@/components/Button';
import styles from './page.module.css';
import { Listing } from '@/types';

export const revalidate = 0;

export default async function Home() {
  const { data: listings, error } = await supabase
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(6);

  const displayListings = (listings as Listing[]) || [];

  return (
    <div className={styles.home}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroContainer}`}>
          <h1 className={styles.heroTitle}>Kupujte a prodávejte podíly nemovitostí</h1>
          <p className={styles.heroSubtitle}>
            První prémiové tržiště specializované výhradně na spoluvlastnické podíly. 
            Spojujeme majitele s investory jednoduše a bezpečně.
          </p>
          <div className={styles.heroActions}>
            <Link href="/add">
              <Button>Přidat inzerát</Button>
            </Link>
            <Link href="/listings">
              <Button variant="outline">Prohlížet nabídky</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className={`container ${styles.feedSection}`}>
        <div className={styles.feedHeader}>
          <h2 className={styles.sectionTitle}>Nejnovější nabídky</h2>
          <Link href="/listings" className={styles.viewAll}>
            Zobrazit vše &rarr;
          </Link>
        </div>
        
        {displayListings.length > 0 ? (
          <div className={styles.grid}>
            {displayListings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>Zatím zde nejsou žádné inzeráty. Buďte první!</p>
            {error && (
              <p className={styles.errorText}>
                (Tip pro vývojáře: Ujistěte se, že jste spustili SQL skript v Supabase.)
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
