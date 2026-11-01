import {
  CaseForms,
  DeclensionSubtype,
  DeclensionType,
  DifficultyLevel,
  NounEntry,
  TopicId,
} from '../types/grammar';

type RawPopularNounSpec = [
  lemma: string,
  uk: string,
  en: string,
  topic: TopicId,
  subtype: DeclensionSubtype,
  difficulty: DifficultyLevel
];

function buildPopularNoun(spec: RawPopularNounSpec, index: number): NounEntry {
  const [lemma, uk, en, topic, subtype, difficulty] = spec;
  const idNum = 151 + index;
  const id = `lt_${String(idNum).padStart(3, '0')}`;
  const frequency =
    difficulty === 1 ? 92 : difficulty === 2 ? 84 : difficulty === 3 ? 76 : 68;

  let declension: DeclensionType = 1;
  let gender: 'm' | 'f' = 'm';
  let sg: CaseForms;
  let pl: CaseForms;
  let stemAlternation: NounEntry['stemAlternation'] | undefined;

  switch (subtype) {
    case '1_as': {
      declension = 1;
      gender = 'm';
      const stem = lemma.slice(0, -2);
      if (lemma.endsWith('jas')) {
        sg = {
          nom: `${stem}as`,
          gen: `${stem}o`,
          dat: `${stem}ui`,
          acc: `${stem}ą`,
          ins: `${stem}u`,
          loc: `${stem}uje`,
          voc: `${stem}au`,
          variants: { loc: [`${stem}yje`], voc: [`${stem}e`] },
        };
      } else {
        sg = {
          nom: `${stem}as`,
          gen: `${stem}o`,
          dat: `${stem}ui`,
          acc: `${stem}ą`,
          ins: `${stem}u`,
          loc: `${stem}e`,
          voc: `${stem}e`,
          variants: { voc: [`${stem}ai`] },
        };
      }
      pl = {
        nom: `${stem}ai`,
        gen: `${stem}ų`,
        dat: `${stem}ams`,
        acc: `${stem}us`,
        ins: `${stem}ais`,
        loc: `${stem}uose`,
        voc: `${stem}ai`,
      };
      break;
    }

    case '1_ias': {
      declension = 1;
      gender = 'm';
      const stem = lemma.slice(0, -3);
      sg = {
        nom: `${stem}ias`,
        gen: `${stem}io`,
        dat: `${stem}iui`,
        acc: `${stem}ią`,
        ins: `${stem}iu`,
        loc: `${stem}yje`,
        voc: `${stem}y`,
        variants: { loc: [`${stem}iuje`], voc: [`${stem}ia`] },
      };
      pl = {
        nom: `${stem}iai`,
        gen: `${stem}ių`,
        dat: `${stem}iams`,
        acc: `${stem}ius`,
        ins: `${stem}iais`,
        loc: `${stem}iuose`,
        voc: `${stem}iai`,
      };
      break;
    }

    case '1_is':
    case '1_ys': {
      declension = 1;
      gender = 'm';
      const stem = lemma.slice(0, -2);
      const isYs = subtype === '1_ys';
      let palStem = stem;
      if (stem.endsWith('t')) {
        palStem = stem.slice(0, -1) + 'č';
        stemAlternation = {
          uk: `Чергування t → č перед закінченнями -io, -iui, -iu, -iai, -ių: ${lemma} → ${palStem}io, ${palStem}iui, мн. ${palStem}iai.`,
          lt: `Priebalsių kaita t → č: ${lemma} → ${palStem}io, ${palStem}iui, dgs. ${palStem}iai.`,
          en: `Palatalization t → č before back vowels: ${lemma} → ${palStem}io, ${palStem}iui, pl. ${palStem}iai.`,
        };
      } else if (stem.endsWith('d')) {
        palStem = stem.slice(0, -1) + 'dž';
        stemAlternation = {
          uk: `Чергування d → dž перед закінченнями -io, -iui, -iu, -iai, -ių: ${lemma} → ${palStem}io, ${palStem}iui, мн. ${palStem}iai.`,
          lt: `Priebalsių kaita d → dž: ${lemma} → ${palStem}io, ${palStem}iui, dgs. ${palStem}iai.`,
          en: `Palatalization d → dž before back vowels: ${lemma} → ${palStem}io, ${palStem}iui, pl. ${palStem}iai.`,
        };
      }
      sg = {
        nom: lemma,
        gen: `${palStem}io`,
        dat: `${palStem}iui`,
        acc: `${stem}į`,
        ins: `${palStem}iu`,
        loc: `${stem}yje`,
        voc: isYs ? `${stem}y` : `${stem}i`,
      };
      pl = {
        nom: `${palStem}iai`,
        gen: `${palStem}ių`,
        dat: `${palStem}iams`,
        acc: `${palStem}ius`,
        ins: `${palStem}iais`,
        loc: `${palStem}iuose`,
        voc: `${palStem}iai`,
      };
      break;
    }

    case '2_a': {
      declension = 2;
      gender = 'f';
      const stem = lemma.slice(0, -1);
      sg = {
        nom: `${stem}a`,
        gen: `${stem}os`,
        dat: `${stem}ai`,
        acc: `${stem}ą`,
        ins: `${stem}a`,
        loc: `${stem}oje`,
        voc: `${stem}a`,
      };
      pl = {
        nom: `${stem}os`,
        gen: `${stem}ų`,
        dat: `${stem}oms`,
        acc: `${stem}as`,
        ins: `${stem}omis`,
        loc: `${stem}ose`,
        voc: `${stem}os`,
      };
      break;
    }

    case '2_ia': {
      declension = 2;
      gender = 'f';
      const stem = lemma.slice(0, -2);
      sg = {
        nom: `${stem}ia`,
        gen: `${stem}ios`,
        dat: `${stem}iai`,
        acc: `${stem}ią`,
        ins: `${stem}ia`,
        loc: `${stem}ioje`,
        voc: `${stem}ia`,
      };
      pl = {
        nom: `${stem}ios`,
        gen: `${stem}ių`,
        dat: `${stem}ioms`,
        acc: `${stem}ias`,
        ins: `${stem}iomis`,
        loc: `${stem}iose`,
        voc: `${stem}ios`,
      };
      break;
    }

    case '2_e': {
      declension = 2;
      gender = 'f';
      const stem = lemma.slice(0, -1);
      let palStem = stem;
      if (stem.endsWith('t')) {
        palStem = stem.slice(0, -1) + 'č';
        stemAlternation = {
          uk: `У родовому відмінку множини t → č перед -ių: ${lemma} → ${palStem}ių.`,
          lt: `Daugiskaitos kilmininke t → č prieš -ių: ${lemma} → ${palStem}ių.`,
          en: `In genitive plural, t palatalizes to č before -ių: ${lemma} → ${palStem}ių.`,
        };
      } else if (stem.endsWith('d')) {
        palStem = stem.slice(0, -1) + 'dž';
        stemAlternation = {
          uk: `У родовому відмінку множини d → dž перед -ių: ${lemma} → ${palStem}ių.`,
          lt: `Daugiskaitos kilmininke d → dž prieš -ių: ${lemma} → ${palStem}ių.`,
          en: `In genitive plural, d palatalizes to dž before -ių: ${lemma} → ${palStem}ių.`,
        };
      }
      sg = {
        nom: `${stem}ė`,
        gen: `${stem}ės`,
        dat: `${stem}ei`,
        acc: `${stem}ę`,
        ins: `${stem}e`,
        loc: `${stem}ėje`,
        voc: `${stem}e`,
      };
      pl = {
        nom: `${stem}ės`,
        gen: `${palStem}ių`,
        dat: `${stem}ėms`,
        acc: `${stem}es`,
        ins: `${stem}ėmis`,
        loc: `${stem}ėse`,
        voc: `${stem}ės`,
      };
      break;
    }

    case '3_is_f': {
      declension = 3;
      gender = 'f';
      const stem = lemma.slice(0, -2);
      let palStem = stem;
      if (stem.endsWith('t')) {
        palStem = stem.slice(0, -1) + 'č';
        stemAlternation = {
          uk: `3 тип відмінювання (жін. рід): чергування t → č у давальному однини (${palStem}iai) та родовому множини (${palStem}ių).`,
          lt: `3 linksniuotė: kaita t → č vns. naudininke (${palStem}iai) ir dgs. kilmininke (${palStem}ių).`,
          en: `3rd declension feminine: t → č in dative singular (${palStem}iai) and genitive plural (${palStem}ių).`,
        };
      } else if (stem.endsWith('d')) {
        palStem = stem.slice(0, -1) + 'dž';
        stemAlternation = {
          uk: `3 тип відмінювання (жін. рід): чергування d → dž у давальному однини (${palStem}iai) та родовому множини (${palStem}ių).`,
          lt: `3 linksniuotė: kaita d → dž vns. naudininke (${palStem}iai) ir dgs. kilmininke (${palStem}ių).`,
          en: `3rd declension feminine: d → dž in dative singular (${palStem}iai) and genitive plural (${palStem}ių).`,
        };
      }
      sg = {
        nom: `${stem}is`,
        gen: `${stem}ies`,
        dat: `${palStem}iai`,
        acc: `${stem}į`,
        ins: `${stem}imi`,
        loc: `${stem}yje`,
        voc: `${stem}ie`,
      };
      pl = {
        nom: `${stem}ys`,
        gen: `${palStem}ių`,
        dat: `${stem}ims`,
        acc: `${stem}is`,
        ins: `${stem}imis`,
        loc: `${stem}yse`,
        voc: `${stem}ys`,
      };
      break;
    }

    case '3_is_m': {
      declension = 3;
      gender = 'm';
      const stem = lemma.slice(0, -2);
      let palStem = stem;
      if (stem.endsWith('t')) {
        palStem = stem.slice(0, -1) + 'č';
      } else if (stem.endsWith('d')) {
        palStem = stem.slice(0, -1) + 'dž';
      }
      sg = {
        nom: `${stem}is`,
        gen: `${stem}ies`,
        dat: `${palStem}iui`,
        acc: `${stem}į`,
        ins: `${stem}imi`,
        loc: `${stem}yje`,
        voc: `${stem}ie`,
      };
      pl = {
        nom: `${stem}ys`,
        gen: `${stem}ų`,
        dat: `${stem}ims`,
        acc: `${stem}is`,
        ins: `${stem}imis`,
        loc: `${stem}yse`,
        voc: `${stem}ys`,
      };
      break;
    }

    case '4_us': {
      declension = 4;
      gender = 'm';
      const stem = lemma.slice(0, -2);
      sg = {
        nom: `${stem}us`,
        gen: `${stem}aus`,
        dat: `${stem}ui`,
        acc: `${stem}ų`,
        ins: `${stem}umi`,
        loc: `${stem}uje`,
        voc: `${stem}au`,
      };
      pl = {
        nom: `${stem}ūs`,
        gen: `${stem}ų`,
        dat: `${stem}ums`,
        acc: `${stem}us`,
        ins: `${stem}umis`,
        loc: `${stem}uose`,
        voc: `${stem}ūs`,
      };
      break;
    }

    case '4_ius': {
      declension = 4;
      gender = 'm';
      if (lemma.endsWith('ius')) {
        const stem = lemma.slice(0, -3);
        sg = {
          nom: `${stem}ius`,
          gen: `${stem}iaus`,
          dat: `${stem}iui`,
          acc: `${stem}ių`,
          ins: `${stem}iumi`,
          loc: `${stem}iuje`,
          voc: `${stem}iau`,
        };
        pl = {
          nom: `${stem}iai`,
          gen: `${stem}ių`,
          dat: `${stem}iams`,
          acc: `${stem}ius`,
          ins: `${stem}iais`,
          loc: `${stem}iuose`,
          voc: `${stem}iai`,
        };
      } else {
        // Ends with -jus (e.g., aliejus, pavojus, rytojus, jubiliejus)
        const stem = lemma.slice(0, -2);
        sg = {
          nom: `${stem}us`,
          gen: `${stem}aus`,
          dat: `${stem}ui`,
          acc: `${stem}ų`,
          ins: `${stem}umi`,
          loc: `${stem}uje`,
          voc: `${stem}au`,
        };
        pl = {
          nom: `${stem}ai`,
          gen: `${stem}ų`,
          dat: `${stem}ams`,
          acc: `${stem}us`,
          ins: `${stem}ais`,
          loc: `${stem}uose`,
          voc: `${stem}ai`,
        };
      }
      break;
    }

    case '5_uo':
    case '5_e': {
      declension = 5;
      gender = 'm';
      const stem = lemma.slice(0, -2);
      stemAlternation = {
        uk: `5 тип відмінювання: у непрямих відмінках основа розширюється суфіксом -en- (${lemma} → ${stem}ens, ${stem}eniui, ${stem}enį).`,
        lt: `5 linksniuotė: priebalsinis kamienas su -en- (${lemma} → ${stem}ens, ${stem}eniui).`,
        en: `5th declension: stem expands with -en- in oblique cases (${lemma} → ${stem}ens, ${stem}eniui).`,
      };
      sg = {
        nom: `${stem}uo`,
        gen: `${stem}ens`,
        dat: `${stem}eniui`,
        acc: `${stem}enį`,
        ins: `${stem}eniu`,
        loc: `${stem}enyje`,
        voc: `${stem}enie`,
      };
      pl = {
        nom: `${stem}enys`,
        gen: `${stem}enų`,
        dat: `${stem}enims`,
        acc: `${stem}enis`,
        ins: `${stem}enimis`,
        loc: `${stem}enyse`,
        voc: `${stem}enys`,
      };
      break;
    }
  }

  return {
    id,
    lemma,
    uk,
    en,
    topic,
    declension,
    subtype,
    gender,
    difficulty,
    frequency,
    verified: true,
    ...(stemAlternation ? { stemAlternation } : {}),
    sg,
    pl,
  };
}

