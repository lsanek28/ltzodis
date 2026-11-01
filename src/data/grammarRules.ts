import {
  AppLanguage,
  DeclensionSubtype,
  DeclensionType,
  DifficultyLevel,
  GrammaticalCase,
  GrammaticalNumber,
  TopicId,
  TrainingMode,
} from '../types/grammar';

export const CASE_ORDER: GrammaticalCase[] = [
  'nom',
  'gen',
  'dat',
  'acc',
  'ins',
  'loc',
  'voc',
];

export interface PrepositionTranslationItem {
  prep: string;
  uk: string;
  en: string;
}

export interface CaseMetadata {
  id: GrammaticalCase;
  shortLt: string;
  nameLt: string;
  questionLt: string;
  name: Record<AppLanguage, string>;
  questionTranslated: Record<AppLanguage, string>;
  prepositionsLt: string[];
  prepositionsWithTranslations: PrepositionTranslationItem[];
  description: Record<AppLanguage, string>;
}

export const CASES_METADATA: Record<GrammaticalCase, CaseMetadata> = {
  nom: {
    id: 'nom',
    shortLt: 'V. (Nom.)',
    nameLt: 'Vardininkas',
    questionLt: 'Kas?',
    name: {
      uk: 'Називний (Vardininkas)',
      lt: 'Vardininkas',
      en: 'Nominative (Vardininkas)',
    },
    questionTranslated: {
      uk: 'Хто? Що?',
      lt: 'Kas?',
      en: 'Who? What?',
    },
    prepositionsLt: [],
    prepositionsWithTranslations: [],
    description: {
      uk: 'Початкова словникова форма іменника; позначає підмет у реченні.',
      lt: 'Pagrindinė žodžio forma, žyminti veiksnį sakinyje.',
      en: 'Dictionary base form of the noun; marks the subject of a sentence.',
    },
  },
  gen: {
    id: 'gen',
    shortLt: 'K. (Gen.)',
    nameLt: 'Kilmininkas',
    questionLt: 'Ko?',
    name: {
      uk: 'Родовий (Kilmininkas)',
      lt: 'Kilmininkas',
      en: 'Genitive (Kilmininkas)',
    },
    questionTranslated: {
      uk: 'Кого? Чого? Чий?',
      lt: 'Ko? Kieno?',
      en: 'Of whom? Of what? Whose?',
    },
    prepositionsLt: ['ant', 'be', 'dėl', 'iki', 'iš', 'nuo', 'po', 'prie', 'tarp', 'už', 'virš'],
    prepositionsWithTranslations: [
      { prep: 'ant', uk: 'на (поверхні)', en: 'on (top of)' },
      { prep: 'be', uk: 'без', en: 'without' },
      { prep: 'dėl', uk: 'через, заради, щодо', en: 'because of, for, concerning' },
      { prep: 'iki', uk: 'до (межі, часу)', en: 'until, up to' },
      { prep: 'iš', uk: 'з, із (зсередини)', en: 'from, out of' },
      { prep: 'nuo', uk: 'від, з (поверхні, часу)', en: 'from, since' },
      { prep: 'po', uk: 'після', en: 'after' },
      { prep: 'prie', uk: 'біля, коло', en: 'by, near, next to' },
      { prep: 'tarp', uk: 'між, серед', en: 'between, among' },
      { prep: 'už', uk: 'за (позаду чогось)', en: 'behind, beyond' },
      { prep: 'virš', uk: 'над', en: 'above, over' },
    ],
    description: {
      uk: 'Виражає приналежність, заперечення (немає чогось), кількість та вживається з більшістю прийменників (iš, nuo, prie, ant, be, iki).',
      lt: 'Rodo priklausomybę, neigimą, dalį ir vartojamas su prielinksniais: ant, be, dėl, iki, iš, nuo, prie, tarp, virš.',
      en: 'Expresses possession, negation, quantity, and is used with prepositions like ant, be, dėl, iki, iš, nuo, prie.',
    },
  },
  dat: {
    id: 'dat',
    shortLt: 'N. (Dat.)',
    nameLt: 'Naudininkas',
    questionLt: 'Kam?',
    name: {
      uk: 'Давальний (Naudininkas)',
      lt: 'Naudininkas',
      en: 'Dative (Naudininkas)',
    },
    questionTranslated: {
      uk: 'Кому? Чому?',
      lt: 'Kam?',
      en: 'To whom? For what?',
    },
    prepositionsLt: [],
    prepositionsWithTranslations: [],
    description: {
      uk: 'Вказує на адресата дії або особу, якій щось призначено (без прийменників).',
      lt: 'Nurodo asmenį ar daiktą, kuriam skiriamas veiksmas (vartojamas be prielinksnių).',
      en: 'Indicates the recipient or beneficiary of an action (never used with prepositions in standard Lithuanian).',
    },
  },
  acc: {
    id: 'acc',
    shortLt: 'G. (Acc.)',
    nameLt: 'Galininkas',
    questionLt: 'Ką?',
    name: {
      uk: 'Знахідний (Galininkas)',
      lt: 'Galininkas',
      en: 'Accusative (Galininkas)',
    },
    questionTranslated: {
      uk: 'Кого? Що?',
      lt: 'Ką?',
      en: 'Whom? What?',
    },
    prepositionsLt: ['apie', 'į', 'pagal', 'pas', 'per', 'po', 'prieš', 'pro', 'už'],
    prepositionsWithTranslations: [
      { prep: 'apie', uk: 'про, близько', en: 'about, around' },
      { prep: 'į', uk: 'в, у, на (напрямок руху)', en: 'into, to (direction)' },
      { prep: 'pagal', uk: 'згідно з, за', en: 'according to, by' },
      { prep: 'pas', uk: 'до (когось), у (когось)', en: 'to / at (someone’s place)' },
      { prep: 'per', uk: 'через, крізь, протягом', en: 'through, across, during' },
      { prep: 'po', uk: 'по (території)', en: 'around, throughout' },
      { prep: 'prieš', uk: 'перед, проти, тому (час)', en: 'before, against, ago' },
      { prep: 'pro', uk: 'повз, крізь', en: 'past, through' },
      { prep: 'už', uk: 'за (подяка, оплата, порівняння)', en: 'for (in exchange / thanks), than' },
    ],
    description: {
      uk: 'Прямий додаток (бачу/купляю що?), напрямок руху з прийменником į, а також час і вживання з apie, pas, per, prieš, už.',
      lt: 'Žymi tiesioginį objektą, judėjimo kryptį (į ką?) ir vartojamas su prielinksniais: apie, į, pagal, pas, per, prieš, pro, už.',
      en: 'Marks the direct object, direction of movement (į), and is used with prepositions apie, į, pagal, pas, per, prieš, pro, už.',
    },
  },
  ins: {
    id: 'ins',
    shortLt: 'Įn. (Inst.)',
    nameLt: 'Įnagininkas',
    questionLt: 'Kuo?',
    name: {
      uk: 'Орудний (Įnagininkas)',
      lt: 'Įnagininkas',
      en: 'Instrumental (Įnagininkas)',
    },
    questionTranslated: {
      uk: 'Ким? Чим?',
      lt: 'Kuo?',
      en: 'With whom? By what means?',
    },
    prepositionsLt: ['po', 'su'],
    prepositionsWithTranslations: [
      { prep: 'po', uk: 'під (чимось)', en: 'under, beneath' },
      { prep: 'su', uk: 'з (разом із ким/чим)', en: 'with (accompaniment)' },
    ],
    description: {
      uk: 'Означає знаряддя дії, транспорт (їхати чим — autobusu), професію або сумісність із прийменником su (з ким/чим).',
      lt: 'Rodo veiksmo įrankį, priemonę (važiuoti autobusu), profesiją arba vartojamas su prielinksniu „su“.',
      en: 'Expresses the instrument or means of action (e.g., traveling by bus), profession, or accompaniment with "su".',
    },
  },
  loc: {
    id: 'loc',
    shortLt: 'Vt. (Loc.)',
    nameLt: 'Vietininkas',
    questionLt: 'Kur? Kame?',
    name: {
      uk: 'Місцевий (Vietininkas)',
      lt: 'Vietininkas',
      en: 'Locative (Vietininkas)',
    },
    questionTranslated: {
      uk: 'Де? У чому?',
      lt: 'Kur? Kame?',
      en: 'Where? In what?',
    },
    prepositionsLt: [],
    prepositionsWithTranslations: [],
    description: {
      uk: 'Вказує на місце перебування всередині чогось (у будинку — name, у місті — mieste). У литовській мові вживається БЕЗ прийменника „в/у“!',
      lt: 'Nurodo buvimo vietą ar laiką. Lietuvių kalboje visada vartojamas BE prielinksnio (name, gatvėje, mieste).',
      en: 'Indicates location inside something or time. In Lithuanian it is ALWAYS used WITHOUT a preposition (name = in the house).',
    },
  },
  voc: {
    id: 'voc',
    shortLt: 'Š. (Voc.)',
    nameLt: 'Šauksmininkas',
    questionLt: 'Šauksmininkas (!)',
    name: {
      uk: 'Кличний (Šauksmininkas)',
      lt: 'Šauksmininkas',
      en: 'Vocative (Šauksmininkas)',
    },
    questionTranslated: {
      uk: 'Звертання (!)',
      lt: 'Kreipimasis (!)',
      en: 'Direct address (!)',
    },
    prepositionsLt: [],
    prepositionsWithTranslations: [],
    description: {
      uk: 'Використовується при прямому звертанні до особи чи предмета (Broli! Mama! Drauge!). У множині збігається з називним відмінком.',
      lt: 'Vartojamas kreipiantis į asmenį ar daiktą (Broli! Sūnau! Drauge!). Daugiskaitoje sutampa su vardininku.',
      en: 'Used when addressing someone or something directly (Broli! Sūnau!). In the plural, it always matches the Nominative.',
    },
  },
};

