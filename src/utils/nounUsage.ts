import { NounEntry } from '../types/grammar';
import {
  inflectUkrainianNoun,
  getUkrainianGender,
  isLithuanianMasculine,
  extractPrimaryWord,
  getEnglishPlural,
  ENGLISH_UNCOUNTABLE_SINGULAR,
  stripUkrainianPreposition,
} from './nounInflections';

export interface CollocationItem {
  phraseLt: string;
  transUk: string;
  transEn: string;
  caseBadge?: string;
  type: 'verb' | 'adjective' | 'prep' | 'genitive';
}

export interface IdiomItem {
  phraseLt: string;
  transUk: string;
  transEn: string;
  explanationUk: string;
  explanationEn: string;
  explanationLt: string;
  originOrStyle?: string;
}

export interface GovernanceItem {
  patternLt: string;
  caseName: string;
  meaningUk: string;
  meaningEn: string;
  meaningLt?: string;
  exampleLt: string;
}

export interface ConversationalPhrase {
  lt: string;
  uk: string;
  en: string;
  context: string;
}

export interface NounUsageGuide {
  collocations: CollocationItem[];
  idioms: IdiomItem[];
  governance: GovernanceItem[];
  conversationalPhrases: ConversationalPhrase[];
}

interface CuratedNounData {
  collocations: CollocationItem[];
  idioms: IdiomItem[];
  governance: GovernanceItem[];
  conversationalPhrases: ConversationalPhrase[];
}

