import type { Article } from './types';

export const article: Article = {
  slug: 'jak-stanovit-cenu-podilu',
  title: 'Jak stanovit cenu podílu',
  excerpt:
    'Proč se podíl neprodá za poměrnou část hodnoty nemovitosti, co velikost slevy reálně ovlivňuje a jak se k rozumnému číslu dopracovat krok za krokem.',
  category: 'Ocenění',
  seoDescription:
    'Jak ocenit spoluvlastnický podíl na nemovitosti — od hodnoty celku přes výpočet poměrné části až po slevu za obsazenost, likviditu a vztahy mezi spoluvlastníky.',
  updated: '2026-09-03',
  keyTakeaways: [
    'Podíl se neoceňuje jako poměrná část hodnoty celku — tržní cena bývá výrazně níž.',
    'Sleva odráží tři věci: obtížné financování, malý okruh kupujících a nejistotu dohody.',
    'Největší vliv na cenu má obsazenost nemovitosti a vztah mezi spoluvlastníky.',
    'Znalecký posudek určuje cenu obvyklou pro úřady, ne to, co za podíl někdo reálně dá.',
  ],
  sections: [
    {
      heading: 'Proč poměrná část nefunguje',
      paragraphs: [
        'Nejčastější představa prodávajícího vypadá takhle: dům má hodnotu deset milionů, vlastním polovinu, chci pět milionů. Logika je čistá, jenže na trhu neobstojí. Za pět milionů si kupující může koupit celý byt, který může hned obývat nebo pronajmout. Za podíl dostane spoluvlastnictví s cizím člověkem a nutnost teprve něco vyjednat.',
        'Kupující tedy nekupuje kus nemovitosti. Kupuje právní pozici a s ní očekávání, že se z ní dá časem dostat k něčemu hodnotnějšímu — k dohodě se spoluvlastníkem, k odkupu zbytku nebo k vypořádání. To čekání a riziko musí být v ceně zaplacené, jinak nemá koupě smysl.',
        'Sleva oproti poměrné části proto není projev nevýhodného jednání ani podceňování vašeho majetku. Je to cena za nelikvidnost a nejistotu, stejná logika jako u jakéhokoli jiného aktiva, které se špatně prodává.',
      ],
    },
    {
      heading: 'Tři důvody, proč jde cena dolů',
      paragraphs: [
        'První je financování. Banky na spoluvlastnický podíl hypotéku poskytují velmi neochotně nebo vůbec — zástava podílu je pro ně problematická. Většina kupujících tedy platí z vlastních peněz, což okruh zájemců zásadně zužuje a tlačí cenu dolů.',
        'Druhý je likvidita. Zatímco byt v krajském městě má stovky potenciálních kupců, o konkrétní podíl se zajímá hrstka lidí — v praxi spoluvlastník a několik investorů, kteří se na tenhle segment specializují. Malý okruh zájemců znamená slabší konkurenci a nižší cenu.',
        'Třetí je nejistota. Kupující nemá záruku, že se se spoluvlastníkem dohodne. Může skončit u soudu, řízení může trvat roky a výsledek není jistý. Za tuhle nejistotu si účtuje rizikovou prémii, která se projeví právě jako sleva z ceny.',
      ],
      bullets: [
        'Hypotéku na podíl banky obvykle neposkytnou.',
        'Zájemců je řádově méně než o celou nemovitost.',
        'Cesta k dohodě není jistá a může trvat roky.',
      ],
    },
    {
      heading: 'Co slevu zmenšuje a co zvětšuje',
      paragraphs: [
        'Sleva není pevné číslo. Dvě nabídky se stejnou velikostí podílu a podobnou nemovitostí se mohou prodat za velmi odlišné částky podle toho, jak vypadá okolní situace.',
        'Cenu zlepšuje prázdná nemovitost — kupující se nemusí dohadovat o vyklizení. Dále větší podíl, protože s většinou se lépe prosazuje běžná správa. Fungující komunikace se spoluvlastníkem a nejlépe jeho vyjádřený zájem podíl odkoupit. A nemovitost v dobrém stavu na místě, kde je poptávka.',
        'Cenu naopak sráží obsazenost nemovitosti spoluvlastníkem, který v ní bydlí a nemá kam jít. Otevřený konflikt nebo probíhající soudní spor. Velmi malý podíl bez reálné vyjednávací síly. Zástavy a exekuce na listu vlastnictví. A nemovitost, o kterou by nebyl zájem ani jako o celek.',
        'V praxi se běžně potkáváme s tím, že podíl na prázdné nemovitosti s vstřícným spoluvlastníkem se prodá blízko poměrné hodnotě, zatímco menšinový podíl na domě obsazeném znesvářeným spoluvlastníkem jde za zlomek. Rozdíl mezi těmito situacemi je mnohem větší než rozdíl daný velikostí podílu samotného.',
      ],
      bullets: [
        'Zlepšuje: prázdná nemovitost, větší podíl, vstřícný spoluvlastník, dobrá lokalita.',
        'Zhoršuje: obsazenost, konflikt, velmi malý podíl, zástavy a exekuce.',
        'Rozhodující je, jak snadno se kupující dostane k vypořádání.',
      ],
    },
    {
      heading: 'Postup: jak se dopracovat k číslu',
      paragraphs: [
        'Začněte hodnotou celé nemovitosti. Podívejte se, za kolik se v okolí prodaly srovnatelné nemovitosti — ne za kolik jsou inzerované, ale za kolik se skutečně prodaly. Inzerované ceny bývají optimistické. Pomůžou cenové mapy nebo odhad od realitního makléře, který lokalitu zná.',
        'Z hodnoty celku spočítejte poměrnou část odpovídající vašemu podílu. To je horní hranice, ke které se v praxi nedostanete, ale je to výchozí bod.',
        'Pak projděte faktory z předchozí kapitoly a upravte číslo dolů podle toho, jak vaše situace vypadá. Buďte k sobě upřímní — pokud je nemovitost obsazená spoluvlastníkem, který se stěhovat nechce, je to zásadní okolnost, ne detail.',
        'Nakonec si výsledek ověřte proti realitě trhu. Projděte inzeráty podobných podílů, dívejte se na to, jak dlouho visí a jestli se ceny snižují. Nabídka, která se prodala do dvou měsíců, vám o ceně řekne mnohem víc než ta, co inzeruje rok.',
      ],
      bullets: [
        'Vyjděte z realizovaných, ne inzerovaných cen v okolí.',
        'Spočítejte poměrnou část a berte ji jako strop.',
        'Upravte dolů podle obsazenosti, vztahů a velikosti podílu.',
        'Porovnejte se skutečně prodanými podíly, ne jen s dlouho visícími inzeráty.',
      ],
    },
    {
      heading: 'Kdy má smysl znalecký posudek',
      paragraphs: [
        'Znalecký posudek je nezbytný v situacích, kde ho vyžaduje úřad nebo soud — u soudního vypořádání spoluvlastnictví, v dědickém řízení nebo někdy pro daňové účely. Tam bez něj nic nevyřešíte.',
        'Pro běžný prodej na volném trhu je ale jeho přínos omezený a je dobré vědět proč. Posudek určuje cenu obvyklou podle metodiky, která pracuje s hodnotou nemovitosti. Nezachycuje to, co cenu podílu na trhu reálně určuje: kolik lidí je ochotno tuhle konkrétní situaci koupit a za kolik.',
        'V praxi to znamená, že posudek často vyjde výš než částka, kterou vám někdo skutečně nabídne. To není chyba znalce — jen odpovídá na jinou otázku, než jakou si klade kupující.',
        'Pokud tedy prodáváte na trhu, berte posudek jako jeden podklad z několika. Pokud jdete k soudu, je to podklad zásadní.',
      ],
      bullets: [
        'Nutný u soudu, v dědictví a někdy pro daně.',
        'Pro tržní prodej má omezenou vypovídací hodnotu.',
        'Cena obvyklá a cena dosažitelná na trhu nejsou totéž.',
      ],
    },
    {
      heading: 'Nejčastější chyba: kotvení na vysněné částce',
      paragraphs: [
        'Prodávající si často spočítá poměrnou část, přičte pár set tisíc „na vyjednávání" a s tímhle číslem jde na trh. U bytu by to fungovalo — přijde nabídka, usmlouvá se. U podílu ne.',
        'Okruh kupujících je tak malý, že přeceněná nabídka z něj vypadne úplně. Investor, který se podílům věnuje, si spočítá, kolik pro něj situace znamená, a když je inzerovaná cena mimo, prostě se neozve. Nepošle nižší protinabídku — jen jde k jinému inzerátu.',
        'Výsledkem je nabídka, která visí měsíce bez jediného telefonátu. Prodávající pak cenu postupně snižuje, ale mezitím se z inzerátu stala „ta nabídka, co tam visí odjakživa", a to samo o sobě vyjednávací pozici zhoršuje.',
        'Rozumnější postup je nastavit cenu blízko realitě hned od začátku a v popisu vysvětlit, z čeho vychází. Nabídka, u které je vidět, že prodávající situaci chápe, přitáhne vážné zájemce mnohem rychleji.',
      ],
    },
  ],
  faq: [
    {
      question: 'O kolik procent se podíl prodává pod poměrnou hodnotou?',
      answer:
        'Jedno číslo neexistuje a každý, kdo vám ho slíbí, hádá. Rozpětí je velmi široké — podíl na prázdné nemovitosti se vstřícným spoluvlastníkem se blíží poměrné hodnotě, menšinový podíl na obsazené nemovitosti v konfliktu jde za zlomek. Rozhoduje hlavně to, jak snadno se kupující dostane k vypořádání.',
    },
    {
      question: 'Dostanu za větší podíl poměrně víc peněz?',
      answer:
        'Zpravidla ano. S většinovým podílem se lépe prosazuje běžná správa a pozice kupujícího při vyjednávání je silnější, což zmenšuje slevu. Velikost podílu ale není nejdůležitější faktor — obsazenost a vztahy mezi spoluvlastníky ovlivňují cenu obvykle víc.',
    },
    {
      question: 'Je znalecký posudek dobrý podklad pro cenu v inzerátu?',
      answer:
        'Jen částečně. Posudek určuje cenu obvyklou podle metodiky, ne částku, kterou trh za podíl skutečně zaplatí — obvykle vyjde výš. Použijte ho jako jeden ze vstupů a doplňte ho pohledem na skutečně prodané podíly.',
    },
    {
      question: 'Mám v inzerátu uvádět odhad hodnoty celé nemovitosti?',
      answer:
        'Ano, ale odděleně od ceny za podíl, aby bylo jasné, co je co. Kupujícímu to pomáhá rychle posoudit, jestli dává nabídka smysl, a nabídce to dodává důvěryhodnost — je vidět, že cena z něčeho vychází.',
    },
  ],
};
