import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  articles,
  formatArticleDate,
  getArticleBySlug,
  getReadingTime,
  getRelatedArticles,
  getSectionId,
} from '@/lib/articleContent';
import { getRelevantListingsForArticle } from '@/lib/listingQueries';
import { formatCzechCurrency } from '@/lib/formatting';
import styles from './page.module.css';

export async function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const article = getArticleBySlug(resolvedParams.slug);

  if (!article) {
    return {};
  }

  return {
    title: `${article.title} - Podilo`,
    description: article.seoDescription,
    alternates: { canonical: `/poradna/${resolvedParams.slug}` },
    openGraph: {
      title: `${article.title} - Podilo`,
      description: article.seoDescription,
      type: 'article',
      publishedTime: article.updated,
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const article = getArticleBySlug(resolvedParams.slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = getRelatedArticles(article.slug, 3);
  const relatedListings = await getRelevantListingsForArticle(article, 3);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://podilo.cz';

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.seoDescription,
    dateModified: article.updated,
    author: { '@type': 'Organization', name: 'Podilo' },
    publisher: { '@type': 'Organization', name: 'Podilo' },
    mainEntityOfPage: `${baseUrl}/poradna/${article.slug}`,
  };

  const faqSchema = article.faq?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: article.faq.map((entry) => ({
          '@type': 'Question',
          name: entry.question,
          acceptedAnswer: { '@type': 'Answer', text: entry.answer },
        })),
      }
    : null;

  return (
    <div className={`container ${styles.page}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <Link href="/poradna" className={styles.backLink}>
        ← Zpět do Poradny
      </Link>

      <header className={styles.header}>
        <div className={styles.meta}>
          <span className={styles.category}>{article.category}</span>
          <span>{getReadingTime(article)}</span>
          <span>Aktualizováno {formatArticleDate(article.updated)}</span>
        </div>
        <h1 className={styles.title}>{article.title}</h1>
        <p className={styles.subtitle}>{article.excerpt}</p>
      </header>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <nav className={styles.toc} aria-label="Obsah článku">
            <p className={styles.tocTitle}>Obsah</p>
            <ol className={styles.tocList}>
              {article.sections.map((section) => (
                <li key={section.heading}>
                  <a href={`#${getSectionId(section.heading)}`}>{section.heading}</a>
                </li>
              ))}
              {article.faq?.length ? (
                <li>
                  <a href="#caste-dotazy">Časté dotazy</a>
                </li>
              ) : null}
            </ol>
          </nav>
        </aside>

        <article className={styles.content}>
          <section className={styles.takeaways} aria-label="Shrnutí">
            <p className={styles.takeawaysTitle}>Ve zkratce</p>
            <ul>
              {article.keyTakeaways.map((takeaway) => (
                <li key={takeaway}>{takeaway}</li>
              ))}
            </ul>
          </section>

          <div className={styles.prose}>
            {article.sections.map((section) => (
              <section
                key={section.heading}
                id={getSectionId(section.heading)}
                className={styles.section}
              >
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.bullets && (
                  <ul>
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          {article.faq?.length ? (
            <section id="caste-dotazy" className={styles.faq}>
              <h2>Časté dotazy</h2>
              <div className={styles.faqList}>
                {article.faq.map((entry) => (
                  <details key={entry.question} className={styles.faqItem}>
                    <summary>{entry.question}</summary>
                    <p>{entry.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          ) : null}

          <p className={styles.disclaimer}>
            Text slouží k obecné orientaci a nenahrazuje právní ani daňové poradenství. Pravidla
            mají výjimky a mění se — konkrétní situaci si nechte posoudit advokátem nebo daňovým
            poradcem.
          </p>
        </article>
      </div>

      <section className={styles.ctaCard}>
        <div>
          <h2>Hledáte konkrétní příležitosti?</h2>
          <p>
            Podívejte se na aktuální nabídky podílů, nebo si založte účet a začněte si ukládat ty,
            které chcete sledovat.
          </p>
        </div>
        <div className={styles.actions}>
          <Link href="/listings" className={styles.primaryLink}>
            Prohlédnout nabídky
          </Link>
          <Link href="/register" className={styles.secondaryLink}>
            Vytvořit účet
          </Link>
        </div>
      </section>

      {relatedListings.length > 0 && (
        <section className={styles.relatedSection}>
          <h2 className={styles.relatedTitle}>Nabídky k tématu</h2>
          <div className={styles.listingGrid}>
            {relatedListings.map((listing) => (
              <Link
                key={listing.id}
                href={`/listings/${listing.id}`}
                className={styles.listingCard}
              >
                <span className={styles.listingLocation}>{listing.location}</span>
                <strong className={styles.listingTitle}>{listing.title}</strong>
                <span className={styles.listingPrice}>{formatCzechCurrency(listing.price)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {relatedArticles.length > 0 && (
        <section className={styles.relatedSection}>
          <h2 className={styles.relatedTitle}>Pokračujte dál</h2>
          <div className={styles.articleGrid}>
            {relatedArticles.map((relatedArticle) => (
              <Link
                key={relatedArticle.slug}
                href={`/poradna/${relatedArticle.slug}`}
                className={styles.articleCard}
              >
                <span className={styles.articleCategory}>{relatedArticle.category}</span>
                <strong>{relatedArticle.title}</strong>
                <span className={styles.articleTime}>{getReadingTime(relatedArticle)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