// ============================================================================
// CURATED REPOSITORY OF VERIFIED LITHUANIAN COLLOCATIONS, IDIOMS & DIALOGUES
// ============================================================================
const CURATED_USAGE_MAP: Record<string, CuratedNounData> = {
  namas: {
    collocations: [
      {
        phraseLt: 'statyti namą',
        transUk: 'будувати будинок',
        transEn: 'to build a house',
        caseBadge: 'Galininkas (Acc.)',
        type: 'verb',
      },
      {
        phraseLt: 'grįžti į namus',
        transUk: 'повертатися додому',
        transEn: 'to return home',
        caseBadge: 'į + Galininkas',
        type: 'prep',
      },
      {
        phraseLt: 'būti namuose',
        transUk: 'бути вдома',
        transEn: 'to be at home',
        caseBadge: 'Vietininkas (Loc.)',
        type: 'prep',
      },
      {
        phraseLt: 'daugiabutis namas',
        transUk: 'багатоквартирний будинок',
        transEn: 'apartment building',
        caseBadge: 'Būdvardis + Dkt.',
        type: 'adjective',
      },
      {
        phraseLt: 'jaukus medinis namas',
        transUk: 'затишний дерев’яний будинок',
        transEn: 'cozy wooden house',
        caseBadge: 'Būdvardis + Dkt.',
        type: 'adjective',
      },
      {
        phraseLt: 'svečių namai',
        transUk: 'гостьовий будинок',
        transEn: 'guesthouse',
        caseBadge: 'Kilmininkas (Gen.)',
        type: 'genitive',
      },
    ],
    idioms: [
      {
        phraseLt: 'Jauskis kaip namuose',
        transUk: 'Почувайся як удома',
        transEn: 'Make yourself at home',
        explanationUk: 'Традиційне гостинне запрошення для гостей почуватися вільно та невимушено.',
        explanationEn: 'Traditional welcoming phrase inviting guests to relax and feel comfortable.',
        explanationLt: 'Tradicinis svetingumo posakis, kviečiantis svečius jaustis laisvai.',
        originOrStyle: 'Svetingumo etiketas / Гостинність',
      },
      {
        phraseLt: 'Mano namai — mano tvirtovė',
        transUk: 'Мій дім — моя фортеця',
        transEn: 'My home is my castle',
        explanationUk: 'Вислів про безпеку, особистий простір і недоторканність приватного життя.',
        explanationEn: 'Proverbial saying signifying privacy, safety, and personal sanctuary.',
        explanationLt: 'Posakis, pabrėžiantis privatumo, saugumo ir šeimos erdvės svarbą.',
        originOrStyle: 'Patarlė / Прислів’я',
      },
      {
        phraseLt: 'Visi namai ant kojų sukelti',
        transUk: 'Увесь дім піднятий на ноги',
        transEn: 'The whole household is in an uproar',
        explanationUk: 'Про велике хвилювання, метушню або термінову підготовку в родині.',
        explanationEn: 'Used when the entire household is stirred up in commotion or urgent preparation.',
        explanationLt: 'Vartojama, kai namuose kyla didelis sujudimas ar skubus pasiruošimas.',
        originOrStyle: 'Frazeologizmas / Ідіома',
      },
    ],
    governance: [
      {
        patternLt: 'į namus',
        caseName: 'į + Galininkas (dgs.)',
        meaningUk: 'куди? рух додому або всередину будинку',
        meaningEn: 'where to? heading home or into the house',
        meaningLt: 'kur? judėjimas namų kryptimi',
        exampleLt: 'Po darbo visada skubu į namus.',
      },
      {
        patternLt: 'namuose',
        caseName: 'Vietininkas (dgs.)',
        meaningUk: 'де? перебування вдома (вживається у множині без прийменника)',
        meaningEn: 'where? staying at home (used in plural Locative without preposition)',
        meaningLt: 'kur? buvimas namie (daugiskaitos vietininkas)',
        exampleLt: 'Savaitgalį visa šeima ilsisi namuose.',
      },
      {
        patternLt: 'iš namų',
        caseName: 'iš + Kilmininkas (dgs.)',
        meaningUk: 'звідки? вихід із дому',
        meaningEn: 'from where? leaving home',
        meaningLt: 'iš kur? išėjimas iš namų',
        exampleLt: 'Anksti ryte išėjau iš namų.',
      },
    ],
    conversationalPhrases: [
      {
        lt: 'Ar šį vakarą būsi namuose?',
        uk: 'Ти будеш сьогодні ввечері вдома?',
        en: 'Will you be at home this evening?',
        context: 'Kasdienis bendravimas / Щоденна розмова',
      },
      {
        lt: 'Sveiki atvykę į mūsų naujus namus!',
        uk: 'Ласкаво просимо до нашого нового дому!',
        en: 'Welcome to our new home!',
        context: 'Įkurtuvės / Новосілля',
      },
    ],
  },

  brolis: {
    collocations: [
      {
        phraseLt: 'vyresnysis / jaunesnysis brolis',
        transUk: 'старший / молодший брат',
        transEn: 'older / younger brother',
        caseBadge: 'Būdvardis + Dkt.',
        type: 'adjective',
      },
      {
        phraseLt: 'tikras brolis',
        transUk: 'рідний брат',
        transEn: 'biological / full brother',
        caseBadge: 'Būdvardis + Dkt.',
        type: 'adjective',
      },
      {
        phraseLt: 'pusbrolis',
        transUk: 'двоюрідний брат (кузен)',
        transEn: 'male cousin',
        caseBadge: 'Giminingas žodis',
        type: 'genitive',
      },
      {
        phraseLt: 'padėti broliui',
        transUk: 'допомагати братові',
        transEn: 'to help a brother',
        caseBadge: 'Naudininkas (Dat.)',
        type: 'verb',
      },
      {
        phraseLt: 'kalbėtis su broliu',
        transUk: 'розмовляти з братом',
        transEn: 'to talk with a brother',
        caseBadge: 'su + Įnagininkas',
        type: 'prep',
      },
    ],
    idioms: [
      {
        phraseLt: 'Panašūs kaip broliai dvyniai',
        transUk: 'Схожі як брати-близнюки (як дві краплі води)',
        transEn: 'Alike like twin brothers / like two peas in a pod',
        explanationUk: 'Про людей або речі, які майже неможливо відрізнити одне від одного.',
        explanationEn: 'Said of two people or items that look almost identical.',
        explanationLt: 'Apie labai panašius, beveik nesiskiriančius žmones ar daiktus.',
        originOrStyle: 'Palyginimas / Порівняння',
      },
      {
        phraseLt: 'Dalytis broliškai',
        transUk: 'Ділитися по-братськи (чесно, порівну)',
        transEn: 'To share brotherly / equally and fairly',
        explanationUk: 'Ділити щось щиро, справедливо і порівну між усіма.',
        explanationEn: 'To divide something fairly and generously.',
        explanationLt: 'Sąžiningai, po lygiai ir draugiškai pasidalyti.',
        originOrStyle: 'Posakis / Сталий вираз',
      },
    ],
    governance: [
      {
        patternLt: 'su broliu',
        caseName: 'su + Įnagininkas',
        meaningUk: 'з ким? разом із братом',
        meaningEn: 'with whom? together with my brother',
        meaningLt: 'su kuo? kartu su broliu',
        exampleLt: 'Mes su broliu savaitgalį važiuojame pas tėvus.',
      },
      {
        patternLt: 'pas brolį',
        caseName: 'pas + Galininkas',
        meaningUk: 'у кого? / до кого? у гостях у брата або йти до брата',
        meaningEn: "at or to the brother's place",
        meaningLt: 'pas ką? brolio namuose arba pas jį į svečius',
        exampleLt: 'Vasario mėnesį svečiavausi pas brolį Kaune.',
      },
    ],
    conversationalPhrases: [
      {
        lt: 'Ar turi brolių ar seserų?',
        uk: 'У тебе є брати чи сестри?',
        en: 'Do you have any brothers or sisters?',
        context: 'Pažintis / Знайомство',
      },
      {
        lt: 'Mano vyresnysis brolis studijuoja Vilniaus universitete.',
        uk: 'Мій старший брат навчається у Вільнюському університеті.',
        en: 'My older brother studies at Vilnius University.',
        context: 'Pasakojimas apie šeimą / Розповідь про родину',
      },
    ],
  },

  sesuo: {
    collocations: [
      {
        phraseLt: 'vyresnioji / jaunesnioji sesuo',
        transUk: 'старша / молодша сестра',
        transEn: 'older / younger sister',
        caseBadge: 'Būdvardis + Dkt.',
        type: 'adjective',
      },
      {
        phraseLt: 'tikra sesuo',
        transUk: 'рідна сестра',
        transEn: 'full sister',
        caseBadge: 'Būdvardis + Dkt.',
        type: 'adjective',
      },
      {
        phraseLt: 'pusseserė',
        transUk: 'двоюрідна сестра (кузина)',
        transEn: 'female cousin',
        caseBadge: 'Giminingas žodis',
        type: 'genitive',
      },
      {
        phraseLt: 'skambinti seseriai',
        transUk: 'телефонувати сестрі',
        transEn: 'to call a sister',
        caseBadge: 'Naudininkas (Dat.)',
        type: 'verb',
      },
      {
        phraseLt: 'susitikti su seserimi',
        transUk: 'зустрітися з сестрою',
        transEn: 'to meet with a sister',
        caseBadge: 'su + Įnagininkas',
        type: 'prep',
      },
    ],
    idioms: [
      {
        phraseLt: 'Seseriška meilė ir parama',
        transUk: 'Сестринська любов і підтримка',
        transEn: 'Sisterly love and support',
        explanationUk: 'Символ щирої родинної близькості, взаєморозуміння та турботи.',
        explanationEn: 'Symbolizes warm family closeness, mutual empathy, and care.',
        explanationLt: 'Šilto giminystės ryšio, rūpesčio ir savitarpio pagalbos išraiška.',
        originOrStyle: 'Posakis / Сталий вираз',
      },
    ],
    governance: [
      {
        patternLt: 'sesers (Kilmininkas)',
        caseName: 'Kamieno kaita: sesuo → seser-',
        meaningUk: 'чиє? кого? сестри (у непрямих відмінках основа змінюється на seser-)',
        meaningEn: "whose? sister's (oblique cases use the stem seser-)",
        meaningLt: 'kieno? netiesioginiuose linksniuose kamienas virsta seser-',
        exampleLt: 'Čia yra mano jaunesniosios sesers knyga.',
      },
      {
        patternLt: 'su seserimi',
        caseName: 'su + Įnagininkas',
        meaningUk: 'з ким? із сестрою',
        meaningEn: 'with whom? with my sister',
        meaningLt: 'su kuo? kartu su seserimi',
        exampleLt: 'Mes su seserimi labai gerai sutariame.',
      },
    ],
    conversationalPhrases: [
      {
        lt: 'Mano sesuo dirba gydytoja Klaipėdoje.',
        uk: 'Моя сестра працює лікаркою в Клайпеді.',
        en: 'My sister works as a doctor in Klaipėda.',
        context: 'Šeima / Родина',
      },
      {
        lt: 'Perduok linkėjimus savo seseriai!',
        uk: 'Передавай вітання своїй сестрі!',
        en: 'Send my regards to your sister!',
        context: 'Mandagumas / Ввічливість',
      },
    ],
  },

  šuo: {
    collocations: [
      {
        phraseLt: 'vedžioti šunį',
        transUk: 'вигулювати собаку',
        transEn: 'to walk a dog',
        caseBadge: 'Galininkas (Acc.)',
        type: 'verb',
      },
      {
        phraseLt: 'ištikimas šuo',
        transUk: 'вірний собака',
        transEn: 'faithful dog',
        caseBadge: 'Būdvardis + Dkt.',
        type: 'adjective',
      },
      {
        phraseLt: 'veislinis šuo',
        transUk: 'породистий собака',
        transEn: 'purebred dog',
        caseBadge: 'Būdvardis + Dkt.',
        type: 'adjective',
      },
      {
        phraseLt: 'šuns lojimas',
        transUk: 'гавкіт собаки',
        transEn: 'dog barking',
        caseBadge: 'Kilmininkas (Gen.)',
        type: 'genitive',
      },
      {
        phraseLt: 'žaisti su šunimi',
        transUk: 'гратися з собакою',
        transEn: 'to play with a dog',
        caseBadge: 'su + Įnagininkas',
        type: 'prep',
      },
    ],
    idioms: [
      {
        phraseLt: 'Čia ir šuo pakastas',
        transUk: 'Ось де собака заритий (у цьому вся суть)',
        transEn: "That's the crux of the matter / There's the rub",
        explanationUk: 'Вказує на справжню приховану причину або головну суть справи.',
        explanationEn: 'Indicates the true hidden cause or core of the issue.',
        explanationLt: 'Nurodo tikrąją problemos esmę ar paslapties priežastį.',
        originOrStyle: 'Populiarus frazeologizmas / Ідіома',
      },
      {
        phraseLt: 'Gyvena kaip šuo su kate',
        transUk: 'Живуть як кішка з собакою (постійно сваряться)',
        transEn: 'Live like cat and dog / quarrel constantly',
        explanationUk: 'Описує постійні суперечки та незгоди між людьми.',
        explanationEn: 'Describes frequent quarrels and discord between people.',
        explanationLt: 'Nurodo nuolatinius barnius ir nesutarimus.',
        originOrStyle: 'Posakis / Приказка',
      },
      {
        phraseLt: 'Šuo ir kariamas pripranta',
        transUk: 'До всього можна звикнути',
        transEn: 'One can get used to anything over time',
        explanationUk: 'Народне прислів’я про здатність людини адаптуватися навіть до складних обставин.',
        explanationEn: 'Traditional Lithuanian proverb about human adaptability to tough conditions.',
        explanationLt: 'Lietuvių patarlė apie žmogaus sugebėjimą prisitaikyti prie sunkumų.',
        originOrStyle: 'Liaudies patarlė / Прислів’я',
      },
    ],
    governance: [
      {
        patternLt: 'bijoti šuns',
        caseName: 'bijoti + Kilmininkas',
        meaningUk: 'боятися собаки (дієслово bijoti вимагає родового відмінка)',
        meaningEn: 'to be afraid of a dog (the verb "bijoti" governs Genitive)',
        meaningLt: 'veiksmažodis „bijoti“ reikalauja kilmininko linksnio',
        exampleLt: 'Mažas vaikas nebijo kaimynų šuns.',
      },
      {
        patternLt: 'su šunimi',
        caseName: 'su + Įnagininkas',
        meaningUk: 'із собакою (супровід)',
        meaningEn: 'with a dog (companionship)',
        meaningLt: 'kartu su šunimi',
        exampleLt: 'Kiekvieną rytą bėgioju parke su šunimi.',
      },
    ],
    conversationalPhrases: [
      {
        lt: 'Koks gražus jūsų šuo! Kokia čia veislė?',
        uk: 'Який гарний у вас собака! Яка це порода?',
        en: 'What a beautiful dog you have! What breed is it?',
        context: 'Pasivaikščiojimas / На прогулянці',
      },
      {
        lt: 'Nebijokite, mūsų šuo yra labai draugiškas.',
        uk: 'Не бійтеся, наш собака дуже дружелюбний.',
        en: 'Do not be afraid, our dog is very friendly.',
        context: 'Parke / У парку',
      },
    ],
  },

  vanduo: {
    collocations: [
      {
        phraseLt: 'gerti vandenį',
        transUk: 'пити воду',
        transEn: 'to drink water',
        caseBadge: 'Galininkas (Acc.)',
        type: 'verb',
      },
      {
        phraseLt: 'stiklinė vandens',
        transUk: 'склянка води',
        transEn: 'a glass of water',
        caseBadge: 'Dalies Kilmininkas',
        type: 'genitive',
      },
      {
        phraseLt: 'negazuotas / gazuotas vanduo',
        transUk: 'негазована / газована вода',
        transEn: 'still / sparkling water',
        caseBadge: 'Būdvardis + Dkt.',
        type: 'adjective',
      },
      {
        phraseLt: 'šaltas šaltinio vanduo',
        transUk: 'холодна джерельна вода',
        transEn: 'cold spring water',
        caseBadge: 'Būdvardis + Dkt.',
        type: 'adjective',
      },
      {
        phraseLt: 'geriamasis vanduo',
        transUk: 'питна вода',
        transEn: 'drinking water',
        caseBadge: 'Dalyvis + Dkt.',
        type: 'adjective',
      },
    ],
    idioms: [
      {
        phraseLt: 'Nutekėjo daug vandens',
        transUk: 'Багато води спливло (минуло чимало часу)',
        transEn: 'A lot of water has flowed under the bridge',
        explanationUk: 'Вживається, коли від певної події минуло багато часу і обставини змінилися.',
        explanationEn: 'Means significant time has passed and much has changed since then.',
        explanationLt: 'Reiškia, kad praėjo daug laiko ir daug kas pasikeitė.',
        originOrStyle: 'Klasikinis posakis / Ідіома',
      },
      {
        phraseLt: 'Panašūs kaip du vandens lašai',
        transUk: 'Схожі як дві краплі води',
        transEn: 'Alike like two drops of water',
        explanationUk: 'Про надзвичайну зовнішню або внутрішню схожість.',
        explanationEn: 'Said of two people or things that look identical.',
        explanationLt: 'Labai panašūs, beveik nesiskiriantys vienas nuo kito.',
        originOrStyle: 'Palyginimas / Порівняння',
      },
      {
        phraseLt: 'Tylėti kaip vandens į burną pripylus',
        transUk: 'Мовчати як води в рот набравши',
        transEn: 'To keep mum / remain completely silent',
        explanationUk: 'Уперто мовчати й не відповідати на жодні запитання.',
        explanationEn: 'To stubbornly refuse to speak or reveal a secret.',
        explanationLt: 'Visiškai tylėti, nieko neatsakyti ir neišduoti paslapties.',
        originOrStyle: 'Frazeologizmas / Фразеологізм',
      },
    ],
    governance: [
      {
        patternLt: 'įpilti vandens',
        caseName: 'Dalies Kilmininkas (Partitive)',
        meaningUk: 'налити води (родовий частковий для невизначеної кількості)',
        meaningEn: 'to pour some water (Partitive Genitive for unspecified amount)',
        meaningLt: 'dalies kilmininkas neapibrėžtam kiekiui nusakyti',
        exampleLt: 'Prašau, įpilkite man stiklinę šalto vandens.',
      },
      {
        patternLt: 'be vandens',
        caseName: 'be + Kilmininkas',
        meaningUk: 'без води (відсутність)',
        meaningEn: 'without water',
        meaningLt: 'be ko? vandens nebuvimas',
        exampleLt: 'Augalai negali išgyventi be vandens.',
      },
    ],
    conversationalPhrases: [
      {
        lt: 'Ar galėčiau paprašyti stiklinės negazuoto vandens?',
        uk: 'Чи можу я попросити склянку негазованої води?',
        en: 'Could I please have a glass of still water?',
        context: 'Restorane / У ресторані',
      },
      {
        lt: 'Vasara prie jūros vanduo būna maloniai šiltas.',
        uk: 'Улітку біля моря вода буває приємно теплою.',
        en: 'In summer by the sea, the water is pleasantly warm.',
        context: 'Atostogos / Відпочинок',
      },
    ],
  },

  duona: {
    collocations: [
      {
        phraseLt: 'kepti duoną',
        transUk: 'пекти хліб',
        transEn: 'to bake bread',
        caseBadge: 'Galininkas (Acc.)',
        type: 'verb',
      },
      {
        phraseLt: 'tamsi ruginė duona',
        transUk: 'темний житній хліб',
        transEn: 'dark rye bread',
        caseBadge: 'Būdvardis + Dkt.',
        type: 'adjective',
      },
      {
        phraseLt: 'duonos riekė / kepalas',
        transUk: 'скибка / буханець хліба',
        transEn: 'a slice / loaf of bread',
        caseBadge: 'Kilmininkas (Gen.)',
        type: 'genitive',
      },
      {
        phraseLt: 'šviežia traški duona',
        transUk: 'свіжий хрусткий хліб',
        transEn: 'fresh crusty bread',
        caseBadge: 'Būdvardis + Dkt.',
        type: 'adjective',
      },
      {
        phraseLt: 'nupirkti duonos',
        transUk: 'купити хліба',
        transEn: 'to buy some bread',
        caseBadge: 'Dalies Kilmininkas',
        type: 'verb',
      },
    ],
    idioms: [
      {
        phraseLt: 'Užsidirbti savo duonai',
        transUk: 'Заробляти собі на хліб (на життя)',
        transEn: "To earn one's daily bread / make a living",
        explanationUk: 'Працювати задля самостійного забезпечення життя.',
        explanationEn: 'To work to support oneself financially.',
        explanationLt: 'Dirbti ir pačiam apsirūpinti pragyvenimui.',
        originOrStyle: 'Populiarus posakis / Сталий вираз',
      },
      {
        phraseLt: 'Sutikti su duona ir druska',
        transUk: 'Зустрічати з хлібом і сіллю',
        transEn: 'To welcome with bread and salt',
        explanationUk: 'Давній звичай урочисто й щиро вітати почесних гостей.',
        explanationEn: 'Ancient tradition of welcoming honored guests warmly.',
        explanationLt: 'Senas paprotys pagarbiai ir svetingai pasitikti svečius.',
        originOrStyle: 'Tradicija / Традиція',
      },
    ],
    governance: [
      {
        patternLt: 'su duona',
        caseName: 'su + Įnagininkas',
        meaningUk: 'з хлібом',
        meaningEn: 'with bread',
        meaningLt: 'kartu su duona',
        exampleLt: 'Šaltibarščius Lietuvoje dažnai valgo su juoda duona.',
      },
      {
        patternLt: 'ant duonos',
        caseName: 'ant + Kilmininkas',
        meaningUk: 'на хліб (намазувати на поверхню)',
        meaningEn: 'onto the bread',
        meaningLt: 'ant duonos riekės',
        exampleLt: 'Užtepk šiek tiek sviesto ant šviežios duonos.',
      },
    ],
    conversationalPhrases: [
      {
        lt: 'Lietuviška ruginė duona garsėja visame pasaulyje.',
        uk: 'Литовський житній хліб славиться в усьому світі.',
        en: 'Lithuanian rye bread is famous all over the world.',
        context: 'Kultūra ir virtuvė / Кулінарія',
      },
      {
        lt: 'Pakeliui į namus užeik į kepyklėlę ir nupirk šviežios duonos.',
        uk: 'Дорогою додому зайди до пекарні й купи свіжого хліба.',
        en: 'On your way home, stop by the bakery and buy some fresh bread.',
        context: 'Kasdienis prašymas / Побутове прохання',
      },
    ],
  },

  darbas: {
    collocations: [
      {
        phraseLt: 'eiti į darbą',
        transUk: 'іти на роботу',
        transEn: 'to go to work',
        caseBadge: 'į + Galininkas',
        type: 'prep',
      },
      {
        phraseLt: 'būti darbe',
        transUk: 'бути на роботі',
        transEn: 'to be at work',
        caseBadge: 'Vietininkas (Loc.)',
        type: 'prep',
      },
      {
        phraseLt: 'ieškoti darbo',
        transUk: 'шукати роботу',
        transEn: 'to look for a job',
        caseBadge: 'ieškoti + Kilmininkas',
        type: 'verb',
      },
      {
        phraseLt: 'atsakingas komandinis darbas',
        transUk: 'відповідальна командна робота',
        transEn: 'responsible teamwork',
        caseBadge: 'Būdvardis + Dkt.',
        type: 'adjective',
      },
      {
        phraseLt: 'darbo patirtis / darbo laikas',
        transUk: 'досвід роботи / робочий час',
        transEn: 'work experience / working hours',
        caseBadge: 'Kilmininkas (Gen.)',
        type: 'genitive',
      },
    ],
    idioms: [
      {
        phraseLt: 'Darbas meistrą giria',
        transUk: 'Діло майстра величає',
        transEn: 'The work praises the master',
        explanationUk: 'Якість виконаної справи найкраще свідчить про вміння людини.',
        explanationEn: 'The quality of completed work speaks for the creator’s skill.',
        explanationLt: 'Gerai atliktas darbas geriausiai parodo žmogaus meistrystę.',
        originOrStyle: 'Liaudies patarlė / Прислів’я',
      },
      {
        phraseLt: 'Kibti į darbą',
        transUk: 'Енергійно взятися до роботи',
        transEn: 'To get down to work / roll up one’s sleeves',
        explanationUk: 'Рішуче й без зволікань розпочати виконання справи.',
        explanationEn: 'To energetically and immediately start working.',
        explanationLt: 'Ryžtingai ir energingai pradėti dirbti.',
        originOrStyle: 'Frazeologizmas / Стійкий вираз',
      },
    ],
    governance: [
      {
        patternLt: 'ieškoti darbo',
        caseName: 'ieškoti + Kilmininkas',
        meaningUk: 'шукати роботу (дієслово ieškoti вимагає родового відмінка)',
        meaningEn: 'to look for a job ("ieškoti" governs the Genitive case)',
        meaningLt: 'veiksmažodis „ieškoti“ reikalauja kilmininko',
        exampleLt: 'Jis šiuo metu ieško naujo darbo Vilniuje.',
      },
      {
        patternLt: 'po darbo',
        caseName: 'po + Kilmininkas',
        meaningUk: 'після роботи (часове значення)',
        meaningEn: 'after work (temporal meaning)',
        meaningLt: 'pasibaigus darbo valandoms',
        exampleLt: 'Po darbo susitikime senamiestyje.',
      },
    ],
    conversationalPhrases: [
      {
        lt: 'Kaip sekasi naujame darbe?',
        uk: 'Як справи на новій роботі?',
        en: 'How are things going at your new job?',
        context: 'Pokalbis / Розмова',
      },
      {
        lt: 'Šiandien turiu labai daug skubaus darbo.',
        uk: 'Сьогодні в мене дуже багато термінової роботи.',
        en: 'Today I have a lot of urgent work.',
        context: 'Darbo diena / Робочий день',
      },
    ],
  },

  laikas: {
    collocations: [
      {
        phraseLt: 'leisti laisvą laiką',
        transUk: 'проводити вільний час',
        transEn: 'to spend free time',
        caseBadge: 'Galininkas (Acc.)',
        type: 'verb',
      },
      {
        phraseLt: 'taupyti laiką',
        transUk: 'економити час',
        transEn: 'to save time',
        caseBadge: 'Galininkas (Acc.)',
        type: 'verb',
      },
      {
        phraseLt: 'atvykti laiku',
        transUk: 'прибути вчасно',
        transEn: 'to arrive on time',
        caseBadge: 'Įnagininkas (Ins.)',
        type: 'prep',
      },
      {
        phraseLt: 'trūksta laiko',
        transUk: 'бракує часу',
        transEn: 'short of time / lacking time',
        caseBadge: 'trūkti + Kilmininkas',
        type: 'verb',
      },
      {
        phraseLt: 'metų laikai',
        transUk: 'пори року',
        transEn: 'seasons of the year',
        caseBadge: 'Daugiskaita (Pl.)',
        type: 'genitive',
      },
    ],
    idioms: [
      {
        phraseLt: 'Laikas bėga / Laikas lekia',
        transUk: 'Час біжить / Час летить',
        transEn: 'Time flies',
        explanationUk: 'Про швидкий і непомітний плин часу.',
        explanationEn: 'Expresses how quickly time passes.',
        explanationLt: 'Apie greitą ir nepastebimą laiko tėkmę.',
        originOrStyle: 'Posakis / Сталий вираз',
      },
      {
        phraseLt: 'Laikas gydo visas žaizdas',
        transUk: 'Час лікує всі рани',
        transEn: 'Time heals all wounds',
        explanationUk: 'З плином часу душевний біль та образи вщухають.',
        explanationEn: 'Emotional pain and sorrow gradually fade with time.',
        explanationLt: 'Su laiku skausmas ir nuoskaudos atlėgsta.',
        originOrStyle: 'Patarlė / Прислів’я',
      },
    ],
    governance: [
      {
        patternLt: 'laiku (Įnagininkas)',
        caseName: 'Įnagininkas be prielinksnio',
        meaningUk: 'вчасно (орудний відмінок у ролі прислівника)',
        meaningEn: 'on time / punctually (Instrumental used adverbially)',
        meaningLt: 'nevėluojant, nustatytu metu',
        exampleLt: 'Traukinys išvyko ir atvyko visiškai laiku.',
      },
      {
        patternLt: 'su laiku',
        caseName: 'su + Įnagininkas',
        meaningUk: 'з часом, поступово',
        meaningEn: 'in time / gradually over time',
        meaningLt: 'palaipsniui, bėgant laikui',
        exampleLt: 'Su laiku viskas paaiškės ir išsispręs.',
      },
    ],
    conversationalPhrases: [
      {
        lt: 'Kaip mėgsti leisti laisvą laiką savaitgaliais?',
        uk: 'Як ти любиш проводити вільний час у вихідні?',
        en: 'How do you like to spend your free time on weekends?',
        context: 'Laisvalaikis / Дозвілля',
      },
      {
        lt: 'Deja, šiandien visai neturiu laiko.',
        uk: 'На жаль, сьогодні я зовсім не маю часу.',
        en: 'Unfortunately, I have no time at all today.',
        context: 'Užimtumas / Зайнятість',
      },
    ],
  },

  draugas: {
    collocations: [
      {
        phraseLt: 'geriausias draugas',
        transUk: 'найкращий друг',
        transEn: 'best friend',
        caseBadge: 'Būdvardis + Dkt.',
        type: 'adjective',
      },
      {
        phraseLt: 'vaikystės draugas',
        transUk: 'друг дитинства',
        transEn: 'childhood friend',
        caseBadge: 'Kilmininkas + Dkt.',
        type: 'genitive',
      },
      {
        phraseLt: 'susitikti su draugais',
        transUk: 'зустрітися з друзями',
        transEn: 'to meet with friends',
        caseBadge: 'su + Įnagininkas',
        type: 'prep',
      },
      {
        phraseLt: 'ištikimas ir patikimas draugas',
        transUk: 'вірний і надійний друг',
        transEn: 'loyal and reliable friend',
        caseBadge: 'Būdvardis + Dkt.',
        type: 'adjective',
      },
    ],
    idioms: [
      {
        phraseLt: 'Tikrą draugą nelaimėje pažinsi',
        transUk: 'Справжній друг пізнається в біді',
        transEn: 'A friend in need is a friend indeed',
        explanationUk: 'Справжня дружба перевіряється готовністю допомогти у важку хвилину.',
        explanationEn: 'True friendship is proven during difficult times.',
        explanationLt: 'Tikras draugas pasimato tada, kai ištinka bėda.',
        originOrStyle: 'Liaudies patarlė / Прислів’я',
      },
      {
        phraseLt: 'Senas draugas geresnis už du naujus',
        transUk: 'Старий друг кращий за двох нових',
        transEn: 'An old friend is better than two new ones',
        explanationUk: 'Перевірена роками дружба значно цінніша за нові поверхневі знайомства.',
        explanationEn: 'Long-tested friendship is worth more than new acquaintances.',
        explanationLt: 'Ilgametė patikrinta draugystė yra vertingesnė už naujas pažintis.',
        originOrStyle: 'Patarlė / Прислів’я',
      },
    ],
    governance: [
      {
        patternLt: 'su draugu / su draugais',
        caseName: 'su + Įnagininkas',
        meaningUk: 'разом із другом / друзями',
        meaningEn: 'together with friend(s)',
        meaningLt: 'kartu su draugu ar draugais',
        exampleLt: 'Penktadienio vakarą leidome su draugais.',
      },
      {
        patternLt: 'pas draugą',
        caseName: 'pas + Galininkas',
        meaningUk: 'у гостях у друга або до друга',
        meaningEn: "at a friend's place / visiting a friend",
        meaningLt: 'draugo namuose arba pas jį į svečius',
        exampleLt: 'Šį savaitgalį važiuoju pas draugą į Kauną.',
      },
    ],
    conversationalPhrases: [
      {
        lt: 'Susipažinkite, čia mano geras draugas Tomas.',
        uk: 'Познайомтеся, це мій хороший друг Томас.',
        en: 'Meet my good friend Tomas.',
        context: 'Pristatymas / Знайомство',
      },
    ],
  },

  širdis: {
    collocations: [
      {
        phraseLt: 'širdis plaka',
        transUk: 'серце б’ється',
        transEn: 'the heart beats',
        caseBadge: 'Veiksmažodis',
        type: 'verb',
      },
      {
        phraseLt: 'gera ir jautri širdis',
        transUk: 'добре й чуйне серце',
        transEn: 'kind and sensitive heart',
        caseBadge: 'Būdvardis + Dkt.',
        type: 'adjective',
      },
      {
        phraseLt: 'širdies gilumoje',
        transUk: 'у глибині серця (душі)',
        transEn: 'deep in one’s heart',
        caseBadge: 'Vietininkas (Loc.)',
        type: 'prep',
      },
      {
        phraseLt: 'priimti į širdį',
        transUk: 'брати близько до серця',
        transEn: 'to take to heart',
        caseBadge: 'į + Galininkas',
        type: 'prep',
      },
    ],
    idioms: [
      {
        phraseLt: 'Iš visos širdies',
        transUk: 'Від усього серця / Від щирого серця',
        transEn: 'From the bottom of one’s heart',
        explanationUk: 'Надзвичайно щиро, відверто та з глибокою вдячністю чи любов’ю.',
        explanationEn: 'With complete sincerity, warmth, and gratitude.',
        explanationLt: 'Labai nuoširdžiai, atvirai ir su didele šiluma.',
        originOrStyle: 'Populiarus posakis / Сталий вираз',
      },
      {
        phraseLt: 'Širdis į kulnus nusirito',
        transUk: 'Душа в п’яти пішла (сильно злякався)',
        transEn: 'One’s heart sank into one’s boots',
        explanationUk: 'Про раптовий сильний переляк або хвилювання.',
        explanationEn: 'Describes a sudden rush of intense fear or anxiety.',
        explanationLt: 'Labai stipriai išsigąsti, patirti staigų išgąstį.',
        originOrStyle: 'Frazeologizmas / Ідіома',
      },
      {
        phraseLt: 'Lengva širdimi',
        transUk: 'З легким серцем (без тривог і сумнівів)',
        transEn: 'With a light heart / without worry',
        explanationUk: 'Спокійно, без жодних сумнівів чи важких думок.',
        explanationEn: 'Peacefully, without hesitation or inner burden.',
        explanationLt: 'Ramiai, be dvejonių ir vidinio nerimo.',
        originOrStyle: 'Metafora / Метафора',
      },
    ],
    governance: [
      {
        patternLt: 'man prie širdies',
        caseName: 'prie + Kilmininkas',
        meaningUk: 'мені до душі / мені подобається',
        meaningEn: 'close to my heart / to my liking',
        meaningLt: 'miela, patinka, artima sielai',
        exampleLt: 'Ramus gyvenimas gamtoje man labai prie širdies.',
      },
    ],
    conversationalPhrases: [
      {
        lt: 'Nuoširdžiai dėkoju jums iš visos širdies!',
        uk: 'Щиро дякую вам від усього серця!',
        en: 'I sincerely thank you from the bottom of my heart!',
        context: 'Padėka / Подяка',
      },
    ],
  },

  knyga: {
    collocations: [
      {
        phraseLt: 'skaityti knygą',
        transUk: 'читати книжку',
        transEn: 'to read a book',
        caseBadge: 'Galininkas (Acc.)',
        type: 'verb',
      },
      {
        phraseLt: 'išleisti knygą',
        transUk: 'видати книжку',
        transEn: 'to publish a book',
        caseBadge: 'Galininkas (Acc.)',
        type: 'verb',
      },
      {
        phraseLt: 'įdomi knyga',
        transUk: 'цікава книжка',
        transEn: 'interesting book',
        caseBadge: 'Būdvardis + Dkt.',
        type: 'adjective',
      },
      {
        phraseLt: 'knygų lentyna',
        transUk: 'книжкова полиця',
        transEn: 'bookshelf',
        caseBadge: 'Kilmininkas (Gen.)',
        type: 'genitive',
      },
    ],
    idioms: [
      {
        phraseLt: 'Skaityti kaip atverstą knygą',
        transUk: 'Читати когось як відкриту книгу',
        transEn: 'To read someone like an open book',
        explanationUk: 'Легко розуміти чиїсь думки, почуття та наміри.',
        explanationEn: 'To easily understand someone’s thoughts and intentions.',
        explanationLt: 'Labai lengvai perprasti kito žmogaus mintis ir jausmus.',
        originOrStyle: 'Palyginimas / Порівняння',
      },
    ],
    governance: [
      {
        patternLt: 'knygoje (Vietininkas)',
        caseName: 'Vietininkas be prielinksnio',
        meaningUk: 'у книжці (місце інформації)',
        meaningEn: 'in the book',
        meaningLt: 'knygos tekste',
        exampleLt: 'Šioje knygoje aprašyta senoji Lietuvos istorija.',
      },
    ],
    conversationalPhrases: [
      {
        lt: 'Kokią knygą dabar skaitai?',
        uk: 'Яку книжку ти зараз читаєш?',
        en: 'What book are you reading right now?',
        context: 'Laisvalaikis / Дозвілля',
      },
    ],
  },

  ranka: {
    collocations: [
      {
        phraseLt: 'paspausti ranką',
        transUk: 'потиснути руку',
        transEn: 'to shake hands',
        caseBadge: 'Galininkas (Acc.)',
        type: 'verb',
      },
      {
        phraseLt: 'ištiesi pagalbos ranką',
        transUk: 'простягнути руку допомоги',
        transEn: 'to lend a helping hand',
        caseBadge: 'Galininkas (Acc.)',
        type: 'verb',
      },
      {
        phraseLt: 'dešinė / kairė ranka',
        transUk: 'права / ліва рука',
        transEn: 'right / left hand',
        caseBadge: 'Būdvardis + Dkt.',
        type: 'adjective',
      },
      {
        phraseLt: 'rankų darbas',
        transUk: 'ручна робота',
        transEn: 'handmade / manual work',
        caseBadge: 'Kilmininkas dgs.',
        type: 'genitive',
      },
    ],
    idioms: [
      {
        phraseLt: 'Auksinės rankos',
        transUk: 'Золоті руки (про вмілого майстра)',
        transEn: 'Golden hands / a master craftsman',
        explanationUk: 'Про людину, яка надзвичайно вправно й майстерно виконує будь-яку роботу.',
        explanationEn: 'Describes a person who is exceptionally skilled with their hands.',
        explanationLt: 'Apie labai nagingą, viską puikiai mokantį padaryti meistrą.',
        originOrStyle: 'Frazeologizmas / Ідіома',
      },
      {
        phraseLt: 'Ranka ranką plauna',
        transUk: 'Рука руку миє',
        transEn: 'One hand washes the other / you scratch my back and I’ll scratch yours',
        explanationUk: 'Про взаємну вигоду або покривання одне одного у спільних справах.',
        explanationEn: 'Refers to reciprocal favors or mutual cover-ups.',
        explanationLt: 'Kai žmonės vienas kitam padeda arba vienas kitą dengia.',
        originOrStyle: 'Patarlė / Прислів’я',
      },
      {
        phraseLt: 'Turėti po ranka',
        transUk: 'Мати під рукою (поруч, напохваті)',
        transEn: 'To have close at hand / within reach',
        explanationUk: 'Тримати потрібну річ зовсім близько, щоб одразу скористатися.',
        explanationEn: 'To keep something nearby for immediate use.',
        explanationLt: 'Turėti arti, lengvai pasiekiamoje vietoje.',
        originOrStyle: 'Posakis / Сталий вираз',
      },
    ],
    governance: [
      {
        patternLt: 'po ranka',
        caseName: 'po + Įnagininkas',
        meaningUk: 'під рукою (значення близькості з орудним відмінком)',
        meaningEn: 'at hand / within reach (po + Instrumental)',
        meaningLt: 'čia pat, lengvai pasiekiama',
        exampleLt: 'Žodyną visada laikau ant stalo po ranka.',
      },
      {
        patternLt: 'į rankas',
        caseName: 'į + Galininkas dgs.',
        meaningUk: 'у руки (взяти в руки / взяти себе в руки)',
        meaningEn: 'into one’s hands',
        meaningLt: 'paimti į rankas',
        exampleLt: 'Sunkią akimirką svarbu suimti save į rankas.',
      },
    ],
    conversationalPhrases: [
      {
        lt: 'Prieš valgį nepamiršk nusiplauti rankų.',
        uk: 'Перед їжею не забудь помити руки.',
        en: 'Do not forget to wash your hands before eating.',
        context: 'Kasdienybė / Побут',
      },
    ],
  },

  akis: {
    collocations: [
      {
        phraseLt: 'žiūrėti į akis',
        transUk: 'дивитися в очі',
        transEn: 'to look into the eyes',
        caseBadge: 'į + Galininkas dgs.',
        type: 'prep',
      },
      {
        phraseLt: 'mėlynos / žalios / rudos akys',
        transUk: 'блакитні / зелені / карі очі',
        transEn: 'blue / green / brown eyes',
        caseBadge: 'Būdvardis + Dkt.',
        type: 'adjective',
      },
      {
        phraseLt: 'atmerkti / užmerkti akis',
        transUk: 'розплющити / заплющити очі',
        transEn: 'to open / close one’s eyes',
        caseBadge: 'Galininkas dgs.',
        type: 'verb',
      },
    ],
    idioms: [
      {
        phraseLt: 'Akis į akį',
        transUk: 'Віч-на-віч (наодинці, безпосередньо)',
        transEn: 'Face to face / eye to eye',
        explanationUk: 'Зустрітися або розмовляти безпосередньо, без посередників.',
        explanationEn: 'To meet or speak directly in person.',
        explanationLt: 'Susitikti ar kalbėtis tiesiogiai, be tarpininkų.',
        originOrStyle: 'Frazeologizmas / Ідіома',
      },
      {
        phraseLt: 'Kristi į akis',
        transUk: 'Кидатися у вічі (привертати увагу)',
        transEn: 'To catch the eye / stand out noticeably',
        explanationUk: 'Бути дуже помітним, одразу привертати увагу.',
        explanationEn: 'To be immediately noticeable or striking.',
        explanationLt: 'Būti labai pastebimam, iš karto atkreipti dėmesį.',
        originOrStyle: 'Frazeologizmas / Ідіома',
      },
      {
        phraseLt: 'Saugoti kaip savo akies vyzdį',
        transUk: 'Берегти як зіницю ока',
        transEn: 'To guard like the apple of one’s eye',
        explanationUk: 'Дуже дбайливо й ретельно оберігати щось найдорожче.',
        explanationEn: 'To cherish and protect something above all else.',
        explanationLt: 'Labai rūpestingai ir brangiai saugoti.',
        originOrStyle: 'Palyginimas / Порівняння',
      },
    ],
    governance: [
      {
        patternLt: 'prieš akis',
        caseName: 'prieš + Galininkas dgs.',
        meaningUk: 'перед очима',
        meaningEn: 'before one’s eyes',
        meaningLt: 'tiesiai priešais',
        exampleLt: 'Visas gražus slėnis atsivėrė mums prieš akis.',
      },
    ],
    conversationalPhrases: [
      {
        lt: 'Pasakyk man tai tiesiai į akis.',
        uk: 'Скажи мені це прямо в очі.',
        en: 'Tell me that straight to my face.',
        context: 'Atviras pokalbis / Відверта розмова',
      },
    ],
  },
  kūdikis: {
    collocations: [
      {
        phraseLt: 'sūpuoti kūdikį',
        transUk: 'колисати немовля',
        transEn: 'to rock a baby',
        caseBadge: 'Galininkas (Acc.)',
        type: 'verb',
      },
      {
        phraseLt: 'rūpintis kūdikiu',
        transUk: 'піклуватися про немовля',
        transEn: 'to take care of the baby',
        caseBadge: 'rūpintis + Įnagininkas',
        type: 'verb',
      },
      {
        phraseLt: 'maitinti kūdikį',
        transUk: 'годувати немовля',
        transEn: 'to feed the baby',
        caseBadge: 'Galininkas (Acc.)',
        type: 'verb',
      },
      {
        phraseLt: 'sveikas ir ramus kūdikis',
        transUk: 'здорове й спокійне немовля',
        transEn: 'a healthy and calm baby',
        caseBadge: 'Būdvardis + Dkt.',
        type: 'adjective',
      },
      {
        phraseLt: 'kūdikio šypsena',
        transUk: 'усмішка немовляти',
        transEn: "a baby's smile",
        caseBadge: 'Kilmininkas (Gen.)',
        type: 'genitive',
      },
    ],
    idioms: [
      {
        phraseLt: 'Miegoti kaip kūdikiui',
        transUk: 'Спати як немовля',
        transEn: 'To sleep like a baby',
        explanationUk: 'Спати дуже міцно, спокійно й безтурботно.',
        explanationEn: 'To sleep very soundly and peacefully.',
        explanationLt: 'Miegoti labai giliai, ramiai ir be rūpesčių.',
        originOrStyle: 'Frazeologizmas / Стійкий вираз',
      },
    ],
    governance: [
      {
        patternLt: 'rūpintis kūdikiu',
        caseName: 'rūpintis + Įnagininkas',
        meaningUk: 'піклуватися про немовля (дієслово rūpintis керує орудним відмінком)',
        meaningEn: 'to care for the baby ("rūpintis" governs Instrumental)',
        meaningLt: 'veiksmažodis „rūpintis“ reikalauja įnagininko linksnio',
        exampleLt: 'Tėvai labai švelniai rūpinasi kūdikiu.',
      },
      {
        patternLt: 'daina kūdikiui (lopšinė)',
        caseName: 'Naudininkas (Dative)',
        meaningUk: 'пісня (колискова) для немовляти (давальний відмінок призначення)',
        meaningEn: 'a lullaby for the baby (Dative of purpose/recipient)',
        meaningLt: 'naudininkas nurodo, kam skiriamas veiksmas ar daiktas',
        exampleLt: 'Mama tyliai dainuoja lopšinę kūdikiui.',
      },
    ],
    conversationalPhrases: [
      {
        lt: 'Tyliau, kūdikis ką tik užmigo.',
        uk: 'Тихіше, немовля щойно заснуло.',
        en: 'Shh, the baby has just fallen asleep.',
        context: 'Namuose / Удома',
      },
      {
        lt: 'Koks mielas ir linksmas kūdikis!',
        uk: 'Яке миле та усміхнене немовля!',
        en: 'What a sweet and cheerful baby!',
        context: 'Šeima / Родина',
      },
    ],
  },
  vagis: {
    collocations: [
      {
        phraseLt: 'sugauti vagį',
        transUk: 'спіймати злодія',
        transEn: 'to catch a thief',
        caseBadge: 'Galininkas (Acc.)',
        type: 'verb',
      },
      {
        phraseLt: 'saugotis vagių',
        transUk: 'остерігатися злодіїв',
        transEn: 'to beware of thieves',
        caseBadge: 'saugotis + Kilmininkas',
        type: 'verb',
      },
      {
        phraseLt: 'apsauga nuo vagių',
        transUk: 'захист від злодіїв',
        transEn: 'protection against thieves',
        caseBadge: 'nuo + Kilmininkas',
        type: 'prep',
      },
      {
        phraseLt: 'sulaikyti įtariamą vagį',
        transUk: 'затримати підозрюваного злодія',
        transEn: 'to detain a suspected thief',
        caseBadge: 'Galininkas (Acc.)',
        type: 'verb',
      },
    ],
    idioms: [
      {
        phraseLt: 'Vagiui ir kepurė dega',
        transUk: 'На злодієві й шапка горить',
        transEn: 'A guilty conscience betrays itself',
        explanationUk: 'Нечесна людина сама себе видає своєю тривожною поведінкою.',
        explanationEn: 'A person with a guilty conscience inadvertently gives themselves away.',
        explanationLt: 'Prasižengęs žmogus pats save išduoda neramia elgsena.',
        originOrStyle: 'Liaudies patarlė / Прислів’я',
      },
    ],
    governance: [
      {
        patternLt: 'saugotis vagių',
        caseName: 'saugotis + Kilmininkas',
        meaningUk: 'остерігатися злодіїв (дієслово saugotis вимагає родового відмінка)',
        meaningEn: 'to beware of thieves ("saugotis" governs Genitive)',
        meaningLt: 'veiksmažodis „saugotis“ reikalauja kilmininko linksnio',
        exampleLt: 'Kelionėje visada reikia saugotis kišenvagių.',
      },
      {
        patternLt: 'apsauga nuo vagių',
        caseName: 'nuo + Kilmininkas',
        meaningUk: 'захист від злодіїв (прийменник nuo керує родовим відмінком)',
        meaningEn: 'protection from thieves ("nuo" governs Genitive)',
        meaningLt: 'prielinksnis „nuo“ valdo kilmininko linksnį',
        exampleLt: 'Name įrengta patikima signalizacija nuo vagių.',
      },
    ],
    conversationalPhrases: [
      {
        lt: 'Policija greitai sulaikė vagį.',
        uk: 'Поліція швидко затримала злодія.',
        en: 'The police quickly detained the thief.',
        context: 'Saugumas / Безпека',
      },
      {
        lt: 'Nepalikite daiktų be priežiūros, kad nepriviliotumėte vagių.',
        uk: 'Не залишайте речі без нагляду, щоб не привабити злодіїв.',
        en: 'Do not leave your belongings unattended so as not to attract thieves.',
        context: 'Perspėjimas / Застереження',
      },
    ],
  },
};