export interface DeclensionTableCell {
  endings: string;
  examples: string;
  examplesTranslated?: {
    uk: string;
    en: string;
  };
}

export interface DeclensionTableColumn {
  declension: DeclensionType;
  titleLt: string;
  title: Record<AppLanguage, string>;
  summary: Record<AppLanguage, string>;
  examplesLt: string[];
  examplesHeaderTranslated?: {
    uk: string;
    en: string;
  };
  singularEndings: Record<GrammaticalCase, DeclensionTableCell>;
  pluralEndings: Record<GrammaticalCase, DeclensionTableCell>;
}

/**
 * Exact table representation from the attached PDF "Daiktavardžių linksniavimas"
 */
export const DECLENSION_PDF_TABLE: DeclensionTableColumn[] = [
  {
    declension: 1,
    titleLt: '1 linksniuotė',
    title: {
      uk: '1 тип відмінювання (1 linksniuotė)',
      lt: '1 linksniuotė',
      en: '1st Declension (1 linksniuotė)',
    },
    summary: {
      uk: 'Іменники чоловічого роду із закінченнями -(i)as, -is, -ys у називному відмінку однини.',
      lt: 'Vyriškosios giminės daiktavardžiai, vardininke turintys galūnes -(i)as, -is, -ys.',
      en: 'Masculine nouns ending in -(i)as, -is, -ys in the nominative singular.',
    },
    examplesLt: ['namas', 'kelias', 'brolis', 'kambarys'],
    examplesHeaderTranslated: {
      uk: 'будинок, дорога, брат, кімната',
      en: 'house, road, brother, room',
    },
    singularEndings: {
      nom: {
        endings: '-(i)as, -is, -ys',
        examples: 'namas, kelias, brolis, kambarys',
        examplesTranslated: {
          uk: 'будинок, дорога, брат, кімната',
          en: 'house, road, brother, room',
        },
      },
      gen: {
        endings: '-(i)o',
        examples: 'namo, kelio, brolio, kambario',
        examplesTranslated: {
          uk: 'будинку, дороги, брата, кімнати',
          en: 'of a house, of a road, of a brother, of a room',
        },
      },
      dat: {
        endings: '-(i)ui',
        examples: 'namui, keliui, broliui, kambariui',
        examplesTranslated: {
          uk: 'будинкові (будинку), дорозі, братові (брату), кімнаті',
          en: 'to a house, to a road, to a brother, to a room',
        },
      },
      acc: {
        endings: '-(i)ą, -į',
        examples: 'namą, kelią, brolį, kambarį',
        examplesTranslated: {
          uk: 'будинок, дорогу, брата, кімнату',
          en: 'house, road, brother, room (obj.)',
        },
      },
      ins: {
        endings: '-(i)u',
        examples: 'namu, keliu, broliu, kambariu',
        examplesTranslated: {
          uk: 'будинком, дорогою, братом, кімнатою',
          en: 'with/by a house, road, brother, room',
        },
      },
      loc: {
        endings: '-e, -yje',
        examples: 'name, kelyje, brolyje, kambaryje',
        examplesTranslated: {
          uk: 'у будинку, на дорозі, у братові (браті), у кімнаті',
          en: 'in a house, on a road, in a brother, in a room',
        },
      },
      voc: {
        endings: '-e, -i, -y',
        examples: 'name, broli, kambary',
        examplesTranslated: {
          uk: 'будинку!, брате!, кімнато!',
          en: 'O house!, brother!, room!',
        },
      },
    },
    pluralEndings: {
      nom: {
        endings: '-(i)ai',
        examples: 'namai, keliai, broliai, kambariai',
        examplesTranslated: {
          uk: 'будинки, дороги, брати, кімнати',
          en: 'houses, roads, brothers, rooms',
        },
      },
      gen: {
        endings: '-(i)ų',
        examples: 'namų, kelių, brolių, kambarių',
        examplesTranslated: {
          uk: 'будинків, доріг, братів, кімнат',
          en: 'of houses, of roads, of brothers, of rooms',
        },
      },
      dat: {
        endings: '-(i)ams',
        examples: 'namams, keliams, broliams, kambariams',
        examplesTranslated: {
          uk: 'будинкам, дорогам, братам, кімнатам',
          en: 'to houses, to roads, to brothers, to rooms',
        },
      },
      acc: {
        endings: '-(i)us',
        examples: 'namus, kelius, brolius, kambarius',
        examplesTranslated: {
          uk: 'будинки, дороги, братів, кімнати',
          en: 'houses, roads, brothers, rooms (obj.)',
        },
      },
      ins: {
        endings: '-(i)ais',
        examples: 'namais, keliais, broliais, kambariais',
        examplesTranslated: {
          uk: 'будинками, дорогами, братами, кімнатами',
          en: 'with/by houses, roads, brothers, rooms',
        },
      },
      loc: {
        endings: '-(i)uose',
        examples: 'namuose, keliuose, broliuose, kambariuose',
        examplesTranslated: {
          uk: 'у будинках, на дорогах, у братах, у кімнатах',
          en: 'in houses, on roads, in brothers, in rooms',
        },
      },
      voc: {
        endings: '-(i)ai',
        examples: 'namai, keliai, broliai, kambariai',
        examplesTranslated: {
          uk: 'будинки!, дороги!, брати!, кімнати!',
          en: 'O houses!, roads!, brothers!, rooms!',
        },
      },
    },
  },
  {
    declension: 2,
    titleLt: '2 linksniuotė',
    title: {
      uk: '2 тип відмінювання (2 linksniuotė)',
      lt: '2 linksniuotė',
      en: '2nd Declension (2 linksniuotė)',
    },
    summary: {
      uk: 'Переважно іменники жіночого роду із закінченнями -(i)a, -ė у називному відмінку однини.',
      lt: 'Dažniausiai moteriškosios giminės daiktavardžiai, vardininke turintys galūnes -(i)a, -ė.',
      en: 'Mostly feminine nouns ending in -(i)a, -ė in the nominative singular.',
    },
    examplesLt: ['knyga', 'vyšnia', 'gatvė'],
    examplesHeaderTranslated: {
      uk: 'книга, вишня, вулиця',
      en: 'book, cherry, street',
    },
    singularEndings: {
      nom: {
        endings: '-(i)a, -ė',
        examples: 'knyga, vyšnia, gatvė',
        examplesTranslated: {
          uk: 'книга, вишня, вулиця',
          en: 'book, cherry, street',
        },
      },
      gen: {
        endings: '-(i)os, -ės',
        examples: 'knygos, vyšnios, gatvės',
        examplesTranslated: {
          uk: 'книги, вишні, вулиці',
          en: 'of a book, of a cherry, of a street',
        },
      },
      dat: {
        endings: '-(i)ai, -ei',
        examples: 'knygai, vyšniai, gatvei',
        examplesTranslated: {
          uk: 'книзі, вишні, вулиці',
          en: 'to a book, to a cherry, to a street',
        },
      },
      acc: {
        endings: '-(i)ą, -ę',
        examples: 'knygą, vyšnią, gatvę',
        examplesTranslated: {
          uk: 'книгу, вишню, вулицю',
          en: 'book, cherry, street (obj.)',
        },
      },
      ins: {
        endings: '-(i)a, -e',
        examples: 'knyga, vyšnia, gatve',
        examplesTranslated: {
          uk: 'книгою, вишнею, вулицею',
          en: 'with/by a book, cherry, street',
        },
      },
      loc: {
        endings: '-(i)oje, -ėje',
        examples: 'knygoje, vyšnioje, gatvėje',
        examplesTranslated: {
          uk: 'у книзі, у вишні, на вулиці',
          en: 'in a book, in a cherry, on a street',
        },
      },
      voc: {
        endings: '-(i)a, -e',
        examples: 'knyga, vyšnia, gatve',
        examplesTranslated: {
          uk: 'книго!, вишне!, вулице!',
          en: 'O book!, cherry!, street!',
        },
      },
    },
    pluralEndings: {
      nom: {
        endings: '-(i)os, -ės',
        examples: 'knygos, vyšnios, gatvės',
        examplesTranslated: {
          uk: 'книги, вишні, вулиці',
          en: 'books, cherries, streets',
        },
      },
      gen: {
        endings: '-(i)ų',
        examples: 'knygų, vyšnių, gatvių',
        examplesTranslated: {
          uk: 'книг, вишень, вулиць',
          en: 'of books, of cherries, of streets',
        },
      },
      dat: {
        endings: '-(i)oms, -ėms',
        examples: 'knygoms, vyšnioms, gatvėms',
        examplesTranslated: {
          uk: 'книгам, вишням, вулицям',
          en: 'to books, to cherries, to streets',
        },
      },
      acc: {
        endings: '-(i)as, -es',
        examples: 'knygas, vyšnias, gatves',
        examplesTranslated: {
          uk: 'книги, вишні, вулиці',
          en: 'books, cherries, streets (obj.)',
        },
      },
      ins: {
        endings: '-(i)omis, -ėmis',
        examples: 'knygomis, vyšniomis, gatvėmis',
        examplesTranslated: {
          uk: 'книгами, вишнями, вулицями',
          en: 'with/by books, cherries, streets',
        },
      },
      loc: {
        endings: '-(i)ose, -ėse',
        examples: 'knygose, vyšniose, gatvėse',
        examplesTranslated: {
          uk: 'у книгах, у вишнях, на вулицях',
          en: 'in books, in cherries, on streets',
        },
      },
      voc: {
        endings: '-(i)os, -ės',
        examples: 'knygos, vyšnios, gatvės',
        examplesTranslated: {
          uk: 'книги!, вишні!, вулиці!',
          en: 'O books!, cherries!, streets!',
        },
      },
    },
  },
  {
    declension: 3,
    titleLt: '3 linksniuotė',
    title: {
      uk: '3 тип відмінювання (3 linksniuotė)',
      lt: '3 linksniuotė',
      en: '3rd Declension (3 linksniuotė)',
    },
    summary: {
      uk: 'Іменники жіночого та чоловічого роду на -is, які в родовому однини мають закінчення -ies (pilis → pilies, dantis → danties).',
      lt: 'Moteriškosios ir vyriškosios giminės daiktavardžiai su galūne -is, kilmininke turintys -ies.',
      en: 'Feminine and masculine nouns ending in -is whose genitive singular ends in -ies.',
    },
    examplesLt: ['pilis', 'dantis'],
    examplesHeaderTranslated: {
      uk: 'замок, зуб',
      en: 'castle, tooth',
    },
    singularEndings: {
      nom: {
        endings: '-is',
        examples: 'pilis, dantis',
        examplesTranslated: {
          uk: 'замок, зуб',
          en: 'castle, tooth',
        },
      },
      gen: {
        endings: '-ies',
        examples: 'pilies, danties',
        examplesTranslated: {
          uk: 'замку, зуба',
          en: 'of a castle, of a tooth',
        },
      },
      dat: {
        endings: '-iai, -iui',
        examples: 'piliai, dančiui',
        examplesTranslated: {
          uk: 'замкові (замку), зубові (зубу)',
          en: 'to a castle, to a tooth',
        },
      },
      acc: {
        endings: '-į',
        examples: 'pilį, dantį',
        examplesTranslated: {
          uk: 'замок, зуб',
          en: 'castle, tooth (obj.)',
        },
      },
      ins: {
        endings: '-imi',
        examples: 'pilimi, dantimi',
        examplesTranslated: {
          uk: 'замком, зубом',
          en: 'with/by a castle, tooth',
        },
      },
      loc: {
        endings: '-yje',
        examples: 'pilyje, dantyje',
        examplesTranslated: {
          uk: 'у замку, у зубі',
          en: 'in a castle, in a tooth',
        },
      },
      voc: {
        endings: '-ie',
        examples: 'pilie, dantie',
        examplesTranslated: {
          uk: 'замку!, зубе!',
          en: 'O castle!, tooth!',
        },
      },
    },
    pluralEndings: {
      nom: {
        endings: '-ys',
        examples: 'pilys, dantys',
        examplesTranslated: {
          uk: 'замки, зуби',
          en: 'castles, teeth',
        },
      },
      gen: {
        endings: '-ių, -ų',
        examples: 'pilių, dantų',
        examplesTranslated: {
          uk: 'замків, зубів',
          en: 'of castles, of teeth',
        },
      },
      dat: {
        endings: '-ims',
        examples: 'pilims, dantims',
        examplesTranslated: {
          uk: 'замкам, зубам',
          en: 'to castles, to teeth',
        },
      },
      acc: {
        endings: '-is',
        examples: 'pilis, dantis',
        examplesTranslated: {
          uk: 'замки, зуби',
          en: 'castles, teeth (obj.)',
        },
      },
      ins: {
        endings: '-imis',
        examples: 'pilimis, dantimis',
        examplesTranslated: {
          uk: 'замками, зубами',
          en: 'with/by castles, teeth',
        },
      },
      loc: {
        endings: '-yse',
        examples: 'pilyse, dantyse',
        examplesTranslated: {
          uk: 'у замках, у зубах',
          en: 'in castles, in teeth',
        },
      },
      voc: {
        endings: '-ys',
        examples: 'pilys, dantys',
        examplesTranslated: {
          uk: 'замки!, зуби!',
          en: 'O castles!, teeth!',
        },
      },
    },
  },
  {
    declension: 4,
    titleLt: '4 linksniuotė',
    title: {
      uk: '4 тип відмінювання (4 linksniuotė)',
      lt: '4 linksniuotė',
      en: '4th Declension (4 linksniuotė)',
    },
    summary: {
      uk: 'Іменники чоловічого роду із закінченням -(i)us у називному однини та -(i)aus у родовому однини.',
      lt: 'Vyriškosios giminės daiktavardžiai, vardininke turintys galūnę -(i)us, o kilmininke -(i)aus.',
      en: 'Masculine nouns ending in -(i)us in nominative singular and -(i)aus in genitive singular.',
    },
    examplesLt: ['sūnus', 'vaisius'],
    examplesHeaderTranslated: {
      uk: 'син, плід (фрукт)',
      en: 'son, fruit',
    },
    singularEndings: {
      nom: {
        endings: '-(i)us',
        examples: 'sūnus, vaisius',
        examplesTranslated: {
          uk: 'син, плід (фрукт)',
          en: 'son, fruit',
        },
      },
      gen: {
        endings: '-(i)aus',
        examples: 'sūnaus, vaisiaus',
        examplesTranslated: {
          uk: 'сина, плоду (фрукта)',
          en: 'of a son, of a fruit',
        },
      },
      dat: {
        endings: '-(i)ui',
        examples: 'sūnui, vaisiui',
        examplesTranslated: {
          uk: 'синові (сину), плодові (фрукту)',
          en: 'to a son, to a fruit',
        },
      },
      acc: {
        endings: '-(i)ų',
        examples: 'sūnų, vaisių',
        examplesTranslated: {
          uk: 'сина, плід (фрукт)',
          en: 'son, fruit (obj.)',
        },
      },
      ins: {
        endings: '-(i)umi',
        examples: 'sūnumi, vaisiumi',
        examplesTranslated: {
          uk: 'сином, плодом (фруктом)',
          en: 'with/by a son, fruit',
        },
      },
      loc: {
        endings: '-(i)uje',
        examples: 'sūnuje, vaisiuje',
        examplesTranslated: {
          uk: 'у синові (сині), у плоді (фрукті)',
          en: 'in a son, in a fruit',
        },
      },
      voc: {
        endings: '-(i)au',
        examples: 'sūnau, vaisiau',
        examplesTranslated: {
          uk: 'сину!, плоде (фрукте)!',
          en: 'O son!, fruit!',
        },
      },
    },
    pluralEndings: {
      nom: {
        endings: '-ūs, -iai',
        examples: 'sūnūs, vaisiai',
        examplesTranslated: {
          uk: 'сини, плоди (фрукти)',
          en: 'sons, fruits',
        },
      },
      gen: {
        endings: '-(i)ų',
        examples: 'sūnų, vaisių',
        examplesTranslated: {
          uk: 'синів, плодів (фруктів)',
          en: 'of sons, of fruits',
        },
      },
      dat: {
        endings: '-ums, -iams',
        examples: 'sūnums, vaisiams',
        examplesTranslated: {
          uk: 'синам, плодам (фруктам)',
          en: 'to sons, to fruits',
        },
      },
      acc: {
        endings: '-(i)us',
        examples: 'sūnus, vaisius',
        examplesTranslated: {
          uk: 'синів, плоди (фрукти)',
          en: 'sons, fruits (obj.)',
        },
      },
      ins: {
        endings: '-umis, -iais',
        examples: 'sūnumis, vaisiais',
        examplesTranslated: {
          uk: 'синами, плодами (фруктами)',
          en: 'with/by sons, fruits',
        },
      },
      loc: {
        endings: '-(i)uose',
        examples: 'sūnuose, vaisiuose',
        examplesTranslated: {
          uk: 'у синах, у плодах (фруктах)',
          en: 'in sons, in fruits',
        },
      },
      voc: {
        endings: '-ūs, -iai',
        examples: 'sūnūs, vaisiai',
        examplesTranslated: {
          uk: 'сини!, плоди (фрукти)!',
          en: 'O sons!, fruits!',
        },
      },
    },
  },
  {
    declension: 5,
    titleLt: '5 linksniuotė',
    title: {
      uk: '5 тип відмінювання (5 linksniuotė)',
      lt: '5 linksniuotė',
      en: '5th Declension (5 linksniuotė)',
    },
    summary: {
      uk: 'Приголосна основа: чоловічі іменники на -uo (akmuo → akmens) та два жіночі слова sesuo (sesers) і duktė (dukters) із суфіксами -en- / -er-.',
      lt: 'Priebalsinio kamieno daiktavardžiai su galūnėmis -uo (akmuo → akmens) ir mot. g. žodžiai sesuo (sesers), duktė (dukters).',
      en: 'Consonant-stem nouns: masculine nouns in -uo (akmuo → akmens) and feminine sesuo (sesers) and duktė (dukters) with -en- / -er- stems.',
    },
    examplesLt: ['akmuo', 'sesuo', 'duktė'],
    examplesHeaderTranslated: {
      uk: 'камінь, сестра, дочка',
      en: 'stone, sister, daughter',
    },
    singularEndings: {
      nom: {
        endings: '-uo, -ė',
        examples: 'akmuo, sesuo, duktė',
        examplesTranslated: {
          uk: 'камінь, сестра, дочка',
          en: 'stone, sister, daughter',
        },
      },
      gen: {
        endings: '-en-s, -er-s',
        examples: 'akmens, sesers, dukters',
        examplesTranslated: {
          uk: 'каменя, сестри, дочки',
          en: 'of a stone, of a sister, of a daughter',
        },
      },
      dat: {
        endings: '-en-iui, -er-iai',
        examples: 'akmeniui, seseriai, dukteriai',
        examplesTranslated: {
          uk: 'каменеві (каменю), сестрі, дочці',
          en: 'to a stone, to a sister, to a daughter',
        },
      },
      acc: {
        endings: '-en-į, -er-į',
        examples: 'akmenį, seserį, dukterį',
        examplesTranslated: {
          uk: 'камінь, сестру, дочку',
          en: 'stone, sister, daughter (obj.)',
        },
      },
      ins: {
        endings: '-en-iu, -er-ia',
        examples: 'akmeniu, seseria, dukteria',
        examplesTranslated: {
          uk: 'каменем, сестрою, дочкою',
          en: 'with/by a stone, sister, daughter',
        },
      },
      loc: {
        endings: '-en-yje, -er-yje',
        examples: 'akmenyje, seseryje, dukteryje',
        examplesTranslated: {
          uk: 'у камені, у сестрі, у дочці',
          en: 'in a stone, in a sister, in a daughter',
        },
      },
      voc: {
        endings: '-en-ie, -er-ie',
        examples: 'akmenie, seserie, dukterie',
        examplesTranslated: {
          uk: 'каменю!, сестро!, дочко!',
          en: 'O stone!, sister!, daughter!',
        },
      },
    },
    pluralEndings: {
      nom: {
        endings: '-en-ys, -er-ys',
        examples: 'akmenys, seserys, dukterys',
        examplesTranslated: {
          uk: 'камені, сестри, дочки',
          en: 'stones, sisters, daughters',
        },
      },
      gen: {
        endings: '-en-ų, -er-ų',
        examples: 'akmenų, seserų, dukterų',
        examplesTranslated: {
          uk: 'каменів, сестер, дочок',
          en: 'of stones, of sisters, of daughters',
        },
      },
      dat: {
        endings: '-en-ims, -er-ims',
        examples: 'akmenims, seserims, dukterims',
        examplesTranslated: {
          uk: 'каменям, сестрам, дочкам',
          en: 'to stones, to sisters, to daughters',
        },
      },
      acc: {
        endings: '-en-is, -er-is',
        examples: 'akmenis, seseris, dukteris',
        examplesTranslated: {
          uk: 'камені, сестер, дочок',
          en: 'stones, sisters, daughters (obj.)',
        },
      },
      ins: {
        endings: '-en-imis, -er-imis',
        examples: 'akmenimis, seserimis, dukterimis',
        examplesTranslated: {
          uk: 'каменями, сестрами, дочками',
          en: 'with/by stones, sisters, daughters',
        },
      },
      loc: {
        endings: '-en-yse, -er-yse',
        examples: 'akmenyse, seseryse, dukteryse',
        examplesTranslated: {
          uk: 'у каменях, у сестрах, у дочках',
          en: 'in stones, in sisters, in daughters',
        },
      },
      voc: {
        endings: '-en-ys, -er-ys',
        examples: 'akmenys, seserys, dukterys',
        examplesTranslated: {
          uk: 'камені!, сестри!, дочки!',
          en: 'O stones!, sisters!, daughters!',
        },
      },
    },
  },
];

