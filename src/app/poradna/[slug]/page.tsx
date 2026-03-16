import { notFound } from 'next/navigation';
import Link from 'next/link';
import { articles, getArticleBySlug } from '@/lib/articleContent';
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
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const article = getArticleBySlug(resolvedParams.slug);

  if (!article) {
    notFound();
  }

  return (
    <article className={`container ${styles.page}`}>
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
    </article>
  );
}
