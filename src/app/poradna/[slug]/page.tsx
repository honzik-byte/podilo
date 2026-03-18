import { notFound } from 'next/navigation';
import Link from 'next/link';
import { articles, getArticleBySlug, getRelatedArticles } from '@/lib/articleContent';
import { getRelevantListingsForArticle } from '@/lib/listingQueries';
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
    openGraph: {
      title: `${article.title} - Podilo`,
      description: article.seoDescription,
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
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.seoDescription,
    author: {
      '@type': 'Organization',
      name: 'Podilo',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Podilo',
    },
    mainEntityOfPage: `${baseUrl}/poradna/${article.slug}`,
  };

  return (
    <article className={`container ${styles.page}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Link href="/poradna" className={styles.backLink}>
        ← Zpět do Poradny
      </Link>

      <header className={styles.header}>
        <div className={styles.meta}>
          <span>{article.category}</span>
          <span>{article.readTime}</span>
        </div>
        <h1 className={styles.title}>{article.title}</h1>
        <p className={styles.subtitle}>{article.excerpt}</p>
      </header>

      <div className={styles.prose}>
        {article.sections.map((section) => (
          <section key={section.heading} className={styles.section}>
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

      <div className={styles.footerCard}>
        <h3>Hledáte konkrétní příležitosti?</h3>
        <p>Podívejte se na aktuální nabídky podílů nebo si založte účet a začněte si ukládat relevantní inzeráty.</p>
        <div className={styles.actions}>
          <Link href="/listings" className={styles.primaryLink}>Prohlédnout nabídky</Link>
          <Link href="/register" className={styles.secondaryLink}>Vytvořit účet</Link>
        </div>
      </div>

      {relatedArticles.length > 0 && (
        <div className={styles.footerCard}>
          <h3>Související články</h3>
          <p>Navazující témata z Poradny, která pomáhají zasadit nabídky do širšího kontextu.</p>
          <div className={styles.relatedLinks}>
            {relatedArticles.map((relatedArticle) => (
              <Link key={relatedArticle.slug} href={`/poradna/${relatedArticle.slug}`} className={styles.relatedLink}>
                {relatedArticle.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {relatedListings.length > 0 && (
        <div className={styles.footerCard}>
          <h3>Relevantní nabídky</h3>
          <p>Konkrétní inzeráty, které tematicky navazují na článek a dávají rychlý přechod z obsahu do marketplace.</p>
          <div className={styles.relatedLinks}>
            {relatedListings.map((listing) => (
              <Link key={listing.id} href={`/listings/${listing.id}`} className={styles.relatedLink}>
                {listing.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