export const SUBTYPE_ENDINGS: Record<
  DeclensionSubtype,
  {
    sg: Record<GrammaticalCase, string>;
    pl: Record<GrammaticalCase, string>;
    modelWord: string;
  }
> = {
  '1_as': {
    modelWord: 'namas',
    sg: { nom: 'as', gen: 'o', dat: 'ui', acc: 'ą', ins: 'u', loc: 'e', voc: 'e' },
    pl: { nom: 'ai', gen: 'ų', dat: 'ams', acc: 'us', ins: 'ais', loc: 'uose', voc: 'ai' },
  },
  '1_ias': {
    modelWord: 'kelias',
    sg: { nom: 'ias', gen: 'io', dat: 'iui', acc: 'ią', ins: 'iu', loc: 'yje', voc: 'y' },
    pl: { nom: 'iai', gen: 'ių', dat: 'iams', acc: 'ius', ins: 'iais', loc: 'iuose', voc: 'iai' },
  },
  '1_is': {
    modelWord: 'brolis',
    sg: { nom: 'is', gen: 'io', dat: 'iui', acc: 'į', ins: 'iu', loc: 'yje', voc: 'i' },
    pl: { nom: 'iai', gen: 'ių', dat: 'iams', acc: 'ius', ins: 'iais', loc: 'iuose', voc: 'iai' },
  },
  '1_ys': {
    modelWord: 'kambarys',
    sg: { nom: 'ys', gen: 'io', dat: 'iui', acc: 'į', ins: 'iu', loc: 'yje', voc: 'y' },
    pl: { nom: 'iai', gen: 'ių', dat: 'iams', acc: 'ius', ins: 'iais', loc: 'iuose', voc: 'iai' },
  },
  '2_a': {
    modelWord: 'knyga',
    sg: { nom: 'a', gen: 'os', dat: 'ai', acc: 'ą', ins: 'a', loc: 'oje', voc: 'a' },
    pl: { nom: 'os', gen: 'ų', dat: 'oms', acc: 'as', ins: 'omis', loc: 'ose', voc: 'os' },
  },
  '2_ia': {
    modelWord: 'vyšnia',
    sg: { nom: 'ia', gen: 'ios', dat: 'iai', acc: 'ią', ins: 'ia', loc: 'ioje', voc: 'ia' },
    pl: { nom: 'ios', gen: 'ių', dat: 'ioms', acc: 'ias', ins: 'iomis', loc: 'iose', voc: 'ios' },
  },
  '2_e': {
    modelWord: 'gatvė',
    sg: { nom: 'ė', gen: 'ės', dat: 'ei', acc: 'ę', ins: 'e', loc: 'ėje', voc: 'e' },
    pl: { nom: 'ės', gen: 'ių', dat: 'ėms', acc: 'es', ins: 'ėmis', loc: 'ėse', voc: 'ės' },
  },
  '3_is_f': {
    modelWord: 'pilis',
    sg: { nom: 'is', gen: 'ies', dat: 'iai', acc: 'į', ins: 'imi', loc: 'yje', voc: 'ie' },
    pl: { nom: 'ys', gen: 'ių', dat: 'ims', acc: 'is', ins: 'imis', loc: 'yse', voc: 'ys' },
  },
  '3_is_m': {
    modelWord: 'dantis',
    sg: { nom: 'is', gen: 'ies', dat: 'iui', acc: 'į', ins: 'imi', loc: 'yje', voc: 'ie' },
    pl: { nom: 'ys', gen: 'ų', dat: 'ims', acc: 'is', ins: 'imis', loc: 'yse', voc: 'ys' },
  },
  '4_us': {
    modelWord: 'sūnus',
    sg: { nom: 'us', gen: 'aus', dat: 'ui', acc: 'ų', ins: 'umi', loc: 'uje', voc: 'au' },
    pl: { nom: 'ūs', gen: 'ų', dat: 'ums', acc: 'us', ins: 'umis', loc: 'uose', voc: 'ūs' },
  },
  '4_ius': {
    modelWord: 'vaisius',
    sg: { nom: 'ius', gen: 'iaus', dat: 'iui', acc: 'ių', ins: 'iumi', loc: 'iuje', voc: 'iau' },
    pl: { nom: 'iai', gen: 'ių', dat: 'iams', acc: 'ius', ins: 'iais', loc: 'iuose', voc: 'iai' },
  },
  '5_uo': {
    modelWord: 'akmuo',
    sg: { nom: 'uo', gen: 'ens', dat: 'eniui', acc: 'enį', ins: 'eniu', loc: 'enyje', voc: 'enie' },
    pl: { nom: 'enys', gen: 'enų', dat: 'enims', acc: 'enis', ins: 'enimis', loc: 'enyse', voc: 'enys' },
  },
  '5_e': {
    modelWord: 'duktė / sesuo',
    sg: { nom: 'ė / uo', gen: 'ers', dat: 'eriai', acc: 'erį', ins: 'eria', loc: 'eryje', voc: 'erie' },
    pl: { nom: 'erys', gen: 'erų', dat: 'erims', acc: 'eris', ins: 'erimis', loc: 'eryse', voc: 'erys' },
  },
};

