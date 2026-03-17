export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  seoDescription: string;
  sections: Array<{
    heading: string;
    paragraphs: string[];
    bullets?: string[];
  }>;
}

export const articles: Article[] = [
  {
    slug: 'co-je-spoluvlastnicky-podil-nemovitosti',
    title: 'Co je spoluvlastnický podíl nemovitosti?',
    excerpt: 'Základní vysvětlení, co přesně kupujete nebo prodáváte a proč je důležité rozlišovat podíl od konkrétní části nemovitosti.',
    category: 'Základy',
    readTime: '4 min',
    seoDescription: 'Vysvětlení spoluvlastnického podílu nemovitosti, práv a povinností spoluvlastníka a praktických dopadů při prodeji i koupi.',
    sections: [
      {
        heading: 'Co podíl znamená v praxi',
        paragraphs: [
          'Spoluvlastnický podíl vyjadřuje míru účasti na celé nemovitosti. Pokud vlastníte například 1/2 domu, neznamená to automaticky, že máte vyhrazené konkrétní patro nebo jednu přesně určenou místnost.',
          'Kupující proto nehodnotí jen samotnou adresu a stav nemovitosti, ale i vztahy mezi spoluvlastníky, možnosti užívání a realistickou cestu k budoucímu vypořádání.'
        ],
        bullets: [
          'Podíl je právní podíl na celku, ne fyzicky oddělená část.',
          'Velikost podílu ovlivňuje vyjednávací pozici i cenu.',
          'Velkou roli hrají dohody mezi spoluvlastníky.'
        ]
      },
      {
        heading: 'Na co si dát pozor',
        paragraphs: [
          'Před prodejem i koupí je vhodné zkontrolovat list vlastnictví, případná omezení, věcná břemena a faktický způsob užívání. U investorů bývá důležité i to, zda je nemovitost volná, pronajatá nebo užívaná jiným spoluvlastníkem.'
        ]
      }
    ]
  },
  {
    slug: 'jak-prodat-podil-na-nemovitosti',
    title: 'Jak prodat podíl na nemovitosti',
    excerpt: 'Praktický přehled kroků od přípravy podkladů až po komunikaci se zájemcem a uzavření dohody.',
    category: 'Pro prodávající',
    readTime: '5 min',
    seoDescription: 'Jak připravit prodej podílu na nemovitosti, jak formulovat nabídku a co si připravit před oslovením zájemců.',
    sections: [
      {
        heading: 'Připravte nabídku tak, aby byla důvěryhodná',
        paragraphs: [
          'Dobře připravený inzerát výrazně zvyšuje šanci na kvalitní poptávky. Investoři potřebují rychle pochopit, co přesně se prodává, za kolik a v jaké situaci se nemovitost nachází.',
          'Podstatné je uvést cenu za nabízený podíl, velikost podílu, odhad hodnoty celé nemovitosti a srozumitelně popsat obsazenost i důvod prodeje.'
        ],
        bullets: [
          'Přidejte přesnou lokalitu a kvalitní fotografie.',
          'Popište vztahy a užívání bez zbytečných nejasností.',
          'Uveďte realistickou cenu a podklady, o které se opírá.'
        ]
      }
    ]
  },
  {
    slug: 'na-co-si-dat-pozor-pri-koupi-podilu',
    title: 'Na co si dát pozor při koupi podílu',
    excerpt: 'Checklist pro investory i spoluvlastníky, kteří chtějí předejít nepříjemným překvapením.',
    category: 'Pro kupující',
    readTime: '6 min',
    seoDescription: 'Kontrolní seznam pro koupi spoluvlastnického podílu: právní stav, obsazenost, rizika a investiční potenciál.',
    sections: [
      {
        heading: 'Zajímejte se o právní i faktický stav',
        paragraphs: [
          'Cena sama o sobě nestačí. U podílů je nutné chápat, kdo nemovitost užívá, zda existuje nájemní vztah, kolik je dalších spoluvlastníků a zda je reálné dosáhnout dohody nebo vypořádání.',
          'Smysl má i porovnání nabídkové ceny s odhadem hodnoty podílu. Nižší cena může znamenat příležitost, ale také komplikovanější situaci.'
        ],
        bullets: [
          'Zkontrolujte list vlastnictví a omezení.',
          'Ptejte se na obsazenost a způsob užívání.',
          'Ověřte, zda je uveden odhad ceny celé nemovitosti.',
          'Zajímejte se o důvod prodeje a stav komunikace mezi spoluvlastníky.'
        ]
      }
    ]
  },
  {
    slug: 'jak-stanovit-cenu-podilu',
    title: 'Jak stanovit cenu podílu',
    excerpt: 'Proč nelze počítat hodnotu podílu jen mechanicky a co ovlivňuje konečnou cenu na trhu.',
    category: 'Ocenění',
    readTime: '5 min',
    seoDescription: 'Jak určit cenu spoluvlastnického podílu, jak pracovat s odhadem ceny celku a jak komunikovat cenu investorům.',
    sections: [
      {
        heading: 'Cena podílu není jen matematický výpočet',
        paragraphs: [
          'Teoretická hodnota podílu může vycházet z odhadu celé nemovitosti, ale skutečná tržní cena zohledňuje i likviditu, obsazenost, kvalitu lokality a vztahy mezi spoluvlastníky.',
          'Dobrá prezentace inzerátu pomáhá vysvětlit, proč je cena nastavena právě takto a jaké benefity nebo rizika ji ovlivňují.'
        ],
        bullets: [
          'Uvádějte cenu za nabízený podíl odděleně od hodnoty celku.',
          'Doplňte kontext: obsazenost, stav, potenciál.',
          'Nebojte se vysvětlit logiku ceny přímo v inzerátu.'
        ]
      }
    ]
  },
  {
    slug: 'investovani-do-podilu-nemovitosti',
    title: 'Investování do podílů nemovitostí',
    excerpt: 'Kdy může být podíl zajímavou příležitostí a jaké nástroje by měl aktivní investor sledovat.',
    category: 'Investor',
    readTime: '7 min',
    seoDescription: 'Jak přemýšlet o investování do spoluvlastnických podílů nemovitostí, jaké signály sledovat a kde hledat příležitosti.',
    sections: [
      {
        heading: 'Co hledají aktivní investoři',
        paragraphs: [
          'Investičně zajímavé nabídky často spojuje jasná cenová logika, realisticky popsaná situace a možnost dalšího kroku, například dohody se spoluvlastníkem nebo budoucího vypořádání.',
          'Proto dává smysl sledovat nové nabídky, ukládat si relevantní příležitosti a porovnávat jejich parametry napříč regiony.'
        ],
        bullets: [
          'Lokality s dlouhodobou poptávkou.',
          'Nabídky s uvedenou hodnotou celku a rozumným diskontem.',
          'Příležitosti s jasným investičním scénářem.'
        ]
      }
    ]
  }
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