const POPULAR_850_SPECS: RawPopularNounSpec[] = [
  [
    "berniukas",
    "хлопчик",
    "boy",
    "family",
    "1_as",
    1
  ],
  [
    "mergaitė",
    "дівчинка",
    "girl",
    "family",
    "2_e",
    1
  ],
  [
    "vyras",
    "чоловік",
    "man / husband",
    "family",
    "1_as",
    1
  ],
  [
    "moteris",
    "жінка",
    "woman",
    "family",
    "3_is_f",
    1
  ],
  [
    "žmona",
    "дружина",
    "wife",
    "family",
    "2_a",
    1
  ],
  [
    "senelis",
    "дідусь",
    "grandfather",
    "family",
    "1_is",
    1
  ],
  [
    "močiutė",
    "бабуся",
    "grandmother",
    "family",
    "2_e",
    1
  ],
  [
    "dėdė",
    "дядько",
    "uncle",
    "family",
    "2_e",
    1
  ],
  [
    "teta",
    "тітка",
    "aunt",
    "family",
    "2_a",
    1
  ],
  [
    "anūkas",
    "онук",
    "grandson",
    "family",
    "1_as",
    1
  ],
  [
    "anūkė",
    "онука",
    "granddaughter",
    "family",
    "2_e",
    1
  ],
  [
    "kaimynas",
    "сусід",
    "male neighbor",
    "family",
    "1_as",
    1
  ],
  [
    "kaimynė",
    "сусідка",
    "female neighbor",
    "family",
    "2_e",
    1
  ],
  [
    "šeima",
    "сім’я / родина",
    "family",
    "family",
    "2_a",
    1
  ],
  [
    "vardas",
    "ім’я",
    "first name",
    "family",
    "1_as",
    1
  ],
  [
    "pavardė",
    "прізвище",
    "surname / last name",
    "family",
    "2_e",
    1
  ],
  [
    "mergina",
    "дівчина",
    "young woman / girlfriend",
    "family",
    "2_a",
    2
  ],
  [
    "vaikinas",
    "хлопець / юнак",
    "young man / boyfriend",
    "family",
    "1_as",
    2
  ],
  [
    "kūdikis",
    "немовля",
    "baby / infant",
    "family",
    "1_is",
    2
  ],
  [
    "pusbrolis",
    "двоюрідний брат",
    "male cousin",
    "family",
    "1_is",
    2
  ],
  [
    "pusseserė",
    "двоюрідна сестра",
    "female cousin",
    "family",
    "2_e",
    2
  ],
  [
    "sūnėnas",
    "племінник",
    "nephew",
    "family",
    "1_as",
    2
  ],
  [
    "dukterėčia",
    "племінниця",
    "niece",
    "family",
    "2_ia",
    2
  ],
  [
    "pažįstamas",
    "знайомий",
    "acquaintance",
    "family",
    "1_as",
    2
  ],
  [
    "jaunuolis",
    "юнак / молода людина",
    "youth / young man",
    "family",
    "1_is",
    2
  ],
  [
    "nuotaka",
    "наречена",
    "bride",
    "family",
    "2_a",
    2
  ],
  [
    "jaunikis",
    "наречений",
    "groom",
    "family",
    "1_is",
    2
  ],
  [
    "bičiulis",
    "приятель / товариш",
    "pal / buddy",
    "family",
    "1_is",
    2
  ],
  [
    "šeimininkas",
    "господар",
    "host / owner",
    "family",
    "1_as",
    2
  ],
  [
    "šeimininkė",
    "господиня",
    "hostess",
    "family",
    "2_e",
    2
  ],
  [
    "sutuoktinis",
    "чоловік (у шлюбі)",
    "male spouse",
    "family",
    "1_is",
    3
  ],
  [
    "sutuoktinė",
    "дружина (у шлюбі)",
    "female spouse",
    "family",
    "2_e",
    3
  ],
  [
    "giminaitis",
    "родич",
    "male relative",
    "family",
    "1_is",
    3
  ],
  [
    "giminaitė",
    "родичка",
    "female relative",
    "family",
    "2_e",
    3
  ],
  [
    "paauglys",
    "підліток",
    "teenager",
    "family",
    "1_ys",
    3
  ],
  [
    "našlys",
    "вдівець",
    "widower",
    "family",
    "1_ys",
    3
  ],
  [
    "našlė",
    "вдова",
    "widow",
    "family",
    "2_e",
    3
  ],
  [
    "uošvis",
    "свекор / тесть",
    "father-in-law",
    "family",
    "1_is",
    3
  ],
  [
    "anyta",
    "свекруха",
    "husband’s mother",
    "family",
    "2_a",
    3
  ],
  [
    "uošvė",
    "теща",
    "wife’s mother",
    "family",
    "2_e",
    3
  ],
  [
    "žentas",
    "зять",
    "son-in-law",
    "family",
    "1_as",
    3
  ],
  [
    "dvynys",
    "близнюк",
    "twin",
    "family",
    "1_ys",
    3
  ],
  [
    "globėjas",
    "опікун",
    "guardian",
    "family",
    "1_as",
    3
  ],
  [
    "asmuo",
    "особа",
    "person / individual",
    "family",
    "5_uo",
    3
  ],
  [
    "pilietis",
    "громадянин",
    "citizen",
    "family",
    "1_is",
    3
  ],
  [
    "gyventojas",
    "житель / мешканець",
    "resident / inhabitant",
    "family",
    "1_as",
    3
  ],
  [
    "protėvis",
    "предок",
    "ancestor",
    "family",
    "1_is",
    4
  ],
  [
    "palikuonis",
    "нащадок",
    "descendant",
    "family",
    "1_is",
    4
  ],
  [
    "bendruomenė",
    "спільнота / громада",
    "community",
    "family",
    "2_e",
    4
  ],
  [
    "karta",
    "покоління",
    "generation",
    "family",
    "2_a",
    4
  ],
  [
    "giminė",
    "рід / рідня",
    "kin / clan / gender",
    "family",
    "2_e",
    4
  ],
  [
    "sužadėtinis",
    "наречений (заручений)",
    "fiancé",
    "family",
    "1_is",
    4
  ],
  [
    "sužadėtinė",
    "наречена (заручена)",
    "fiancée",
    "family",
    "2_e",
    4
  ],
  [
    "krikštatėvis",
    "хрещений батько",
    "godfather",
    "family",
    "1_is",
    4
  ],
  [
    "krikštamotė",
    "хрещена мати",
    "godmother",
    "family",
    "2_e",
    4
  ],
  [
    "įpėdinis",
    "спадкоємець",
    "heir / successor",
    "family",
    "1_is",
    4
  ],
  [
    "bendraamžis",
    "одноліток / ровесник",
    "peer / coeval",
    "family",
    "1_is",
    4
  ],
  [
    "tautietis",
    "співвітчизник",
    "compatriot",
    "family",
    "1_is",
    4
  ],
  [
    "užsienietis",
    "іноземець",
    "foreigner",
    "family",
    "1_is",
    4
  ],
  [
    "senjoras",
    "літня людина / сеньйор",
    "senior citizen",
    "family",
    "1_as",
    4
  ],
  [
    "jaunimas",
    "молодь",
    "youth / young people",
    "family",
    "1_as",
    3
  ],
  [
    "visuomenė",
    "суспільство",
    "society",
    "family",
    "2_e",
    4
  ],
  [
    "žmonija",
    "людство",
    "humanity / mankind",
    "family",
    "2_a",
    4
  ],
  [
    "asmenybė",
    "особистість",
    "personality / individual",
    "family",
    "2_e",
    4
  ],
  [
    "bendradarbis",
    "співробітник",
    "coworker",
    "family",
    "1_is",
    3
  ],
  [
    "draugija",
    "товариство / спілка",
    "association / society",
    "family",
    "2_a",
    4
  ],
  [
    "našlaitis",
    "сирота",
    "orphan",
    "family",
    "1_is",
    4
  ],
  [
    "įvaikis",
    "прийомна дитина",
    "adopted child",
    "family",
    "1_is",
    4
  ],
  [
    "senolis",
    "старець / дідусь",
    "elder",
    "family",
    "1_is",
    3
  ],
  [
    "jaunavedys",
    "молодята (чоловік)",
    "newlywed",
    "family",
    "1_ys",
    4
  ],
  [
    "stogas",
    "дах",
    "roof",
    "home",
    "1_as",
    1
  ],
  [
    "kiemas",
    "двір / подвір’я",
    "yard / courtyard",
    "home",
    "1_as",
    1
  ],
  [
    "sodas",
    "сад",
    "garden / orchard",
    "home",
    "1_as",
    1
  ],
  [
    "vonia",
    "ванна кімната / ванна",
    "bathroom / bathtub",
    "home",
    "2_ia",
    1
  ],
  [
    "tualetas",
    "туалет",
    "toilet / restroom",
    "home",
    "1_as",
    1
  ],
  [
    "sofa",
    "диван / софа",
    "sofa / couch",
    "home",
    "2_a",
    1
  ],
  [
    "spinta",
    "шафа",
    "wardrobe / closet",
    "home",
    "2_a",
    1
  ],
  [
    "lempa",
    "лампа",
    "lamp",
    "home",
    "2_a",
    1
  ],
  [
    "veidrodis",
    "дзеркало",
    "mirror",
    "home",
    "1_is",
    1
  ],
  [
    "kilimas",
    "килим",
    "carpet / rug",
    "home",
    "1_as",
    1
  ],
  [
    "paveikslas",
    "картина",
    "painting / picture",
    "home",
    "1_as",
    1
  ],
  [
    "balkonas",
    "балкон",
    "balcony",
    "home",
    "1_as",
    1
  ],
  [
    "garažas",
    "гараж",
    "garage",
    "home",
    "1_as",
    1
  ],
  [
    "aukštas",
    "поверх",
    "floor / storey",
    "home",
    "1_as",
    1
  ],
  [
    "liftas",
    "ліфт",
    "elevator / lift",
    "home",
    "1_as",
    1
  ],
  [
    "svetainė",
    "вітальня",
    "living room",
    "home",
    "2_e",
    2
  ],
  [
    "koridorius",
    "коридор",
    "corridor / hallway",
    "home",
    "4_ius",
    2
  ],
  [
    "laiptinė",
    "сходовий майданчик / під’їзд",
    "stairwell",
    "home",
    "2_e",
    2
  ],
  [
    "rūsys",
    "підвал / погріб",
    "basement / cellar",
    "home",
    "1_ys",
    2
  ],
  [
    "palėpė",
    "горище / мансарда",
    "attic / loft",
    "home",
    "2_e",
    2
  ],
  [
    "tvora",
    "паркан / огорожа",
    "fence",
    "home",
    "2_a",
    2
  ],
  [
    "fotelis",
    "крісло",
    "armchair",
    "home",
    "1_is",
    2
  ],
  [
    "lentyna",
    "полиця",
    "shelf",
    "home",
    "2_a",
    2
  ],
  [
    "stalčius",
    "шухляда",
    "drawer",
    "home",
    "4_ius",
    2
  ],
  [
    "pagalvė",
    "подушка",
    "pillow",
    "home",
    "2_e",
    2
  ],
  [
    "antklodė",
    "ковдра",
    "blanket / duvet",
    "home",
    "2_e",
    2
  ],
  [
    "paklodė",
    "простирадло",
    "bedsheet",
    "home",
    "2_e",
    2
  ],
  [
    "rankšluostis",
    "рушник",
    "towel",
    "home",
    "1_is",
    2
  ],
  [
    "užuolaida",
    "штора / фіранка",
    "curtain",
    "home",
    "2_a",
    2
  ],
  [
    "šaldytuvas",
    "холодильник",
    "refrigerator",
    "home",
    "1_as",
    2
  ],
  [
    "viryklė",
    "плита (кухонна)",
    "kitchen stove",
    "home",
    "2_e",
    2
  ],
  [
    "orkaitė",
    "духовка",
    "oven",
    "home",
    "2_e",
    2
  ],
  [
    "virdulys",
    "чайник",
    "kettle",
    "home",
    "1_ys",
    2
  ],
  [
    "puodas",
    "каструля / горщик",
    "pot",
    "home",
    "1_as",
    2
  ],
  [
    "keptuvė",
    "сковорідка / пательня",
    "frying pan",
    "home",
    "2_e",
    2
  ],
  [
    "lėkštė",
    "тарілка",
    "plate",
    "home",
    "2_e",
    2
  ],
  [
    "puodelis",
    "чашка / горнятко",
    "cup / mug",
    "home",
    "1_is",
    2
  ],
  [
    "stiklinė",
    "склянка",
    "drinking glass",
    "home",
    "2_e",
    2
  ],
  [
    "šakutė",
    "виделка",
    "fork",
    "home",
    "2_e",
    2
  ],
  [
    "šaukštas",
    "ложка",
    "spoon",
    "home",
    "1_as",
    2
  ],
  [
    "šaukštelis",
    "чайна ложка",
    "teaspoon",
    "home",
    "1_is",
    3
  ],
  [
    "dubenėlis",
    "мисочка / піала",
    "small bowl",
    "home",
    "1_is",
    3
  ],
  [
    "dubuo",
    "миска",
    "bowl / basin",
    "home",
    "5_uo",
    3
  ],
  [
    "kriauklė",
    "раковина / мийка",
    "sink",
    "home",
    "2_e",
    3
  ],
  [
    "čiaupas",
    "кран (водопровідний)",
    "faucet / tap",
    "home",
    "1_as",
    3
  ],
  [
    "dušas",
    "душ",
    "shower",
    "home",
    "1_as",
    3
  ],
  [
    "skalbyklė",
    "пральна машина",
    "washing machine",
    "home",
    "2_e",
    3
  ],
  [
    "indaplovė",
    "посудомийна машина",
    "dishwasher",
    "home",
    "2_e",
    3
  ],
  [
    "siurblys",
    "пилосос / насос",
    "vacuum / pump",
    "home",
    "1_ys",
    3
  ],
  [
    "lygintuvas",
    "праска",
    "clothes iron",
    "home",
    "1_as",
    3
  ],
  [
    "šviestuvas",
    "світильник / люстра",
    "light fixture",
    "home",
    "1_as",
    3
  ],
  [
    "jungiklis",
    "вимикач",
    "light switch",
    "home",
    "1_is",
    3
  ],
  [
    "lizdas",
    "розетка / гніздо",
    "socket / nest",
    "home",
    "1_as",
    3
  ],
  [
    "radiatorius",
    "радіатор / батарея",
    "radiator",
    "home",
    "4_ius",
    3
  ],
  [
    "židinys",
    "камін / вогнище",
    "fireplace / hearth",
    "home",
    "1_ys",
    3
  ],
  [
    "kaminas",
    "димар",
    "chimney",
    "home",
    "1_as",
    3
  ],
  [
    "terasa",
    "тераса",
    "terrace / patio",
    "home",
    "2_a",
    3
  ],
  [
    "slenkstis",
    "поріг",
    "threshold / doorstep",
    "home",
    "1_is",
    3
  ],
  [
    "spyna",
    "замок (дверний)",
    "door lock",
    "home",
    "2_a",
    3
  ],
  [
    "skambutis",
    "дзвінок",
    "doorbell / bell",
    "home",
    "1_is",
    3
  ],
  [
    "būstas",
    "житло / помешкання",
    "housing / dwelling",
    "home",
    "1_as",
    4
  ],
  [
    "interjeras",
    "інтер’єр",
    "interior",
    "home",
    "1_as",
    4
  ],
  [
    "apšvietimas",
    "освітлення",
    "lighting",
    "home",
    "1_as",
    4
  ],
  [
    "šildymas",
    "опалення",
    "heating",
    "home",
    "1_as",
    4
  ],
  [
    "vėdinimas",
    "вентиляція",
    "ventilation",
    "home",
    "1_as",
    4
  ],
  [
    "remontas",
    "ремонт",
    "renovation / repair",
    "home",
    "1_as",
    4
  ],
  [
    "aplinka",
    "середовище / оточення",
    "environment / surroundings",
    "home",
    "2_a",
    4
  ],
  [
    "nuosavybė",
    "власність / майно",
    "property / ownership",
    "home",
    "2_e",
    4
  ],
  [
    "nuomininkas",
    "орендар",
    "tenant",
    "home",
    "1_as",
    4
  ],
  [
    "bendrabutis",
    "гуртожиток",
    "dormitory",
    "home",
    "1_is",
    4
  ],
  [
    "sodyba",
    "садиба / хутір",
    "homestead",
    "home",
    "2_a",
    4
  ],
  [
    "pastogė",
    "піддашшя / прихисток",
    "shelter / eaves",
    "home",
    "2_e",
    4
  ],
  [
    "pertvara",
    "перегородка",
    "partition wall",
    "home",
    "2_a",
    4
  ],
  [
    "čiužinys",
    "матрац",
    "mattress",
    "home",
    "1_ys",
    3
  ],
  [
    "komoda",
    "комод",
    "chest of drawers",
    "home",
    "2_a",
    2
  ],
  [
    "taburetė",
    "табуретка",
    "stool",
    "home",
    "2_e",
    2
  ],
  [
    "spintelė",
    "тумбочка / шафка",
    "cabinet / nightstand",
    "home",
    "2_e",
    2
  ],
  [
    "rankena",
    "дверна ручка",
    "door handle",
    "home",
    "2_a",
    3
  ],
  [
    "palangė",
    "підвіконня",
    "windowsill",
    "home",
    "2_e",
    3
  ],
  [
    "plytelė",
    "плитка / кахель",
    "tile",
    "home",
    "2_e",
    3
  ],
  [
    "mėsa",
    "м’ясо",
    "meat",
    "food",
    "2_a",
    1
  ],
  [
    "žuvis",
    "риба",
    "fish",
    "food",
    "3_is_f",
    1
  ],
  [
    "kiaušinis",
    "яйце",
    "egg",
    "food",
    "1_is",
    1
  ],
  [
    "sviestas",
    "вершкове масло",
    "butter",
    "food",
    "1_as",
    1
  ],
  [
    "cukrus",
    "цукор",
    "sugar",
    "food",
    "4_us",
    1
  ],
  [
    "druska",
    "сіль",
    "salt",
    "food",
    "2_a",
    1
  ],
  [
    "bulvė",
    "картопля",
    "potato",
    "food",
    "2_e",
    1
  ],
  [
    "morka",
    "морква",
    "carrot",
    "food",
    "2_a",
    1
  ],
  [
    "pomidoras",
    "помідор",
    "tomato",
    "food",
    "1_as",
    1
  ],
  [
    "agurkas",
    "огірок",
    "cucumber",
    "food",
    "1_as",
    1
  ],
  [
    "bananas",
    "банан",
    "banana",
    "food",
    "1_as",
    1
  ],
  [
    "citrina",
    "лимон",
    "lemon",
    "food",
    "2_a",
    1
  ],
  [
    "apelsinas",
    "апельсин",
    "orange",
    "food",
    "1_as",
    1
  ],
  [
    "tortas",
    "торт",
    "cake",
    "food",
    "1_as",
    1
  ],
  [
    "pyragas",
    "пиріг / тістечко",
    "pie / pastry",
    "food",
    "1_as",
    1
  ],
  [
    "šokoladas",
    "шоколад",
    "chocolate",
    "food",
    "1_as",
    1
  ],
  [
    "alus",
    "пиво",
    "beer",
    "food",
    "4_us",
    1
  ],
  [
    "vynas",
    "вино",
    "wine",
    "food",
    "1_as",
    1
  ],
  [
    "maistas",
    "їжа",
    "food",
    "food",
    "1_as",
    1
  ],
  [
    "vištiena",
    "курятина",
    "chicken meat",
    "food",
    "2_a",
    2
  ],
  [
    "kiauliena",
    "свинина",
    "pork",
    "food",
    "2_a",
    2
  ],
  [
    "jautiena",
    "яловичина",
    "beef",
    "food",
    "2_a",
    2
  ],
  [
    "dešra",
    "ковбаса",
    "sausage",
    "food",
    "2_a",
    2
  ],
  [
    "kumpis",
    "шинка",
    "ham",
    "food",
    "1_is",
    2
  ],
  [
    "varškė",
    "кисломолочний сир",
    "curd / cottage cheese",
    "food",
    "2_e",
    2
  ],
  [
    "grietinė",
    "сметана",
    "sour cream",
    "food",
    "2_e",
    2
  ],
  [
    "jogurtas",
    "йогурт",
    "yogurt",
    "food",
    "1_as",
    2
  ],
  [
    "košė",
    "каша",
    "porridge",
    "food",
    "2_e",
    2
  ],
  [
    "ryžis",
    "рисинка / рис",
    "rice grain",
    "food",
    "1_is",
    2
  ],
  [
    "blynas",
    "млинець",
    "pancake",
    "food",
    "1_as",
    2
  ],
  [
    "sumuštinis",
    "бутерброд / сендвіч",
    "sandwich",
    "food",
    "1_is",
    2
  ],
  [
    "padažas",
    "соус",
    "sauce",
    "food",
    "1_as",
    2
  ],
  [
    "aliejus",
    "олія",
    "cooking oil",
    "food",
    "4_ius",
    2
  ],
  [
    "svogūnas",
    "цибуля",
    "onion",
    "food",
    "1_as",
    2
  ],
  [
    "česnakas",
    "часник",
    "garlic",
    "food",
    "1_as",
    2
  ],
  [
    "kopūstas",
    "капуста",
    "cabbage",
    "food",
    "1_as",
    2
  ],
  [
    "burokėlis",
    "буряк",
    "beetroot",
    "food",
    "1_is",
    2
  ],
  [
    "grybas",
    "гриб",
    "mushroom",
    "food",
    "1_as",
    2
  ],
  [
    "uoga",
    "ягода",
    "berry",
    "food",
    "2_a",
    2
  ],
  [
    "braškė",
    "полуниця",
    "strawberry",
    "food",
    "2_e",
    2
  ],
  [
    "kriaušė",
    "груша",
    "pear",
    "food",
    "2_e",
    2
  ],
  [
    "vynuogė",
    "виноград (ягода)",
    "grape",
    "food",
    "2_e",
    2
  ],
  [
    "sausainis",
    "печиво",
    "cookie / biscuit",
    "food",
    "1_is",
    2
  ],
  [
    "saldainis",
    "цукерка",
    "candy / sweet",
    "food",
    "1_is",
    2
  ],
  [
    "bandelė",
    "булочка",
    "bun / roll",
    "food",
    "2_e",
    3
  ],
  [
    "kepsnys",
    "смажене м’ясо / стейк",
    "roast / steak",
    "food",
    "1_ys",
    3
  ],
  [
    "troškinys",
    "рагу / тушкована страва",
    "stew",
    "food",
    "1_ys",
    3
  ],
  [
    "cepelinas",
    "цепелін (литовська страва)",
    "stuffed potato dumpling",
    "food",
    "1_as",
    3
  ],
  [
    "koldūnas",
    "пельмень / вареник",
    "dumpling",
    "food",
    "1_as",
    3
  ],
  [
    "dešrelė",
    "сосиска",
    "frankfurter / wiener",
    "food",
    "2_e",
    3
  ],
  [
    "lašiša",
    "лосось",
    "salmon",
    "food",
    "2_a",
    3
  ],
  [
    "silkė",
    "оселедець",
    "herring",
    "food",
    "2_e",
    3
  ],
  [
    "pipiras",
    "перець",
    "pepper",
    "food",
    "1_as",
    3
  ],
  [
    "actas",
    "оцет",
    "vinegar",
    "food",
    "1_as",
    3
  ],
  [
    "krapas",
    "кріп",
    "dill",
    "food",
    "1_as",
    3
  ],
  [
    "petražolė",
    "петрушка",
    "parsley",
    "food",
    "2_e",
    3
  ],
  [
    "persikas",
    "персик",
    "peach",
    "food",
    "1_as",
    3
  ],
  [
    "slyva",
    "слива",
    "plum",
    "food",
    "2_a",
    3
  ],
  [
    "arbūzas",
    "кавун",
    "watermelon",
    "food",
    "1_as",
    3
  ],
  [
    "riešutas",
    "горіх",
    "nut",
    "food",
    "1_as",
    3
  ],
  [
    "uogienė",
    "варення / джем",
    "jam / preserve",
    "food",
    "2_e",
    3
  ],
  [
    "gėrimas",
    "напій",
    "drink / beverage",
    "food",
    "1_as",
    3
  ],
  [
    "limonadas",
    "лимонад",
    "lemonade",
    "food",
    "1_as",
    3
  ],
  [
    "kokteilis",
    "коктейль",
    "cocktail / smoothie",
    "food",
    "1_is",
    3
  ],
  [
    "patiekalas",
    "страва",
    "dish / course",
    "food",
    "1_as",
    3
  ],
  [
    "užkandis",
    "закуска / перекус",
    "snack / appetizer",
    "food",
    "1_is",
    3
  ],
  [
    "desertas",
    "десерт",
    "dessert",
    "food",
    "1_as",
    3
  ],
  [
    "skonis",
    "смак",
    "taste / flavor",
    "food",
    "1_is",
    4
  ],
  [
    "kvapas",
    "запах / аромат",
    "smell / aroma",
    "food",
    "1_as",
    4
  ],
  [
    "receptas",
    "рецепт",
    "recipe / prescription",
    "food",
    "1_as",
    4
  ],
  [
    "porcija",
    "порція",
    "portion / serving",
    "food",
    "2_a",
    4
  ],
  [
    "ingredientas",
    "інгредієнт / складник",
    "ingredient",
    "food",
    "1_as",
    4
  ],
  [
    "prieskonis",
    "пряність / спеція",
    "spice / seasoning",
    "food",
    "1_is",
    4
  ],
  [
    "tešla",
    "тісто",
    "dough / batter",
    "food",
    "2_a",
    4
  ],
  [
    "įdaras",
    "начинка",
    "filling / stuffing",
    "food",
    "1_as",
    4
  ],
  [
    "kalakutiena",
    "індичатина",
    "turkey meat",
    "food",
    "2_a",
    4
  ],
  [
    "aviniena",
    "баранина",
    "mutton / lamb",
    "food",
    "2_a",
    4
  ],
  [
    "varškėtis",
    "сирник",
    "curd pancake",
    "food",
    "1_is",
    4
  ],
  [
    "spanguolė",
    "журавлина",
    "cranberry",
    "food",
    "2_e",
    4
  ],
  [
    "mėlynė",
    "чорниця",
    "blueberry / bilberry",
    "food",
    "2_e",
    4
  ],
  [
    "avietė",
    "малина",
    "raspberry",
    "food",
    "2_e",
    4
  ],
  [
    "serbentas",
    "смородина / порічка",
    "currant",
    "food",
    "1_as",
    4
  ],
  [
    "mityba",
    "харчування / раціон",
    "nutrition / diet",
    "food",
    "2_a",
    4
  ],
  [
    "alkis",
    "голод",
    "hunger",
    "food",
    "1_is",
    4
  ],
  [
    "troškulys",
    "спрага",
    "thirst",
    "food",
    "1_ys",
    4
  ],
  [
    "daržovė",
    "овоч",
    "vegetable",
    "food",
    "2_e",
    1
  ],
  [
    "čekis",
    "чек (касовий)",
    "receipt / check",
    "shopping",
    "1_is",
    1
  ],
  [
    "kasa",
    "каса",
    "checkout / cash desk",
    "shopping",
    "2_a",
    1
  ],
  [
    "euras",
    "євро",
    "euro",
    "shopping",
    "1_as",
    1
  ],
  [
    "centas",
    "цент",
    "cent",
    "shopping",
    "1_as",
    1
  ],
  [
    "dovana",
    "подарунок",
    "gift / present",
    "shopping",
    "2_a",
    1
  ],
  [
    "maišelis",
    "пакет / торбинка",
    "shopping bag",
    "shopping",
    "1_is",
    1
  ],
  [
    "prekė",
    "товар",
    "item / product / good",
    "shopping",
    "2_e",
    1
  ],
  [
    "skyrius",
    "відділ",
    "department / section",
    "shopping",
    "4_ius",
    1
  ],
  [
    "pirkėjas",
    "покупець",
    "buyer / shopper",
    "shopping",
    "1_as",
    2
  ],
  [
    "klientas",
    "клієнт",
    "client / customer",
    "shopping",
    "1_as",
    2
  ],
  [
    "katalogas",
    "каталог",
    "catalog",
    "shopping",
    "1_as",
    2
  ],
  [
    "akcija",
    "акція / розпродаж",
    "promotion / sale",
    "shopping",
    "2_a",
    2
  ],
  [
    "išpardavimas",
    "розпродаж",
    "clearance sale",
    "shopping",
    "1_as",
    2
  ],
  [
    "grąža",
    "решта (здача)",
    "change (money)",
    "shopping",
    "2_a",
    2
  ],
  [
    "mokėjimas",
    "оплата / платіж",
    "payment",
    "shopping",
    "1_as",
    2
  ],
  [
    "užsakymas",
    "замовлення",
    "order",
    "shopping",
    "1_as",
    2
  ],
  [
    "pristatymas",
    "доставка",
    "delivery",
    "shopping",
    "1_as",
    2
  ],
  [
    "siunta",
    "посилка",
    "parcel / shipment",
    "shopping",
    "2_a",
    2
  ],
  [
    "pakuotė",
    "упаковка / пакування",
    "packaging / pack",
    "shopping",
    "2_e",
    2
  ],
  [
    "dėžė",
    "коробка / ящик",
    "box",
    "shopping",
    "2_e",
    2
  ],
  [
    "dėžutė",
    "коробочка",
    "small box / carton",
    "shopping",
    "2_e",
    2
  ],
  [
    "butelis",
    "пляшка",
    "bottle",
    "shopping",
    "1_is",
    2
  ],
  [
    "stiklainis",
    "банка (скляна)",
    "jar",
    "shopping",
    "1_is",
    2
  ],
  [
    "skardinė",
    "бляшанка",
    "tin can",
    "shopping",
    "2_e",
    3
  ],
  [
    "etiketė",
    "етикетка / бирка",
    "label / price tag",
    "shopping",
    "2_e",
    3
  ],
  [
    "garantija",
    "гарантія",
    "warranty / guarantee",
    "shopping",
    "2_a",
    3
  ],
  [
    "kokybė",
    "якість",
    "quality",
    "shopping",
    "2_e",
    3
  ],
  [
    "kiekis",
    "кількість",
    "quantity / amount",
    "shopping",
    "1_is",
    3
  ],
  [
    "svoris",
    "вага",
    "weight",
    "shopping",
    "1_is",
    3
  ],
  [
    "dydis",
    "розмір",
    "size",
    "shopping",
    "1_is",
    3
  ],
  [
    "pasirinkimas",
    "вибір / асортимент",
    "choice / selection",
    "shopping",
    "1_as",
    3
  ],
  [
    "prekyba",
    "торгівля",
    "trade / commerce",
    "shopping",
    "2_a",
    3
  ],
  [
    "rinka",
    "ринок (економічний)",
    "market",
    "shopping",
    "2_a",
    3
  ],
  [
    "kioskas",
    "кіоск",
    "kiosk / newsstand",
    "shopping",
    "1_as",
    3
  ],
  [
    "kepyklėlė",
    "пекарня",
    "bakery",
    "shopping",
    "2_e",
    3
  ],
  [
    "mėsinė",
    "м’ясна крамниця",
    "butcher shop",
    "shopping",
    "2_e",
    3
  ],
  [
    "knygynas",
    "книгарня",
    "bookstore",
    "shopping",
    "1_as",
    3
  ],
  [
    "vežimėlis",
    "візок (у супермаркеті)",
    "shopping cart / trolley",
    "shopping",
    "1_is",
    3
  ],
  [
    "vitrina",
    "вітрина",
    "display window",
    "shopping",
    "2_a",
    3
  ],
  [
    "eilė",
    "черга / ряд",
    "queue / line",
    "shopping",
    "2_e",
    2
  ],
  [
    "grąžinimas",
    "повернення (товару)",
    "return / refund",
    "shopping",
    "1_as",
    4
  ],
  [
    "keitimas",
    "обмін",
    "exchange",
    "shopping",
    "1_as",
    4
  ],
  [
    "vartotojas",
    "споживач / користувач",
    "consumer / user",
    "shopping",
    "1_as",
    4
  ],
  [
    "gamintojas",
    "виробник",
    "manufacturer / producer",
    "shopping",
    "1_as",
    4
  ],
  [
    "tiekėjas",
    "постачальник",
    "supplier / provider",
    "shopping",
    "1_as",
    4
  ],
  [
    "importas",
    "імпорт",
    "import",
    "shopping",
    "1_as",
    4
  ],
  [
    "eksportas",
    "експорт",
    "export",
    "shopping",
    "1_as",
    4
  ],
  [
    "vertė",
    "вартість / цінність",
    "value / worth",
    "shopping",
    "2_e",
    4
  ],
  [
    "mokestis",
    "податок / плата",
    "tax / fee",
    "shopping",
    "1_is",
    4
  ],
  [
    "išlaida",
    "витрата",
    "expense",
    "shopping",
    "2_a",
    4
  ],
  [
    "nuostolis",
    "збиток",
    "loss",
    "shopping",
    "1_is",
    4
  ],
  [
    "pelnas",
    "прибуток",
    "profit",
    "shopping",
    "1_as",
    4
  ],
  [
    "biudžetas",
    "бюджет",
    "budget",
    "shopping",
    "1_as",
    4
  ],
  [
    "skola",
    "борг",
    "debt",
    "shopping",
    "2_a",
    4
  ],
  [
    "paskola",
    "позика / кредит",
    "loan",
    "shopping",
    "2_a",
    4
  ],
  [
    "kreditas",
    "кредит",
    "credit",
    "shopping",
    "1_as",
    4
  ],
  [
    "indėlis",
    "вклад / депозит",
    "deposit / contribution",
    "shopping",
    "1_is",
    4
  ],
  [
    "valiuta",
    "валюта",
    "currency",
    "shopping",
    "2_a",
    4
  ],
  [
    "kursas",
    "курс (валют / навчання)",
    "exchange rate / course",
    "shopping",
    "1_as",
    3
  ],
  [
    "direktorius",
    "директор",
    "director / principal",
    "work",
    "4_ius",
    1
  ],
  [
    "policininkas",
    "поліцейський",
    "police officer",
    "work",
    "1_as",
    1
  ],
  [
    "virėjas",
    "кухар",
    "cook / chef",
    "work",
    "1_as",
    1
  ],
  [
    "kirpėjas",
    "перукар",
    "hairdresser / barber",
    "work",
    "1_as",
    1
  ],
  [
    "aktorius",
    "актор",
    "actor",
    "work",
    "4_ius",
    1
  ],
  [
    "dainininkas",
    "співак",
    "singer",
    "work",
    "1_as",
    1
  ],
  [
    "menininkas",
    "митець / художник",
    "artist",
    "work",
    "1_as",
    2
  ],
  [
    "dailininkas",
    "художник",
    "painter / artist",
    "work",
    "1_as",
    2
  ],
  [
    "rašytojas",
    "письменник",
    "writer / author",
    "work",
    "1_as",
    2
  ],
  [
    "žurnalistas",
    "журналіст",
    "journalist",
    "work",
    "1_as",
    2
  ],
  [
    "inžinierius",
    "інженеp",
    "engineer",
    "work",
    "4_ius",
    2
  ],
  [
    "programuotojas",
    "програміст",
    "programmer / developer",
    "work",
    "1_as",
    2
  ],
  [
    "teisininkas",
    "юрист / правник",
    "lawyer",
    "work",
    "1_as",
    2
  ],
  [
    "advokatas",
    "адвокат",
    "attorney / advocate",
    "work",
    "1_as",
    2
  ],
  [
    "buhalteris",
    "бухгалтер",
    "accountant",
    "work",
    "1_is",
    2
  ],
  [
    "vadybininkas",
    "менеджер",
    "manager",
    "work",
    "1_as",
    2
  ],
  [
    "sekretorius",
    "секретар",
    "secretary",
    "work",
    "4_ius",
    2
  ],
  [
    "padavėjas",
    "офіціант",
    "waiter",
    "work",
    "1_as",
    2
  ],
  [
    "statybininkas",
    "будівельник",
    "construction worker",
    "work",
    "1_as",
    2
  ],
  [
    "mechanikas",
    "механік",
    "mechanic",
    "work",
    "1_as",
    2
  ],
  [
    "elektrikas",
    "електрик",
    "electrician",
    "work",
    "1_as",
    2
  ],
  [
    "ūkininkas",
    "фермер",
    "farmer",
    "work",
    "1_as",
    2
  ],
  [
    "kareivis",
    "солдат / військовий",
    "soldier",
    "work",
    "1_is",
    2
  ],
  [
    "gaisrininkas",
    "пожежник",
    "firefighter",
    "work",
    "1_as",
    2
  ],
  [
    "darbuotojas",
    "працівник / співробітник",
    "employee / worker",
    "work",
    "1_as",
    2
  ],
  [
    "darbdavys",
    "роботодавець",
    "employer",
    "work",
    "1_ys",
    3
  ],
  [
    "specialistė",
    "спеціалістка / фахівчиня",
    "female specialist",
    "work",
    "2_e",
    3
  ],
  [
    "specialistas",
    "спеціаліст / фахівець",
    "specialist / expert",
    "work",
    "1_as",
    3
  ],
  [
    "ekspertas",
    "експерт",
    "expert",
    "work",
    "1_as",
    3
  ],
  [
    "mokslininkas",
    "науковець / вчений",
    "scientist / researcher",
    "work",
    "1_as",
    3
  ],
  [
    "tyrėjas",
    "дослідник",
    "researcher / investigator",
    "work",
    "1_as",
    3
  ],
  [
    "vertėjas",
    "перекладач",
    "translator / interpreter",
    "work",
    "1_as",
    3
  ],
  [
    "architektas",
    "архітектор",
    "architect",
    "work",
    "1_as",
    3
  ],
  [
    "dizaineris",
    "дизайнер",
    "designer",
    "work",
    "1_is",
    3
  ],
  [
    "fotografas",
    "фотограф",
    "photographer",
    "work",
    "1_as",
    3
  ],
  [
    "režisierius",
    "режисер",
    "director (film/theater)",
    "work",
    "4_ius",
    3
  ],
  [
    "muzikantas",
    "музикант",
    "musician",
    "work",
    "1_as",
    3
  ],
  [
    "sportininkas",
    "спортсмен",
    "athlete",
    "work",
    "1_as",
    3
  ],
  [
    "treneris",
    "тренер",
    "coach / trainer",
    "work",
    "1_is",
    3
  ],
  [
    "teisėjas",
    "суддя / арбітр",
    "judge / referee",
    "work",
    "1_as",
    3
  ],
  [
    "įmonė",
    "підприємство / компанія",
    "company / enterprise",
    "work",
    "2_e",
    3
  ],
  [
    "bendrovė",
    "компанія / товариство",
    "corporation / company",
    "work",
    "2_e",
    3
  ],
  [
    "organizacija",
    "організація",
    "organization",
    "work",
    "2_a",
    3
  ],
  [
    "įstaiga",
    "установа / заклад",
    "institution / agency",
    "work",
    "2_a",
    3
  ],
  [
    "fabrika",
    "фабрика",
    "factory",
    "work",
    "2_a",
    3
  ],
  [
    "gamykla",
    "завод",
    "plant / factory",
    "work",
    "2_a",
    3
  ],
  [
    "susitikimas",
    "зустріч / нарада",
    "meeting",
    "work",
    "1_as",
    3
  ],
  [
    "posėdis",
    "засідання / нарада",
    "session / board meeting",
    "work",
    "1_is",
    3
  ],
  [
    "užduotis",
    "завдання / задача",
    "task / assignment",
    "work",
    "3_is_f",
    3
  ],
  [
    "ataskaita",
    "звіт",
    "report",
    "work",
    "2_a",
    3
  ],
  [
    "dokumentas",
    "документ",
    "document",
    "work",
    "1_as",
    2
  ],
  [
    "parašas",
    "підпис",
    "signature",
    "work",
    "1_as",
    3
  ],
  [
    "antspaudas",
    "печатка / штамп",
    "stamp / seal",
    "work",
    "1_as",
    4
  ],
  [
    "karjera",
    "кар’єра",
    "career",
    "work",
    "2_a",
    3
  ],
  [
    "profesija",
    "професія / фах",
    "profession",
    "work",
    "2_a",
    2
  ],
  [
    "patirtis",
    "досвід",
    "experience",
    "work",
    "3_is_f",
    3
  ],
  [
    "įgūdis",
    "навичка / уміння",
    "skill",
    "work",
    "1_is",
    4
  ],
  [
    "kompetencija",
    "компетенція",
    "competence",
    "work",
    "2_a",
    4
  ],
  [
    "atsakomybė",
    "відповідальність",
    "responsibility",
    "work",
    "2_e",
    4
  ],
  [
    "pareiga",
    "обов’язок / посада",
    "duty / obligation",
    "work",
    "2_a",
    4
  ],
  [
    "konkursas",
    "конкурс",
    "competition / tender",
    "work",
    "1_as",
    4
  ],
  [
    "atranka",
    "відбір / рекрутинг",
    "selection / screening",
    "work",
    "2_a",
    4
  ],
  [
    "pokalbis",
    "розмова / співбесіда",
    "conversation / interview",
    "work",
    "1_is",
    3
  ],
  [
    "poilsis",
    "відпочинок",
    "rest / leisure",
    "work",
    "1_is",
    2
  ],
  [
    "pertrauka",
    "перерва",
    "break / intermission",
    "work",
    "2_a",
    2
  ],
  [
    "pamaina",
    "зміна (робоча)",
    "work shift",
    "work",
    "2_a",
    4
  ],
  [
    "grafikas",
    "графік / розклад",
    "schedule / chart",
    "work",
    "1_as",
    3
  ],
  [
    "premija",
    "премія / бонус",
    "bonus / award",
    "work",
    "2_a",
    4
  ],
  [
    "pensija",
    "пенсія",
    "pension / retirement",
    "work",
    "2_a",
    4
  ],
  [
    "verslas",
    "бізнес / справа",
    "business",
    "work",
    "1_as",
    3
  ],
  [
    "verslininkas",
    "підприємець / бізнесмен",
    "entrepreneur / businessman",
    "work",
    "1_as",
    3
  ],
  [
    "partneris",
    "партнер",
    "partner",
    "work",
    "1_is",
    3
  ],
  [
    "konkurentas",
    "конкурент",
    "competitor",
    "work",
    "1_as",
    4
  ],
  [
    "susitarimas",
    "домовленість / угода",
    "agreement / deal",
    "work",
    "1_as",
    4
  ],
  [
    "sprendimas",
    "рішення",
    "decision / solution",
    "work",
    "1_as",
    3
  ],
  [
    "rezultatas",
    "результат",
    "result / outcome",
    "work",
    "1_as",
    2
  ],
  [
    "tikslas",
    "мета / ціль",
    "goal / purpose",
    "work",
    "1_as",
    3
  ],
  [
    "planas",
    "план",
    "plan",
    "work",
    "1_as",
    2
  ],
  [
    "sėkmė",
    "успіх / удача",
    "success / luck",
    "work",
    "2_e",
    3
  ],
  [
    "troleibusas",
    "тролейбус",
    "trolleybus",
    "transport",
    "1_as",
    1
  ],
  [
    "tramvajus",
    "трамвай",
    "tram / streetcar",
    "transport",
    "4_ius",
    1
  ],
  [
    "motociklas",
    "мотоцикл",
    "motorcycle",
    "transport",
    "1_as",
    1
  ],
  [
    "paspirtukas",
    "самокат",
    "scooter",
    "transport",
    "1_as",
    1
  ],
  [
    "ratas",
    "колесо / коло",
    "wheel / circle",
    "transport",
    "1_as",
    1
  ],
  [
    "mašina",
    "машина / авто",
    "car / machine",
    "transport",
    "2_a",
    1
  ],
  [
    "mikroautobusas",
    "мікроавтобус / маршрутка",
    "minibus",
    "transport",
    "1_as",
    2
  ],
  [
    "sunkvežimis",
    "вантажівка",
    "truck / lorry",
    "transport",
    "1_is",
    2
  ],
  [
    "traktorius",
    "трактор",
    "tractor",
    "transport",
    "4_ius",
    2
  ],
  [
    "sraigtasparnis",
    "гелікоптер / вертоліт",
    "helicopter",
    "transport",
    "1_is",
    2
  ],
  [
    "valtis",
    "човен",
    "boat",
    "transport",
    "3_is_f",
    2
  ],
  [
    "keltas",
    "пором",
    "ferry",
    "transport",
    "1_as",
    2
  ],
  [
    "jachta",
    "яхта",
    "yacht",
    "transport",
    "2_a",
    2
  ],
  [
    "vagonas",
    "вагон",
    "train car / carriage",
    "transport",
    "1_as",
    2
  ],
  [
    "bėgis",
    "рейка",
    "rail / track",
    "transport",
    "1_is",
    3
  ],
  [
    "peronas",
    "перон / платформа",
    "station platform",
    "transport",
    "1_as",
    2
  ],
  [
    "keleivis",
    "пасажир",
    "passenger",
    "transport",
    "1_is",
    2
  ],
  [
    "praeivis",
    "перехожий",
    "passerby / pedestrian",
    "transport",
    "1_is",
    3
  ],
  [
    "šviesoforas",
    "світлофор",
    "traffic light",
    "transport",
    "1_as",
    2
  ],
  [
    "sankryža",
    "перехрестя",
    "intersection / crossroads",
    "transport",
    "2_a",
    2
  ],
  [
    "perėja",
    "пішохідний перехід",
    "crosswalk / crossing",
    "transport",
    "2_a",
    2
  ],
  [
    "šaligatvis",
    "тротуар",
    "sidewalk / pavement",
    "transport",
    "1_is",
    2
  ],
  [
    "greitkelis",
    "автомагістраль / шосе",
    "highway / motorway",
    "transport",
    "1_is",
    3
  ],
  [
    "aplinkkelis",
    "об’їзна дорога",
    "bypass road",
    "transport",
    "1_is",
    4
  ],
  [
    "tunelis",
    "тунель",
    "tunnel",
    "transport",
    "1_is",
    2
  ],
  [
    "viadukas",
    "віадук / естакада",
    "viaduct / overpass",
    "transport",
    "1_as",
    4
  ],
  [
    "žiedas",
    "кільцева розв’язка / каблучка",
    "roundabout / ring",
    "transport",
    "1_as",
    3
  ],
  [
    "posūkis",
    "поворот",
    "turn / bend",
    "transport",
    "1_is",
    3
  ],
  [
    "ženklas",
    "дорожній знак / символ",
    "road sign / mark",
    "transport",
    "1_as",
    2
  ],
  [
    "greitis",
    "швидкість",
    "speed / velocity",
    "transport",
    "1_is",
    2
  ],
  [
    "eismas",
    "дорожній рух",
    "traffic",
    "transport",
    "1_as",
    3
  ],
  [
    "spūstis",
    "затор (на дорозі)",
    "traffic jam / congestion",
    "transport",
    "3_is_f",
    3
  ],
  [
    "avarija",
    "аварія / ДТП",
    "accident / crash",
    "transport",
    "2_a",
    3
  ],
  [
    "bauda",
    "штраф",
    "fine / penalty",
    "transport",
    "2_a",
    3
  ],
  [
    "aikštelė",
    "парковка / майданчик",
    "parking lot / court",
    "transport",
    "2_e",
    2
  ],
  [
    "degalinė",
    "автозаправка (АЗС)",
    "gas station",
    "transport",
    "2_e",
    2
  ],
  [
    "benzinas",
    "бензин",
    "gasoline / petrol",
    "transport",
    "1_as",
    2
  ],
  [
    "dyzelinas",
    "дизельне пальне",
    "diesel fuel",
    "transport",
    "1_as",
    3
  ],
  [
    "kuras",
    "паливо / пальне",
    "fuel",
    "transport",
    "1_as",
    3
  ],
  [
    "variklis",
    "двигун / мотор",
    "engine / motor",
    "transport",
    "1_is",
    3
  ],
  [
    "vairas",
    "кермо",
    "steering wheel / handlebars",
    "transport",
    "1_as",
    2
  ],
  [
    "stabdys",
    "гальмо",
    "brake",
    "transport",
    "1_ys",
    3
  ],
  [
    "padanga",
    "шина / покришка",
    "tire",
    "transport",
    "2_a",
    3
  ],
  [
    "bagažinė",
    "багажник",
    "car trunk / boot",
    "transport",
    "2_e",
    3
  ],
  [
    "sėdynė",
    "сидіння",
    "seat",
    "transport",
    "2_e",
    3
  ],
  [
    "diržas",
    "ремінь (безпеки)",
    "seatbelt / belt",
    "transport",
    "1_as",
    2
  ],
  [
    "žibintas",
    "фара / ліхтар",
    "headlight / lantern",
    "transport",
    "1_as",
    3
  ],
  [
    "stiklas",
    "скло / лобове скло",
    "glass / windshield",
    "transport",
    "1_as",
    2
  ],
  [
    "valytuvas",
    "склоочисник (двірник)",
    "windshield wiper",
    "transport",
    "1_as",
    4
  ],
  [
    "akumuliatorius",
    "акумулятор",
    "battery",
    "transport",
    "4_ius",
    4
  ],
  [
    "kroviklis",
    "зарядний пристрій",
    "charger",
    "transport",
    "1_is",
    3
  ],
  [
    "elektromobilis",
    "електромобіль",
    "electric car",
    "transport",
    "1_is",
    3
  ],
  [
    "krovinys",
    "вантаж",
    "cargo / freight",
    "transport",
    "1_ys",
    4
  ],
  [
    "vežėjas",
    "перевізник",
    "carrier / transporter",
    "transport",
    "1_as",
    4
  ],
  [
    "maršrutas",
    "маршрут",
    "route / itinerary",
    "transport",
    "1_as",
    3
  ],
  [
    "tvarkaraštis",
    "розклад руху",
    "timetable / schedule",
    "transport",
    "1_is",
    3
  ],
  [
    "reisas",
    "рейс",
    "flight / trip / run",
    "transport",
    "1_as",
    3
  ],
  [
    "pakilimas",
    "зліт / підйом",
    "takeoff / ascent",
    "transport",
    "1_as",
    4
  ],
  [
    "nusileidimas",
    "посадка / приземлення",
    "landing / descent",
    "transport",
    "1_as",
    4
  ],
  [
    "pilotas",
    "пілот",
    "pilot",
    "transport",
    "1_as",
    2
  ],
  [
    "kapitonas",
    "капітан",
    "captain",
    "transport",
    "1_as",
    2
  ],
  [
    "jūreivis",
    "моряк",
    "sailor",
    "transport",
    "1_is",
    3
  ],
  [
    "restoranas",
    "ресторан",
    "restaurant",
    "city",
    "1_as",
    1
  ],
  [
    "baras",
    "бар",
    "bar / pub",
    "city",
    "1_as",
    1
  ],
  [
    "teatras",
    "театр",
    "theater",
    "city",
    "1_as",
    1
  ],
  [
    "kinas",
    "кіно / кінотеатр",
    "cinema / movie theater",
    "city",
    "1_as",
    1
  ],
  [
    "stadionas",
    "стадіон",
    "stadium",
    "city",
    "1_as",
    1
  ],
  [
    "baseinas",
    "басейн",
    "swimming pool",
    "city",
    "1_as",
    1
  ],
  [
    "salė",
    "зал / зала",
    "hall / gym",
    "city",
    "2_e",
    1
  ],
  [
    "centras",
    "центр",
    "center / downtown",
    "city",
    "1_as",
    1
  ],
  [
    "rajonas",
    "район",
    "district / neighborhood",
    "city",
    "1_as",
    1
  ],
  [
    "kaimas",
    "село",
    "village / countryside",
    "city",
    "1_as",
    1
  ],
  [
    "pastatas",
    "будівля / споруда",
    "building",
    "city",
    "1_as",
    2
  ],
  [
    "bokštas",
    "вежа",
    "tower",
    "city",
    "1_as",
    2
  ],
  [
    "paminklas",
    "пам’ятник",
    "monument / memorial",
    "city",
    "1_as",
    2
  ],
  [
    "fontanas",
    "фонтан",
    "fountain",
    "city",
    "1_as",
    2
  ],
  [
    "suoliukas",
    "лавка (у парку)",
    "park bench",
    "city",
    "1_as",
    2
  ],
  [
    "žibintuvėlis",
    "ліхтарик",
    "flashlight",
    "city",
    "1_is",
    3
  ],
  [
    "alėja",
    "алея",
    "alley / avenue",
    "city",
    "2_a",
    2
  ],
  [
    "prospektas",
    "проспект",
    "avenue / boulevard",
    "city",
    "1_as",
    2
  ],
  [
    "skersgatvis",
    "провулок",
    "lane / side street",
    "city",
    "1_is",
    3
  ],
  [
    "krantinė",
    "набережна",
    "embankment / quay",
    "city",
    "2_e",
    3
  ],
  [
    "priemiestis",
    "передмістя",
    "suburb",
    "city",
    "1_is",
    3
  ],
  [
    "senamiestis",
    "старе місто",
    "old town",
    "city",
    "1_is",
    2
  ],
  [
    "rotušė",
    "ратуша",
    "town hall / city hall",
    "city",
    "2_e",
    3
  ],
  [
    "katedra",
    "кафедральний собор",
    "cathedral",
    "city",
    "2_a",
    2
  ],
  [
    "vienuolynas",
    "монастир",
    "monastery / convent",
    "city",
    "1_as",
    4
  ],
  [
    "galerija",
    "галерея",
    "art gallery",
    "city",
    "2_a",
    2
  ],
  [
    "paroda",
    "виставка",
    "exhibition",
    "city",
    "2_a",
    2
  ],
  [
    "koncertas",
    "концерт",
    "concert",
    "city",
    "1_as",
    1
  ],
  [
    "spektaklis",
    "вистава / спектакль",
    "play / performance",
    "city",
    "1_is",
    2
  ],
  [
    "festivalis",
    "фестиваль",
    "festival",
    "city",
    "1_is",
    2
  ],
  [
    "klubas",
    "клуб",
    "club",
    "city",
    "1_as",
    1
  ],
  [
    "savivaldybė",
    "муніципалітет / мерія",
    "municipality / city council",
    "city",
    "2_e",
    3
  ],
  [
    "ministerija",
    "міністерство",
    "ministry",
    "city",
    "2_a",
    4
  ],
  [
    "ambasada",
    "посольство",
    "embassy",
    "city",
    "2_a",
    3
  ],
  [
    "konsulatas",
    "консульство",
    "consulate",
    "city",
    "1_as",
    4
  ],
  [
    "teismas",
    "суд",
    "court of law",
    "city",
    "1_as",
    3
  ],
  [
    "policija",
    "поліція",
    "police",
    "city",
    "2_a",
    1
  ],
  [
    "kalėjimas",
    "в’язниця",
    "prison / jail",
    "city",
    "1_as",
    4
  ],
  [
    "valgykla",
    "їдальня",
    "canteen / cafeteria",
    "city",
    "2_a",
    2
  ],
  [
    "kirpykla",
    "перукарня",
    "barbershop / hair salon",
    "city",
    "2_a",
    2
  ],
  [
    "skalbykla",
    "пральня",
    "laundromat / laundry",
    "city",
    "2_a",
    3
  ],
  [
    "dirbtuvė",
    "майстерня",
    "workshop / studio",
    "city",
    "2_e",
    3
  ],
  [
    "sandėlis",
    "склад",
    "warehouse / storage",
    "city",
    "1_is",
    3
  ],
  [
    "turgavietė",
    "ринкова площа / базар",
    "marketplace",
    "city",
    "2_e",
    4
  ],
  [
    "apžvalga",
    "огляд / панорама",
    "overview / lookout",
    "city",
    "2_a",
    4
  ],
  [
    "vietovė",
    "місцевість",
    "locality / area",
    "city",
    "2_e",
    4
  ],
  [
    "gyvenvietė",
    "населений пункт / селище",
    "settlement",
    "city",
    "2_e",
    4
  ],
  [
    "sostinė",
    "столиця",
    "capital city",
    "city",
    "2_e",
    2
  ],
  [
    "provincija",
    "провінція",
    "province",
    "city",
    "2_a",
    4
  ],
  [
    "apskritis",
    "повіт / область",
    "county / region",
    "city",
    "3_is_f",
    4
  ],
  [
    "valstybė",
    "держава",
    "state / country",
    "city",
    "2_e",
    3
  ],
  [
    "tėvynė",
    "батьківщина",
    "homeland / motherland",
    "city",
    "2_e",
    3
  ],
  [
    "pasaulis",
    "світ",
    "world",
    "city",
    "1_is",
    2
  ],
  [
    "žemynas",
    "материк / континент",
    "continent",
    "city",
    "1_as",
    3
  ],
  [
    "mokinys",
    "учень / школяр",
    "schoolboy / pupil",
    "school",
    "1_ys",
    1
  ],
  [
    "mokinė",
    "учениця / школярка",
    "schoolgirl / pupil",
    "school",
    "2_e",
    1
  ],
  [
    "studentė",
    "студентка",
    "female student",
    "school",
    "2_e",
    1
  ],
  [
    "klasė",
    "клас",
    "classroom / grade",
    "school",
    "2_e",
    1
  ],
  [
    "lenta",
    "дошка (шкільна)",
    "blackboard / board",
    "school",
    "2_a",
    1
  ],
  [
    "pieštukas",
    "олівець",
    "pencil",
    "school",
    "1_as",
    1
  ],
  [
    "rašiklis",
    "ручка (для письма)",
    "pen",
    "school",
    "1_is",
    1
  ],
  [
    "sąsiuvinis",
    "зошит",
    "exercise book / notebook",
    "school",
    "1_is",
    1
  ],
  [
    "puslapis",
    "сторінка",
    "page",
    "school",
    "1_is",
    1
  ],
  [
    "raidė",
    "літера / буква",
    "letter (of alphabet)",
    "school",
    "2_e",
    1
  ],
  [
    "tekstas",
    "текст",
    "text",
    "school",
    "1_as",
    1
  ],
  [
    "pratimas",
    "вправа",
    "exercise / drill",
    "school",
    "1_as",
    1
  ],
  [
    "testas",
    "тест",
    "test / quiz",
    "school",
    "1_as",
    1
  ],
  [
    "egzaminas",
    "іспит / екзамен",
    "exam",
    "school",
    "1_as",
    2
  ],
  [
    "pažymys",
    "оцінка / бал",
    "grade / mark",
    "school",
    "1_ys",
    2
  ],
  [
    "diplomas",
    "диплом",
    "diploma / degree",
    "school",
    "1_as",
    2
  ],
  [
    "pažymėjimas",
    "посвідчення / сертифікат",
    "certificate / ID card",
    "school",
    "1_as",
    3
  ],
  [
    "vadovėlis",
    "підручник",
    "textbook",
    "school",
    "1_is",
    2
  ],
  [
    "užrašinė",
    "блокнот / записник",
    "notepad",
    "school",
    "2_e",
    2
  ],
  [
    "trintukas",
    "гумка (стирачка)",
    "eraser",
    "school",
    "1_as",
    2
  ],
  [
    "liniuotė",
    "лінійка",
    "ruler",
    "school",
    "2_e",
    2
  ],
  [
    "kuprinė",
    "рюкзак / ранець",
    "backpack",
    "school",
    "2_e",
    2
  ],
  [
    "darželis",
    "дитячий садок / квітник",
    "kindergarten / small garden",
    "school",
    "1_is",
    2
  ],
  [
    "gimnazija",
    "гімназія",
    "gymnasium / high school",
    "school",
    "2_a",
    2
  ],
  [
    "kolegija",
    "коледж / колегія",
    "college",
    "school",
    "2_a",
    3
  ],
  [
    "akademija",
    "академія",
    "academy",
    "school",
    "2_a",
    3
  ],
  [
    "fakultetas",
    "факультет",
    "faculty / department",
    "school",
    "1_as",
    2
  ],
  [
    "paskaita",
    "лекція",
    "lecture",
    "school",
    "2_a",
    2
  ],
  [
    "seminaras",
    "семінар",
    "seminar / workshop",
    "school",
    "1_as",
    3
  ],
  [
    "dėstytojas",
    "викладач (університету)",
    "lecturer / instructor",
    "school",
    "1_as",
    2
  ],
  [
    "mokslas",
    "наука / навчання",
    "science / study",
    "school",
    "1_as",
    2
  ],
  [
    "žinia",
    "звістка / новина / знання",
    "news / message",
    "school",
    "2_ia",
    2
  ],
  [
    "informacija",
    "інформація",
    "information",
    "school",
    "2_a",
    2
  ],
  [
    "gramatika",
    "граматика",
    "grammar",
    "school",
    "2_a",
    2
  ],
  [
    "tarimas",
    "вимова",
    "pronunciation",
    "school",
    "1_as",
    3
  ],
  [
    "kirtis",
    "наголос",
    "word stress / accent",
    "school",
    "1_is",
    3
  ],
  [
    "linksnis",
    "відмінок",
    "grammatical case",
    "school",
    "1_is",
    2
  ],
  [
    "linksniuotė",
    "тип відмінювання (відміна)",
    "declension",
    "school",
    "2_e",
    3
  ],
  [
    "daiktavardis",
    "іменник",
    "noun",
    "school",
    "1_is",
    3
  ],
  [
    "būdvardis",
    "прикметник",
    "adjective",
    "school",
    "1_is",
    3
  ],
  [
    "veiksmažodis",
    "дієслово",
    "verb",
    "school",
    "1_is",
    3
  ],
  [
    "prielinksnis",
    "прийменник",
    "preposition",
    "school",
    "1_is",
    3
  ],
  [
    "kamienas",
    "основа слова / стовбур",
    "word stem / tree trunk",
    "school",
    "1_as",
    3
  ],
  [
    "šaknis",
    "корінь",
    "root",
    "school",
    "3_is_f",
    3
  ],
  [
    "priesaga",
    "суфікс",
    "suffix",
    "school",
    "2_a",
    4
  ],
  [
    "priešdėlis",
    "префікс",
    "prefix",
    "school",
    "1_is",
    4
  ],
  [
    "vienaskaita",
    "однина",
    "singular",
    "school",
    "2_a",
    3
  ],
  [
    "daugiskaita",
    "множина",
    "plural",
    "school",
    "2_a",
    3
  ],
  [
    "vertimas",
    "переклад",
    "translation",
    "school",
    "1_as",
    2
  ],
  [
    "pavyzdys",
    "приклад / зразок",
    "example / sample",
    "school",
    "1_ys",
    2
  ],
  [
    "paaiškinimas",
    "пояснення",
    "explanation",
    "school",
    "1_as",
    3
  ],
  [
    "apibrėžimas",
    "визначення / дефініція",
    "definition",
    "school",
    "1_as",
    4
  ],
  [
    "literatūra",
    "література",
    "literature",
    "school",
    "2_a",
    2
  ],
  [
    "istorija",
    "історія",
    "history / story",
    "school",
    "2_a",
    2
  ],
  [
    "matematika",
    "математика",
    "mathematics",
    "school",
    "2_a",
    2
  ],
  [
    "fizika",
    "фізика",
    "physics",
    "school",
    "2_a",
    3
  ],
  [
    "chemija",
    "хімія",
    "chemistry",
    "school",
    "2_a",
    3
  ],
  [
    "biologija",
    "біологія",
    "biology",
    "school",
    "2_a",
    3
  ],
  [
    "geografija",
    "географія",
    "geography",
    "school",
    "2_a",
    3
  ],
  [
    "filosofija",
    "філософія",
    "philosophy",
    "school",
    "2_a",
    4
  ],
  [
    "psichologija",
    "психологія",
    "psychology",
    "school",
    "2_a",
    4
  ],
  [
    "ekonomika",
    "економіка",
    "economics / economy",
    "school",
    "2_a",
    4
  ],
  [
    "informatika",
    "інформатика",
    "computer science",
    "school",
    "2_a",
    3
  ],
  [
    "tyrimas",
    "дослідження",
    "research / study",
    "school",
    "1_as",
    4
  ],
  [
    "atradimas",
    "відкриття",
    "discovery",
    "school",
    "1_as",
    4
  ],
  [
    "išradimas",
    "винахід",
    "invention",
    "school",
    "1_as",
    4
  ],
  [
    "teorija",
    "теорія",
    "theory",
    "school",
    "2_a",
    4
  ],
  [
    "praktika",
    "практика",
    "practice / internship",
    "school",
    "2_a",
    3
  ],
  [
    "metodas",
    "метод",
    "method",
    "school",
    "1_as",
    4
  ],
  [
    "sistema",
    "система",
    "system",
    "school",
    "2_a",
    3
  ],
  [
    "programa",
    "програма",
    "program / curriculum",
    "school",
    "2_a",
    2
  ],
  [
    "stipendija",
    "стипендія",
    "scholarship",
    "school",
    "2_a",
    3
  ],
  [
    "katė",
    "кішка / кіт",
    "cat",
    "nature",
    "2_e",
    1
  ],
  [
    "paukštis",
    "птах",
    "bird",
    "nature",
    "1_is",
    1
  ],
  [
    "arklys",
    "кінь",
    "horse",
    "nature",
    "1_ys",
    1
  ],
  [
    "karvė",
    "корова",
    "cow",
    "nature",
    "2_e",
    1
  ],
  [
    "kiaulė",
    "свиня",
    "pig",
    "nature",
    "2_e",
    1
  ],
  [
    "avis",
    "вівця",
    "sheep",
    "nature",
    "3_is_f",
    2
  ],
  [
    "ožka",
    "коза",
    "goat",
    "nature",
    "2_a",
    2
  ],
  [
    "višta",
    "курка",
    "hen / chicken",
    "nature",
    "2_a",
    1
  ],
  [
    "gaidys",
    "півень",
    "rooster",
    "nature",
    "1_ys",
    2
  ],
  [
    "antis",
    "качка",
    "duck",
    "nature",
    "3_is_f",
    2
  ],
  [
    "žąsis",
    "гуска",
    "goose",
    "nature",
    "3_is_f",
    3
  ],
  [
    "pelė",
    "миша",
    "mouse",
    "nature",
    "2_e",
    2
  ],
  [
    "zuikis",
    "заєць",
    "hare / bunny",
    "nature",
    "1_is",
    2
  ],
  [
    "lapė",
    "лисиця",
    "fox",
    "nature",
    "2_e",
    2
  ],
  [
    "vilkas",
    "вовк",
    "wolf",
    "nature",
    "1_as",
    2
  ],
  [
    "lokys",
    "ведмідь",
    "bear",
    "nature",
    "1_ys",
    2
  ],
  [
    "briedis",
    "лось",
    "elk / moose",
    "nature",
    "1_is",
    3
  ],
  [
    "elnias",
    "олень",
    "deer",
    "nature",
    "1_ias",
    3
  ],
  [
    "šernas",
    "кабан / дикий вепр",
    "wild boar",
    "nature",
    "1_as",
    3
  ],
  [
    "voverė",
    "білка",
    "squirrel",
    "nature",
    "2_e",
    2
  ],
  [
    "ežys",
    "їжак",
    "hedgehog",
    "nature",
    "1_ys",
    2
  ],
  [
    "varlė",
    "жаба",
    "frog",
    "nature",
    "2_e",
    2
  ],
  [
    "gyvatė",
    "змія",
    "snake",
    "nature",
    "2_e",
    3
  ],
  [
    "bitė",
    "бджола",
    "bee",
    "nature",
    "2_e",
    2
  ],
  [
    "drugelis",
    "метелик",
    "butterfly",
    "nature",
    "1_is",
    2
  ],
  [
    "uodas",
    "комар",
    "mosquito",
    "nature",
    "1_as",
    3
  ],
  [
    "musė",
    "муха",
    "fly",
    "nature",
    "2_e",
    2
  ],
  [
    "skruzdėlė",
    "мураха",
    "ant",
    "nature",
    "2_e",
    3
  ],
  [
    "voras",
    "павук",
    "spider",
    "nature",
    "1_as",
    2
  ],
  [
    "gyvūnas",
    "тварина",
    "animal",
    "nature",
    "1_as",
    1
  ],
  [
    "žvėris",
    "звір",
    "wild beast / animal",
    "nature",
    "3_is_m",
    3
  ],
  [
    "augalas",
    "рослина",
    "plant",
    "nature",
    "1_as",
    2
  ],
  [
    "gėlė",
    "квітка",
    "flower",
    "nature",
    "2_e",
    1
  ],
  [
    "rožė",
    "троянда",
    "rose",
    "nature",
    "2_e",
    1
  ],
  [
    "tulpė",
    "тюльпан",
    "tulip",
    "nature",
    "2_e",
    2
  ],
  [
    "žolė",
    "трава",
    "grass / herb",
    "nature",
    "2_e",
    1
  ],
  [
    "lapas",
    "листок / аркуш",
    "leaf / sheet of paper",
    "nature",
    "1_as",
    1
  ],
  [
    "šaka",
    "гілка / галузь",
    "branch",
    "nature",
    "2_a",
    2
  ],
  [
    "krūmas",
    "кущ",
    "bush / shrub",
    "nature",
    "1_as",
    2
  ],
  [
    "ąžuolas",
    "дуб",
    "oak",
    "nature",
    "1_as",
    3
  ],
  [
    "beržas",
    "береза",
    "birch",
    "nature",
    "1_as",
    3
  ],
  [
    "pušis",
    "сосна",
    "pine",
    "nature",
    "3_is_f",
    3
  ],
  [
    "eglė",
    "ялина / смерека",
    "spruce / fir tree",
    "nature",
    "2_e",
    2
  ],
  [
    "liepa",
    "липа (також липень)",
    "linden tree (also July)",
    "nature",
    "2_a",
    3
  ],
  [
    "klevas",
    "клен",
    "maple",
    "nature",
    "1_as",
    3
  ],
  [
    "ežeras",
    "озеро",
    "lake",
    "nature",
    "1_as",
    1
  ],
  [
    "tvenkinys",
    "ставок / водойма",
    "pond / reservoir",
    "nature",
    "1_ys",
    3
  ],
  [
    "šaltinis",
    "джерело",
    "spring / source",
    "nature",
    "1_is",
    3
  ],
  [
    "vandenynas",
    "океан",
    "ocean",
    "nature",
    "1_as",
    2
  ],
  [
    "įlanka",
    "затока",
    "bay / gulf",
    "nature",
    "2_a",
    4
  ],
  [
    "sala",
    "острів",
    "island",
    "nature",
    "2_a",
    2
  ],
  [
    "pusiasalis",
    "півострів",
    "peninsula",
    "nature",
    "1_is",
    4
  ],
  [
    "krantas",
    "берег",
    "shore / bank / coast",
    "nature",
    "1_as",
    2
  ],
  [
    "paplūdimys",
    "пляж",
    "beach",
    "nature",
    "1_ys",
    2
  ],
  [
    "smėlis",
    "пісок",
    "sand",
    "nature",
    "1_is",
    2
  ],
  [
    "molis",
    "глина",
    "clay",
    "nature",
    "1_is",
    4
  ],
  [
    "purvas",
    "бруд / болото",
    "mud / dirt",
    "nature",
    "1_as",
    3
  ],
  [
    "dulkė",
    "пилинка / пил",
    "speck of dust",
    "nature",
    "2_e",
    3
  ],
  [
    "kalnas",
    "гора",
    "mountain",
    "nature",
    "1_as",
    1
  ],
  [
    "kalva",
    "пагорб",
    "hill",
    "nature",
    "2_a",
    3
  ],
  [
    "slėnis",
    "долина",
    "valley",
    "nature",
    "1_is",
    3
  ],
  [
    "pieva",
    "лука / галявина",
    "meadow",
    "nature",
    "2_a",
    2
  ],
  [
    "laukas",
    "поле",
    "field / outside",
    "nature",
    "1_as",
    1
  ],
  [
    "pelkė",
    "болото / трясовина",
    "swamp / marsh",
    "nature",
    "2_e",
    4
  ],
  [
    "dykuma",
    "пустеля",
    "desert",
    "nature",
    "2_a",
    3
  ],
  [
    "ola",
    "печера / нора",
    "cave / burrow",
    "nature",
    "2_a",
    4
  ],
  [
    "žemė",
    "земля / ґрунт",
    "earth / land / ground",
    "nature",
    "2_e",
    1
  ],
  [
    "mėnulis",
    "місяць (небесне тіло)",
    "moon",
    "nature",
    "1_is",
    1
  ],
  [
    "žvaigždė",
    "зірка",
    "star",
    "nature",
    "2_e",
    1
  ],
  [
    "planeta",
    "планета",
    "planet",
    "nature",
    "2_a",
    2
  ],
  [
    "visata",
    "всесвіт",
    "universe",
    "nature",
    "2_a",
    4
  ],
  [
    "gamta",
    "природа",
    "nature",
    "nature",
    "2_a",
    1
  ],
  [
    "oras",
    "повітря / погода",
    "air / weather",
    "nature",
    "1_as",
    1
  ],
  [
    "sniegas",
    "сніг",
    "snow",
    "nature",
    "1_as",
    1
  ],
  [
    "ledas",
    "лід / крига",
    "ice",
    "nature",
    "1_as",
    1
  ],
  [
    "rūkas",
    "туман",
    "fog / mist",
    "nature",
    "1_as",
    2
  ],
  [
    "audra",
    "буря / шторм / гроза",
    "storm / tempest",
    "nature",
    "2_a",
    2
  ],
  [
    "perkūnija",
    "гроза / грім",
    "thunderstorm",
    "nature",
    "2_a",
    3
  ],
  [
    "žaibas",
    "блискавка",
    "lightning",
    "nature",
    "1_as",
    3
  ],
  [
    "vaivorykštė",
    "веселка",
    "rainbow",
    "nature",
    "2_e",
    3
  ],
  [
    "šaltis",
    "холод / мороз",
    "cold / frost",
    "nature",
    "1_is",
    2
  ],
  [
    "šalna",
    "заморозок",
    "light frost",
    "nature",
    "2_a",
    4
  ],
  [
    "karštis",
    "спека / жар",
    "heat / fever",
    "nature",
    "1_is",
    2
  ],
  [
    "šiluma",
    "тепло",
    "warmth / heat",
    "nature",
    "2_a",
    2
  ],
  [
    "temperatūra",
    "температура",
    "temperature",
    "nature",
    "2_a",
    2
  ],
  [
    "klimatas",
    "клімат",
    "climate",
    "nature",
    "1_as",
    3
  ],
  [
    "ugnis",
    "вогонь",
    "fire",
    "nature",
    "3_is_f",
    2
  ],
  [
    "dūmas",
    "дим",
    "smoke",
    "nature",
    "1_as",
    3
  ],
  [
    "banga",
    "хвиля",
    "wave",
    "nature",
    "2_a",
    2
  ],
  [
    "srovė",
    "течія / струм",
    "current / stream",
    "nature",
    "2_e",
    4
  ],
  [
    "potvynis",
    "повінь / приплив",
    "flood / high tide",
    "nature",
    "1_is",
    4
  ],
  [
    "sausra",
    "посуха",
    "drought",
    "nature",
    "2_a",
    4
  ],
  [
    "kūnas",
    "тіло",
    "body",
    "health",
    "1_as",
    1
  ],
  [
    "veidas",
    "обличчя",
    "face",
    "health",
    "1_as",
    1
  ],
  [
    "nosis",
    "ніс",
    "nose",
    "health",
    "3_is_f",
    1
  ],
  [
    "burna",
    "рот",
    "mouth",
    "health",
    "2_a",
    1
  ],
  [
    "lūpa",
    "губа",
    "lip",
    "health",
    "2_a",
    2
  ],
  [
    "liežuvis",
    "язик",
    "tongue",
    "health",
    "1_is",
    2
  ],
  [
    "kaklas",
    "шия / горло",
    "neck",
    "health",
    "1_as",
    1
  ],
  [
    "gerklė",
    "горло",
    "throat",
    "health",
    "2_e",
    2
  ],
  [
    "petys",
    "плече",
    "shoulder",
    "health",
    "1_ys",
    2
  ],
  [
    "nugara",
    "спина",
    "back",
    "health",
    "2_a",
    1
  ],
  [
    "krūtinė",
    "груди / грудна клітка",
    "chest / breast",
    "health",
    "2_e",
    2
  ],
  [
    "pilvas",
    "живіт",
    "stomach / belly",
    "health",
    "1_as",
    1
  ],
  [
    "koja",
    "нога",
    "leg / foot",
    "health",
    "2_a",
    1
  ],
  [
    "pėda",
    "стопа",
    "foot / footprint",
    "health",
    "2_a",
    2
  ],
  [
    "kelis",
    "коліно",
    "knee",
    "health",
    "1_is",
    2
  ],
  [
    "pirštas",
    "палець",
    "finger / toe",
    "health",
    "1_as",
    1
  ],
  [
    "nagas",
    "ніготь",
    "nail / claw",
    "health",
    "1_as",
    3
  ],
  [
    "delnas",
    "долоня",
    "palm of hand",
    "health",
    "1_as",
    3
  ],
  [
    "kumštis",
    "кулак",
    "fist",
    "health",
    "1_is",
    3
  ],
  [
    "alkūnė",
    "лікоть",
    "elbow",
    "health",
    "2_e",
    3
  ],
  [
    "riešas",
    "зап’ястя",
    "wrist",
    "health",
    "1_as",
    4
  ],
  [
    "kakta",
    "чоло / лоб",
    "forehead",
    "health",
    "2_a",
    2
  ],
  [
    "skruostas",
    "щока",
    "cheek",
    "health",
    "1_as",
    3
  ],
  [
    "smakras",
    "підборіддя",
    "chin",
    "health",
    "1_as",
    3
  ],
  [
    "antakis",
    "брова",
    "eyebrow",
    "health",
    "1_is",
    3
  ],
  [
    "blakstiena",
    "вія",
    "eyelash",
    "health",
    "2_a",
    4
  ],
  [
    "plaukas",
    "волосина / волосся",
    "hair",
    "health",
    "1_as",
    1
  ],
  [
    "barzda",
    "борода",
    "beard",
    "health",
    "2_a",
    2
  ],
  [
    "oda",
    "шкіра",
    "skin / leather",
    "health",
    "2_a",
    2
  ],
  [
    "kaulas",
    "кістка",
    "bone",
    "health",
    "1_as",
    2
  ],
  [
    "raumuo",
    "м’яз",
    "muscle",
    "health",
    "5_uo",
    3
  ],
  [
    "plautis",
    "легеня",
    "lung",
    "health",
    "1_is",
    4
  ],
  [
    "skrandis",
    "шлунок",
    "stomach (organ)",
    "health",
    "1_is",
    3
  ],
  [
    "inkstas",
    "нирка",
    "kidney",
    "health",
    "1_as",
    4
  ],
  [
    "nervas",
    "нерв",
    "nerve",
    "health",
    "1_as",
    3
  ],
  [
    "sąnarys",
    "суглоб",
    "joint",
    "health",
    "1_ys",
    4
  ],
  [
    "stuburas",
    "хребет",
    "spine / backbone",
    "health",
    "1_as",
    4
  ],
  [
    "skausmas",
    "біль",
    "pain / ache",
    "health",
    "1_as",
    2
  ],
  [
    "liga",
    "хвороба / захворювання",
    "illness / disease",
    "health",
    "2_a",
    2
  ],
  [
    "peršalimas",
    "застуда",
    "common cold",
    "health",
    "1_as",
    2
  ],
  [
    "gripas",
    "грип",
    "flu / influenza",
    "health",
    "1_as",
    2
  ],
  [
    "kosulys",
    "кашель",
    "cough",
    "health",
    "1_ys",
    2
  ],
  [
    "sloga",
    "нежить",
    "runny nose",
    "health",
    "2_a",
    2
  ],
  [
    "alergija",
    "алергія",
    "allergy",
    "health",
    "2_a",
    3
  ],
  [
    "uždegimas",
    "запалення",
    "inflammation / infection",
    "health",
    "1_as",
    4
  ],
  [
    "žaizda",
    "рана",
    "wound / injury",
    "health",
    "2_a",
    3
  ],
  [
    "randas",
    "шрам / рубець",
    "scar",
    "health",
    "1_as",
    4
  ],
  [
    "kraujospūdis",
    "артеріальний тиск",
    "blood pressure",
    "health",
    "1_is",
    4
  ],
  [
    "pulsas",
    "пульс",
    "pulse",
    "health",
    "1_as",
    3
  ],
  [
    "kvėpavimas",
    "дихання",
    "breathing / respiration",
    "health",
    "1_as",
    3
  ],
  [
    "tabletė",
    "таблетка / пігулка",
    "tablet / pill",
    "health",
    "2_e",
    2
  ],
  [
    "kapsulė",
    "капсула",
    "capsule",
    "health",
    "2_e",
    3
  ],
  [
    "tepalas",
    "мазь",
    "ointment / salve",
    "health",
    "1_as",
    3
  ],
  [
    "sirupas",
    "сироп",
    "syrup",
    "health",
    "1_as",
    2
  ],
  [
    "vitaminas",
    "вітамін",
    "vitamin",
    "health",
    "1_as",
    2
  ],
  [
    "pleistras",
    "пластир",
    "adhesive bandage / plaster",
    "health",
    "1_as",
    3
  ],
  [
    "tvarstis",
    "бинт / пов’язка",
    "bandage / dressing",
    "health",
    "1_is",
    3
  ],
  [
    "švirkštas",
    "шприц",
    "syringe",
    "health",
    "1_as",
    4
  ],
  [
    "skiepas",
    "щеплення / вакцина",
    "vaccine / vaccination",
    "health",
    "1_as",
    3
  ],
  [
    "operacija",
    "операція",
    "surgery / operation",
    "health",
    "2_a",
    3
  ],
  [
    "gydymas",
    "лікування",
    "treatment / therapy",
    "health",
    "1_as",
    3
  ],
  [
    "apžiūra",
    "медичний огляд",
    "checkup / examination",
    "health",
    "2_a",
    3
  ],
  [
    "konsultacija",
    "консультація",
    "consultation",
    "health",
    "2_a",
    3
  ],
  [
    "diagnozė",
    "діагноз",
    "diagnosis",
    "health",
    "2_e",
    4
  ],
  [
    "simptomas",
    "симптом",
    "symptom",
    "health",
    "1_as",
    4
  ],
  [
    "pacientas",
    "пацієнт",
    "patient",
    "health",
    "1_as",
    2
  ],
  [
    "slaugytoja",
    "медсестра",
    "nurse",
    "health",
    "2_a",
    2
  ],
  [
    "chirurgas",
    "хірург",
    "surgeon",
    "health",
    "1_as",
    3
  ],
  [
    "odontologas",
    "стоматолог",
    "dentist",
    "health",
    "1_as",
    3
  ],
  [
    "vaistininkas",
    "фармацевт / аптекар",
    "pharmacist",
    "health",
    "1_as",
    3
  ],
  [
    "poliklinika",
    "поліклініка",
    "outpatient clinic",
    "health",
    "2_a",
    2
  ],
  [
    "klinika",
    "клініка",
    "clinic",
    "health",
    "2_a",
    2
  ],
  [
    "palata",
    "лікарняна палата",
    "hospital ward",
    "health",
    "2_a",
    4
  ],
  [
    "savijauta",
    "самопочуття",
    "well-being / how one feels",
    "health",
    "2_a",
    3
  ],
  [
    "nuovargis",
    "втома",
    "fatigue / tiredness",
    "health",
    "1_is",
    3
  ],
  [
    "stresas",
    "стрес",
    "stress",
    "health",
    "1_as",
    3
  ],
  [
    "miegas",
    "сон",
    "sleep",
    "health",
    "1_as",
    1
  ],
  [
    "sapnas",
    "сновидіння / сон",
    "dream",
    "health",
    "1_as",
    2
  ],
  [
    "paltas",
    "пальто",
    "coat / overcoat",
    "clothing",
    "1_as",
    1
  ],
  [
    "megztinis",
    "светр / кофта",
    "sweater / cardigan",
    "clothing",
    "1_is",
    1
  ],
  [
    "švarkas",
    "піджак / жакет",
    "suit jacket / blazer",
    "clothing",
    "1_as",
    2
  ],
  [
    "sijonas",
    "спідниця",
    "skirt",
    "clothing",
    "1_as",
    1
  ],
  [
    "kostiumas",
    "костюм",
    "suit / costume",
    "clothing",
    "1_as",
    2
  ],
  [
    "liemenė",
    "жилет / жилетка",
    "vest / waistcoat",
    "clothing",
    "2_e",
    3
  ],
  [
    "liemenėlė",
    "бюстгальтер",
    "bra",
    "clothing",
    "2_e",
    4
  ],
  [
    "kojinė",
    "шкарпетка",
    "sock / stocking",
    "clothing",
    "2_e",
    1
  ],
  [
    "pirštinė",
    "рукавичка",
    "glove / mitten",
    "clothing",
    "2_e",
    2
  ],
  [
    "šalikas",
    "шарф",
    "scarf",
    "clothing",
    "1_as",
    2
  ],
  [
    "kaklaraištis",
    "краватка",
    "necktie",
    "clothing",
    "1_is",
    3
  ],
  [
    "skrybėlė",
    "капелюх",
    "hat",
    "clothing",
    "2_e",
    2
  ],
  [
    "chalatas",
    "халат",
    "bathrobe / gown",
    "clothing",
    "1_as",
    3
  ],
  [
    "pižama",
    "піжама",
    "pajamas",
    "clothing",
    "2_a",
    2
  ],
  [
    "lietpaltis",
    "плащ / дощовик",
    "raincoat",
    "clothing",
    "1_is",
    3
  ],
  [
    "basutė",
    "босоніжка / сандаля",
    "sandal",
    "clothing",
    "2_e",
    3
  ],
  [
    "šlepetė",
    "капця / тапочка",
    "slipper",
    "clothing",
    "2_e",
    2
  ],
  [
    "kulnas",
    "підбор / п’ята",
    "heel",
    "clothing",
    "1_as",
    3
  ],
  [
    "padas",
    "підошва",
    "shoe sole",
    "clothing",
    "1_as",
    4
  ],
  [
    "raištelis",
    "шнурок",
    "shoelace",
    "clothing",
    "1_is",
    3
  ],
  [
    "kišenė",
    "кишеня",
    "pocket",
    "clothing",
    "2_e",
    2
  ],
  [
    "rankovė",
    "рукав",
    "sleeve",
    "clothing",
    "2_e",
    3
  ],
  [
    "apykaklė",
    "комір",
    "collar",
    "clothing",
    "2_e",
    3
  ],
  [
    "saga",
    "ґудзик",
    "button",
    "clothing",
    "2_a",
    2
  ],
  [
    "užtrauktukas",
    "блискавка (застібка)",
    "zipper",
    "clothing",
    "1_as",
    3
  ],
  [
    "audinys",
    "тканина",
    "fabric / cloth",
    "clothing",
    "1_ys",
    3
  ],
  [
    "medvilnė",
    "бавовна",
    "cotton",
    "clothing",
    "2_e",
    3
  ],
  [
    "vilna",
    "вовна",
    "wool",
    "clothing",
    "2_a",
    3
  ],
  [
    "šilkas",
    "шовк",
    "silk",
    "clothing",
    "1_as",
    3
  ],
  [
    "kailis",
    "хутро",
    "fur / pelt",
    "clothing",
    "1_is",
    3
  ],
  [
    "rankinė",
    "сумочка (жіноча)",
    "handbag / purse",
    "clothing",
    "2_e",
    2
  ],
  [
    "piniginė",
    "гаманець",
    "wallet / purse",
    "clothing",
    "2_e",
    2
  ],
  [
    "papuošalas",
    "прикраса",
    "jewelry / ornament",
    "clothing",
    "1_as",
    3
  ],
  [
    "grandinėlė",
    "ланцюжок",
    "chain / necklace",
    "clothing",
    "2_e",
    3
  ],
  [
    "apyrankė",
    "браслет",
    "bracelet",
    "clothing",
    "2_e",
    3
  ],
  [
    "auskaras",
    "сережка",
    "earring",
    "clothing",
    "1_as",
    3
  ],
  [
    "muilas",
    "мило",
    "soap",
    "clothing",
    "1_as",
    1
  ],
  [
    "šampūnas",
    "шампунь",
    "shampoo",
    "clothing",
    "1_as",
    1
  ],
  [
    "šepetys",
    "щітка",
    "brush",
    "clothing",
    "1_ys",
    2
  ],
  [
    "pasta",
    "зубна паста / паста",
    "paste / toothpaste",
    "clothing",
    "2_a",
    2
  ],
  [
    "kremas",
    "крем",
    "cream / lotion",
    "clothing",
    "1_as",
    2
  ],
  [
    "skustuvas",
    "бритва",
    "razor / shaver",
    "clothing",
    "1_as",
    3
  ],
  [
    "džiovintuvas",
    "фен / сушарка",
    "hair dryer / dryer",
    "clothing",
    "1_as",
    3
  ],
  [
    "adata",
    "голка",
    "needle",
    "clothing",
    "2_a",
    3
  ],
  [
    "siūlas",
    "нитка",
    "thread / yarn",
    "clothing",
    "1_as",
    3
  ],
  [
    "daiktas",
    "річ / предмет",
    "thing / item / object",
    "clothing",
    "1_as",
    1
  ],
  [
    "įrankis",
    "інструмент",
    "tool / instrument",
    "clothing",
    "1_is",
    3
  ],
  [
    "plaktukas",
    "молоток",
    "hammer",
    "clothing",
    "1_as",
    3
  ],
  [
    "atsuktuvas",
    "викрутка",
    "screwdriver",
    "clothing",
    "1_as",
    4
  ],
  [
    "pjūklas",
    "пилка",
    "saw",
    "clothing",
    "1_as",
    4
  ],
  [
    "kastuvas",
    "лопата",
    "spade / shovel",
    "clothing",
    "1_as",
    3
  ],
  [
    "šluota",
    "мітла / віник",
    "broom",
    "clothing",
    "2_a",
    2
  ],
  [
    "kibiras",
    "відро",
    "bucket / pail",
    "clothing",
    "1_as",
    2
  ],
  [
    "skudurėlis",
    "ганчірка / серветка",
    "cloth / rag",
    "clothing",
    "1_is",
    3
  ],
  [
    "kempinė",
    "губка",
    "sponge",
    "clothing",
    "2_e",
    3
  ],
  [
    "šiukšlė",
    "сміття (смітинка)",
    "piece of trash / litter",
    "clothing",
    "2_e",
    2
  ],
  [
    "konteineris",
    "контейнер / бак",
    "container / bin",
    "clothing",
    "1_is",
    3
  ],
  [
    "laidas",
    "провід / кабель / шнур",
    "wire / cord / cable",
    "clothing",
    "1_as",
    3
  ],
  [
    "ekranas",
    "екран",
    "screen / display",
    "clothing",
    "1_as",
    2
  ],
  [
    "klaviatūra",
    "клавіатура",
    "keyboard",
    "clothing",
    "2_a",
    2
  ],
  [
    "ausinė",
    "навушник",
    "earphone / headphone",
    "clothing",
    "2_e",
    2
  ],
  [
    "garsiakalbis",
    "динамік / гучномовець",
    "speaker / loudspeaker",
    "clothing",
    "1_is",
    3
  ],
  [
    "mikrofonas",
    "мікрофон",
    "microphone",
    "clothing",
    "1_as",
    3
  ],
  [
    "fotoaparatas",
    "фотоапарат / камера",
    "camera",
    "clothing",
    "1_as",
    2
  ],
  [
    "televizorius",
    "телевізор",
    "television set",
    "clothing",
    "4_ius",
    1
  ],
  [
    "radijas",
    "радіо",
    "radio",
    "clothing",
    "1_as",
    2
  ],
  [
    "spausdintuvas",
    "принтер",
    "printer",
    "clothing",
    "1_as",
    3
  ],
  [
    "planšetė",
    "планшет",
    "tablet computer",
    "clothing",
    "2_e",
    2
  ],
  [
    "turistas",
    "турист",
    "tourist",
    "travel",
    "1_as",
    1
  ],
  [
    "turistė",
    "туристка",
    "female tourist",
    "travel",
    "2_e",
    1
  ],
  [
    "ekskursija",
    "екскурсія",
    "excursion / guided tour",
    "travel",
    "2_a",
    2
  ],
  [
    "gidas",
    "гід / екскурсовод",
    "tour guide",
    "travel",
    "1_as",
    2
  ],
  [
    "rezervacija",
    "бронювання / резервація",
    "reservation / booking",
    "travel",
    "2_a",
    2
  ],
  [
    "registracija",
    "реєстрація",
    "registration / check-in",
    "travel",
    "2_a",
    2
  ],
  [
    "registratūra",
    "рецепція / реєстратура",
    "reception desk",
    "travel",
    "2_a",
    3
  ],
  [
    "bagažas",
    "багаж",
    "luggage / baggage",
    "travel",
    "1_as",
    2
  ],
  [
    "rankinis",
    "ручна поклажа",
    "hand luggage",
    "travel",
    "1_is",
    3
  ],
  [
    "krepšelis",
    "кошик / торбинка",
    "basket / small bag",
    "travel",
    "1_is",
    2
  ],
  [
    "viza",
    "віза",
    "visa",
    "travel",
    "2_a",
    2
  ],
  [
    "muitinė",
    "митниця",
    "customs",
    "travel",
    "2_e",
    3
  ],
  [
    "pareigūnas",
    "посадовець / офіцер",
    "official / officer",
    "travel",
    "1_as",
    3
  ],
  [
    "patikra",
    "перевірка / контроль",
    "inspection / security check",
    "travel",
    "2_a",
    3
  ],
  [
    "terminalas",
    "термінал",
    "terminal",
    "travel",
    "1_as",
    2
  ],
  [
    "skrydis",
    "політ / авіарейс",
    "flight",
    "travel",
    "1_is",
    2
  ],
  [
    "stiuardesė",
    "стюардеса / бортпровідниця",
    "flight attendant",
    "travel",
    "2_e",
    3
  ],
  [
    "laivynas",
    "флот",
    "fleet",
    "travel",
    "1_as",
    4
  ],
  [
    "uostamiestis",
    "портове місто",
    "port city",
    "travel",
    "1_is",
    3
  ],
  [
    "kurortas",
    "курорт",
    "resort",
    "travel",
    "1_as",
    2
  ],
  [
    "sanatorija",
    "санаторій",
    "sanatorium / spa resort",
    "travel",
    "2_a",
    3
  ],
  [
    "stovykla",
    "табір / кемпінг",
    "camp",
    "travel",
    "2_a",
    2
  ],
  [
    "palapinė",
    "намет",
    "tent",
    "travel",
    "2_e",
    2
  ],
  [
    "miegmaišis",
    "спальний мішок",
    "sleeping bag",
    "travel",
    "1_is",
    3
  ],
  [
    "laužas",
    "багаття / вогнище",
    "campfire / bonfire",
    "travel",
    "1_as",
    3
  ],
  [
    "žygis",
    "похід / мандрівка",
    "hike / trek / march",
    "travel",
    "1_is",
    3
  ],
  [
    "keliautojas",
    "мандрівник",
    "traveler",
    "travel",
    "1_as",
    2
  ],
  [
    "nuotykis",
    "пригода",
    "adventure",
    "travel",
    "1_is",
    2
  ],
  [
    "įspūdis",
    "враження",
    "impression",
    "travel",
    "1_is",
    3
  ],
  [
    "prisiminimas",
    "спогад",
    "memory / recollection",
    "travel",
    "1_as",
    3
  ],
  [
    "nuotrauka",
    "фотографія / знімок",
    "photograph / picture",
    "travel",
    "2_a",
    1
  ],
  [
    "atvirukas",
    "листівка",
    "postcard",
    "travel",
    "1_as",
    2
  ],
  [
    "suvenyras",
    "сувенір",
    "souvenir",
    "travel",
    "1_as",
    2
  ],
  [
    "gintaras",
    "бурштин",
    "amber",
    "travel",
    "1_as",
    2
  ],
  [
    "kryptis",
    "напрямок",
    "direction",
    "travel",
    "3_is_f",
    3
  ],
  [
    "šiaurė",
    "північ (сторона світу)",
    "north",
    "travel",
    "2_e",
    2
  ],
  [
    "atstumas",
    "відстань / дистанція",
    "distance",
    "travel",
    "1_as",
    2
  ],
  [
    "kilometras",
    "кілометр",
    "kilometer",
    "travel",
    "1_as",
    1
  ],
  [
    "metras",
    "метр",
    "meter",
    "travel",
    "1_as",
    1
  ],
  [
    "žingsnis",
    "крок",
    "step / pace",
    "travel",
    "1_is",
    2
  ],
  [
    "takas",
    "стежка / доріжка",
    "path / trail / track",
    "travel",
    "1_as",
    2
  ],
  [
    "kompasas",
    "компас",
    "compass",
    "travel",
    "1_as",
    3
  ],
  [
    "užsienis",
    "закордон",
    "foreign country / abroad",
    "travel",
    "1_is",
    2
  ],
  [
    "viešnagė",
    "гостювання / візит",
    "stay / visit",
    "travel",
    "2_e",
    4
  ],
  [
    "priėmimas",
    "прийом / рецепція",
    "reception / admission",
    "travel",
    "1_as",
    3
  ],
  [
    "nakvynė",
    "нічліг / ночівля",
    "overnight stay / lodging",
    "travel",
    "2_e",
    3
  ],
  [
    "vila",
    "вілла",
    "villa",
    "travel",
    "2_a",
    2
  ],
  [
    "regykla",
    "оглядовий майданчик",
    "viewpoint / observation deck",
    "travel",
    "2_a",
    4
  ],
  [
    "pakrantė",
    "узбережжя",
    "coastline / shore",
    "travel",
    "2_e",
    3
  ],
  [
    "kopa",
    "дюна (піщана)",
    "sand dune",
    "travel",
    "2_a",
    3
  ]
];

export const NOUNS_POPULAR_850: NounEntry[] = POPULAR_850_SPECS.map(buildPopularNoun);