export const TOPICS_METADATA: Record<
  TopicId,
  {
    id: TopicId;
    label: Record<AppLanguage, string>;
    description: Record<AppLanguage, string>;
  }
> = {
  family: {
    id: 'family',
    label: { uk: "Сім'я та люди", lt: 'Šeima ir žmonės', en: 'Family & People' },
    description: { uk: 'Родичі, друзі, стосунки та вікові групи', lt: 'Giminaičiai, draugai ir santykiai', en: 'Relatives, friends, relationships' },
  },
  home: {
    id: 'home',
    label: { uk: 'Дім і меблі', lt: 'Namai ir baldai', en: 'Home & Furniture' },
    description: { uk: 'Житло, кімнати, інтер’єр і побутові речі', lt: 'Būstas, kambariai ir interjeras', en: 'Housing, rooms, and interior items' },
  },
  food: {
    id: 'food',
    label: { uk: 'Їжа та напої', lt: 'Maistas ir gėrimai', en: 'Food & Drinks' },
    description: { uk: 'Продукти, страви, фрукти, овочі та напої', lt: 'Produktai, patiekalai ir gėrimai', en: 'Groceries, dishes, fruits, and beverages' },
  },
  shopping: {
    id: 'shopping',
    label: { uk: 'Магазини й покупки', lt: 'Parduotuvės ir pirkiniai', en: 'Shops & Shopping' },
    description: { uk: 'Ціни, оплата, ринок, замовлення та чеки', lt: 'Kainos, mokėjimai, turgus ir čekiai', en: 'Prices, payments, market, and receipts' },
  },
  work: {
    id: 'work',
    label: { uk: 'Робота та професії', lt: 'Darbas ir profesijos', en: 'Work & Professions' },
    description: { uk: 'Фахівці, офіс, кар’єра та робочі процеси', lt: 'Specialistai, biuras ir karjera', en: 'Specialists, office, and career' },
  },
  transport: {
    id: 'transport',
    label: { uk: 'Транспорт і автомобілі', lt: 'Transportas ir automobiliai', en: 'Transport & Cars' },
    description: { uk: 'Громадський транспорт, авто, дорога та рух', lt: 'Viešasis transportas, kelias ir eismas', en: 'Public transit, vehicles, and roads' },
  },
  city: {
    id: 'city',
    label: { uk: 'Місто та місця', lt: 'Miestas ir vietos', en: 'City & Places' },
    description: { uk: 'Вулиці, установи, парки та інфраструктура', lt: 'Gatvės, įstaigos ir parkai', en: 'Streets, institutions, and parks' },
  },
  school: {
    id: 'school',
    label: { uk: 'Школа й навчання', lt: 'Mokykla ir mokslas', en: 'School & Education' },
    description: { uk: 'Університет, книги, уроки, мова та знання', lt: 'Universitetas, knygos, pamokos ir kalba', en: 'University, books, lessons, and language' },
  },
  nature: {
    id: 'nature',
    label: { uk: 'Природа та погода', lt: 'Gamta ir orai', en: 'Nature & Weather' },
    description: { uk: 'Стихії, рослини, тварини, ландшафт і клімат', lt: 'Augalai, gyvūnai, kraštovaizdis ir klimatas', en: 'Elements, plants, animals, and climate' },
  },
  health: {
    id: 'health',
    label: { uk: "Здоров'я та аптека", lt: 'Sveikata ir vaistinė', en: 'Health & Pharmacy' },
    description: { uk: 'Тіло людини, лікування, ліки та самопочуття', lt: 'Kūno dalys, gydymas ir vaistai', en: 'Human body, treatment, and medicine' },
  },
  clothing: {
    id: 'clothing',
    label: { uk: 'Одяг і предмети побуту', lt: 'Drabužiai ir buitis', en: 'Clothing & Household' },
    description: { uk: 'Гардероб, взуття, аксесуари та щоденні речі', lt: 'Apranga, avalynė ir kasdieniai daiktai', en: 'Wardrobe, footwear, and everyday items' },
  },
  travel: {
    id: 'travel',
    label: { uk: 'Подорожі', lt: 'Kelionės', en: 'Travel' },
    description: { uk: 'Готель, вокзал, аеропорт, квитки та відпочинок', lt: 'Viešbutis, oro uostas, bilietai ir poilsis', en: 'Hotel, airport, tickets, and vacation' },
  },
  time: {
    id: 'time',
    label: { uk: 'Час і повсякденне життя', lt: 'Laikas ir kasdienybė', en: 'Time & Daily Life' },
    description: { uk: 'Дні, пори року, частини доби та розклад', lt: 'Dienos, metų laikai ir tvarkaraštis', en: 'Days, seasons, times of day, and schedule' },
  },
  abstract: {
    id: 'abstract',
    label: { uk: 'Абстрактні поняття та інше', lt: 'Abstrakčios sąvokos ir kita', en: 'Abstract Concepts & More' },
    description: { uk: 'Думки, почуття, правила, культура та суспільство', lt: 'Mintys, jausmai, taisyklės ir kultūra', en: 'Thoughts, feelings, rules, and culture' },
  },
};

