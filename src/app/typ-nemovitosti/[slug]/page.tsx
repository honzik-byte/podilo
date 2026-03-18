import { notFound } from 'next/navigation';
import Link from 'next/link';
import ListingCard from '@/components/ListingCard';
import { getListingLandingTaxonomy, getListingsByPropertyTypeSlug } from '@/lib/listingQueries';
import styles from '@/app/discovery.module.css';

export async function generateStaticParams() {
  const { propertyTypes } = await getListingLandingTaxonomy();
  return propertyTypes.map((type) => ({ slug: type.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const { propertyType, listings } = await getListingsByPropertyTypeSlug(resolvedParams.slug);

  if (!propertyType) {
    return {};
  }

  return {
    title: `${propertyType}: nabídky podílů | Podilo`,
    description: `Aktuální nabídky spoluvlastnických podílů pro typ nemovitosti ${propertyType}.`,
    alternates: {
      canonical: `/typ-nemovitosti/${resolvedParams.slug}`,
    },
    openGraph: {
      title: `${propertyType}: nabídky podílů | Podilo`,
      description: `${listings.length} aktivních nabídek pro typ nemovitosti ${propertyType}.`,
    },
  };
}

export default async function PropertyTypeLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const { propertyType, listings } = await getListingsByPropertyTypeSlug(resolvedParams.slug);

  if (!propertyType) {
    notFound();
  }

  return (
    <div className={`container ${styles.page}`}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Typ nemovitosti</p>
        <h1 className={styles.title}>Podíly pro typ {propertyType}</h1>
        <p className={styles.subtitle}>
          Programatický přehled nabídek podle typu nemovitosti pomáhá rychleji srovnat byty, domy, pozemky i komerční objekty.
        </p>
        <div className={styles.meta}>
          <span className={styles.metaBadge}>{listings.length} aktivních nabídek</span>
          <Link href="/listings" className={styles.metaBadge}>
            Otevřít hlavní výpis
          </Link>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Nabídky podle typu nemovitosti</h2>
          <p className={styles.sectionText}>Podobný formát je vhodný i pro SEO, protože návštěvníkovi rovnou dává relevantní výběr.</p>
        </div>

        {listings.length > 0 ? (
          <div className={styles.grid}>
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>Pro tento typ nemovitosti zatím nejsou aktivní nabídky.</div>
        )}
      </section>
    </div>
  );
}
