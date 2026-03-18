import Link from 'next/link';
import ListingCard from '@/components/ListingCard';
import Button from '@/components/Button';
import WhyRegisterCard from '@/components/WhyRegisterCard';
import HeroStats from '@/components/HeroStats';
import TestimonialsCarousel from '@/components/TestimonialsCarousel';
import { articles } from '@/lib/articleContent';
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

const commonBuyerQuestions = [
  {
    question: 'Jak poznám, jestli je cena podílu realistická?',
    answer: 'Sledujte rozdíl mezi cenou za nabízený podíl, odhadem ceny celé nemovitosti a popisem situace. Podobná cena bez kontextu nestačí.',
  },
  {
    question: 'Je Podilo realitní kancelář nebo zprostředkovatel?',
    answer: 'Ne. Podilo funguje jako specializované tržiště. Zájemce a prodávající se propojují napřímo a další kroky řeší mezi sebou.',
  },
  {
    question: 'Co si ověřit ještě před prvním kontaktem?',
    answer: 'Velikost podílu, obsazenost, odhad ceny celé nemovitosti, důvod prodeje a jestli inzerát dává jasný smysl i bez dovysvětlování po telefonu.',
  },
];

export default async function Home() {
  const [allListings, { regions, propertyTypes }] = await Promise.all([
    getAllListings(),
    getListingLandingTaxonomy(),
  ]);
  const featuredListings = allListings.slice(0, 6);
  const publishedListings = 12;

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

        {featuredListings.length > 0 ? (
          <div className={styles.grid}>
            {featuredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>Zatím zde nejsou žádné inzeráty. Buďte první, kdo nabídne svůj podíl.</p>
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

      <section className={`container ${styles.trustSection}`}>
        <div className={styles.sectionHeaderSimple}>
          <div>
            <p className={styles.sectionEyebrow}>Důvěra a ověření</p>
            <h2 className={styles.sectionTitle}>Jasně oddělujeme roli platformy, ověření kontaktu a samotný obchod</h2>
          </div>
        </div>

        <div className={styles.trustGrid}>
          <div className={styles.trustCard}>
            <strong>Ověřený kontakt</strong>
            <p>U vybraných nabídek ověřujeme, že kontakt patří skutečnému zadavateli nabídky. Neznamená to právní garanci transakce, ale silnější důvěryhodnost inzerátu.</p>
          </div>
          <div className={styles.trustCard}>
            <strong>Přímý kontakt bez prostředníka</strong>
            <p>Zájemce komunikuje přímo s prodávajícím. Podilo nepřebírá roli makléře, nevyjednává za strany a nezasahuje do podmínek dohody.</p>
          </div>
          <div className={styles.trustCard}>
            <strong>Podilo jako specializované tržiště</strong>
            <p>Soustředíme se na srozumitelnost ceny podílu, kontext nabídky a lepší orientaci na trhu se spoluvlastnickými podíly.</p>
          </div>
        </div>
      </section>

      {propertyTypes.length > 0 && (
        <section className={`container ${styles.propertySection}`}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionEyebrow}>Podle typu nemovitosti</p>
              <h2 className={styles.sectionTitle}>Rychlý vstup do typu nabídky, který právě řešíte</h2>
            </div>
            <Link href="/listings" className={styles.viewAll}>
              Otevřít marketplace →
            </Link>
          </div>

          <div className={styles.typeGrid}>
            {propertyTypes.slice(0, 4).map((propertyType) => (
              <Link key={propertyType.slug} href={`/typ-nemovitosti/${propertyType.slug}`} className={styles.typeCard}>
                <span>{propertyType.label}</span>
                <strong>{propertyType.count} aktivních nabídek</strong>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className={`container ${styles.faqSection}`}>
        <div className={styles.sectionHeaderSimple}>
          <div>
            <p className={styles.sectionEyebrow}>Co kupující řeší nejčastěji</p>
            <h2 className={styles.sectionTitle}>Krátké odpovědi na otázky, které rozhodují o prvním kontaktu</h2>
          </div>
        </div>

        <div className={styles.faqGrid}>
          {commonBuyerQuestions.map((item) => (
            <div key={item.question} className={styles.faqCard}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </div>
          ))}
        </div>
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

        {(regions.length > 0 || propertyTypes.length > 0) && (
          <div className={styles.articleGrid} style={{ marginTop: '1.25rem' }}>
            {regions.slice(0, 2).map((region) => (
              <Link key={region.slug} href={`/lokality/${region.slug}`} className={styles.articleCard}>
                <div className={styles.articleMeta}>
                  <span>Lokalita</span>
                  <span>{region.count} nabídek</span>
                </div>
                <h3>Podíly v regionu {region.name}</h3>
                <p>Programatický přehled aktivních nabídek pro konkrétní region.</p>
              </Link>
            ))}
            {propertyTypes.slice(0, 1).map((propertyType) => (
              <Link key={propertyType.slug} href={`/typ-nemovitosti/${propertyType.slug}`} className={styles.articleCard}>
                <div className={styles.articleMeta}>
                  <span>Typ nemovitosti</span>
                  <span>{propertyType.count} nabídek</span>
                </div>
                <h3>Podíly pro typ {propertyType.label}</h3>
                <p>Rychlý vstup do nabídek stejného typu nemovitosti bez dalšího filtrování.</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className={`container ${styles.investorSection}`}>
        <div className={styles.investorCard}>
          <div>
            <p className={styles.sectionEyebrow}>Pro aktivní investory</p>
            <h2 className={styles.sectionTitle}>Investor Pro připravujeme, ale dáváme mu realistický tvar</h2>
            <p className={styles.sectionText}>
              Nechceme generický subscription box. Připravujeme uložená hledání, alerty, watchlist a další nástroje, které dávají smysl jen těm, kdo sledují trh pravidelně.
            </p>
          </div>
          <Link href="/premium">
            <Button variant="outline">Co připravujeme</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