// ============================================================================
// PRECISE UKRAINIAN & ENGLISH MORPHOLOGY HELPERS
// ============================================================================
function cleanUkForm(str: string): string {
  return str.split('/')[0].replace(/\(.*?\)/g, '').replace(/!+$/, '').trim();
}

function getEnglishIndefiniteArticle(phrase: string): 'a' | 'an' {
  const clean = phrase.trim().toLowerCase();
  if (/^(honest|hour|heir|herb\b)/.test(clean)) return 'an';
  if (/^(uni|use|usu|euro|one\b|once\b)/.test(clean)) return 'a';
  if (/^[aeiou]/.test(clean)) return 'an';
  return 'a';
}

function isEnglishUncountableOrPlural(enSg: string, enPl: string): boolean {
  if (ENGLISH_UNCOUNTABLE_SINGULAR.has(enSg)) return true;
  if (enSg.endsWith('s') && enSg === enPl) return true; // scissors, glasses, clothes, jeans, trousers, stairs
  if (
    enSg.endsWith('ing') &&
    ![
      'ring', 'earring', 'building', 'painting', 'drawing', 'meeting',
      'crossing', 'ceiling', 'spring', 'wing', 'thing', 'swing', 'king',
      'sibling', 'offspring', 'stocking', 'pudding', 'dumpling', 'herring',
      'recording', 'wedding', 'evening', 'morning', 'feeling', 'meaning',
      'warning', 'blessing', 'finding', 'opening', 'ending', 'beginning',
    ].includes(enSg)
  ) {
    return true;
  }
  return false;
}

// ============================================================================
// FINE-GRAINED SEMANTIC CLASSIFIER (20 DOMAIN CLASSES)
// ============================================================================
type FineSemanticCategory =
  | 'vehicle'
  | 'animal'
  | 'body_part_pain'
  | 'body_feature_external'
  | 'illness_symptom'
  | 'medicine_remedy'
  | 'health_care_state'
  | 'person_social_group'
  | 'person'
  | 'food_drink'
  | 'clothing_footwear'
  | 'jewelry_bag_fabric'
  | 'appliance_device'
  | 'furniture_home_fixture'
  | 'portable_object'
  | 'document_text_media'
  | 'finance_commerce'
  | 'city_building'
  | 'indoor_room'
  | 'street_road_infra'
  | 'geo_country_region'
  | 'nature_landscape_plant'
  | 'weather_element_material'
  | 'scheduled_event'
  | 'time_period_season'
  | 'abstract_concept';

