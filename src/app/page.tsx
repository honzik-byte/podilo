import Link from 'next/link';
import Image from 'next/image';
import ListingCard from '@/components/ListingCard';
import Button from '@/components/Button';
import { articles, getReadingTime } from '@/lib/articleContent';
import { getAllListings, getListingLandingTaxonomy } from '@/lib/listingQueries';
import styles from './page.module.css';

export const revalidate = 0;

const articleHighlights = [
  'nejcastejsi-chyby-pri-prodeji-podilu',
  'jak-prodat-podil-na-nemovitosti',
  'na-co-si-dat-pozor-pri-koupi-podilu',
]
  .map((slug) => articles.find((article) => article.slug === slug))
  .filter((article): article is NonNullable<typeof article> => Boolean(article));

export default async function Home() {
  const [allListings, { propertyTypes, regions }] = await Promise.all([
    getAllListings(),
    getListingLandingTaxonomy(),
  ]);
  const promotedListings = allListings.filter((listing) => listing.is_top || listing.is_highlighted);
  const featuredListings = (promotedListings.length > 0 ? promotedListings : allListings).slice(0, 6);
  const heroImage = featuredListings.find((listing) => listing.images?.[0])?.images?.[0];

  return (
    <div className={styles.home}>
      <section className={styles.hero}>
        <div className={styles.heroPhoto}>
          {heroImage && (
            <Image
              src={heroImage}
              alt=""
              fill
              sizes="100vw"
              quality={60}
              priority
              className={styles.heroImage}
            />
          )}
          <div className={styles.heroScrim} />
          <div className={`container ${styles.heroContent}`}>
            <h1 className={styles.heroTitle}>Kupujte a prodávejte podíly nemovitostí s větší jistotou</h1>
            <p className={styles.heroSubtitle}>
              Ověřené nabídky spoluvlastnických podílů, jasná dokumentace a přímé spojení s vlastníkem — bez zbytečných zprostředkovatelů.
            </p>
            <div className={styles.heroActions}>
              <Link href="/add">
                <Button className={styles.heroPrimaryButton}>Přidat inzerát</Button>
              </Link>
              <Link href="/listings">
                <Button variant="outline" className={styles.heroSecondaryButton}>
                  Prohlížet nabídky
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={`container ${styles.proofSection}`}>
        <div className={styles.proofGrid}>
          <div className={styles.proofCard}>
            <strong>Bez provize</strong>
            <p>Podilo není realitní kancelář ani broker. Je to inzertní tržiště pro jeden konkrétní segment trhu.</p>
          </div>
          <div className={styles.proofCard}>
            <strong>Přímo s vlastníkem</strong>
            <p>Zájemce komunikuje rovnou s prodávajícím. Nevyjednáváme za strany ani nezasahujeme do podmínek dohody.</p>
          </div>
          <div className={styles.proofCard}>
            <strong>Investor kontext</strong>
            <p>Vedle ceny podílu vidíte odhad hodnoty celku, obsazenost i další podklady pro rychlejší rozhodnutí.</p>
          </div>
        </div>
        <p className={styles.proofNote}>
          U vybraných nabídek ověřujeme, že kontakt patří skutečnému zadavateli. Není to právní
          garance transakce, ale vyšší jistota, že píšete tomu, komu podíl skutečně patří.
        </p>
      </section>

      <section className={`container ${styles.feedSection}`}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Aktuální příležitosti</p>
            <h2 className={styles.sectionTitle}>Vybrané nabídky</h2>
            <p className={styles.sectionText}>
              Na úvodní stránce zobrazujeme především aktivně propagované nabídky, které mají být ve feedu nejvíc vidět.
            </p>
          </div>
          <Link href="/listings" className={styles.viewAll}>
            Zobrazit vše →
          </Link>
        </div>

        {featuredListings.length > 0 ? (
          <div className={styles.grid}>
            {featuredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
            {/* With only a handful of listings the grid would leave a wide empty
                gap, so the remaining space asks for supply instead. */}
            {featuredListings.length < 3 && (
              <Link href="/add" className={styles.addCard}>
                <span className={styles.addCardEyebrow}>Máte podíl k prodeji?</span>
                <strong className={styles.addCardTitle}>Přidejte svůj inzerát</strong>
                <p className={styles.addCardText}>
                  Zveřejnění je zdarma a zabere pár minut. Nabídku uvidí lidé, kteří se o
                  spoluvlastnické podíly zajímají cíleně.
                </p>
                <span className={styles.addCardCta}>Přidat inzerát →</span>
              </Link>
            )}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>Zatím zde nejsou žádné inzeráty. Buďte první, kdo nabídne svůj podíl.</p>
            <Link href="/add" className={styles.emptyStateLink}>
              Přidat inzerát →
            </Link>
          </div>
        )}
      </section>

      <section className={`container ${styles.educationSection}`}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Poradna</p>
            <h2 className={styles.sectionTitle}>Vysvětlujeme, jak s podíly pracovat</h2>
            <p className={styles.sectionText}>
              Praktické články pro prodávající, kupující i investory, kteří chtějí lépe chápat specifika trhu se spoluvlastnickými podíly.
            </p>
          </div>
          <Link href="/poradna" className={styles.viewAll}>
            Všechny články →
          </Link>
        </div>

        <div className={styles.articleGrid}>
          {articleHighlights.map((article) => (
            <Link key={article.slug} href={`/poradna/${article.slug}`} className={styles.articleCard}>
              <div className={styles.articleMeta}>
                <span>{article.category}</span>
                <span>{getReadingTime(article)}</span>
              </div>
              <h3>{article.title}</h3>
              <p>{article.excerpt}</p>
            </Link>
          ))}
        </div>

      </section>

      {(propertyTypes.length > 0 || regions.length > 0) && (
        <section className={`container ${styles.browseSection}`}>
          <div className={styles.sectionHeaderSimple}>
            <div>
              <p className={styles.sectionEyebrow}>Procházet dál</p>
              <h2 className={styles.sectionTitle}>Podíly podle typu nemovitosti a regionu</h2>
            </div>
          </div>

          <div className={styles.chips}>
            {propertyTypes.slice(0, 5).map((propertyType) => (
              <Link
                key={propertyType.slug}
                href={`/typ-nemovitosti/${propertyType.slug}`}
                className={styles.chip}
              >
                <span>{propertyType.label}</span>
                <strong>{propertyType.count}</strong>
              </Link>
            ))}
            {regions.slice(0, 5).map((region) => (
              <Link key={region.slug} href={`/lokality/${region.slug}`} className={styles.chip}>
                <span>{region.name}</span>
                <strong>{region.count}</strong>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
