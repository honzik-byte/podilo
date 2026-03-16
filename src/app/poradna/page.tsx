import Link from 'next/link';
import { articles } from '@/lib/articleContent';
import styles from './page.module.css';

export const metadata = {
  title: 'Poradna - Podilo',
  description: 'Praktické články o prodeji, koupi a investování do spoluvlastnických podílů nemovitostí.',
};

export default function ContentHubPage() {
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
    </div>
  );
}
