import { notFound } from 'next/navigation';
import Link from 'next/link';
import ListingCard from '@/components/ListingCard';
import { getListingLandingTaxonomy, getListingsByRegionSlug } from '@/lib/listingQueries';
import styles from '@/app/discovery.module.css';

export async function generateStaticParams() {
  const { regions } = await getListingLandingTaxonomy();
  return regions.map((region) => ({ slug: region.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const { region, listings } = await getListingsByRegionSlug(resolvedParams.slug);

  if (!region) {
    return {};
  }

  return {
    title: `Podíly nemovitostí: ${region.name} | Podilo`,
    description: `Aktuální nabídky spoluvlastnických podílů pro ${region.name}. Porovnejte cenu podílu, typ nemovitosti i charakter příležitosti.`,
    alternates: {
      canonical: `/lokality/${region.slug}`,
    },
    openGraph: {
      title: `Podíly nemovitostí: ${region.name} | Podilo`,
      description: `${listings.length} nabídek spoluvlastnických podílů pro ${region.name}.`,
    },
  };
}

export default async function RegionLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const { region, listings } = await getListingsByRegionSlug(resolvedParams.slug);

  if (!region) {
    notFound();
  }

  return (
    <div className={`container ${styles.page}`}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Regionální přehled</p>
        <h1 className={styles.title}>Podíly nemovitostí pro {region.name}</h1>
        <p className={styles.subtitle}>
          Přehled aktivních nabídek v regionu, kde je možné rychle porovnat cenu za nabízený podíl, typ nemovitosti i míru obsazenosti.
        </p>
        <div className={styles.meta}>
          <span className={styles.metaBadge}>{listings.length} aktivních nabídek</span>
          <Link href="/listings" className={styles.metaBadge}>
            Všechny nabídky
          </Link>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Aktuální příležitosti v regionu</h2>
          <p className={styles.sectionText}>Tato stránka pomáhá investorům i prodávajícím sledovat lokální nabídku bez ručního filtrování.</p>
        </div>

        {listings.length > 0 ? (
          <div className={styles.grid}>
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>V tomto regionu zatím nemáme aktivní nabídku. Sledujte výpis nebo si založte hlídání v budoucí verzi.</div>
        )}
      </section>
    </div>
  );
}
