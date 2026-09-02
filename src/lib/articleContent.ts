import type { Article } from './articles/types';
import { article as coJeSpoluvlastnickyPodil } from './articles/co-je-spoluvlastnicky-podil-nemovitosti';
import { article as predkupniPravo } from './articles/predkupni-pravo-spoluvlastniku';
import { article as jakProdatPodil } from './articles/jak-prodat-podil-na-nemovitosti';
import { article as nejcastejsiChyby } from './articles/nejcastejsi-chyby-pri-prodeji-podilu';
import { article as danePriProdeji } from './articles/dane-pri-prodeji-podilu';
import { article as naCoSiDatPozor } from './articles/na-co-si-dat-pozor-pri-koupi-podilu';
import { article as jakStanovitCenu } from './articles/jak-stanovit-cenu-podilu';
import { article as zruseniSpoluvlastnictvi } from './articles/zruseni-a-vyporadani-spoluvlastnictvi';
import { article as dedictviAPodil } from './articles/dedictvi-a-podil-na-nemovitosti';
import { article as investovaniDoPodilu } from './articles/investovani-do-podilu-nemovitosti';

export type { Article, ArticleSection, ArticleFaq, ArticleCategory } from './articles/types';
export {
  ARTICLE_CATEGORIES,
  getReadingTime,
  getReadingMinutes,
  getArticleWordCount,
  getSectionId,
  formatArticleDate,
} from './articles/types';

/**
 * Order drives the hub: the first entry is the lead article, and the rest are
 * grouped by category in the order they first appear here.
 */
export const articles: Article[] = [
  coJeSpoluvlastnickyPodil,
  predkupniPravo,
  jakProdatPodil,
  nejcastejsiChyby,
  danePriProdeji,
  naCoSiDatPozor,
  jakStanovitCenu,
  zruseniSpoluvlastnictvi,
  dedictviAPodil,
  investovaniDoPodilu,
];

export function getArticleBySlug(slug: string) {
  return articles.find((article) => article.slug === slug);
}

export function getRelatedArticles(slug: string, limit = 3) {
  const current = getArticleBySlug(slug);

  if (!current) {
    return [];
  }

  return articles
    .filter((article) => article.slug !== slug)
    .sort((a, b) => {
      const aScore = Number(a.category === current.category);
      const bScore = Number(b.category === current.category);
      return bScore - aScore;
    })
    .slice(0, limit);
}

export function getArticlesByCategory() {
  const grouped = new Map<string, Article[]>();

  articles.forEach((article) => {
    const existing = grouped.get(article.category) ?? [];
    grouped.set(article.category, [...existing, article]);
  });

  return [...grouped.entries()].map(([category, items]) => ({ category, items }));
}