function classifyNounSemantics(noun: NounEntry): FineSemanticCategory {
  const lt = noun.lemma.toLowerCase().trim();

  // 1. Vehicles
  const vehicles = new Set([
    'automobilis', 'mašina', 'autobusas', 'traukinys', 'lėktuvas', 'laivas',
    'dviratis', 'troleibusas', 'tramvajus', 'motociklas', 'taksi', 'metro',
    'valtis', 'keltas', 'sunkvežimis', 'paspirtukas', 'sraigtasparnis',
    'mikroautobusas', 'greitoji', 'vagonas', 'vežimas', 'rogės', 'jachta',
    'traktorius', 'valtelė', 'laivelis'
  ]);
  if (vehicles.has(lt)) return 'vehicle';

  // 2. Animals, birds, fish, insects
  const animals = new Set([
    'šuo', 'katė', 'katinas', 'paukštis', 'arklys', 'žirgas', 'karvė',
    'vilkas', 'lokys', 'meška', 'zuikis', 'kiškis', 'lapė', 'bitė', 'uodas',
    'musė', 'kiaulė', 'avis', 'ožka', 'višta', 'gaidys', 'antis', 'žąsis',
    'pelė', 'žiurkė', 'gyvatė', 'varlė', 'žuvis', 'šernas', 'briedis',
    'elnias', 'voverė', 'ežys', 'liūtas', 'tigras', 'dramblys', 'beždžionė',
    'drugelis', 'voras', 'skruzdėlė', 'vabzdys', 'gulbė', 'gandras',
    'žvirblis', 'varna', 'balandis', 'erelis', 'pelėda', 'šuniukas', 'kačiukas',
    'gyvūnas', 'žvėris', 'veršis', 'ėriukas', 'paršelis', 'kalakutas',
    'papūga', 'kregždė', 'lakštingala', 'genys', 'zylė', 'sraigė', 'vėžlys',
    'banginis', 'delfinas', 'ryklys', 'lydeka', 'lašiša', 'silkė', 'vėžys',
    'vapsva', 'erkė', 'žiogas', 'boružė', 'kirminas'
  ]);
  if (animals.has(lt)) return 'animal';

  // 3. Body parts & organs vs external grooming features
  const externalBodyFeatures = new Set([
    'veidas', 'kakta', 'skruostas', 'smakras', 'lūpa', 'oda', 'plaukas',
    'plaukai', 'barzda', 'ūsai', 'antakis', 'blakstiena', 'nagas', 'delnas',
    'kumštis', 'kūnas', 'kraujas', 'ašara', 'prakaitas', 'balsas', 'žvilgsnis',
    'šypsena', 'raukšlė', 'ūgis', 'figūra'
  ]);
  if (externalBodyFeatures.has(lt)) return 'body_feature_external';

  const painBodyParts = new Set([
    'galva', 'ranka', 'koja', 'akis', 'ausis', 'nosis', 'burna', 'dantis',
    'liežuvis', 'kaklas', 'petys', 'nugara', 'krūtinė', 'pilvas', 'skrandis',
    'širdis', 'plaučiai', 'kepenys', 'smegenys', 'kaulas', 'raumuo', 'pirštas',
    'kelis', 'alkūnė', 'gerklė', 'riešas', 'pėda', 'stuburas', 'inkstas',
    'nervas', 'sąnarys', 'šlaunis', 'blauzda', 'čiurna', 'smegenys'
  ]);
  if (painBodyParts.has(lt) || (lt === 'kulnas' && noun.topic === 'health')) {
    return 'body_part_pain';
  }

  // 4. Health, Illness, Remedies & Medical states
  const medicalPlaces = new Set([
    'ligoninė', 'vaistinė', 'klinika', 'poliklinika', 'ambulatorija',
    'sanatorija', 'dispanseris', 'laboratorija', 'priimamasis', 'registratūra'
  ]);
  if (medicalPlaces.has(lt)) return 'city_building';
  if (lt === 'palata' || lt === 'kabinetas') return 'indoor_room';

  const illnessesAndSymptoms = new Set([
    'liga', 'peršalimas', 'gripas', 'kosulys', 'sloga', 'alergija',
    'uždegimas', 'žaizda', 'randas', 'skausmas', 'simptomas', 'diagnozė',
    'nuovargis', 'stresas', 'infekcija', 'virusas', 'bakterija', 'insultas',
    'infarktas', 'lūžis', 'mėlynė', 'nudegimas', 'svaigulys', 'pykinimas',
    'bėrimas', 'angina', 'bronchitas', 'migrena', 'nemiga', 'depresija',
    'trauma', 'komplikacija', 'epidemija', 'negalavimas', 'sutrikimas',
    'priepuolis', 'karščiavimas'
  ]);
  if (illnessesAndSymptoms.has(lt)) return 'illness_symptom';

  const medicinesAndRemedies = new Set([
    'vaistas', 'tabletė', 'kapsulė', 'tepalas', 'sirupas', 'vitaminas',
    'pleistras', 'tvarstis', 'švirkštas', 'skiepas', 'lašai', 'milteliai',
    'antibiotikas', 'dozė', 'injekcija', 'kompresas', 'termometras',
    'inhaliatorius', 'akiniai', 'ramentai'
  ]);
  if (medicinesAndRemedies.has(lt)) return 'medicine_remedy';

  const healthCareStates = new Set([
    'sveikata', 'savijauta', 'gydymas', 'operacija', 'apžiūra', 'konsultacija',
    'miegas', 'sapnas', 'kvėpavimas', 'pulsas', 'kraujospūdis', 'reabilitacija',
    'profilaktika', 'higiena', 'imunitetas', 'apetitas', 'virškinimas',
    'regėjimas', 'klausa', 'uoslė', 'alkis', 'troškulys', 'mityba', 'dieta',
    'gyvybė', 'mirtis', 'gimimas', 'nėštumas', 'gimdymas', 'jaunystė',
    'senatvė', 'vaikystė', 'paauglystė', 'pilnametystė', 'amžius'
  ]);
  if (healthCareStates.has(lt) || noun.topic === 'health') {
    if (lt !== 'gydytojas' && lt !== 'seselė' && lt !== 'pacientas' && lt !== 'ligonis' && lt !== 'vaistininkas' && lt !== 'chirurgas' && lt !== 'odontologas' && lt !== 'slaugytoja' && lt !== 'sanitaras') {
      return 'health_care_state';
    }
  }

  // 5. Social groups & organizations vs individual people
  const socialGroups = new Set([
    'šeima', 'giminė', 'bendruomenė', 'visuomenė', 'žmonija', 'tauta',
    'karta', 'jaunimas', 'draugija', 'komanda', 'kolektyvas', 'grupė',
    'publika', 'minia', 'delegacija', 'komisija', 'taryba', 'valdžia',
    'vyriausybė', 'policija', 'kariuomenė', 'armija', 'personalas',
    'administracija', 'vadovybė', 'organizacija', 'partija', 'sąjunga',
    'asociacija', 'šeimyna', 'pora'
  ]);
  if (socialGroups.has(lt)) return 'person_social_group';

  const nonPersonFamilyOrAbstract = new Set([
    'vardas', 'pavardė', 'asmenybė', 'charakteris', 'santykiai', 'santuoka',
    'skyrybos', 'vestuvės', 'laidotuvės', 'krikštynos', 'gimtadienis',
    'vardadienis', 'jubiliejus', 'motinystė', 'tėvystė', 'draugystė',
    'kaimynystė', 'partnerystė', 'giminystė', 'meilė', 'pagarba', 'namų ūkis',
    'likimas', 'gyvenimas', 'biografija', 'kilmė', 'tradicija', 'paprotys'
  ]);

  const peopleKeywords = new Set([
    'brolis', 'sesuo', 'tėvas', 'tėtis', 'motina', 'mama', 'vaikas', 'sūnus',
    'duktė', 'dukra', 'senelis', 'senelė', 'močiutė', 'anūkas', 'anūkė',
    'dėdė', 'teta', 'pusbrolis', 'pusseserė', 'vyras', 'moteris', 'žmona',
    'žmogus', 'draugas', 'draugė', 'kaimynas', 'kaimynė', 'svečias',
    'mokytojas', 'mokytoja', 'mokinys', 'mokinė', 'studentas', 'studentė',
    'dėstytojas', 'profesorius', 'direktorius', 'vadovas', 'darbuotojas',
    'kolega', 'klientas', 'pirkėjas', 'pardavėjas', 'padavėjas', 'virėjas',
    'gydytojas', 'seselė', 'pacientas', 'ligonis', 'vaistininkas', 'chirurgas',
    'odontologas', 'slaugytoja', 'vairuotojas', 'keleivis', 'pilotas',
    'policininkas', 'gaisrininkas', 'karys', 'kareivis', 'teisėjas',
    'advokatas', 'rašytojas', 'poetas', 'dailininkas', 'aktorius',
    'dainininkas', 'muzikantas', 'žurnalistas', 'inžinierius', 'programuotojas',
    'architektas', 'statybininkas', 'ūkininkas', 'žvejys', 'sportininkas',
    'treneris', 'turistas', 'užsienietis', 'pilietis', 'gyventojas',
    'jaunuolis', 'mergina', 'vaikinas', 'berniukas', 'mergaitė', 'kūdikis',
    'paauglys', 'šeimininkas', 'šeimininkė', 'autorius', 'specialistas',
    'meistras', 'ekspertas', 'partneris', 'viršininkas', 'sekretorius',
    'buhalteris', 'vadybininkas', 'konsultantas', 'kirpėjas', 'siuvėjas',
    'elektrikas', 'santechnikas', 'mechanikas', 'sargas', 'valytojas',
    'kurjeris', 'laiškanešys', 'kasininkas', 'administratorių', 'administratorius',
    'redaktorius', 'vertėjas', 'mokslininkas', 'tyrėjas', 'istorikas',
    'politikas', 'prezidentas', 'ministras', 'meris', 'meras', 'ambasadorius',
    'diplomatas', 'karalius', 'karalienė', 'princas', 'herojus', 'didvyris',
    'liudininkas', 'teisiamasis', 'nukentėjusysis', 'globėjas', 'įvaikis',
    'našlaitis', 'našlys', 'našlė', 'jaunikis', 'nuotaka', 'sužadėtinis',
    'sužadėtinė', 'uošvis', 'uošvė', 'anyta', 'šešuras', 'žentas', 'marti',
    'svainis', 'svainė', 'dieveris', 'brolėnas', 'dukterėčia', 'sūnėnas',
    'krikštatėvis', 'krikštamotė', 'vaikaitis', 'provaikaitis', 'protėvis',
    'palikuonis', 'bendraamžis', 'bendradarbis', 'bendraklasis', 'bendramokslis',
    'pažįstamas', 'priešas', 'varžovas', 'konkurentas', 'nugalėtojas',
    'čempionas', 'dalyvis', 'žiūrovas', 'klausytojas', 'skaitytojas',
    'lankytojas', 'keliautojas', 'pakeleivis', 'pėstysis', 'lietuvis',
    'lietuvė', 'ukrainietis', 'ukrainietė', 'europietis', 'asmuo', 'individas'
  ]);
  if (
    !nonPersonFamilyOrAbstract.has(lt) &&
    lt !== 'avietė' &&
    lt !== 'turgavietė' &&
    lt !== 'gyvenvietė' &&
    (noun.topic === 'family' ||
      peopleKeywords.has(lt) ||
      lt.endsWith('ininkas') ||
      lt.endsWith('ininkė') ||
      lt.endsWith('ietis') ||
      lt.endsWith('ietė') ||
      (lt.endsWith('tojas') && lt !== 'rytojus') ||
      lt.endsWith('toja'))
  ) {
    return 'person';
  }

  // 6. Appliances & Electronic Devices (check BEFORE topic === 'clothing' because 14 electronics are in 'clothing' topic in nounsPopular850.ts!)
  const appliancesAndDevices = new Set([
    'telefonas', 'kompiuteris', 'nešiojamasis kompiuteris', 'planšetė',
    'televizorius', 'ekranas', 'monitorius', 'klaviatūra', 'ausinė', 'ausinės',
    'garsiakalbis', 'mikrofonas', 'fotoaparatas', 'kamera', 'radijas',
    'spausdintuvas', 'įkroviklis', 'baterija', 'laidas', 'kabelis', 'lizdas',
    'jungiklis', 'lemputė', 'šaldytuvas', 'viryklė', 'orkaitė',
    'skalbimo mašina', 'indaplovė', 'dulkių siurblys', 'lygintuvas',
    'virdulys', 'mikrobangų krosnelė', 'krosnis', 'radiatorius',
    'kondicionierius', 'ventiliatorius', 'džiovintuvas', 'skustuvas',
    'šviesoforas', 'variklis', 'prietaisas', 'įrenginys', 'aparatas',
    'mechanizmas', 'technika', 'liftas', 'siurblys', 'kranas'
  ]);
  if (appliancesAndDevices.has(lt)) return 'appliance_device';

  // 7. Portable Objects, Tools, Hygiene, Tableware (check BEFORE topic === 'clothing' because tools & hygiene items are in 'clothing' topic in nounsPopular850.ts!)
  const portableObjects = new Set([
    'raktas', 'puodelis', 'stiklinė', 'lėkštė', 'dubuo', 'šaukštas',
    'šaukštelis', 'šakutė', 'peilis', 'puodas', 'keptuvė', 'padėklas',
    'arbatinukas', 'butelis', 'stiklainis', 'dėžutė', 'dėžė', 'pakuotė',
    'kibiras', 'šluota', 'skudurėlis', 'kempinė', 'šiukšlė', 'konteineris',
    'muilas', 'šampūnas', 'pasta', 'kremas', 'kvepalai', 'rankšluostis',
    'šepetys', 'dantų šepetėlis', 'šukos', 'vaza', 'žvakė', 'žaislas',
    'kamuolys', 'dovana', 'suvenyras', 'įrankis', 'plaktukas', 'kastuvas',
    'pjūklas', 'atsuktuvas', 'kirvis', 'varžtas', 'vinis', 'virvė', 'žirklės',
    'tušinukas', 'pieštukas', 'rašiklis', 'trintukas', 'liniuotė', 'teptukas',
    'dažai', 'kreida', 'klijai', 'popierius', 'vokas', 'siuntinys', 'prekė',
    'gaminys', 'produktas', 'daiktas', 'indas', 'staltiesė', 'servetėlė',
    'patalynė', 'antklodė', 'pagalvė', 'čiužinys', 'paklodė', 'kilimėlis',
    'žiebtuvėlis', 'degtukas', 'žibintuvėlis', 'kompasas', 'palapinė',
    'miegmaišis', 'meškerė', 'tinklas', 'ratas', 'vairas', 'stabdžiai',
    'sėdynė', 'padanga'
  ]);
  if (portableObjects.has(lt)) return 'portable_object';

  // 8. Jewelry, Bags, Fabrics & Garment Parts
  const jewelryBagsFabrics = new Set([
    'rankinė', 'piniginė', 'kuprinė', 'lagaminas', 'krepšys', 'maišelis',
    'rankinis bagažas', 'bagažas', 'skėtis', 'papuošalas', 'žiedas',
    'grandinėlė', 'apyrankė', 'auskaras', 'karoliai', 'segė', 'laikrodis',
    'audinys', 'medvilnė', 'vilna', 'šilkas', 'linas', 'kailis', 'kišenė',
    'rankovė', 'apykaklė', 'saga', 'užtrauktukas', 'kulnas', 'padas',
    'raištelis', 'siūlas', 'adata', 'dėmė'
  ]);
  if (jewelryBagsFabrics.has(lt)) return 'jewelry_bag_fabric';

  // 9. Wearable Clothing & Footwear
  if (noun.topic === 'clothing') return 'clothing_footwear';

  // 10. Food & Drink (excluding non-edibles like skonis, kvapas, receptas, porcija)
  const nonFoodInFoodTopic = new Set([
    'alkis', 'troškulys', 'mityba', 'skonis', 'kvapas', 'receptas', 'porcija',
    'meniu', 'valgiaraštis', 'sąskaita', 'užsakymas', 'padavėjas', 'virėjas'
  ]);
  if (noun.topic === 'food' && !nonFoodInFoodTopic.has(lt)) {
    return 'food_drink';
  }

  // 11. Scheduled Events, Trips, Celebrations, Classes & Meetings (check BEFORE city_building so paroda/koncertas/festivalis/spektaklis in city topic get scheduled_event)
  const scheduledEvents = new Set([
    'kelionė', 'išvyka', 'ekskursija', 'žygis', 'kruizas', 'skrydis', 'reisas',
    'atostogos', 'komandiruotė', 'šventė', 'gimtadienis', 'vardadienis',
    'vestuvės', 'krikštynos', 'laidotuvės', 'naujieji metai', 'kalėdos',
    'velykos', 'joninės', 'užgavėnės', 'jubiliejus', 'minėjimas',
    'susitikimas', 'pasimatymas', 'posėdis', 'susirinkimas', 'konferencija',
    'kongresas', 'seminaras', 'kursai', 'mokymai', 'pamoka', 'paskaita',
    'egzaminas', 'testas', 'įskaita', 'konkursas', 'olimpiada', 'koncertas',
    'spektaklis', 'festivalis', 'paroda', 'mugė', 'premjera', 'vakarėlis',
    'varžybos', 'rungtynės', 'čempionatas', 'turnyras', 'treniruotė',
    'renginys', 'įvykis', 'nuotykis', 'šokis'
  ]);
  if (scheduledEvents.has(lt)) return 'scheduled_event';

  // 12. Documents, Books, Texts, School & Language Items, Media, Art
  const documentsMedia = new Set([
    'knyga', 'vadovėlis', 'žodynas', 'žurnalas', 'laikraštis', 'sąsiuvinis',
    'užrašinė', 'dienoraštis', 'laiškas', 'atvirukas', 'dokumentas', 'pasas',
    'pažymėjimas', 'leidimas', 'viza', 'sutartis', 'pareiškimas', 'prašymas',
    'anketa', 'pažyma', 'diplomas', 'atestatas', 'sertifikatas', 'bilietas',
    'kortelė', 'čekis', 'kvitas', 'žemėlapis', 'tvarkaraštis', 'maršrutas',
    'sąrašas', 'meniu', 'valgiaraštis', 'receptas', 'straipsnis', 'tekstas',
    'eilėraštis', 'romanas', 'pasaka', 'apsakymas', 'žodis', 'sakinys',
    'raidė', 'skiemuo', 'taisyklė', 'pratimas', 'užduotis', 'klausimas',
    'atsakymas', 'klaida', 'pažymys', 'įvertinimas', 'tema', 'skyrius',
    'puslapis', 'nuotrauka', 'paveikslas', 'filmas', 'daina', 'melodija',
    'muzika', 'eilėraštis', 'skelbimas', 'reklama', 'pranešimas', 'naujiena',
    'informacija', 'žinios', 'programa', 'projektas', 'ataskaita', 'planas'
  ]);
  if (documentsMedia.has(lt)) return 'document_text_media';

  // 13. Finance, Commerce, Prices, Measurements
  const financeCommerce = new Set([
    'pinigai', 'grynieji', 'moneta', 'banknotas', 'valiuta', 'euras', 'centas',
    'kaina', 'vertė', 'nuolaida', 'akcija', 'išpardavimas', 'sąskaita',
    'mokestis', 'mokesčiai', 'atlyginimas', 'alga', 'pensija', 'stipendija',
    'premija', 'pajamos', 'išlaidos', 'biudžetas', 'paskola', 'kreditas',
    'skola', 'palūkanos', 'indėlis', 'investicija', 'pelnas', 'nuostolis',
    'kapitalas', 'fondas', 'draudimas', 'muitas', 'bauda', 'mokėjimas',
    'pavedimas', 'grąža', 'prekyba', 'verslas', 'rinka', 'ekonomika',
    'finansai', 'užsakymas', 'pristatymas', 'pirkinys', 'paslauga',
    'garantija', 'kokybė', 'kiekis', 'dydis', 'svoris', 'ilgis', 'plotis',
    'aukštis', 'gylis', 'greitis', 'atstumas', 'eilė', 'nuoma', 'turtas',
    'nuosavybė', 'porcija'
  ]);
  if (financeCommerce.has(lt) || noun.topic === 'shopping') {
    if (lt !== 'parduotuvė' && lt !== 'prekybos centras' && lt !== 'turgus' && lt !== 'kasa' && lt !== 'kioskas' && lt !== 'vaistinė' && lt !== 'kepyklėlė') {
      return 'finance_commerce';
    }
  }

  // 14. Indoor Rooms
  const indoorRooms = new Set([
    'butas', 'kambarys', 'virtuvė', 'miegamasis', 'svetainė', 'valgomasis',
    'vonia', 'vonios kambarys', 'tualetas', 'koridorius', 'prieškambaris',
    'rūsys', 'palėpė', 'mansarda', 'garažas', 'sandėliukas', 'klasė',
    'auditorija', 'salė', 'sporto salė', 'aktų salė', 'kabinetas', 'palata',
    'fojė', 'kasa', 'būstas'
  ]);
  if (indoorRooms.has(lt)) return 'indoor_room';

  // 15. Furniture & Home Structural Fixtures
  const furnitureAndFixtures = new Set([
    'stalas', 'kėdė', 'lova', 'spinta', 'sofa', 'fotelis', 'lentyna', 'komoda',
    'rašomasis stalas', 'spintelė', 'suolas', 'suoliukas', 'veidrodis', 'kilimas',
    'užuolaida', 'lempa', 'šviestuvas', 'durys', 'langas', 'siena', 'grindys',
    'lubos', 'stogas', 'laiptai', 'aukštas', 'slenkstis', 'kaminas', 'židinys',
    'tvora', 'vartai', 'kolona', 'fasadas', 'pamatas', 'balkonas', 'terasa',
    'veranda', 'čiaupas', 'kriauklė', 'dušas', 'vamzdis', 'spyna', 'skambutis',
    'baldas', 'interjeras', 'remontas', 'statyba', 'aplinka', 'buitis', 'ūkis'
  ]);
  if (furnitureAndFixtures.has(lt) || noun.topic === 'home') {
    if (lt !== 'namas' && lt !== 'kiemas' && lt !== 'sodas' && lt !== 'šiluma' && lt !== 'jaukumas' && lt !== 'tvarka' && lt !== 'švara') {
      return 'furniture_home_fixture';
    }
  }

  // 16. Geographical areas, countries, cities, regions
  const geoRegions = new Set([
    'miestas', 'senamiestis', 'priemiestis', 'uostamiestis', 'sostinė',
    'kaimas', 'gyvenvietė', 'miestelis', 'rajonas', 'kvartalas', 'apskritis',
    'provincija', 'regionas', 'kraštas', 'vietovė', 'apylinkė', 'šalis',
    'valstybė', 'respublika', 'karalystė', 'tėvynė', 'gimtinė', 'užsienis',
    'pasaulis', 'žemynas', 'kontinentas', 'sala', 'pusiasalis', 'šiaurė',
    'pietūs', 'rytai', 'vakarai', 'centras', 'pakraštys', 'teritorija', 'zona'
  ]);
  if (geoRegions.has(lt)) return 'geo_country_region';

  // 17. Streets, Roads, Bridges, Urban Infrastructure & Parks
  const streetRoadInfra = new Set([
    'gatvė', 'alėja', 'prospektas', 'bulvaras', 'skersgatvis', 'aikštė',
    'turgaus aikštė', 'turgavietė', 'kelias', 'plentas', 'greitkelis',
    'aplinkkelis', 'geležinkelis', 'takas', 'takelis', 'šaligatvis', 'perėja',
    'sankryža', 'posūkis', 'tiltas', 'viadukas', 'tunelis', 'peronas',
    'stotelė', 'krantinė', 'prieplauka', 'kiemas', 'sodas', 'parkas',
    'skveras', 'kapinės', 'statybvietė', 'riba', 'muitinė',
    'stovėjimo aikštelė', 'eismas', 'spūstis', 'kamštis', 'ženklas',
    'paminklas', 'fontanas'
  ]);
  if (streetRoadInfra.has(lt)) return 'street_road_infra';

  // 18. City Buildings & Institutions
  const cityBuildings = new Set([
    'namas', 'pastatas', 'mokykla', 'universitetas', 'kolegija', 'gimnazija',
    'darželis', 'biblioteka', 'biuras', 'įmonė', 'bendrovė', 'įstaiga',
    'gamykla', 'fabrikas', 'dirbtuvė', 'sandėlis', 'bankas', 'paštas',
    'parduotuvė', 'prekybos centras', 'supermarketas', 'kioskas', 'turgus',
    'kavinė', 'restoranas', 'valgykla', 'baras', 'kepyklėlė', 'picerija',
    'viešbutis', 'nakvynės namai', 'motelis', 'svečių namai', 'kurortas',
    'stovykla', 'muziejus', 'teatras', 'kinas', 'galerija', 'filharmonija',
    'bažnyčia', 'katedra', 'vienuolynas', 'koplyčia', 'pilis', 'rūmai',
    'dvaras', 'bokštas', 'rotušė', 'ambasada', 'konsulatas', 'savivaldybė',
    'ministerija', 'teismas', 'kalėjimas', 'stotis', 'oro uostas', 'uostas',
    'švyturys', 'stadionas', 'baseinas', 'sporto klubas', 'klubas', 'kirpykla',
    'grožio salonas', 'skalbykla', 'valykla', 'autoservisas', 'degalinė',
    'zoologijos sodas', 'botanikos sodas'
  ]);
  if (cityBuildings.has(lt) || (noun.topic === 'city' && lt !== 'apžvalga')) {
    return 'city_building';
  }

  // 19. Weather, Elements, Natural Materials & Fuels
  const weatherElementsMaterials = new Set([
    'oras', 'lietus', 'sniegas', 'ledas', 'kruša', 'šerkšnas', 'rasa', 'vėjas',
    'vėjelis', 'audra', 'vėtra', 'uraganas', 'perkūnija', 'žaibas',
    'griaustinis', 'debesis', 'rūkas', 'migla', 'šaltis', 'speigas', 'šiluma',
    'karštis', 'kaitra', 'sausra', 'potvynis', 'klimatas', 'temperatūra',
    'prognozė', 'ugnis', 'liepsna', 'dūmai', 'pelenai', 'laužas', 'srovė',
    'banga', 'puta', 'lašas', 'bala', 'šešėlis', 'šviesa', 'tamsa',
    'spindulys', 'garsas', 'triukšmas', 'tyla', 'aidas', 'kvapas', 'vanduo',
    'akmuo', 'smėlis', 'molis', 'purvas', 'dirvožemis', 'dulkės', 'gintaras',
    'auksas', 'sidabras', 'geležis', 'plienas', 'varis', 'metalas', 'stiklas',
    'plastikas', 'mediena', 'anglis', 'nafta', 'dujos', 'kuras', 'benzinas',
    'elektra', 'energija'
  ]);
  if (weatherElementsMaterials.has(lt)) return 'weather_element_material';

  // 20. Nature Landscapes, Water Bodies, Celestial Bodies & Plants
  const natureLandscapePlants = new Set([
    'miškas', 'giria', 'pušynas', 'ąžuolynas', 'beržynas', 'pieva', 'laukas',
    'ganykla', 'kalnas', 'kalva', 'slėnis', 'dauba', 'uola', 'urvas', 'dykuma',
    'stepė', 'džiunglės', 'upė', 'upelis', 'ežeras', 'jūra', 'vandenynas',
    'įlanka', 'sąsiauris', 'tvenkinys', 'šaltinis', 'krioklys', 'pelkė',
    'krantas', 'pakrantė', 'paplūdimys', 'kopa', 'dugnas', 'dangus', 'saulė',
    'mėnulis', 'žvaigždė', 'planeta', 'visata', 'vaivorykštė', 'horizontas',
    'augalas', 'medis', 'krūmas', 'šaknis', 'kamienas', 'šaka', 'lapas',
    'žiedas', 'pumpuras', 'žolė', 'samanos', 'papartis', 'ąžuolas', 'beržas',
    'pušis', 'eglė', 'liepa', 'klevas', 'gluosnis', 'šermukšnis', 'kaštonas',
    'gėlė', 'rožė', 'tulpė', 'ramunė', 'lelija', 'bijūnas', 'narcizas',
    'saulėgrąža', 'grybas', 'baravykas', 'voveraitė', 'uoga', 'riešutas',
    'sėkla', 'derlius', 'gamta', 'kraštovaizdis', 'žemė'
  ]);
  if (natureLandscapePlants.has(lt) || noun.topic === 'nature') {
    return 'nature_landscape_plant';
  }

  // 21. Time Periods, Days, Seasons
  const timePeriods = new Set([
    'laikas', 'sekundė', 'minutė', 'valanda', 'para', 'diena', 'rytas',
    'popietė', 'vakaras', 'naktis', 'vidurdienis', 'vidurnaktis', 'aušra',
    'saulėtekis', 'saulėlydis', 'prieblanda', 'savaitė', 'savaitgalis',
    'darbo diena', 'pirmadienis', 'antradienis', 'trečiadienis',
    'ketvirtadienis', 'penktadienis', 'šeštadienis', 'sekmadienis', 'mėnuo',
    'metai', 'šimtmetis', 'era', 'epocha', 'laikotarpis', 'periodas',
    'sezonas', 'semestras', 'ketvirtis', 'pavasaris', 'vasara', 'ruduo',
    'žiema', 'pradžia', 'pabaiga', 'vidurys', 'tęsinys', 'pertrauka',
    'pamaina', 'poilsis', 'laisvalaikis', 'nakvynė', 'viešnagė', 'praeitis',
    'dabartis', 'ateitis', 'akimirka', 'momentas', 'kartas', 'data',
    'terminas', 'amžinybė', 'rytojus', 'vakar diena'
  ]);
  if (timePeriods.has(lt) || noun.topic === 'time') return 'time_period_season';

  // 22. Abstract Concepts, Work, Qualities, Feelings
  return 'abstract_concept';
}

