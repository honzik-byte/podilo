import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ListingCard from '@/components/ListingCard';
import Button from '@/components/Button';
import WhyRegisterCard from '@/components/WhyRegisterCard';
import HeroStats from '@/components/HeroStats';
import TestimonialsCarousel from '@/components/TestimonialsCarousel';
import { articles } from '@/lib/articleContent';
import { mergeWithLocalListings } from '@/lib/localListings';
import styles from './page.module.css';
import { Listing } from '@/types';

export const revalidate = 0;

const articleHighlights = articles.slice(0, 3);

export default async function Home() {
  const { data: listings, error } = await supabase
    .from('listings')
    .select('*')
    .order('is_top', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(6);

  const displayListings = await mergeWithLocalListings((listings as Listing[]) || []);
  const publishedListings = displayListings.length;

  return (
    <div className={styles.home}>
      <section className={styles.hero}>
        <div className={`container ${styles.heroContainer}`}>
          <div className={styles.heroContent}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>Marketplace pro spoluvlastnické podíly</p>
              <h1 className={styles.heroTitle}>Kupujte a prodávejte podíly nemovitostí s větší jistotou</h1>
              <p className={styles.heroSubtitle}>
                Podilo je specializované české tržiště zaměřené pouze na spoluvlastnické podíly. Pomáhá rychle pochopit, co se prodává, za kolik a v jaké situaci se nabídka nachází.
              </p>
              <div className={styles.heroActions}>
                <Link href="/add">
                  <Button>Přidat inzerát</Button>
                </Link>
                <Link href="/listings">
                  <Button variant="outline">Prohlížet nabídky</Button>
                </Link>
              </div>
            </div>

            <div className={styles.heroAside}>
              <div className={styles.heroStack}>
                <HeroStats publishedListings={publishedListings} />
                <TestimonialsCarousel />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`container ${styles.proofSection}`}>
        <div className={styles.proofGrid}>
          <div className={styles.proofCard}>
            <strong>Bez provize</strong>
            <p>Podilo není realitní kancelář ani broker. Je to čisté tržiště pro konkrétní segment trhu.</p>
          </div>
          <div className={styles.proofCard}>
            <strong>Investor kontext</strong>
            <p>Vedle ceny podílu vidíte i odhad celku, obsazenost a další podklady pro rychlejší rozhodnutí.</p>
          </div>
          <div className={styles.proofCard}>
            <strong>Přímé spojení</strong>
            <p>Zájemce komunikuje přímo s prodávajícím, bez složitého zprostředkování a bez zbytečného šumu.</p>
          </div>
        </div>
      </section>

      <section className={`container ${styles.feedSection}`}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Aktuální příležitosti</p>
            <h2 className={styles.sectionTitle}>Nejnovější nabídky</h2>
            <p className={styles.sectionText}>
              Výběr čerstvě zveřejněných podílů, které můžete dále filtrovat podle lokality, ceny nebo situace nabídky.
            </p>
          </div>
          <Link href="/listings" className={styles.viewAll}>
            Zobrazit vše →
          </Link>
        </div>

        {displayListings.length > 0 ? (
          <div className={styles.grid}>
            {displayListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>Zatím zde nejsou žádné inzeráty. Buďte první, kdo nabídne svůj podíl.</p>
            {error && (
              <p className={styles.errorText}>
                Připojení k databázi selhalo. Zkontrolujte lokální Supabase konfiguraci.
              </p>
            )}
          </div>
        )}
      </section>

      <section className={`container ${styles.registerSection}`}>
        <div className={styles.sectionHeaderSimple}>
          <div>
            <p className={styles.sectionEyebrow}>Registrace</p>
            <h2 className={styles.sectionTitle}>Účet dává smysl hlavně tehdy, když chcete trh aktivně sledovat</h2>
          </div>
        </div>
        <WhyRegisterCard title="Uložte si zajímavé nabídky a vraťte se k nim později" />
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
                <span>{article.readTime}</span>
              </div>
              <h3>{article.title}</h3>
              <p>{article.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
