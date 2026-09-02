import Link from 'next/link';
import { articles, getArticlesByCategory, getReadingTime } from '@/lib/articleContent';
import { getListingLandingTaxonomy } from '@/lib/listingQueries';
import styles from './page.module.css';

export const metadata = {
  title: 'Poradna o spoluvlastnických podílech | Podilo',
  description:
    'Praktické články o prodeji, koupi a investování do spoluvlastnických podílů nemovitostí. Vysvětlení trhu, cen i právního kontextu.',
  alternates: { canonical: '/poradna' },
};

export default async function ContentHubPage() {
  const { regions, propertyTypes } = await getListingLandingTaxonomy();
  const [leadArticle] = articles;
  const grouped = getArticlesByCategory().filter((group) =>
    group.items.some((item) => item.slug !== leadArticle.slug)
  );

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Poradna Podilo</p>
        <h1 className={styles.title}>Spoluvlastnickým podílům se dá rozumět</h1>
        <p className={styles.subtitle}>
          Trh s podíly má vlastní pravidla — jiná než u běžného prodeje bytu. Vysvětlujeme právní
          i praktickou stránku věci, ať už podíl prodáváte, zvažujete koupi, nebo hledáte
          investiční příležitost.
        </p>
      </header>

      <Link href={`/poradna/${leadArticle.slug}`} className={styles.leadCard}>
        <div className={styles.leadBody}>
          <div className={styles.meta}>
            <span className={styles.category}>{leadArticle.category}</span>
            <span>{getReadingTime(leadArticle)}</span>
          </div>
          <h2 className={styles.leadTitle}>{leadArticle.title}</h2>
          <p className={styles.leadExcerpt}>{leadArticle.excerpt}</p>
          <span className={styles.leadCta}>Začněte tady →</span>
        </div>
        <ul className={styles.leadTakeaways}>
          {leadArticle.keyTakeaways.slice(0, 3).map((takeaway) => (
            <li key={takeaway}>{takeaway}</li>
          ))}
        </ul>
      </Link>

      {grouped.map((group) => {
        const items = group.items.filter((item) => item.slug !== leadArticle.slug);

        if (items.length === 0) {
          return null;
        }

        return (
          <section key={group.category} className={styles.categorySection}>
            <h2 className={styles.categoryTitle}>{group.category}</h2>
            <div className={styles.grid}>
              {items.map((article) => (
                <Link
                  key={article.slug}
                  href={`/poradna/${article.slug}`}
                  className={styles.card}
                >
                  <div className={styles.meta}>
                    <span>{getReadingTime(article)}</span>
                  </div>
                  <h3 className={styles.cardTitle}>{article.title}</h3>
                  <p className={styles.cardExcerpt}>{article.excerpt}</p>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      {(regions.length > 0 || propertyTypes.length > 0) && (
        <section className={styles.browseSection}>
          <div className={styles.browseHeader}>
            <h2 className={styles.categoryTitle}>Přejít rovnou k nabídkám</h2>
            <p className={styles.browseText}>
              Konkrétní podíly podle regionu nebo typu nemovitosti.
            </p>
          </div>
          <div className={styles.chips}>
            {regions.slice(0, 4).map((region) => (
              <Link key={region.slug} href={`/lokality/${region.slug}`} className={styles.chip}>
                <span>{region.name}</span>
                <strong>{region.count}</strong>
              </Link>
            ))}
            {propertyTypes.slice(0, 4).map((propertyType) => (
              <Link
                key={propertyType.slug}
                href={`/typ-nemovitosti/${propertyType.slug}`}
                className={styles.chip}
              >
                <span>{propertyType.label}</span>
                <strong>{propertyType.count}</strong>
              </Link>
            ))}
          </div>
        </section>
      )}

      <p className={styles.disclaimer}>
        Články slouží k obecné orientaci na trhu se spoluvlastnickými podíly a nenahrazují právní
        ani daňové poradenství. Konkrétní situaci si nechte posoudit advokátem nebo daňovým
        poradcem.
      </p>
    </div>
  );
}