export const DIFFICULTY_CEFR_LABELS: Record<DifficultyLevel, string> = {
  1: 'A0–A1',
  2: 'A1–A2',
  3: 'A2–B1',
  4: 'B1–B2',
};

export const DIFFICULTY_METADATA: Record<
  DifficultyLevel,
  {
    level: DifficultyLevel;
    cefr: string;
    title: Record<AppLanguage, string>;
    subtitle: Record<AppLanguage, string>;
    rules: Record<AppLanguage, string[]>;
  }
> = {
  1: {
    level: 1,
    cefr: 'A0–A1',
    title: {
      uk: 'Рівень 1 — Початковий (A0–A1)',
      lt: '1 lygis — Pradedantysis (A0–A1)',
      en: 'Level 1 — Beginner (A0–A1)',
    },
    subtitle: {
      uk: 'Лексика A0–A1: найпростіші щоденні слова 1–2 типів відмінювання, переважно однина (V., K., N., G.)',
      lt: 'A0–A1 žodynas: dažniausi 1–2 linksniuotės žodžiai, vienaskaita (V., K., N., G.)',
      en: 'A0–A1 vocabulary: essential everyday 1st–2nd declension nouns, mostly singular (Nom, Gen, Dat, Acc)',
    },
    rules: {
      uk: [
        'Слова рівня A0–A1 із регулярними моделями відмінювання',
        'Основні 4 відмінки: називний, родовий, давальний і знахідний',
        'Переважно форми однини з перекладом і доступними підказками',
      ],
      lt: [
        'A0–A1 lygio dažniausi žodžiai su reguliariais modeliais',
        'Pagrindiniai 4 linksniai: vardininkas, kilmininkas, naudininkas ir galininkas',
        'Daugiausia vienaskaita su vertimu ir užuominomis',
      ],
      en: [
        'A0–A1 core vocabulary with regular declension patterns',
        'Core 4 cases: Nominative, Genitive, Dative, and Accusative',
        'Primarily singular forms with full translation and hints available',
      ],
    },
  },
  2: {
    level: 2,
    cefr: 'A1–A2',
    title: {
      uk: 'Рівень 2 — Базовий (A1–A2)',
      lt: '2 lygis — Pagrindinis (A1–A2)',
      en: 'Level 2 — Elementary (A1–A2)',
    },
    subtitle: {
      uk: 'Лексика A1–A2: усі 7 відмінків, однина та множина, 1–4 типи відмінювання',
      lt: 'A1–A2 žodynas: visi 7 linksniai, vienaskaita ir daugiskaita, 1–4 linksniuotės',
      en: 'A1–A2 vocabulary: all 7 cases, singular and plural, declension types 1–4',
    },
    rules: {
      uk: [
        'Популярна побутова лексика рівня A1–A2',
        'Усі сім відмінків включно з орудним, місцевим і кличним в однині та множині',
        'Різні типи відмінювання (1, 2, 3, 4 типи відмінювання)',
      ],
      lt: [
        'A1–A2 kasdienio gyvenimo žodynas',
        'Visi septyni linksniai vienaskaitoje ir daugiskaitoje',
        'Įvairūs linksniavimo tipai (1–4 linksniuotės)',
      ],
      en: [
        'Practical everyday A1–A2 vocabulary',
        'All seven cases across both singular and plural numbers',
        'Diverse declension types (1st through 4th declensions)',
      ],
    },
  },
  3: {
    level: 3,
    cefr: 'A2–B1',
    title: {
      uk: 'Рівень 3 — Середній (A2–B1)',
      lt: '3 lygis — Vidutinis (A2–B1)',
      en: 'Level 3 — Intermediate (A2–B1)',
    },
    subtitle: {
      uk: 'Лексика A2–B1: чергування основи (t→č, d→dž), 3–5 типи відмінювання, прийменники та контекст',
      lt: 'A2–B1 žodynas: kamieno kaita (t→č, d→dž), 3–5 linksniuotės, prielinksniai',
      en: 'A2–B1 vocabulary: stem alternations (t→č, d→dž), 3rd–5th declensions, prepositions',
    },
    rules: {
      uk: [
        'Слова рівня A2–B1 із чергуванням приголосних основи (t → č, d → dž)',
        'Складніші закінчення 3, 4 та 5 типів відмінювання',
        'Вправи з прийменниками (iš, su, į, prie, ant) та контекстом речення',
      ],
      lt: [
        'A2–B1 žodžiai su priebalsių kaita kamiene (t → č, d → dž)',
        'Sudėtingesnės 3, 4 ir 5 linksniuotės galūnės',
        'Pratimai su prielinksniais ir sakinio kontekstu',
      ],
      en: [
        'A2–B1 vocabulary featuring consonant stem alternations (t → č, d → dž)',
        'More complex endings from 3rd, 4th, and 5th declensions',
        'Exercises with prepositions and sentence context',
      ],
    },
  },
  4: {
    level: 4,
    cefr: 'B1–B2',
    title: {
      uk: 'Рівень 4 — Просунутий (B1–B2)',
      lt: '4 lygis — Pažengusysis (B1–B2)',
      en: 'Level 4 — Advanced (B1–B2)',
    },
    subtitle: {
      uk: 'Лексика B1–B2: 5 тип відмінювання, винятки, абстрактні поняття, контекст і робота над помилками',
      lt: 'B1–B2 žodynas: 5 linksniuotė, išimtys, abstrakčios sąvokos, kontekstas be vertimo',
      en: 'B1–B2 vocabulary: 5th declension, irregulars, abstract terms, unassisted context & error focus',
    },
    rules: {
      uk: [
        'Просунута лексика B1–B2, 5 тип відмінювання та нерегулярні моделі (žmogus, šuo, sesuo, akmuo)',
        'Випадкове поєднання відмінків і чисел із пріоритетом складних слів',
        'Контекстні завдання та цілеспрямоване повторення слів із помилками',
      ],
      lt: [
        'Pažengusiųjų B1–B2 žodynas, 5 linksniuotė ir išimtys (žmogus, šuo, sesuo, akmuo)',
        'Atsitiktinis linksnių ir skaičių derinys',
        'Kontekstinės užduotys ir dažniausiai klystamų žodžių kartojimas',
      ],
      en: [
        'Advanced B1–B2 vocabulary, 5th declension, and irregular paradigms (žmogus, šuo, sesuo, akmuo)',
        'Random combination of cases and numbers prioritizing difficult nouns',
        'Contextual tasks and targeted review of frequent mistakes',
      ],
    },
  },
};