// ============================================================================
// MAIN EXPORT: GENERATE VERIFIED USAGE GUIDE FOR ANY NOUN
// ============================================================================
export function getNounUsageGuide(noun: NounEntry): NounUsageGuide {
  const lemmaKey = noun.lemma.toLowerCase().trim();
  const curated = CURATED_USAGE_MAP[lemmaKey];
  if (curated) {
    return curated;
  }

  const category = classifyNounSemantics(noun);
  const isLtMasc = isLithuanianMasculine(noun);
  const ukGender = getUkrainianGender(noun);

  // Properly inflected Ukrainian forms for all cases
  const ukNomSg = cleanUkForm(inflectUkrainianNoun(noun, 'nom', 'sg'));
  const ukGenSg = cleanUkForm(inflectUkrainianNoun(noun, 'gen', 'sg'));
  const ukDatSg = cleanUkForm(inflectUkrainianNoun(noun, 'dat', 'sg'));
  const ukAccSg = cleanUkForm(inflectUkrainianNoun(noun, 'acc', 'sg'));
  const ukInsSg = cleanUkForm(inflectUkrainianNoun(noun, 'ins', 'sg'));
  const ukLocSgWithPrep = inflectUkrainianNoun(noun, 'loc', 'sg').split('/')[0].replace(/\(.*?\)/g, '').trim();
  const ukLocSgBare = stripUkrainianPreposition(ukLocSgWithPrep);
  const ukGenPl = cleanUkForm(inflectUkrainianNoun(noun, 'gen', 'pl'));
  const ukInsPl = cleanUkForm(inflectUkrainianNoun(noun, 'ins', 'pl'));

  // Clean English singular & plural
  const enSg = extractPrimaryWord(noun.en).toLowerCase();
  const enPl = getEnglishPlural(noun.en);
  const isEnUncountable = isEnglishUncountableOrPlural(enSg, enPl);
  const enIndef = (adjAndNoun: string) =>
    isEnUncountable ? adjAndNoun : `${getEnglishIndefiniteArticle(adjAndNoun)} ${adjAndNoun}`;
  const enManyOrMuch = isEnUncountable ? `a lot of ${enSg}` : `many ${enPl}`;

  // Ukrainian gender-agreed adjective helpers
  const ukAdj = (m: string, f: string, n: string, pl: string) =>
    ukGender === 'f' ? f : ukGender === 'n' ? n : ukGender === 'pl' ? pl : m;

  // Lithuanian gender-agreed adjective/pronoun helpers
  const ltAdj = (m: string, f: string) => (isLtMasc ? m : f);

  switch (category) {
    case 'person': {
      return {
        collocations: [
          {
            phraseLt: `${ltAdj('geras', 'gera')} ${noun.lemma}`,
            transUk: `${ukAdj('хороший', 'хороша', 'хороше', 'хороші')} ${ukNomSg}`,
            transEn: enIndef(`good ${enSg}`),
            caseBadge: 'Būdvardis + Dkt.',
            type: 'adjective',
          },
          {
            phraseLt: `kalbėtis su ${noun.sg.ins}`,
            transUk: `розмовляти з ${ukInsSg}`,
            transEn: `to speak with the ${enSg}`,
            caseBadge: 'su + Įnagininkas',
            type: 'prep',
          },
          {
            phraseLt: `padėti ${noun.sg.dat}`,
            transUk: `допомагати ${ukDatSg}`,
            transEn: `to help the ${enSg}`,
            caseBadge: 'Naudininkas (Dat.)',
            type: 'verb',
          },
          {
            phraseLt: `kreiptis į ${noun.sg.acc}`,
            transUk: `звертатися до ${ukGenSg}`,
            transEn: `to turn to the ${enSg}`,
            caseBadge: 'į + Galininkas',
            type: 'prep',
          },
          {
            phraseLt: `daug ${noun.pl.gen}`,
            transUk: `багато ${ukGenPl}`,
            transEn: enManyOrMuch,
            caseBadge: 'daug + Kilmininkas dgs.',
            type: 'genitive',
          },
        ],
        idioms: [
          {
            phraseLt: `Rasti bendrą kalbą su ${noun.sg.ins}`,
            transUk: `Знайти спільну мову з ${ukInsSg}`,
            transEn: `To find common ground with the ${enSg}`,
            explanationUk: 'Досягти взаєморозуміння, довіри та доброзичливого спілкування.',
            explanationEn: 'To reach mutual understanding and friendly cooperation.',
            explanationLt: 'Pasiekti tarpusavio supratimą ir sutarimą.',
            originOrStyle: 'Frazeologizmas / Стійкий вираз',
          },
          {
            phraseLt: `Žmogus žmogui — geriausias draugas`,
            transUk: `Людина людині — найкращий друг і порадник`,
            transEn: `Mutual support is the foundation of human relationships`,
            explanationUk: 'Щира підтримка й повага зміцнюють родинні, дружні та професійні стосунки.',
            explanationEn: 'Sincere support and respect strengthen family, friendly, and professional bonds.',
            explanationLt: 'Nuoširdi pagalba ir pagarba stiprina žmonių tarpusavio ryšius.',
            originOrStyle: 'Išminties posakis / Прислів’я',
          },
        ],
        governance: [
          {
            patternLt: `pas ${noun.sg.acc}`,
            caseName: 'pas + Galininkas',
            meaningUk: `до кого? / у кого? (до ${ukGenSg} або у ${ukGenSg})`,
            meaningEn: `to / at the ${enSg}'s place (governs Accusative)`,
            meaningLt: 'pas ką? nurodo asmenį, pas kurį einama ar būnama',
            exampleLt: `Rytoj ryte einu pas ${noun.sg.acc}.`,
          },
          {
            patternLt: `su ${noun.sg.ins}`,
            caseName: 'su + Įnagininkas',
            meaningUk: `з ким? спілкування або спільна дія з ${ukInsSg}`,
            meaningEn: `with whom? interaction with the ${enSg}`,
            meaningLt: 'su kuo? bendravimas ar veikla kartu',
            exampleLt: `Maloniai pasikalbėjome su ${noun.sg.ins}.`,
          },
          {
            patternLt: `${noun.sg.dat} (Naudininkas)`,
            caseName: 'Naudininkas (Dative)',
            meaningUk: `кому? адресат дії (${ukDatSg})`,
            meaningEn: `to whom? recipient of the action`,
            meaningLt: 'kam? veiksmo adresatas',
            exampleLt: `Padėkojau ${noun.sg.dat} už puikią pagalbą.`,
          },
        ],
        conversationalPhrases: [
          {
            lt: `Ar jau kalbėjaisi su ${ltAdj('šiuo', 'šia')} ${noun.sg.ins}?`,
            uk: `Ти вже розмовляв із ${ukAdj('цим', 'цією', 'цим', 'цими')} ${ukInsSg}?`,
            en: `Have you already spoken with this ${enSg}?`,
            context: 'Bendravimas / Спілкування',
          },
          {
            lt: `Mums labai padėjo ${ltAdj('šis', 'ši')} ${noun.lemma}.`,
            uk: `Нам дуже ${ukAdj('допоміг цей', 'допомогла ця', 'допомогло це', 'допомогли ці')} ${ukNomSg}.`,
            en: `This ${enSg} helped us a lot.`,
            context: 'Padėka / Вдячність',
          },
        ],
      };
    }

    case 'person_social_group': {
      return {
        collocations: [
          {
            phraseLt: `${ltAdj('darni', 'darni').replace('darni', isLtMasc ? 'darnus' : 'darni')} ${noun.lemma}`,
            transUk: `${ukAdj('згуртований', 'згуртована', 'згуртоване', 'згуртовані')} ${ukNomSg}`,
            transEn: enIndef(`united ${enSg}`),
            caseBadge: 'Būdvardis + Dkt.',
            type: 'adjective',
          },
          {
            phraseLt: `priklausyti ${noun.sg.dat}`,
            transUk: `належати до ${ukGenSg}`,
            transEn: `to belong to the ${enSg}`,
            caseBadge: 'priklausyti + Naudininkas',
            type: 'verb',
          },
          {
            phraseLt: `bendrauti su ${noun.sg.ins}`,
            transUk: `спілкуватися з ${ukInsSg}`,
            transEn: `to interact with the ${enSg}`,
            caseBadge: 'su + Įnagininkas',
            type: 'prep',
          },
          {
            phraseLt: `${noun.sg.gen} nariai`,
            transUk: `члени ${ukGenSg}`,
            transEn: `members of the ${enSg}`,
            caseBadge: 'Kilmininkas (Gen.)',
            type: 'genitive',
          },
        ],
        idioms: [
          {
            phraseLt: `Vienybėje — jėga`,
            transUk: `В єдності — сила`,
            transEn: `In unity there is strength`,
            explanationUk: 'Спільна праця й взаємопідтримка допомагають досягти значно більшого.',
            explanationEn: 'Working together in harmony allows a group to overcome any challenge.',
            explanationLt: 'Bendra veikla ir sutarimas padeda įveikti bet kokius sunkumus.',
            originOrStyle: 'Patarlė / Прислів’я',
          },
        ],
        governance: [
          {
            patternLt: `priklausyti ${noun.sg.dat}`,
            caseName: 'priklausyti + Naudininkas',
            meaningUk: `належати до ${ukGenSg} (дієслово priklausyti у литовській мові керує давальним відмінком)`,
            meaningEn: `to belong to the ${enSg} ("priklausyti" governs Dative)`,
            meaningLt: 'veiksmažodis „priklausyti“ reikalauja naudininko linksnio (kam?)',
            exampleLt: `Jis didžiuojasi priklausydamas ${ltAdj('šiam', 'šiai')} ${noun.sg.dat}.`,
          },
          {
            patternLt: `su ${noun.sg.ins}`,
            caseName: 'su + Įnagininkas',
            meaningUk: `разом із ${ukInsSg} (спільна дія з орудним відмінком)`,
            meaningEn: `together with the ${enSg}`,
            meaningLt: 'su kuo? buvimas ar veikla kartu',
            exampleLt: `Visą savaitgalį praleidome kartu su ${noun.sg.ins}.`,
          },
        ],
        conversationalPhrases: [
          {
            lt: `Mūsų ${noun.lemma} yra labai draugiškas ir vieningas.`,
            uk: `${ukAdj('Наш', 'Наша', 'Наше', 'Наші')} ${ukNomSg} дуже ${ukAdj('дружний і згуртований', 'дружна й згуртована', 'дружне й згуртоване', 'дружні й згуртовані')}.`,
            en: `Our ${enSg} is very friendly and united.`,
            context: 'Bendruomenė / Спільнота',
          },
          {
            lt: `Šis sprendimas svarbus visai ${noun.sg.dat}.`,
            uk: `Це рішення важливе для ${ukAdj('всього', 'всієї', 'всього', 'всіх')} ${ukGenSg}.`,
            en: `This decision is important for the entire ${enSg}.`,
            context: 'Visuomenė / Суспільство',
          },
        ],
      };
    }

    case 'animal': {
      return {
        collocations: [
          {
            phraseLt: `maitinti ${noun.sg.acc}`,
            transUk: `годувати ${ukAccSg}`,
            transEn: `to feed the ${enSg}`,
            caseBadge: 'Galininkas (Acc.)',
            type: 'verb',
          },
          {
            phraseLt: `rūpintis ${noun.sg.ins}`,
            transUk: `піклуватися про ${ukAccSg}`,
            transEn: `to take care of the ${enSg}`,
            caseBadge: 'rūpintis + Įnagininkas',
            type: 'verb',
          },
          {
            phraseLt: `${ltAdj('jaukus', 'jauki')} / ${ltAdj('laukinis', 'laukinė')} ${noun.lemma}`,
            transUk: `${ukAdj('приручений або дикий', 'приручена або дика', 'приручене або дике', 'приручені або дикі')} ${ukNomSg}`,
            transEn: `tame or wild ${enSg}`,
            caseBadge: 'Būdvardis + Dkt.',
            type: 'adjective',
          },
          {
            phraseLt: `stebėti ${noun.pl.acc}`,
            transUk: `спостерігати за ${ukInsPl}`,
            transEn: `to observe ${enPl} in nature`,
            caseBadge: 'Galininkas dgs.',
            type: 'verb',
          },
          {
            phraseLt: `daug ${noun.pl.gen}`,
            transUk: `багато ${ukGenPl}`,
            transEn: enManyOrMuch,
            caseBadge: 'Kilmininkas dgs.',
            type: 'genitive',
          },
        ],
        idioms: [
          {
            phraseLt: `Gyventi santarvėje su gamta`,
            transUk: `Жити в злагоді з природою`,
            transEn: `To live in harmony with nature`,
            explanationUk: 'У литовській фольклорній традиції тварини та птахи є символами зв’язку людини з природою.',
            explanationEn: 'In Lithuanian folklore, animals and birds symbolize humanity’s bond with nature.',
            explanationLt: 'Lietuvių tautosakoje gyvūnai ir paukščiai simbolizuoja žmogaus ryšį su gamta.',
            originOrStyle: 'Tautosaka / Фольклор',
          },
        ],
        governance: [
          {
            patternLt: `rūpintis ${noun.sg.ins}`,
            caseName: 'rūpintis + Įnagininkas',
            meaningUk: `піклуватися про ${ukAccSg} (у литовській дієслово rūpintis вимагає орудного відмінка)`,
            meaningEn: `to care for the ${enSg} ("rūpintis" governs Instrumental)`,
            meaningLt: 'veiksmažodis „rūpintis“ reikalauja įnagininko',
            exampleLt: `Vaikai labai atsakingai rūpinasi ${noun.sg.ins}.`,
          },
          {
            patternLt: `bijoti ${noun.sg.gen}`,
            caseName: 'bijoti + Kilmininkas',
            meaningUk: `боятися ${ukGenSg} (дієслово bijoti вимагає родового відмінка)`,
            meaningEn: `to be afraid of the ${enSg} ("bijoti" governs Genitive)`,
            meaningLt: 'veiksmažodis „bijoti“ reikalauja kilmininko',
            exampleLt: `Nereikia bijoti ${ltAdj('šio', 'šios')} ${noun.sg.gen}.`,
          },
        ],
        conversationalPhrases: [
          {
            lt: `Pažiūrėk, ${ltAdj('koks gražus', 'kokia graži')} ${noun.lemma}!`,
            uk: `Подивись, ${ukAdj('який гарний', 'яка гарна', 'яке гарне', 'які гарні')} ${ukNomSg}!`,
            en: `Look what ${enIndef(`beautiful ${enSg}`)}!`,
            context: 'Gamtoje / На природі',
          },
          {
            lt: `Gamtoje pamatėme ${noun.sg.acc}.`,
            uk: `На природі ми побачили ${ukAccSg}.`,
            en: `In nature we saw ${enIndef(enSg)}.`,
            context: 'Išvyka / Прогулянка',
          },
        ],
      };
    }

    case 'vehicle': {
      return {
        collocations: [
          {
            phraseLt: `važiuoti ${noun.sg.ins}`,
            transUk: `їхати ${ukInsSg}`,
            transEn: `to travel by ${enSg}`,
            caseBadge: 'Įnagininkas (be „su“!)',
            type: 'verb',
          },
          {
            phraseLt: `įlipti į ${noun.sg.acc}`,
            transUk: `сідати в ${ukAccSg}`,
            transEn: `to board / get into the ${enSg}`,
            caseBadge: 'į + Galininkas',
            type: 'prep',
          },
          {
            phraseLt: `išlipti iš ${noun.sg.gen}`,
            transUk: `виходити з ${ukGenSg}`,
            transEn: `to get off / exit the ${enSg}`,
            caseBadge: 'iš + Kilmininkas',
            type: 'prep',
          },
          {
            phraseLt: `laukti ${noun.sg.gen}`,
            transUk: `чекати на ${ukAccSg}`,
            transEn: `to wait for the ${enSg}`,
            caseBadge: 'laukti + Kilmininkas',
            type: 'verb',
          },
          {
            phraseLt: `${ltAdj('greitas ir patogus', 'greita ir patogi')} ${noun.lemma}`,
            transUk: `${ukAdj('швидкий і зручний', 'швидка й зручна', 'швидке й зручне', 'швидкі й зручні')} ${ukNomSg}`,
            transEn: `fast and comfortable ${enSg}`,
            caseBadge: 'Būdvardis + Dkt.',
            type: 'adjective',
          },
        ],
        idioms: [
          {
            phraseLt: `Gero kelio! / Laimingos kelionės!`,
            transUk: `Щасливої дороги!`,
            transEn: `Have a safe trip! / Bon voyage!`,
            explanationUk: 'Традиційне литовське побажання тим, хто вирушає в дорогу транспортом.',
            explanationEn: 'Standard Lithuanian wish for travelers setting off on a journey.',
            explanationLt: 'Tradicinis palinkėjimas išvykstantiems į kelionę.',
            originOrStyle: 'Palinkėjimas / Побажання',
          },
        ],
        governance: [
          {
            patternLt: `važiuoti ${noun.sg.ins}`,
            caseName: 'Įnagininkas be prielinksnio',
            meaningUk: `їхати ${ukInsSg} (важливо: у литовській мові транспортний засіб вживається в орудному відмінку БЕЗ прийменника „su“)`,
            meaningEn: `to go by ${enSg} (important: vehicle in Instrumental WITHOUT preposition "su")`,
            meaningLt: 'susisiekimo priemonė reiškiama įnagininku be prielinksnio „su“',
            exampleLt: `Į darbą kasdien važiuoju ${noun.sg.ins}.`,
          },
          {
            patternLt: `laukti ${noun.sg.gen}`,
            caseName: 'laukti + Kilmininkas',
            meaningUk: `чекати на ${ukAccSg} (дієслово laukti вимагає родового відмінка)`,
            meaningEn: `to wait for the ${enSg} ("laukti" requires Genitive)`,
            meaningLt: 'veiksmažodis „laukti“ valdo kilmininko linksnį',
            exampleLt: `Keleiviai stotelėje laukia ${noun.sg.gen}.`,
          },
        ],
        conversationalPhrases: [
          {
            lt: `Kada atvyksta kitas ${noun.lemma}?`,
            uk: `Коли прибуває ${ukAdj('наступний', 'наступна', 'наступне', 'наступні')} ${ukNomSg}?`,
            en: `When does the next ${enSg} arrive?`,
            context: 'Transportas / Транспорт',
          },
          {
            lt: `Ar važiuosime ${noun.sg.ins}, ar eisime pėsčiomis?`,
            uk: `Поїдемо ${ukInsSg} чи підемо пішки?`,
            en: `Shall we go by ${enSg} or walk on foot?`,
            context: 'Kelionė mieste / Поїздка містом',
          },
        ],
      };
    }

    case 'city_building': {
      return {
        collocations: [
          {
            phraseLt: `eiti / važiuoti į ${noun.sg.acc}`,
            transUk: `іти / їхати до ${ukGenSg}`,
            transEn: `to go to the ${enSg}`,
            caseBadge: 'į + Galininkas',
            type: 'prep',
          },
          {
            phraseLt: `būti / lankytis ${noun.sg.loc}`,
            transUk: `перебувати ${ukLocSgWithPrep}`,
            transEn: `to be at/in the ${enSg}`,
            caseBadge: 'Vietininkas (Loc.)',
            type: 'prep',
          },
          {
            phraseLt: `grįžti iš ${noun.sg.gen}`,
            transUk: `повертатися з ${ukGenSg}`,
            transEn: `to return from the ${enSg}`,
            caseBadge: 'iš + Kilmininkas',
            type: 'prep',
          },
          {
            phraseLt: `susitikti prie ${noun.sg.gen}`,
            transUk: `зустрітися біля ${ukGenSg}`,
            transEn: `to meet near the ${enSg}`,
            caseBadge: 'prie + Kilmininkas',
            type: 'prep',
          },
          {
            phraseLt: `${ltAdj('naujas ir modernus', 'nauja ir moderni')} ${noun.lemma}`,
            transUk: `${ukAdj('новий і сучасний', 'нова й сучасна', 'нове й сучасне', 'нові й сучасні')} ${ukNomSg}`,
            transEn: `new and modern ${enSg}`,
            caseBadge: 'Būdvardis + Dkt.',
            type: 'adjective',
          },
        ],
        idioms: [
          {
            phraseLt: `Visi keliai veda į tikslą`,
            transUk: `Усі дороги ведуть до мети`,
            transEn: `All roads lead to the destination`,
            explanationUk: 'Хто шукає потрібне місце чи установу в місті, обов’язково знайде правильний шлях.',
            explanationEn: 'Anyone who seeks the right place or goal in the city will find the way.',
            explanationLt: 'Kas ieško reikiamos vietos ar atkakliai siekia tikslo, visada randa kelią.',
            originOrStyle: 'Posakis / Приказка',
          },
        ],
        governance: [
          {
            patternLt: `į ${noun.sg.acc}`,
            caseName: 'į + Galininkas',
            meaningUk: `куди? напрямок руху до ${ukGenSg}`,
            meaningEn: `where to? direction towards/into the ${enSg}`,
            meaningLt: 'į kur? judėjimo kryptis į vidų',
            exampleLt: `Šiandien po pietų einame į ${noun.sg.acc}.`,
          },
          {
            patternLt: `${noun.sg.loc}`,
            caseName: 'Vietininkas (be prielinksnio)',
            meaningUk: `де? місцезнаходження (${ukLocSgWithPrep}) без прийменника в литовській мові`,
            meaningEn: `where? location inside/at the ${enSg} (no preposition in Lithuanian)`,
            meaningLt: 'kur? buvimo vieta be prielinksnio',
            exampleLt: `Mūsų draugai dabar yra ${noun.sg.loc}.`,
          },
          {
            patternLt: `iš ${noun.sg.gen}`,
            caseName: 'iš + Kilmininkas',
            meaningUk: `звідки? рух із ${ukGenSg}`,
            meaningEn: `from where? movement out of the ${enSg}`,
            meaningLt: 'iš kur? judėjimas iš vidaus',
            exampleLt: `Jis ką tik grįžo iš ${noun.sg.gen}.`,
          },
        ],
        conversationalPhrases: [
          {
            lt: `Atsiprašau, kur yra ${ltAdj('artimiausias', 'artimiausia')} ${noun.lemma}?`,
            uk: `Перепрошую, де знаходиться ${ukAdj('найближчий', 'найближча', 'найближче', 'найближчі')} ${ukNomSg}?`,
            en: `Excuse me, where is the nearest ${enSg}?`,
            context: 'Orientavimasis mieste / Орієнтація в місті',
          },
          {
            lt: `Susitikime penktą valandą prie ${noun.sg.gen}.`,
            uk: `Зустріньмося о п’ятій годині біля ${ukGenSg}.`,
            en: `Let's meet at five o'clock by the ${enSg}.`,
            context: 'Susitarimas / Домовленість',
          },
        ],
      };
    }

    case 'indoor_room': {
      return {
        collocations: [
          {
            phraseLt: `įeiti į ${noun.sg.acc}`,
            transUk: `увійти в ${ukAccSg}`,
            transEn: `to enter the ${enSg}`,
            caseBadge: 'į + Galininkas',
            type: 'prep',
          },
          {
            phraseLt: `būti ${noun.sg.loc}`,
            transUk: `перебувати ${ukLocSgWithPrep}`,
            transEn: `to be in the ${enSg}`,
            caseBadge: 'Vietininkas (Loc.)',
            type: 'prep',
          },
          {
            phraseLt: `išeiti iš ${noun.sg.gen}`,
            transUk: `вийти з ${ukGenSg}`,
            transEn: `to step out of the ${enSg}`,
            caseBadge: 'iš + Kilmininkas',
            type: 'prep',
          },
          {
            phraseLt: `sutvarkyti ${noun.sg.acc}`,
            transUk: `прибрати в ${ukLocSgBare}`,
            transEn: `to tidy up the ${enSg}`,
            caseBadge: 'Galininkas (Acc.)',
            type: 'verb',
          },
          {
            phraseLt: `${ltAdj('šviesus ir erdvus', 'šviesi ir erdvi')} ${noun.lemma}`,
            transUk: `${ukAdj('світлий і просторий', 'світла й простора', 'світле й просторе', 'світлі й просторі')} ${ukNomSg}`,
            transEn: `bright and spacious ${enSg}`,
            caseBadge: 'Būdvardis + Dkt.',
            type: 'adjective',
          },
        ],
        idioms: [
          {
            phraseLt: `Mano namai — mano tvirtovė`,
            transUk: `Мій дім — моя фортеця`,
            transEn: `My home is my castle`,
            explanationUk: 'Затишний і охайний простір створює відчуття спокою та безпеки.',
            explanationEn: 'A cozy, well-kept indoor space creates comfort and peace of mind.',
            explanationLt: 'Tvarkinga ir jauki erdvė suteikia ramybės bei saugumo jausmą.',
            originOrStyle: 'Posakis / Прислів’я',
          },
        ],
        governance: [
          {
            patternLt: `į ${noun.sg.acc}`,
            caseName: 'į + Galininkas',
            meaningUk: `куди? вхід у ${ukAccSg}`,
            meaningEn: `into the ${enSg} (direction governs Accusative)`,
            meaningLt: 'į kur? judėjimas į patalpos vidų',
            exampleLt: `Prašome užeiti į ${noun.sg.acc}.`,
          },
          {
            patternLt: `${noun.sg.loc}`,
            caseName: 'Vietininkas (Locative)',
            meaningUk: `де? перебування ${ukLocSgWithPrep} (місцевий відмінок без прийменника)`,
            meaningEn: `in the ${enSg} (Locative without preposition)`,
            meaningLt: 'kur? buvimas patalpoje be prielinksnio',
            exampleLt: `Šiuo metu visi sėdi ${noun.sg.loc}.`,
          },
        ],
        conversationalPhrases: [
          {
            lt: `${ltAdj('Šis', 'Ši')} ${noun.lemma} yra labai ${ltAdj('šviesus ir jaukus', 'šviesi ir jauki')}.`,
            uk: `${ukAdj('Цей', 'Ця', 'Це', 'Ці')} ${ukNomSg} дуже ${ukAdj('світлий і затишний', 'світла й затишна', 'світле й затишне', 'світлі й затишні')}.`,
            en: `This ${enSg} is very bright and cozy.`,
            context: 'Patalpos / Приміщення',
          },
          {
            lt: `Uždek šviesą ${noun.sg.loc}, prašau.`,
            uk: `Увімкни, будь ласка, світло ${ukLocSgWithPrep}.`,
            en: `Please turn on the light in the ${enSg}.`,
            context: 'Kasdienis pokalbis / У побуті',
          },
        ],
      };
    }

    case 'street_road_infra': {
      return {
        collocations: [
          {
            phraseLt: `eiti per ${noun.sg.acc}`,
            transUk: `переходити через ${ukAccSg}`,
            transEn: `to go across / along the ${enSg}`,
            caseBadge: 'per + Galininkas',
            type: 'prep',
          },
          {
            phraseLt: `būti ${noun.sg.loc}`,
            transUk: `знаходитися ${ukLocSgWithPrep}`,
            transEn: `to be on/at the ${enSg}`,
            caseBadge: 'Vietininkas (Loc.)',
            type: 'prep',
          },
          {
            phraseLt: `pasukti į ${noun.sg.acc}`,
            transUk: `повернути на ${ukAccSg}`,
            transEn: `to turn onto the ${enSg}`,
            caseBadge: 'į + Galininkas',
            type: 'prep',
          },
          {
            phraseLt: `prie ${noun.sg.gen}`,
            transUk: `біля ${ukGenSg}`,
            transEn: `near the ${enSg}`,
            caseBadge: 'prie + Kilmininkas',
            type: 'prep',
          },
        ],
        idioms: [
          {
            phraseLt: `Tiesus kelias — greičiausias`,
            transUk: `Прямий шлях — найкоротший`,
            transEn: `The straight road is the fastest`,
            explanationUk: 'Добре знання маршруту й уважність на дорозі заощаджують час і сили.',
            explanationEn: 'Knowing the route and paying attention on the road saves time and effort.',
            explanationLt: 'Geras maršruto žinojimas ir atidumas kelyje padeda sutaupyti laiko.',
            originOrStyle: 'Patarlė / Прислів’я',
          },
        ],
        governance: [
          {
            patternLt: `per ${noun.sg.acc}`,
            caseName: 'per + Galininkas',
            meaningUk: `через / крізь ${ukAccSg} (прийменник per керує знахідним відмінком)`,
            meaningEn: `across / through the ${enSg} ("per" governs Accusative)`,
            meaningLt: 'prielinksnis „per“ nurodo judėjimą skersai arba išilgai objekto',
            exampleLt: `Pėstieji atsargiai ėjo per ${noun.sg.acc}.`,
          },
          {
            patternLt: `${noun.sg.loc}`,
            caseName: 'Vietininkas (Locative)',
            meaningUk: `де? ${ukLocSgWithPrep} (місцевий відмінок без прийменника)`,
            meaningEn: `on / at the ${enSg} (Locative without preposition)`,
            meaningLt: 'kur? vieta nusakoma vietininko linksniu',
            exampleLt: `Šiandien ${noun.sg.loc} labai intensyvus eismas.`,
          },
        ],
        conversationalPhrases: [
          {
            lt: `Eikite tiesiai ir pasukite prie ${noun.sg.gen}.`,
            uk: `Ідіть прямо й поверніть біля ${ukGenSg}.`,
            en: `Go straight ahead and turn near the ${enSg}.`,
            context: 'Maršrutas / Маршрут',
          },
          {
            lt: `Būkite atidūs ${noun.sg.loc}.`,
            uk: `Будьте уважні ${ukLocSgWithPrep}.`,
            en: `Be attentive on/at the ${enSg}.`,
            context: 'Saugumas kelyje / Безпека руху',
          },
        ],
      };
    }

    case 'geo_country_region': {
      return {
        collocations: [
          {
            phraseLt: `gyventi ${noun.sg.loc}`,
            transUk: `жити ${ukLocSgWithPrep}`,
            transEn: `to live in the ${enSg}`,
            caseBadge: 'Vietininkas (Loc.)',
            type: 'verb',
          },
          {
            phraseLt: `keliauti į ${noun.sg.acc}`,
            transUk: `подорожувати до ${ukGenSg}`,
            transEn: `to travel to the ${enSg}`,
            caseBadge: 'į + Galininkas',
            type: 'prep',
          },
          {
            phraseLt: `atvykti iš ${noun.sg.gen}`,
            transUk: `прибути з ${ukGenSg}`,
            transEn: `to arrive from the ${enSg}`,
            caseBadge: 'iš + Kilmininkas',
            type: 'prep',
          },
          {
            phraseLt: `${noun.sg.gen} istorija ir kultūra`,
            transUk: `історія та культура ${ukGenSg}`,
            transEn: `history and culture of the ${enSg}`,
            caseBadge: 'Kilmininkas (Gen.)',
            type: 'genitive',
          },
        ],
        idioms: [
          {
            phraseLt: `Visur gerai, bet savame krašte geriausia`,
            transUk: `Усюди добре, а в рідному краї найкраще`,
            transEn: `East or West, one's homeland is best`,
            explanationUk: 'Пізнаючи різні куточки світу, людина найбільше цінує рідний край.',
            explanationEn: 'While exploring different regions and countries, one cherishes home most.',
            explanationLt: 'Keliaujant po įvairius kraštus, gimtoji vieta išlieka brangiausia.',
            originOrStyle: 'Liaudies patarlė / Прислів’я',
          },
        ],
        governance: [
          {
            patternLt: `gyventi ${noun.sg.loc}`,
            caseName: 'Vietininkas (Locative)',
            meaningUk: `де? жити ${ukLocSgWithPrep}`,
            meaningEn: `where? to live in the ${enSg}`,
            meaningLt: 'kur? gyvenamoji ar buvimo vieta',
            exampleLt: `Jie jau penkerius metus gyvena ${noun.sg.loc}.`,
          },
          {
            patternLt: `į ${noun.sg.acc} / iš ${noun.sg.gen}`,
            caseName: 'į + Gal. / iš + Kilm.',
            meaningUk: `куди? до ${ukGenSg} (į + знахідний) та звідки? з ${ukGenSg} (iš + родовий)`,
            meaningEn: `to the ${enSg} (į + Acc.) and from the ${enSg} (iš + Gen.)`,
            meaningLt: 'kryptis į vietovę ir iš jos',
            exampleLt: `Daug turistų kasmet atvyksta į ${noun.sg.acc}.`,
          },
        ],
        conversationalPhrases: [
          {
            lt: `Ar jau esi lankęsis ${ltAdj('šiame', 'šioje')} ${noun.sg.loc}?`,
            uk: `Ти вже бував у ${ukAdj('цьому', 'цій', 'цьому', 'цих')} ${ukLocSgBare}?`,
            en: `Have you ever visited this ${enSg}?`,
            context: 'Kelionės / Подорожі',
          },
          {
            lt: `${ltAdj('Šis', 'Ši')} ${noun.lemma} garsėja gražia gamta ir svetingais žmonėmis.`,
            uk: `${ukAdj('Цей', 'Ця', 'Це', 'Ці')} ${ukNomSg} славиться гарною природою та гостинними людьми.`,
            en: `This ${enSg} is famous for its beautiful nature and welcoming people.`,
            context: 'Geografija / Географія',
          },
        ],
      };
    }

    case 'food_drink': {
      return {
        collocations: [
          {
            phraseLt: `nupirkti ${noun.sg.gen}`,
            transUk: `купити ${ukGenSg}`,
            transEn: `to buy some ${enSg}`,
            caseBadge: 'Dalies Kilmininkas',
            type: 'verb',
          },
          {
            phraseLt: `paragauti ${ltAdj('šviežio', 'šviežios')} ${noun.sg.gen}`,
            transUk: `скуштувати ${ukAdj('свіжого', 'свіжої', 'свіжого', 'свіжих')} ${ukGenSg}`,
            transEn: `to taste fresh ${enSg}`,
            caseBadge: 'Kilmininkas (Gen.)',
            type: 'verb',
          },
          {
            phraseLt: `mėgti ${noun.sg.acc}`,
            transUk: `любити ${ukAccSg}`,
            transEn: `to like ${enSg}`,
            caseBadge: 'Galininkas (Acc.)',
            type: 'verb',
          },
          {
            phraseLt: `${ltAdj('šviežias ir skanus', 'šviežia ir skani')} ${noun.lemma}`,
            transUk: `${ukAdj('свіжий і смачний', 'свіжа й смачна', 'свіже й смачне', 'свіжі й смачні')} ${ukNomSg}`,
            transEn: `fresh and delicious ${enSg}`,
            caseBadge: 'Būdvardis + Dkt.',
            type: 'adjective',
          },
          {
            phraseLt: `be ${noun.sg.gen}`,
            transUk: `без ${ukGenSg}`,
            transEn: `without ${enSg}`,
            caseBadge: 'be + Kilmininkas',
            type: 'prep',
          },
        ],
        idioms: [
          {
            phraseLt: `Skanaus! / Gero apetito!`,
            transUk: `Смачного!`,
            transEn: `Bon appétit! / Enjoy your meal!`,
            explanationUk: 'Неодмінне побажання за литовським столом перед початком трапези.',
            explanationEn: 'Essential Lithuanian dining expression wishing everyone a pleasant meal.',
            explanationLt: 'Tradicinis palinkėjimas sėdant prie stalo ar pradedant valgyti.',
            originOrStyle: 'Stalo etiketas / Застільний етикет',
          },
        ],
        governance: [
          {
            patternLt: `norėti / pirkti ${noun.sg.gen}`,
            caseName: 'Dalies Kilmininkas (Partitive)',
            meaningUk: `хотіти / купити ${ukGenSg} (родовий відмінок часткової кількості для продуктів і напоїв)`,
            meaningEn: `to want / buy some ${enSg} (Partitive Genitive for food and drinks)`,
            meaningLt: 'dalies kilmininkas maisto produktų ar gėrimų kiekiui nusakyti',
            exampleLt: `Parduotuvėje nupirkau ${ltAdj('šviežio', 'šviežios')} ${noun.sg.gen}.`,
          },
          {
            patternLt: `su ${noun.sg.ins}`,
            caseName: 'su + Įnagininkas',
            meaningUk: `з чим? страва з ${ukInsSg}`,
            meaningEn: `with what? served with ${enSg}`,
            meaningLt: 'su kuo? patiekalo sudedamoji dalis ar priedas',
            exampleLt: `Šis patiekalas labai skanus su ${noun.sg.ins}.`,
          },
        ],
        conversationalPhrases: [
          {
            lt: `Ar norėtumėte šiek tiek ${noun.sg.gen}?`,
            uk: `Чи не бажаєте трохи ${ukGenSg}?`,
            en: `Would you like some ${enSg}?`,
            context: 'Vaišės / Частування',
          },
          {
            lt: `Aš labai mėgstu ${ltAdj('šviežią', 'šviežią')} ${noun.sg.acc}.`,
            uk: `Я дуже люблю ${ukAdj('свіжий', 'свіжу', 'свіже', 'свіжі')} ${ukAccSg}.`,
            en: `I really like fresh ${enSg}.`,
            context: 'Skonis / Смакові вподобання',
          },
        ],
      };
    }

    case 'clothing_footwear': {
      return {
        collocations: [
          {
            phraseLt: `pasimatuoti ${noun.sg.acc}`,
            transUk: `приміряти ${ukAccSg}`,
            transEn: `to try on the ${enSg}`,
            caseBadge: 'Galininkas (Acc.)',
            type: 'verb',
          },
          {
            phraseLt: `dėvėti / vilkėti ${noun.sg.acc}`,
            transUk: `носити ${ukAccSg}`,
            transEn: `to wear the ${enSg}`,
            caseBadge: 'Galininkas (Acc.)',
            type: 'verb',
          },
          {
            phraseLt: `nusipirkti naują ${noun.sg.acc}`,
            transUk: `купити ${ukAdj('новий', 'нову', 'нове', 'нові')} ${ukAccSg}`,
            transEn: `to buy ${enIndef(`new ${enSg}`)}`,
            caseBadge: 'Galininkas (Acc.)',
            type: 'verb',
          },
          {
            phraseLt: `${ltAdj('patogus ir stilingas', 'patogi ir stilinga')} ${noun.lemma}`,
            transUk: `${ukAdj('зручний і стильний', 'зручна й стильна', 'зручне й стильне', 'зручні й стильні')} ${ukNomSg}`,
            transEn: `comfortable and stylish ${enSg}`,
            caseBadge: 'Būdvardis + Dkt.',
            type: 'adjective',
          },
        ],
        idioms: [
          {
            phraseLt: `Pagal rūbą sutinka, pagal protą palydi`,
            transUk: `Зустрічають по одягу, а проводжають по розуму`,
            transEn: `Clothes make the first impression, but wisdom leaves the lasting one`,
            explanationUk: 'Зовнішній вигляд справляє лише перше враження, а справжня цінність людини — у її розумі та вчинках.',
            explanationEn: 'Appearance creates the initial impression, but character and intelligence matter most.',
            explanationLt: 'Išvaizda sukuria tik pirmąjį įspūdį, o tikroji žmogaus vertė atsiskleidžia bendraujant.',
            originOrStyle: 'Liaudies patarlė / Прислів’я',
          },
        ],
        governance: [
          {
            patternLt: `pasimatuoti ${noun.sg.acc}`,
            caseName: 'Galininkas (Accusative)',
            meaningUk: `приміряти ${ukAccSg} (прямий додаток у знахідному відмінку)`,
            meaningEn: `to try on the ${enSg} (direct object in Accusative)`,
            meaningLt: 'ką pasimatuoti? tiesioginis papildinys galininko linksniu',
            exampleLt: `Norėčiau pasimatuoti ${ltAdj('šį', 'šią')} ${noun.sg.acc}.`,
          },
          {
            patternLt: `su ${noun.sg.ins}`,
            caseName: 'su + Įnagininkas',
            meaningUk: `у чому? / з чим? (одягнений у ${ukAccSg})`,
            meaningEn: `wearing / dressed in the ${enSg}`,
            meaningLt: 'su kuo? vilkint ar dėvint drabužį',
            exampleLt: `Šiandien labai patogu būti su ${ltAdj('šiuo', 'šia')} ${noun.sg.ins}.`,
          },
        ],
        conversationalPhrases: [
          {
            lt: `Kur yra matavimosi kabina? Norėčiau pasimatuoti ${ltAdj('šį', 'šią')} ${noun.sg.acc}.`,
            uk: `Де примірочна? Я хотів би приміряти ${ukAdj('цей', 'цю', 'це', 'ці')} ${ukAccSg}.`,
            en: `Where is the fitting room? I would like to try on this ${enSg}.`,
            context: 'Drabužių parduotuvėje / У магазині одягу',
          },
          {
            lt: `${ltAdj('Šis', 'Ši')} ${noun.lemma} jums labai tinka!`,
            uk: `${ukAdj('Цей', 'Ця', 'Це', 'Ці')} ${ukNomSg} вам дуже пасує!`,
            en: `This ${enSg} suits you very well!`,
            context: 'Komplimentas / Комплімент',
          },
        ],
      };
    }

    case 'jewelry_bag_fabric': {
      return {
        collocations: [
          {
            phraseLt: `išsirinkti ${noun.sg.acc}`,
            transUk: `обрати ${ukAccSg}`,
            transEn: `to choose ${enIndef(enSg)}`,
            caseBadge: 'Galininkas (Acc.)',
            type: 'verb',
          },
          {
            phraseLt: `${ltAdj('kokybiškas ir gražus', 'kokybiška ir graži')} ${noun.lemma}`,
            transUk: `${ukAdj('якісний і гарний', 'якісна й гарна', 'якісне й гарне', 'якісні й гарні')} ${ukNomSg}`,
            transEn: `high-quality and attractive ${enSg}`,
            caseBadge: 'Būdvardis + Dkt.',
            type: 'adjective',
          },
          {
            phraseLt: `suderinti su ${noun.sg.ins}`,
            transUk: `поєднати з ${ukInsSg}`,
            transEn: `to match with the ${enSg}`,
            caseBadge: 'su + Įnagininkas',
            type: 'prep',
          },
          {
            phraseLt: `be ${noun.sg.gen}`,
            transUk: `без ${ukGenSg}`,
            transEn: `without the ${enSg}`,
            caseBadge: 'be + Kilmininkas',
            type: 'prep',
          },
        ],
        idioms: [
          {
            phraseLt: `Grožis slypi detalėse`,
            transUk: `Краса криється в деталях`,
            transEn: `Beauty lies in the details`,
            explanationUk: 'Вдало підібрана деталь, тканина чи аксесуар довершує зовнішній вигляд.',
            explanationEn: 'A well-chosen accessory, material, or detail completes the overall style.',
            explanationLt: 'Tinkamai parinkta detalė ar aksesuaras suteikia stiliui išbaigtumo.',
            originOrStyle: 'Posakis / Сталий вираз',
          },
        ],
        governance: [
          {
            patternLt: `su ${noun.sg.ins}`,
            caseName: 'su + Įnagininkas',
            meaningUk: `з чим? поєднання з ${ukInsSg}`,
            meaningEn: `with the ${enSg} ("su" governs Instrumental)`,
            meaningLt: 'su kuo? derinimas ar turėjimas su savimi',
            exampleLt: `Šis stilius puikiai dera su ${noun.sg.ins}.`,
          },
          {
            patternLt: `dėl ${noun.sg.gen}`,
            caseName: 'dėl + Kilmininkas',
            meaningUk: `завдяки чому? / щодо ${ukGenSg}`,
            meaningEn: `regarding / thanks to the ${enSg}`,
            meaningLt: 'prielinksnis „dėl“ valdo kilmininko linksnį',
            exampleLt: `Pirkėjas pasiteiravo pardavėjo dėl ${noun.sg.gen}.`,
          },
        ],
        conversationalPhrases: [
          {
            lt: `${ltAdj('Šis', 'Ši')} ${noun.lemma} atrodo labai tvarkingai ir kokybiškai.`,
            uk: `${ukAdj('Цей', 'Ця', 'Це', 'Ці')} ${ukNomSg} виглядає дуже охайно та якісно.`,
            en: `This ${enSg} looks very neat and well-made.`,
            context: 'Pirkimas / Покупки',
          },
          {
            lt: `Kur įsigijote ${ltAdj('tokį gražų', 'tokią gražią')} ${noun.sg.acc}?`,
            uk: `Де ви придбали ${ukAdj('такий гарний', 'таку гарну', 'таке гарне', 'такі гарні')} ${ukAccSg}?`,
            en: `Where did you get such ${enIndef(`nice ${enSg}`)}?`,
            context: 'Kasdienis pokalbis / Щоденна розмова',
          },
        ],
      };
    }

    case 'body_part_pain': {
      return {
        collocations: [
          {
            phraseLt: `man skauda ${noun.sg.acc}`,
            transUk: `у мене болить ${ukNomSg}`,
            transEn: `my ${enSg} hurts`,
            caseBadge: 'skauda + Galininkas!',
            type: 'verb',
          },
          {
            phraseLt: `užsigauti / sužeisti ${noun.sg.acc}`,
            transUk: `забити / поранити ${ukAccSg}`,
            transEn: `to hurt / injure one's ${enSg}`,
            caseBadge: 'Galininkas (Acc.)',
            type: 'verb',
          },
          {
            phraseLt: `stiprinti ${noun.sg.acc}`,
            transUk: `зміцнювати ${ukAccSg}`,
            transEn: `to strengthen the ${enSg}`,
            caseBadge: 'Galininkas (Acc.)',
            type: 'verb',
          },
          {
            phraseLt: `patikrinti ${noun.sg.acc}`,
            transUk: `обстежити / перевірити ${ukAccSg}`,
            transEn: `to examine the ${enSg}`,
            caseBadge: 'Galininkas (Acc.)',
            type: 'verb',
          },
        ],
        idioms: [
          {
            phraseLt: `Sveikame kūne — sveika siela`,
            transUk: `У здоровому тілі — здоровий дух`,
            transEn: `A sound mind in a sound body`,
            explanationUk: 'Фізичне здоров’я та рух сприяють душевному спокою і ясній думці.',
            explanationEn: 'Physical health and well-being support mental clarity and peace.',
            explanationLt: 'Fizinė sveikata ir judėjimas padeda išlaikyti dvasinę pusiausvyrą.',
            originOrStyle: 'Klasikinis posakis / Прислів’я',
          },
        ],
        governance: [
          {
            patternLt: `man skauda ${noun.sg.acc}`,
            caseName: 'skauda + Galininkas (Accusative)',
            meaningUk: `у мене болить ${ukNomSg} (важливо: у литовській мові після дієслова „skauda“ частина тіла ставиться у ЗНАХІДНОМУ відмінку — ką skauda?)`,
            meaningEn: `my ${enSg} hurts (important: in Lithuanian, "skauda" governs the Accusative case)`,
            meaningLt: 'veiksmažodis „skauda“ reikalauja galininko linksnio (ką skauda?)',
            exampleLt: `Gydytojau, man nuo vakar skauda ${noun.sg.acc}.`,
          },
        ],
        conversationalPhrases: [
          {
            lt: `Gydytojau, man skauda ${noun.sg.acc}.`,
            uk: `Лікарю, у мене болить ${ukNomSg}.`,
            en: `Doctor, my ${enSg} hurts.`,
            context: 'Pas gydytoją / На прийомі в лікаря',
          },
          {
            lt: `Sportuojant svarbu saugoti ${noun.sg.acc}.`,
            uk: `Під час занять спортом важливо берегти ${ukAccSg}.`,
            en: `When exercising, it is important to protect your ${enSg}.`,
            context: 'Sveikata / Здоров’я',
          },
        ],
      };
    }

    case 'body_feature_external': {
      return {
        collocations: [
          {
            phraseLt: `prižiūrėti ${noun.sg.acc}`,
            transUk: `доглядати за ${ukInsSg}`,
            transEn: `to take care of one's ${enSg}`,
            caseBadge: 'Galininkas (Acc.)',
            type: 'verb',
          },
          {
            phraseLt: `atkreipti dėmesį į ${noun.sg.acc}`,
            transUk: `звернути увагу на ${ukAccSg}`,
            transEn: `to notice the ${enSg}`,
            caseBadge: 'į + Galininkas',
            type: 'prep',
          },
          {
            phraseLt: `${ltAdj('sveikas ir tvarkingas', 'sveika ir tvarkinga')} ${noun.lemma}`,
            transUk: `${ukAdj('здоровий і доглянутий', 'здорова й доглянута', 'здорове й доглянуте', 'здорові й доглянуті')} ${ukNomSg}`,
            transEn: `healthy and well-kept ${enSg}`,
            caseBadge: 'Būdvardis + Dkt.',
            type: 'adjective',
          },
          {
            phraseLt: `${noun.sg.gen} priežiūra`,
            transUk: `догляд за ${ukInsSg}`,
            transEn: `${enSg} care`,
            caseBadge: 'Kilmininkas (Gen.)',
            type: 'genitive',
          },
        ],
        idioms: [
          {
            phraseLt: `Veidas — sielos veidrodis`,
            transUk: `Зовнішність і погляд — дзеркало душі`,
            transEn: `The face and expression are the mirror of the soul`,
            explanationUk: 'Риси обличчя, усмішка та зовнішній вигляд відображають внутрішній стан людини.',
            explanationEn: 'One’s facial features and expression reflect inner emotions and health.',
            explanationLt: 'Žmogaus išvaizda ir veido bruožai atspindi vidinę būseną bei savijautą.',
            originOrStyle: 'Posakis / Прислів’я',
          },
        ],
        governance: [
          {
            patternLt: `rūpintis ${noun.sg.ins}`,
            caseName: 'rūpintis + Įnagininkas',
            meaningUk: `дбати про ${ukAccSg} (дієслово rūpintis керує орудним відмінком)`,
            meaningEn: `to care for one's ${enSg} ("rūpintis" governs Instrumental)`,
            meaningLt: 'veiksmažodis „rūpintis“ valdo įnagininko linksnį',
            exampleLt: `Kasdien svarbu tinkamai rūpintis savo ${noun.sg.ins}.`,
          },
          {
            patternLt: `į ${noun.sg.acc}`,
            caseName: 'į + Galininkas',
            meaningUk: `подивитися на ${ukAccSg}`,
            meaningEn: `to look at the ${enSg}`,
            meaningLt: 'pažvelgti į ką nors (galininko linksnis)',
            exampleLt: `Jis šiltai pažvelgė į ${noun.sg.acc}.`,
          },
        ],
        conversationalPhrases: [
          {
            lt: `Tinkama ${noun.sg.gen} priežiūra padeda išlikti sveikiems.`,
            uk: `Належний догляд за ${ukInsSg} допомагає зберігати здоров’я.`,
            en: `Proper ${enSg} care helps maintain good health.`,
            context: 'Priežiūra / Догляд',
          },
          {
            lt: `Iš karto pastebėjau ${ltAdj('jo išraiškingą', 'jos išraiškingą')} ${noun.sg.acc}.`,
            uk: `Я одразу помітив ${ukAdj('його виразний', 'її виразну', 'його виразне', 'їхні виразні')} ${ukAccSg}.`,
            en: `I immediately noticed the expressive ${enSg}.`,
            context: 'Išvaizda / Зовнішність',
          },
        ],
      };
    }

    case 'illness_symptom': {
      return {
        collocations: [
          {
            phraseLt: `gydyti ${noun.sg.acc}`,
            transUk: `лікувати ${ukAccSg}`,
            transEn: `to treat the ${enSg}`,
            caseBadge: 'Galininkas (Acc.)',
            type: 'verb',
          },
          {
            phraseLt: `vaistai nuo ${noun.sg.gen}`,
            transUk: `ліки від ${ukGenSg}`,
            transEn: `medicine for / against ${enSg}`,
            caseBadge: 'nuo + Kilmininkas',
            type: 'prep',
          },
          {
            phraseLt: `išvengti ${noun.sg.gen}`,
            transUk: `уникнути ${ukGenSg}`,
            transEn: `to prevent / avoid ${enSg}`,
            caseBadge: 'išvengti + Kilmininkas',
            type: 'verb',
          },
          {
            phraseLt: `skųstis ${noun.sg.ins}`,
            transUk: `скаржитися на ${ukAccSg}`,
            transEn: `to complain of ${enSg}`,
            caseBadge: 'skųstis + Įnagininkas',
            type: 'verb',
          },
        ],
        idioms: [
          {
            phraseLt: `Geriau užkirsti kelią negu gydyti`,
            transUk: `Краще запобігти хворобі, ніж лікувати`,
            transEn: `Prevention is better than cure`,
            explanationUk: 'Вчасна профілактика та увага до симптомів допомагають зберегти здоров’я.',
            explanationEn: 'Timely prevention and attention to early symptoms protect your health.',
            explanationLt: 'Laiku vykdoma profilaktika padeda išvengti rimtų negalavimų.',
            originOrStyle: 'Medicinos išmintis / Прислів’я',
          },
        ],
        governance: [
          {
            patternLt: `vaistai nuo ${noun.sg.gen}`,
            caseName: 'nuo + Kilmininkas',
            meaningUk: `засіб від ${ukGenSg} (прийменник nuo керує родовим відмінком)`,
            meaningEn: `remedy against / for ${enSg} ("nuo" governs Genitive)`,
            meaningLt: 'priemonė ar vaistai nuo ligos ar simptomo',
            exampleLt: `Vaistininkas pasiūlė efektyvių vaistų nuo ${noun.sg.gen}.`,
          },
          {
            patternLt: `dėl ${noun.sg.gen}`,
            caseName: 'dėl + Kilmininkas',
            meaningUk: `через ${ukAccSg} / з приводу ${ukGenSg}`,
            meaningEn: `because of / regarding ${enSg}`,
            meaningLt: 'priežastis ar kreipimosi į gydytoją pagrindas',
            exampleLt: `Pacientas kreipėsi į gydytoją dėl ${noun.sg.gen}.`,
          },
        ],
        conversationalPhrases: [
          {
            lt: `Kokius vaistus rekomenduotumėte nuo ${noun.sg.gen}?`,
            uk: `Які ліки ви порадили б від ${ukGenSg}?`,
            en: `What medicine would you recommend for ${enSg}?`,
            context: 'Vaistinėje / В аптеці',
          },
          {
            lt: `Laiku pradėtas gydymas padėjo greitai įveikti ${noun.sg.acc}.`,
            uk: `Вчасно розпочате лікування допомогло швидко подолати ${ukAccSg}.`,
            en: `Timely treatment helped quickly overcome the ${enSg}.`,
            context: 'Pas gydytoją / У лікаря',
          },
        ],
      };
    }

    case 'medicine_remedy': {
      return {
        collocations: [
          {
            phraseLt: `vartoti / gerti ${noun.sg.acc}`,
            transUk: `приймати ${ukAccSg}`,
            transEn: `to take / use the ${enSg}`,
            caseBadge: 'Galininkas (Acc.)',
            type: 'verb',
          },
          {
            phraseLt: `išrašyti ${noun.sg.acc}`,
            transUk: `виписати ${ukAccSg}`,
            transEn: `to prescribe the ${enSg}`,
            caseBadge: 'Galininkas (Acc.)',
            type: 'verb',
          },
          {
            phraseLt: `nupirkti ${noun.sg.acc} vaistinėje`,
            transUk: `купити ${ukAccSg} в аптеці`,
            transEn: `to buy the ${enSg} at the pharmacy`,
            caseBadge: 'Galininkas + Vietininkas',
            type: 'verb',
          },
          {
            phraseLt: `${ltAdj('veiksmingas', 'veiksminga')} ${noun.lemma}`,
            transUk: `${ukAdj('дієвий', 'дієва', 'дієве', 'дієві')} ${ukNomSg}`,
            transEn: `effective ${enSg}`,
            caseBadge: 'Būdvardis + Dkt.',
            type: 'adjective',
          },
        ],
        idioms: [
          {
            phraseLt: `Sveikata — brangiausias turtas`,
            transUk: `Здоров’я — найдорожчий скарб`,
            transEn: `Health is the most precious treasure`,
            explanationUk: 'Дбайливе виконання порад лікаря сприяє швидкому одужанню.',
            explanationEn: 'Following medical advice carefully ensures a smooth recovery.',
            explanationLt: 'Atidus gydytojo nurodymų laikymasis padeda greičiau pasveikti.',
            originOrStyle: 'Liaudies patarlė / Прислів’я',
          },
        ],
        governance: [
          {
            patternLt: `vartoti ${noun.sg.acc}`,
            caseName: 'Galininkas (Accusative)',
            meaningUk: `приймати / застосовувати ${ukAccSg} (прямий додаток у знахідному відмінку)`,
            meaningEn: `to take / apply the ${enSg} (direct object in Accusative)`,
            meaningLt: 'ką vartoti? tiesioginis papildinys galininko linksniu',
            exampleLt: `Gydytojas patarė vartoti ${ltAdj('šį', 'šią')} ${noun.sg.acc} po valgio.`,
          },
          {
            patternLt: `receptas ${noun.sg.dat}`,
            caseName: 'Naudininkas (Dative)',
            meaningUk: `рецепт на ${ukAccSg} (у литовській мові призначення передається давальним відмінком)`,
            meaningEn: `prescription for the ${enSg} (purpose in Dative)`,
            meaningLt: 'kam skirtas receptas? naudininko linksnis',
            exampleLt: `Gydytojas išrašė elektroninį receptą ${noun.sg.dat}.`,
          },
        ],
        conversationalPhrases: [
          {
            lt: `Kaip dažnai reikia vartoti ${ltAdj('šį', 'šią')} ${noun.sg.acc}?`,
            uk: `Як часто потрібно приймати ${ukAdj('цей', 'цю', 'це', 'ці')} ${ukAccSg}?`,
            en: `How often should I take/use this ${enSg}?`,
            context: 'Vaistinėje / В аптеці',
          },
          {
            lt: `Ar ${ltAdj('šiam', 'šiai')} ${noun.sg.dat} reikalingas gydytojo receptas?`,
            uk: `Чи потрібен рецепт лікаря на ${ukAdj('цей', 'цю', 'це', 'ці')} ${ukAccSg}?`,
            en: `Is a doctor's prescription required for this ${enSg}?`,
            context: 'Konsultacija / Консультація',
          },
        ],
      };
    }

    case 'health_care_state': {
      return {
        collocations: [
          {
            phraseLt: `rūpintis ${noun.sg.ins}`,
            transUk: `дбати про ${ukAccSg}`,
            transEn: `to take care of ${enSg}`,
            caseBadge: 'rūpintis + Įnagininkas',
            type: 'verb',
          },
          {
            phraseLt: `pasikonsultuoti dėl ${noun.sg.gen}`,
            transUk: `проконсультуватися щодо ${ukGenSg}`,
            transEn: `to consult regarding ${enSg}`,
            caseBadge: 'dėl + Kilmininkas',
            type: 'prep',
          },
          {
            phraseLt: `stebėti ${noun.sg.acc}`,
            transUk: `стежити за ${ukInsSg}`,
            transEn: `to monitor ${enSg}`,
            caseBadge: 'Galininkas (Acc.)',
            type: 'verb',
          },
          {
            phraseLt: `skirti dėmesį ${noun.sg.dat}`,
            transUk: `приділяти увагу ${ukDatSg}`,
            transEn: `to pay attention to ${enSg}`,
            caseBadge: 'Naudininkas (Dat.)',
            type: 'verb',
          },
        ],
        idioms: [
          {
            phraseLt: `Sveikata — didžiausias turtas`,
            transUk: `Здоров’я — найбільший скарб`,
            transEn: `Health is the greatest wealth`,
            explanationUk: 'Жодні матеріальні блага не замінять міцного здоров’я та гарного самопочуття.',
            explanationEn: 'Good health is more valuable than any material possessions.',
            explanationLt: 'Joks materialus turtas neatstoja geros sveikatos ir savijautos.',
            originOrStyle: 'Liaudies patarlė / Прислів’я',
          },
        ],
        governance: [
          {
            patternLt: `rūpintis ${noun.sg.ins}`,
            caseName: 'rūpintis + Įnagininkas',
            meaningUk: `піклуватися про ${ukAccSg} (дієслово rūpintis вимагає орудного відмінка)`,
            meaningEn: `to look after ${enSg} ("rūpintis" governs Instrumental)`,
            meaningLt: 'veiksmažodis „rūpintis“ reikalauja įnagininko linksnio',
            exampleLt: `Kiekvienam svarbu nuolat rūpintis savo ${noun.sg.ins}.`,
          },
          {
            patternLt: `dėl ${noun.sg.gen}`,
            caseName: 'dėl + Kilmininkas',
            meaningUk: `з приводу чого? звернення щодо ${ukGenSg}`,
            meaningEn: `regarding / concerning ${enSg}`,
            meaningLt: 'dėl ko? priežastis ar konsultacijos tema',
            exampleLt: `Jis pasitarė su gydytoju dėl ${noun.sg.gen}.`,
          },
        ],
        conversationalPhrases: [
          {
            lt: `Gydytojas išsamiai papasakojo apie ${noun.sg.acc}.`,
            uk: `Лікар детально розповів про ${ukAccSg}.`,
            en: `The doctor explained in detail about ${enSg}.`,
            context: 'Klinikoje / У клініці',
          },
          {
            lt: `Linkiu jums stiprios sveikatos ir puikios savijautos!`,
            uk: `Бажаю вам міцного здоров’я та чудового самопочуття!`,
            en: `I wish you strong health and great well-being!`,
            context: 'Palinkėjimas / Побажання',
          },
        ],
      };
    }

    case 'appliance_device': {
      return {
        collocations: [
          {
            phraseLt: `įjungti / išjungti ${noun.sg.acc}`,
            transUk: `увімкнути / вимкнути ${ukAccSg}`,
            transEn: `to turn on / turn off the ${enSg}`,
            caseBadge: 'Galininkas (Acc.)',
            type: 'verb',
          },
          {
            phraseLt: `naudotis ${noun.sg.ins}`,
            transUk: `користуватися ${ukInsSg}`,
            transEn: `to use the ${enSg}`,
            caseBadge: 'naudotis + Įnagininkas',
            type: 'verb',
          },
          {
            phraseLt: `suremontuoti ${noun.sg.acc}`,
            transUk: `відремонтувати ${ukAccSg}`,
            transEn: `to repair the ${enSg}`,
            caseBadge: 'Galininkas (Acc.)',
            type: 'verb',
          },
          {
            phraseLt: `${ltAdj('naujas ir modernus', 'nauja ir moderni')} ${noun.lemma}`,
            transUk: `${ukAdj('новий і сучасний', 'нова й сучасна', 'нове й сучасне', 'нові й сучасні')} ${ukNomSg}`,
            transEn: `new and modern ${enSg}`,
            caseBadge: 'Būdvardis + Dkt.',
            type: 'adjective',
          },
        ],
        idioms: [
          {
            phraseLt: `Technika tarnauja žmogui`,
            transUk: `Техніка служить людині`,
            transEn: `Technology serves humanity`,
            explanationUk: 'Сучасні прилади заощаджують час і полегшують щоденну працю.',
            explanationEn: 'Modern appliances and devices save time and make daily work easier.',
            explanationLt: 'Šiuolaikiniai prietaisai taupo laiką ir palengvina kasdienę buitį.',
            originOrStyle: 'Posakis / Сталий вираз',
          },
        ],
        governance: [
          {
            patternLt: `naudotis ${noun.sg.ins}`,
            caseName: 'naudotis + Įnagininkas',
            meaningUk: `користуватися ${ukInsSg} (дієслово naudotis керує орудним відмінком)`,
            meaningEn: `to use the ${enSg} ("naudotis" governs Instrumental)`,
            meaningLt: 'veiksmažodis „naudotis“ reikalauja įnagininko linksnio (kuo?)',
            exampleLt: `Kasdien darbe ir namuose naudojuosi ${ltAdj('šiuo', 'šia')} ${noun.sg.ins}.`,
          },
          {
            patternLt: `be ${noun.sg.gen}`,
            caseName: 'be + Kilmininkas',
            meaningUk: `без ${ukGenSg} (прийменник be керує родовим відмінком)`,
            meaningEn: `without the ${enSg} ("be" governs Genitive)`,
            meaningLt: 'prielinksnis „be“ valdo kilmininko linksnį',
            exampleLt: `Šiandien sunku įsivaizduoti kasdienybę be ${noun.sg.gen}.`,
          },
        ],
        conversationalPhrases: [
          {
            lt: `Ar galiu trumpam pasinaudoti tavo ${noun.sg.ins}?`,
            uk: `Чи можу я ненадовго скористатися ${ukAdj('твоїм', 'твоєю', 'твоїм', 'твоїми')} ${ukInsSg}?`,
            en: `May I briefly use your ${enSg}?`,
            context: 'Kasdienis prašymas / Щоденне прохання',
          },
          {
            lt: `${ltAdj('Šis', 'Ši')} ${noun.lemma} veikia labai tyliai ir patikimai.`,
            uk: `${ukAdj('Цей', 'Ця', 'Це', 'Ці')} ${ukNomSg} працює дуже тихо й надійно.`,
            en: `This ${enSg} works very quietly and reliably.`,
            context: 'Technika / Техніка',
          },
        ],
      };
    }

    case 'furniture_home_fixture': {
      return {
        collocations: [
          {
            phraseLt: `atnaujinti ${noun.sg.acc}`,
            transUk: `оновити ${ukAccSg}`,
            transEn: `to renovate / update the ${enSg}`,
            caseBadge: 'Galininkas (Acc.)',
            type: 'verb',
          },
          {
            phraseLt: `prie ${noun.sg.gen}`,
            transUk: `біля ${ukGenSg}`,
            transEn: `by / near the ${enSg}`,
            caseBadge: 'prie + Kilmininkas',
            type: 'prep',
          },
          {
            phraseLt: `${ltAdj('tvirtas ir gražus', 'tvirta ir graži')} ${noun.lemma}`,
            transUk: `${ukAdj('міцний і гарний', 'міцна й гарна', 'міцне й гарне', 'міцні й гарні')} ${ukNomSg}`,
            transEn: `sturdy and attractive ${enSg}`,
            caseBadge: 'Būdvardis + Dkt.',
            type: 'adjective',
          },
          {
            phraseLt: `${noun.sg.gen} spalva ir stilius`,
            transUk: `колір і стиль ${ukGenSg}`,
            transEn: `the color and style of the ${enSg}`,
            caseBadge: 'Kilmininkas (Gen.)',
            type: 'genitive',
          },
        ],
        idioms: [
          {
            phraseLt: `Namų jaukumas kuriamas su meile`,
            transUk: `Домашній затишок створюється з любов’ю`,
            transEn: `Home comfort is created with care`,
            explanationUk: 'Дбайливо облаштований дім дарує тепло і спокій усій родині.',
            explanationEn: 'A thoughtfully arranged home brings warmth and peace to the whole family.',
            explanationLt: 'Rūpestingai prižiūrimi namai suteikia šilumos ir ramybės.',
            originOrStyle: 'Posakis / Сталий вираз',
          },
        ],
        governance: [
          {
            patternLt: `prie ${noun.sg.gen}`,
            caseName: 'prie + Kilmininkas',
            meaningUk: `біля ${ukGenSg} (прийменник prie вимагає родового відмінка)`,
            meaningEn: `near / by the ${enSg} ("prie" governs Genitive)`,
            meaningLt: 'prielinksnis „prie“ nurodo buvimą šalia objekto',
            exampleLt: `Mes sustojome prie ${ltAdj('šio', 'šios')} ${noun.sg.gen}.`,
          },
          {
            patternLt: `dėl ${noun.sg.gen}`,
            caseName: 'dėl + Kilmininkas',
            meaningUk: `щодо ${ukGenSg} (родовий відмінок з прийменником dėl)`,
            meaningEn: `regarding the ${enSg}`,
            meaningLt: 'prielinksnis „dėl“ valdo kilmininko linksnį',
            exampleLt: `Šeima pasitarė su meistru dėl ${noun.sg.gen}.`,
          },
        ],
        conversationalPhrases: [
          {
            lt: `${ltAdj('Šis', 'Ši')} ${noun.lemma} puikiai dera prie namų interjero.`,
            uk: `${ukAdj('Цей', 'Ця', 'Це', 'Ці')} ${ukNomSg} чудово пасує до домашнього інтер’єру.`,
            en: `This ${enSg} matches the home interior wonderfully.`,
            context: 'Namai / Дім та інтер’єр',
          },
          {
            lt: `Šiais metais planuojame atnaujinti ${noun.sg.acc}.`,
            uk: `Цього року ми плануємо оновити ${ukAccSg}.`,
            en: `This year we are planning to update the ${enSg}.`,
            context: 'Planai / Господарство',
          },
        ],
      };
    }

    case 'portable_object': {
      return {
        collocations: [
          {
            phraseLt: `naudoti ${noun.sg.acc}`,
            transUk: `використовувати ${ukAccSg}`,
            transEn: `to use the ${enSg}`,
            caseBadge: 'Galininkas (Acc.)',
            type: 'verb',
          },
          {
            phraseLt: `įsigyti / nusipirkti ${noun.sg.acc}`,
            transUk: `придбати / купити ${ukAccSg}`,
            transEn: `to buy ${enIndef(enSg)}`,
            caseBadge: 'Galininkas (Acc.)',
            type: 'verb',
          },
          {
            phraseLt: `ieškoti ${noun.sg.gen}`,
            transUk: `шукати ${ukAccSg}`,
            transEn: `to look for the ${enSg}`,
            caseBadge: 'ieškoti + Kilmininkas',
            type: 'verb',
          },
          {
            phraseLt: `${ltAdj('naujas ir patogus', 'nauja ir patogi')} ${noun.lemma}`,
            transUk: `${ukAdj('новий і зручний', 'нова й зручна', 'нове й зручне', 'нові й зручні')} ${ukNomSg}`,
            transEn: `new and handy ${enSg}`,
            caseBadge: 'Būdvardis + Dkt.',
            type: 'adjective',
          },
          {
            phraseLt: `be ${noun.sg.gen}`,
            transUk: `без ${ukGenSg}`,
            transEn: `without the ${enSg}`,
            caseBadge: 'be + Kilmininkas',
            type: 'prep',
          },
        ],
        idioms: [
          {
            phraseLt: `Kiekvienam daiktui — sava vieta`,
            transUk: `Кожній речі — своє місце`,
            transEn: `A place for everything and everything in its place`,
            explanationUk: 'Порядок у домі та справах починається з дбайливого ставлення до речей.',
            explanationEn: 'Order and efficiency come from keeping everyday items organized.',
            explanationLt: 'Tvarka namuose ir darbe prasideda nuo daiktų tvarkingumo.',
            originOrStyle: 'Patarlė / Прислів’я',
          },
          {
            phraseLt: `Turėti po ranka`,
            transUk: `Мати під рукою (напохваті)`,
            transEn: `To have close at hand`,
            explanationUk: 'Тримати потрібну річ поруч, щоб у будь-яку мить нею скористатися.',
            explanationEn: 'To keep an essential item within easy reach.',
            explanationLt: 'Laikyti reikalingą daiktą čia pat, lengvai pasiekiamoje vietoje.',
            originOrStyle: 'Posakis / Сталий вираз',
          },
        ],
        governance: [
          {
            patternLt: `su ${noun.sg.ins}`,
            caseName: 'su + Įnagininkas',
            meaningUk: `з ${ukInsSg} (орудний відмінок знаряддя або супроводу)`,
            meaningEn: `with the ${enSg} (Instrumental case)`,
            meaningLt: 'su kuo? įrankis ar daiktas, naudojamas veikloje',
            exampleLt: `Su ${ltAdj('geru', 'gera')} ${noun.sg.ins} darbas vyksta greičiau.`,
          },
          {
            patternLt: `ieškoti ${noun.sg.gen}`,
            caseName: 'ieškoti + Kilmininkas',
            meaningUk: `шукати ${ukAccSg} (у литовській мові дієслово ieškoti вимагає родового відмінка — ko ieškoti?)`,
            meaningEn: `to look for the ${enSg} ("ieškoti" governs the Genitive case)`,
            meaningLt: 'veiksmažodis „ieškoti“ reikalauja kilmininko linksnio (ko?)',
            exampleLt: `Stalčiuje ieškojau ${noun.sg.gen}.`,
          },
        ],
        conversationalPhrases: [
          {
            lt: `Ar gali paduoti man ${ltAdj('tą', 'tą')} ${noun.sg.acc}?`,
            uk: `Чи можеш подати мені ${ukAdj('той', 'ту', 'те', 'ті')} ${ukAccSg}?`,
            en: `Could you pass me that ${enSg}?`,
            context: 'Kasdienis prašymas / Щоденне прохання',
          },
          {
            lt: `Kur padėjai ${noun.sg.acc}? Reikia čia pat.`,
            uk: `Куди ти поклав ${ukAccSg}? Потрібно просто зараз.`,
            en: `Where did you put the ${enSg}? I need it right now.`,
            context: 'Namuose / Удома',
          },
        ],
      };
    }

    case 'document_text_media': {
      return {
        collocations: [
          {
            phraseLt: `skaityti / peržiūrėti ${noun.sg.acc}`,
            transUk: `читати / переглядати ${ukAccSg}`,
            transEn: `to read / review the ${enSg}`,
            caseBadge: 'Galininkas (Acc.)',
            type: 'verb',
          },
          {
            phraseLt: `parengti / parašyti ${noun.sg.acc}`,
            transUk: `підготувати / написати ${ukAccSg}`,
            transEn: `to prepare / write ${enIndef(enSg)}`,
            caseBadge: 'Galininkas (Acc.)',
            type: 'verb',
          },
          {
            phraseLt: `aptarti ${noun.sg.acc}`,
            transUk: `обговорити ${ukAccSg}`,
            transEn: `to discuss the ${enSg}`,
            caseBadge: 'Galininkas (Acc.)',
            type: 'verb',
          },
          {
            phraseLt: `${ltAdj('svarbus ir naudingas', 'svarbi ir naudinga')} ${noun.lemma}`,
            transUk: `${ukAdj('важливий і корисний', 'важлива й корисна', 'важливе й корисне', 'важливі й корисні')} ${ukNomSg}`,
            transEn: `important and useful ${enSg}`,
            caseBadge: 'Būdvardis + Dkt.',
            type: 'adjective',
          },
        ],
        idioms: [
          {
            phraseLt: `Kas parašyta plunksna — neiškirsi ir kirviu`,
            transUk: `Що написано пером — не вирубаєш і сокирою`,
            transEn: `What is written in ink cannot be easily erased`,
            explanationUk: 'Зафіксоване в документі, книзі чи тексті слово має велику вагу й залишається в пам’яті.',
            explanationEn: 'Words recorded in documents or books carry lasting weight and responsibility.',
            explanationLt: 'Užrašytas žodis ar dokumentas turi tvirtą galią ir išlieka ilgam.',
            originOrStyle: 'Liaudies patarlė / Прислів’я',
          },
        ],
        governance: [
          {
            patternLt: `apie ${noun.sg.acc}`,
            caseName: 'apie + Galininkas',
            meaningUk: `про ${ukAccSg} (прийменник apie завжди керує знахідним відмінком)`,
            meaningEn: `about the ${enSg} ("apie" governs Accusative)`,
            meaningLt: 'prielinksnis „apie“ valdo galininko linksnį',
            exampleLt: `Kolegos kalbėjosi apie ${ltAdj('šį', 'šią')} ${noun.sg.acc}.`,
          },
          {
            patternLt: `ieškoti ${noun.sg.gen}`,
            caseName: 'ieškoti + Kilmininkas',
            meaningUk: `шукати ${ukAccSg} (дієслово ieškoti вимагає родового відмінка)`,
            meaningEn: `to look for the ${enSg} ("ieškoti" governs Genitive)`,
            meaningLt: 'veiksmažodis „ieškoti“ reikalauja kilmininko linksnio',
            exampleLt: `Aš ieškau reikalingo ${noun.sg.gen}.`,
          },
        ],
        conversationalPhrases: [
          {
            lt: `Ar jau perskaitei ${ltAdj('šį', 'šią')} ${noun.sg.acc}?`,
            uk: `Ти вже переглянув ${ukAdj('цей', 'цю', 'це', 'ці')} ${ukAccSg}?`,
            en: `Have you already read/checked this ${enSg}?`,
            context: 'Mokslas ir darbas / Навчання та робота',
          },
          {
            lt: `Nepamirškite patikrinti ${noun.sg.gen} prieš išvykdami.`,
            uk: `Не забудьте перевірити ${ukAccSg} перед виїздом.`,
            en: `Do not forget to check the ${enSg} before leaving.`,
            context: 'Priminimas / Нагадування',
          },
        ],
      };
    }

    case 'finance_commerce': {
      return {
        collocations: [
          {
            phraseLt: `patikrinti ${noun.sg.acc}`,
            transUk: `перевірити ${ukAccSg}`,
            transEn: `to check the ${enSg}`,
            caseBadge: 'Galininkas (Acc.)',
            type: 'verb',
          },
          {
            phraseLt: `susitarti dėl ${noun.sg.gen}`,
            transUk: `домовитися щодо ${ukGenSg}`,
            transEn: `to agree on the ${enSg}`,
            caseBadge: 'dėl + Kilmininkas',
            type: 'prep',
          },
          {
            phraseLt: `apskaičiuoti ${noun.sg.acc}`,
            transUk: `розрахувати ${ukAccSg}`,
            transEn: `to calculate the ${enSg}`,
            caseBadge: 'Galininkas (Acc.)',
            type: 'verb',
          },
          {
            phraseLt: `${ltAdj('tikslus', 'tiksli')} ${noun.lemma}`,
            transUk: `${ukAdj('точний', 'точна', 'точне', 'точні')} ${ukNomSg}`,
            transEn: `accurate ${enSg}`,
            caseBadge: 'Būdvardis + Dkt.',
            type: 'adjective',
          },
        ],
        idioms: [
          {
            phraseLt: `Sąskaita draugystės negadina`,
            transUk: `Точний розрахунок дружби не псує`,
            transEn: `Clear accounts keep friendships strong`,
            explanationUk: 'Прозорість і точність у фінансових та торговельних справах зміцнюють довіру.',
            explanationEn: 'Clarity and honesty in financial and commercial matters build lasting trust.',
            explanationLt: 'Aiškumas ir tikslumas finansiniuose reikaluose saugo gerus santykius.',
            originOrStyle: 'Liaudies patarlė / Прислів’я',
          },
        ],
        governance: [
          {
            patternLt: `dėl ${noun.sg.gen}`,
            caseName: 'dėl + Kilmininkas',
            meaningUk: `щодо ${ukGenSg} (прийменник dėl вимагає родового відмінка)`,
            meaningEn: `regarding / concerning the ${enSg} ("dėl" governs Genitive)`,
            meaningLt: 'prielinksnis „dėl“ reikalauja kilmininko linksnio',
            exampleLt: `Pirkėjas pasikonsultavo dėl ${noun.sg.gen}.`,
          },
          {
            patternLt: `už ${noun.sg.acc}`,
            caseName: 'už + Galininkas',
            meaningUk: `за ${ukAccSg} (оплата або відповідальність за щось — знахідний відмінок)`,
            meaningEn: `for the ${enSg} ("už" governs Accusative)`,
            meaningLt: 'prielinksnis „už“ su galininku nurodo atlygį ar mainus',
            exampleLt: `Dėkojame už laiku atliktą ${noun.sg.acc}.`,
          },
        ],
        conversationalPhrases: [
          {
            lt: `Norėčiau pasiteirauti dėl ${noun.sg.gen}.`,
            uk: `Я хотів би дізнатися щодо ${ukGenSg}.`,
            en: `I would like to inquire about the ${enSg}.`,
            context: 'Parduotuvėje ar banke / У магазині чи банку',
          },
          {
            lt: `Prašome patikslinti ${noun.sg.acc}.`,
            uk: `Уточніть, будь ласка, ${ukAccSg}.`,
            en: `Please clarify the ${enSg}.`,
            context: 'Dalykinis pokalbis / Ділова розмова',
          },
        ],
      };
    }

    case 'nature_landscape_plant': {
      return {
        collocations: [
          {
            phraseLt: `grožėtis ${noun.sg.ins}`,
            transUk: `милуватися ${ukInsSg}`,
            transEn: `to admire the ${enSg}`,
            caseBadge: 'grožėtis + Įnagininkas',
            type: 'verb',
          },
          {
            phraseLt: `saugoti ${noun.sg.acc}`,
            transUk: `берегти ${ukAccSg}`,
            transEn: `to protect the ${enSg}`,
            caseBadge: 'Galininkas (Acc.)',
            type: 'verb',
          },
          {
            phraseLt: `džiaugtis ${noun.sg.ins}`,
            transUk: `радіти ${ukDatSg}`,
            transEn: `to enjoy the ${enSg}`,
            caseBadge: 'džiaugtis + Įnagininkas',
            type: 'verb',
          },
          {
            phraseLt: `Lietuvos gamtos ${noun.lemma}`,
            transUk: `${ukNomSg} литовської природи`,
            transEn: `${enSg} of Lithuanian nature`,
            caseBadge: 'Kilmininkas + Dkt.',
            type: 'genitive',
          },
        ],
        idioms: [
          {
            phraseLt: `Gamta — visų mūsų namai`,
            transUk: `Природа — наш спільний дім`,
            transEn: `Nature is home to us all`,
            explanationUk: 'Любов до лісів, річок, рослин і краєвидів є невід’ємною рисою литовської культури.',
            explanationEn: 'Deep respect for forests, rivers, plants, and landscapes is central to Lithuanian culture.',
            explanationLt: 'Meilė miškams, upėms, augalams ir kraštovaizdžiui yra svarbi lietuvių kultūros dalis.',
            originOrStyle: 'Išminties posakis / Прислів’я',
          },
        ],
        governance: [
          {
            patternLt: `grožėtis / džiaugtis ${noun.sg.ins}`,
            caseName: 'Įnagininkas (Instrumental)',
            meaningUk: `милуватися (${ukInsSg}) та радіти (${ukDatSg}) у литовській мові керують орудним відмінком`,
            meaningEn: `verbs "grožėtis" (admire) and "džiaugtis" (enjoy) govern the Instrumental case`,
            meaningLt: 'veiksmažodžiai „grožėtis“ ir „džiaugtis“ reikalauja įnagininko',
            exampleLt: `Keliautojai ilgai grožėjosi ${noun.sg.ins}.`,
          },
        ],
        conversationalPhrases: [
          {
            lt: `Pažiūrėk, ${ltAdj('koks gražus', 'kokia graži')} ${noun.lemma}!`,
            uk: `Подивись, ${ukAdj('який гарний', 'яка гарна', 'яке гарне', 'які гарні')} ${ukNomSg}!`,
            en: `Look how beautiful the ${enSg} is!`,
            context: 'Poilsis gamtoje / Відпочинок на природі',
          },
          {
            lt: `Pasivaikščiojimas gamtoje suteikia daug jėgų ir ramybės.`,
            uk: `Прогулянка на природі додає багато сил і спокою.`,
            en: `A walk in nature brings plenty of energy and peace.`,
            context: 'Išvyka / Прогулянка',
          },
        ],
      };
    }

    case 'weather_element_material': {
      return {
        collocations: [
          {
            phraseLt: `stebėti ${noun.sg.acc}`,
            transUk: `спостерігати за ${ukInsSg}`,
            transEn: `to observe the ${enSg}`,
            caseBadge: 'Galininkas (Acc.)',
            type: 'verb',
          },
          {
            phraseLt: `apsisaugoti nuo ${noun.sg.gen}`,
            transUk: `захиститися від ${ukGenSg}`,
            transEn: `to protect against ${enSg}`,
            caseBadge: 'nuo + Kilmininkas',
            type: 'prep',
          },
          {
            phraseLt: `dėl ${noun.sg.gen}`,
            transUk: `через ${ukAccSg} / завдяки ${ukDatSg}`,
            transEn: `due to / because of ${enSg}`,
            caseBadge: 'dėl + Kilmininkas',
            type: 'prep',
          },
          {
            phraseLt: `${ltAdj('stiprus', 'stipri')} / ${ltAdj('grynas', 'gryna')} ${noun.lemma}`,
            transUk: `${ukAdj('природний', 'природна', 'природне', 'природні')} ${ukNomSg}`,
            transEn: `natural ${enSg}`,
            caseBadge: 'Būdvardis + Dkt.',
            type: 'adjective',
          },
        ],
        idioms: [
          {
            phraseLt: `Nėra blogo oro, yra tik netinkama apranga`,
            transUk: `Не буває поганої погоди, буває лише невідповідний одяг`,
            transEn: `There is no bad weather, only inappropriate clothing`,
            explanationUk: 'Популярна в Литві приказка про готовність до будь-яких природних умов і стихій.',
            explanationEn: 'Popular saying in Lithuania about being prepared for any weather or natural element.',
            explanationLt: 'Populiarus posakis apie pasirengimą bet kokioms gamtos sąlygoms.',
            originOrStyle: 'Šnekamasis posakis / Приказка',
          },
        ],
        governance: [
          {
            patternLt: `nuo ${noun.sg.gen}`,
            caseName: 'nuo + Kilmininkas',
            meaningUk: `від ${ukGenSg} (прийменник nuo керує родовим відмінком)`,
            meaningEn: `from / against ${enSg} ("nuo" governs Genitive)`,
            meaningLt: 'prielinksnis „nuo“ reikalauja kilmininko linksnio',
            exampleLt: `Svarbu tinkamai apsisaugoti nuo ${noun.sg.gen}.`,
          },
          {
            patternLt: `dėl ${noun.sg.gen}`,
            caseName: 'dėl + Kilmininkas',
            meaningUk: `через ${ukAccSg} (причина виражається прийменником dėl + родовий відмінок)`,
            meaningEn: `because of ${enSg} ("dėl" governs Genitive)`,
            meaningLt: 'priežasties raiška su prielinksniu „dėl“',
            exampleLt: `Dėl ${noun.sg.gen} teko pakoreguoti dienos planus.`,
          },
        ],
        conversationalPhrases: [
          {
            lt: `Šiandien lauke išties jaučiamas ${noun.lemma}.`,
            uk: `Сьогодні надворі справді відчувається ${ukNomSg}.`,
            en: `Today outside you can really feel the ${enSg}.`,
            context: 'Gamtos reiškiniai / Природні явища',
          },
          {
            lt: `Atkreipkite dėmesį į ${noun.sg.acc}.`,
            uk: `Зверніть увагу на ${ukAccSg}.`,
            en: `Pay attention to the ${enSg}.`,
            context: 'Kasdienis pokalbis / Щоденна розмова',
          },
        ],
      };
    }

    case 'scheduled_event': {
      return {
        collocations: [
          {
            phraseLt: `ruoštis ${noun.sg.dat}`,
            transUk: `готуватися до ${ukGenSg}`,
            transEn: `to prepare for the ${enSg}`,
            caseBadge: 'ruoštis + Naudininkas!',
            type: 'verb',
          },
          {
            phraseLt: `dalyvauti ${noun.sg.loc}`,
            transUk: `брати участь ${ukLocSgWithPrep}`,
            transEn: `to participate in the ${enSg}`,
            caseBadge: 'dalyvauti + Vietininkas',
            type: 'verb',
          },
          {
            phraseLt: `planuoti ${noun.sg.acc}`,
            transUk: `планувати ${ukAccSg}`,
            transEn: `to plan the ${enSg}`,
            caseBadge: 'Galininkas (Acc.)',
            type: 'verb',
          },
          {
            phraseLt: `per ${noun.sg.acc}`,
            transUk: `під час ${ukGenSg}`,
            transEn: `during the ${enSg}`,
            caseBadge: 'per + Galininkas',
            type: 'prep',
          },
          {
            phraseLt: `po ${noun.sg.gen}`,
            transUk: `після ${ukGenSg}`,
            transEn: `after the ${enSg}`,
            caseBadge: 'po + Kilmininkas',
            type: 'prep',
          },
        ],
        idioms: [
          {
            phraseLt: `Gera pradžia — pusė darbo`,
            transUk: `Добрий початок — половина справи`,
            transEn: `Well begun is half done`,
            explanationUk: 'Ретельна підготовка до події чи заходу забезпечує успішний результат.',
            explanationEn: 'Thorough preparation for an event or undertaking ensures success.',
            explanationLt: 'Kruopštus pasiruošimas renginiui ar veiklai lemia sėkmę.',
            originOrStyle: 'Liaudies patarlė / Прислів’я',
          },
        ],
        governance: [
          {
            patternLt: `ruoštis ${noun.sg.dat}`,
            caseName: 'ruoštis + Naudininkas (Dative)',
            meaningUk: `готуватися до ${ukGenSg} (важливо: у литовській мові дієслово „ruoštis“ вимагає ДАВАЛЬНОГО відмінка — kam ruoštis?)`,
            meaningEn: `to prepare for the ${enSg} (important: "ruoštis" governs the Dative case)`,
            meaningLt: 'veiksmažodis „ruoštis“ reikalauja naudininko linksnio (kam?)',
            exampleLt: `Mes iš anksto ruošiamės ${noun.sg.dat}.`,
          },
          {
            patternLt: `per ${noun.sg.acc} / po ${noun.sg.gen}`,
            caseName: 'per + Gal. / po + Kilm.',
            meaningUk: `під час ${ukGenSg} (per + знахідний) та після ${ukGenSg} (po + родовий)`,
            meaningEn: `during the ${enSg} (per + Acc.) and after the ${enSg} (po + Gen.)`,
            meaningLt: 'laiko raiška su prielinksniais „per“ ir „po“',
            exampleLt: `Susitiksime iš karto po ${noun.sg.gen}.`,
          },
        ],
        conversationalPhrases: [
          {
            lt: `Ar jau pasiruošei ${noun.sg.dat}?`,
            uk: `Ти вже підготувався до ${ukGenSg}?`,
            en: `Have you already prepared for the ${enSg}?`,
            context: 'Planavimas / Планування',
          },
          {
            lt: `Pasimatysime po ${noun.sg.gen}!`,
            uk: `Побачимося після ${ukGenSg}!`,
            en: `See you after the ${enSg}!`,
            context: 'Atsisveikinimas / Прощання',
          },
        ],
      };
    }

    case 'time_period_season': {
      return {
        collocations: [
          {
            phraseLt: `planuoti ${noun.sg.acc}`,
            transUk: `планувати ${ukAccSg}`,
            transEn: `to plan the ${enSg}`,
            caseBadge: 'Galininkas (Acc.)',
            type: 'verb',
          },
          {
            phraseLt: `per ${noun.sg.acc}`,
            transUk: `протягом ${ukGenSg}`,
            transEn: `during the ${enSg}`,
            caseBadge: 'per + Galininkas',
            type: 'prep',
          },
          {
            phraseLt: `iki ${noun.sg.gen}`,
            transUk: `до ${ukGenSg}`,
            transEn: `until the ${enSg}`,
            caseBadge: 'iki + Kilmininkas',
            type: 'prep',
          },
          {
            phraseLt: `po ${noun.sg.gen}`,
            transUk: `після ${ukGenSg}`,
            transEn: `after the ${enSg}`,
            caseBadge: 'po + Kilmininkas',
            type: 'prep',
          },
          {
            phraseLt: `${ltAdj('ramus ir malonus', 'rami ir maloni')} ${noun.lemma}`,
            transUk: `${ukAdj('спокійний і приємний', 'спокійна й приємна', 'спокійне й приємне', 'спокійні й приємні')} ${ukNomSg}`,
            transEn: `peaceful and pleasant ${enSg}`,
            caseBadge: 'Būdvardis + Dkt.',
            type: 'adjective',
          },
        ],
        idioms: [
          {
            phraseLt: `Viskam savas metas`,
            transUk: `Усьому свій час`,
            transEn: `There is a time and season for everything`,
            explanationUk: 'Кожна пора чи проміжок часу має свою красу та призначення.',
            explanationEn: 'Every season and period of time has its own value and purpose.',
            explanationLt: 'Kiekvienas laikotarpis ar metas turi savo prasmę ir grožį.',
            originOrStyle: 'Liaudies patarlė / Прислів’я',
          },
        ],
        governance: [
          {
            patternLt: `per ${noun.sg.acc}`,
            caseName: 'per + Galininkas',
            meaningUk: `протягом / за ${ukAccSg} (прийменник per зі знахідним відмінком вказує на тривалість)`,
            meaningEn: `during / over the ${enSg} ("per" + Accusative expresses duration)`,
            meaningLt: 'prielinksnis „per“ su galininku nusako laiko trukmę',
            exampleLt: `Per ${ltAdj('šį', 'šią')} ${noun.sg.acc} nuveikėme daug darbų.`,
          },
          {
            patternLt: `iki ${noun.sg.gen} / po ${noun.sg.gen}`,
            caseName: 'iki / po + Kilmininkas',
            meaningUk: `до ${ukGenSg} та після ${ukGenSg} (прийменники iki та po керують родовим відмінком)`,
            meaningEn: `until the ${enSg} and after the ${enSg} (govern Genitive)`,
            meaningLt: 'laiko ribos su prielinksniais „iki“ ir „po“',
            exampleLt: `Darbus baigsime iki ${noun.sg.gen}.`,
          },
        ],
        conversationalPhrases: [
          {
            lt: `Kokie tavo planai ${ltAdj('šiam', 'šiai')} ${noun.sg.dat}?`,
            uk: `Які в тебе плани на ${ukAdj('цей', 'цю', 'це', 'ці')} ${ukAccSg}?`,
            en: `What are your plans for this ${enSg}?`,
            context: 'Laiko planavimas / Планування часу',
          },
          {
            lt: `Linkiu tau gražaus ir ramaus laiko!`,
            uk: `Бажаю тобі гарного й спокійного часу!`,
            en: `I wish you a pleasant and peaceful time!`,
            context: 'Palinkėjimas / Побажання',
          },
        ],
      };
    }

    case 'abstract_concept':
    default: {
      return {
        collocations: [
          {
            phraseLt: `kalbėti apie ${noun.sg.acc}`,
            transUk: `говорити про ${ukAccSg}`,
            transEn: `to talk about ${enSg}`,
            caseBadge: 'apie + Galininkas',
            type: 'prep',
          },
          {
            phraseLt: `skirti dėmesį ${noun.sg.dat}`,
            transUk: `приділяти увагу ${ukDatSg}`,
            transEn: `to pay attention to ${enSg}`,
            caseBadge: 'Naudininkas (Dat.)',
            type: 'verb',
          },
          {
            phraseLt: `vertinti ${noun.sg.acc}`,
            transUk: `цінувати ${ukAccSg}`,
            transEn: `to value / appreciate ${enSg}`,
            caseBadge: 'Galininkas (Acc.)',
            type: 'verb',
          },
          {
            phraseLt: `${ltAdj('svarbus', 'svarbi')} ${noun.lemma}`,
            transUk: `${ukAdj('важливий', 'важлива', 'важливе', 'важливі')} ${ukNomSg}`,
            transEn: `important ${enSg}`,
            caseBadge: 'Būdvardis + Dkt.',
            type: 'adjective',
          },
          {
            phraseLt: `dėl ${noun.sg.gen}`,
            transUk: `заради / щодо ${ukGenSg}`,
            transEn: `regarding / for the sake of ${enSg}`,
            caseBadge: 'dėl + Kilmininkas',
            type: 'prep',
          },
        ],
        idioms: [
          {
            phraseLt: `Geras žodis širdį šildo`,
            transUk: `Добре слово серце гріє`,
            transEn: `A kind word warms the heart`,
            explanationUk: 'Щира думка, підтримка і взаємоповага допомагають досягти згоди в будь-якій справі.',
            explanationEn: 'Sincere communication and mutual respect foster understanding in every matter.',
            explanationLt: 'Nuoširdus bendravimas ir pagarba padeda pasiekti sutarimą.',
            originOrStyle: 'Liaudies patarlė / Прислів’я',
          },
        ],
        governance: [
          {
            patternLt: `apie ${noun.sg.acc}`,
            caseName: 'apie + Galininkas',
            meaningUk: `про що? розмова або думка про ${ukAccSg} (прийменник apie завжди керує знахідним відмінком)`,
            meaningEn: `about what? speaking or thinking about ${enSg} ("apie" governs Accusative)`,
            meaningLt: 'prielinksnis „apie“ visada reikalauja galininko linksnio',
            exampleLt: `Mes ilgai diskutavome apie ${ltAdj('šį', 'šią')} ${noun.sg.acc}.`,
          },
          {
            patternLt: `dėl ${noun.sg.gen}`,
            caseName: 'dėl + Kilmininkas',
            meaningUk: `щодо чого? / через що? (щодо ${ukGenSg}, прийменник dėl керує родовим відмінком)`,
            meaningEn: `regarding / due to ${enSg} ("dėl" governs Genitive)`,
            meaningLt: 'prielinksnis „dėl“ reikalauja kilmininko linksnio',
            exampleLt: `Visi greitai sutarėme dėl ${noun.sg.gen}.`,
          },
        ],
        conversationalPhrases: [
          {
            lt: `Kokia tavo nuomonė apie ${ltAdj('šį', 'šią')} ${noun.sg.acc}?`,
            uk: `Яка твоя думка про ${ukAdj('цей', 'цю', 'це', 'ці')} ${ukAccSg}?`,
            en: `What is your opinion about this ${enSg}?`,
            context: 'Diskusija / Дискусія',
          },
          {
            lt: `Tai labai svarbu kiekvienam iš mūsų.`,
            uk: `Це має велике значення для кожного з нас.`,
            en: `This is very important for each of us.`,
            context: 'Pokalbis / Розмова',
          },
        ],
      };
    }
  }
}
