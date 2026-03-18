import Link from 'next/link';
import { articles } from '@/lib/articleContent';
import { getListingLandingTaxonomy } from '@/lib/listingQueries';
import styles from './page.module.css';

export const metadata = {
  title: 'Poradna o spoluvlastnických podílech | Podilo',
  description: 'Praktické články o prodeji, koupi a investování do spoluvlastnických podílů nemovitostí. Vysvětlení trhu, cen i právního kontextu.',
};

export default async function ContentHubPage() {
  const { regions, propertyTypes } = await getListingLandingTaxonomy();

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Poradna Podilo</p>
        <h1 className={styles.title}>Obsahový hub pro kupující, prodávající i investory</h1>
        <p className={styles.subtitle}>
          Vysvětlujeme právní i praktické souvislosti trhu se spoluvlastnickými podíly, aby rozhodování nad nabídkami bylo jistější a rychlejší.
        </p>
      </div>

      <div className={styles.grid}>
        {articles.map((article) => (
          <Link key={article.slug} href={`/poradna/${article.slug}`} className={styles.card}>
            <div className={styles.meta}>
              <span>{article.category}</span>
              <span>{article.readTime}</span>
            </div>
            <h2>{article.title}</h2>
            <p>{article.excerpt}</p>
          </Link>
        ))}
      </div>

      {(regions.length > 0 || propertyTypes.length > 0) && (
        <div className={styles.grid} style={{ marginTop: '1.5rem' }}>
          {regions.slice(0, 3).map((region) => (
            <Link key={region.slug} href={`/lokality/${region.slug}`} className={styles.card}>
              <div className={styles.meta}>
                <span>Lokalita</span>
                <span>{region.count} nabídek</span>
              </div>
              <h2>Podíly v regionu {region.name}</h2>
              <p>Regionální landing page s aktivními nabídkami a rychlým kontextem pro investory.</p>
            </Link>
          ))}
          {propertyTypes.slice(0, 3).map((propertyType) => (
            <Link key={propertyType.slug} href={`/typ-nemovitosti/${propertyType.slug}`} className={styles.card}>
              <div className={styles.meta}>
                <span>Typ nemovitosti</span>
                <span>{propertyType.count} nabídek</span>
              </div>
              <h2>Podíly: {propertyType.label}</h2>
              <p>Tematická landing page podle typu nemovitosti s relevantním výběrem nabídek.</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