export const TRAINING_MODES_METADATA: Record<
  TrainingMode,
  {
    id: TrainingMode;
    title: Record<AppLanguage, string>;
    description: Record<AppLanguage, string>;
  }
> = {
  random: {
    id: 'random',
    title: { uk: 'Випадкове тренування', lt: 'Atsitiktinė treniruotė', en: 'Random Practice' },
    description: {
      uk: 'Адаптивний вибір слова, відмінка та числа відповідно до вашого рівня.',
      lt: 'Adaptyvus žodžio, linksnio ir skaičiaus parinkimas pagal jūsų lygį.',
      en: 'Adaptive selection of noun, case, and number tailored to your level.',
    },
  },
  by_case: {
    id: 'by_case',
    title: { uk: 'Тренування за відмінком', lt: 'Treniruotė pagal linksnį', en: 'Practice by Case' },
    description: {
      uk: 'Окреме відпрацювання вибраного відмінка (наприклад, лише Kilmininkas або Vietininkas).',
      lt: 'Tikslinis pasirinkto linksnio (pvz., tik Kilmininko ar Vietininko) mokymasis.',
      en: 'Focused practice on a single grammatical case (e.g., Genitive or Locative only).',
    },
  },
  by_declension: {
    id: 'by_declension',
    title: { uk: 'За типом відмінювання', lt: 'Pagal linksniuotę (1–5)', en: 'By Declension Type (1–5)' },
    description: {
      uk: 'Опрацювання одного з п’яти типів відмінювання за таблицею Daiktavardžių linksniavimas.',
      lt: 'Atskiros iš penkių linksniuočių praktika pagal lentelę.',
      en: 'Master each of the 5 declension types from the Lithuanian grammar table.',
    },
  },
  by_number: {
    id: 'by_number',
    title: { uk: 'Однина чи множина', lt: 'Vienaskaita ar daugiskaita', en: 'Singular vs. Plural' },
    description: {
      uk: 'Фокус лише на формах однини (Vienaskaita) або лише на формах множини (Daugiskaita).',
      lt: 'Susitelkite tik į vienaskaitos arba tik į daugiskaitos formas.',
      en: 'Focus exclusively on Singular (Vienaskaita) or Plural (Daugiskaita) forms.',
    },
  },
  by_topic: {
    id: 'by_topic',
    title: { uk: 'Тематичне тренування', lt: 'Teminė treniruotė', en: 'Thematic Practice' },
    description: {
      uk: 'Вивчайте лексику за однією з 14 практичних тем: місто, транспорт, їжа, робота, здоров’я.',
      lt: 'Mokykite žodžius pagal 14 kasdienių temų: miestas, transportas, maistas, sveikata.',
      en: 'Practice vocabulary grouped across 14 everyday topics: city, transport, food, health.',
    },
  },
  exam: {
    id: 'exam',
    title: { uk: 'Іспит без підказок', lt: 'Egzaminas be užuominų', en: 'No-Hint Exam' },
    description: {
      uk: 'Серія з 15 контрольних завдань без підказок із підсумковим оцінюванням точності.',
      lt: '15 kontrolinių užduočių serija be užuominų su galutiniu įvertinimu.',
      en: 'Timed 15-question control series without hints and with final grade breakdown.',
    },
  },
  mistakes: {
    id: 'mistakes',
    title: { uk: 'Повторення помилок', lt: 'Klaidų kartojimas', en: 'Mistake Review' },
    description: {
      uk: 'Автоматичне повернення до слів і відмінків, у яких ви найчастіше помилялися.',
      lt: 'Automatinis grįžimas prie žodžių ir linksnių, kuriuose padarėte klaidų.',
      en: 'Targeted spaced-repetition drills on nouns and cases where you previously erred.',
    },
  },
  full_paradigm: {
    id: 'full_paradigm',
    title: { uk: 'Повне відмінювання (7 форм)', lt: 'Pilnas linksniavimas (7 formos)', en: 'Full Declension Table (7 Forms)' },
    description: {
      uk: 'Самостійно введіть усі 7 відмінкових форм вибраного слова в однині або множині.',
      lt: 'Savikontrolė: įveskite visas 7 vieno žodžio vienaskaitos ar daugiskaitos formas.',
      en: 'Complete all 7 case forms of a single noun in Singular or Plural at once.',
    },
  },
  sentences: {
    id: 'sentences',
    title: { uk: 'Режим із реченнями', lt: 'Sakinio kontekstas', en: 'Sentence Context Mode' },
    description: {
      uk: 'Визначте потрібний відмінок і закінчення слова за контекстом живого речення та прийменника.',
      lt: 'Nustatykite reikiamą žodžio formą pagal sakinio kontekstą ir prielinksnį.',
      en: 'Determine the required case and ending from real Lithuanian sentence context and prepositions.',
    },
  },
};

