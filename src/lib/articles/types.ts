export const ARTICLE_CATEGORIES = [
  'Základy',
  'Pro prodávající',
  'Pro kupující',
  'Ocenění',
  'Vypořádání',
  'Investor',
] as const;

export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

export interface ArticleSection {
  /** Used as the anchor target in the table of contents, so keep it distinct. */
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface ArticleFaq {
  question: string;
  answer: string;
}

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: ArticleCategory;
  seoDescription: string;
  /** ISO date, shown to readers and used for freshness signals. */
  updated: string;
  keyTakeaways: string[];
  sections: ArticleSection[];
  faq?: ArticleFaq[];
}

/**
 * Reading time is derived from the text rather than written by hand - the
 * hand-written values had drifted to roughly ten times the real length.
 */
const WORDS_PER_MINUTE = 200;

export function getArticleWordCount(article: Article) {
  const parts = [
    article.excerpt,
    ...article.keyTakeaways,
    ...article.sections.flatMap((section) => [
      section.heading,
      ...section.paragraphs,
      ...(section.bullets ?? []),
    ]),
    ...(article.faq ?? []).flatMap((entry) => [entry.question, entry.answer]),
  ];

  return parts.join(' ').split(/\s+/).filter(Boolean).length;
}

export function getReadingMinutes(article: Article) {
  return Math.max(1, Math.round(getArticleWordCount(article) / WORDS_PER_MINUTE));
}

export function getReadingTime(article: Article) {
  return `${getReadingMinutes(article)} min čtení`;
}

/** Stable anchor id for a section heading, used by the table of contents. */
export function getSectionId(heading: string) {
  return heading
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function formatArticleDate(iso: string) {
  return new Date(iso).toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