export const LITHUANIAN_DIACRITICS = ['ą', 'č', 'ę', 'ė', 'į', 'š', 'ų', 'ū', 'ž'];

/**
 * Splits a Lithuanian inflected form into stem and grammatical ending
 * according to its DeclensionSubtype and GrammaticalCase + GrammaticalNumber.
 */
export function segmentLithuanianWord(
  form: string,
  subtype: DeclensionSubtype,
  grammaticalCase: GrammaticalCase,
  grammaticalNumber: GrammaticalNumber
): { stem: string; ending: string } {
  const clean = form.trim();
  const subtypeMap = SUBTYPE_ENDINGS[subtype];
  if (subtypeMap) {
    const rawExpectedEnding = subtypeMap[grammaticalNumber][grammaticalCase];
    // Handle multi-option subtype endings like 'ė / uo'
    const candidates = rawExpectedEnding
      .split('/')
      .map((s) => s.trim())
      .sort((a, b) => b.length - a.length);

    for (const candidate of candidates) {
      if (clean.endsWith(candidate) && clean.length > candidate.length) {
        return {
          stem: clean.slice(0, clean.length - candidate.length),
          ending: candidate,
        };
      }
    }
  }

  // Fallback longest known Lithuanian case ending match
  const commonEndings = [
    'enyje', 'eryje', 'enimis', 'erimis', 'enyse', 'eryse', 'eniui', 'eriai', 'enims', 'erims',
    'iuose', 'uose', 'ioje', 'oje', 'ėje', 'yje', 'uje', 'yse', 'ose', 'ėse',
    'iams', 'ioms', 'imis', 'omis', 'ėmis', 'umis', 'iais', 'iaus', 'iumi',
    'ams', 'oms', 'ėms', 'ims', 'ums', 'ais', 'aus', 'umi', 'ies', 'iui',
    'ens', 'ers', 'enį', 'erį', 'enys', 'erys', 'enų', 'erų', 'enis', 'eris',
    'ias', 'ios', 'iai', 'ius', 'au', 'ie', 'uo',
    'as', 'is', 'ys', 'us', 'os', 'ės', 'ai', 'ei', 'ui',
    'ą', 'ę', 'į', 'ų', 'ū', 'ė', 'a', 'e', 'i', 'o', 'u', 'y',
  ];

  for (const end of commonEndings) {
    if (clean.endsWith(end) && clean.length > end.length) {
      return {
        stem: clean.slice(0, clean.length - end.length),
        ending: end,
      };
    }
  }

  return {
    stem: clean.slice(0, Math.max(1, clean.length - 1)),
    ending: clean.slice(Math.max(1, clean.length - 1)),
  };
}
