import {
  AppLanguage,
  DifficultyLevel,
  SegmentedWord,
  TopicId,
  VerbConjugationType,
  VerbEntry,
  VerbGovernedCase,
  VerbPerson,
  VerbPersonForms,
  VerbSentenceExample,
  VerbTense,
} from '../types/grammar';
import { stripLithuanianDiacritics } from './answerChecker';

export const VERB_PERSON_ORDER: VerbPerson[] = [
  'as',
  'tu',
  'jis',
  'mes',
  'jus',
  'jie',
];

export const VERB_PERSONS_METADATA: Record<
  VerbPerson,
  {
    pronounLt: string;
    shortLt: string;
    label: Record<AppLanguage, string>;
  }
> = {
  as: {
    pronounLt: 'aš',
    shortLt: '1 vns. (aš)',
    label: {
      uk: 'Я (aš)',
      lt: '1 asm. vns. (aš)',
      en: 'I (aš)',
    },
  },
  tu: {
    pronounLt: 'tu',
    shortLt: '2 vns. (tu)',
    label: {
      uk: 'Ти (tu)',
      lt: '2 asm. vns. (tu)',
      en: 'You sg. (tu)',
    },
  },
  jis: {
    pronounLt: 'jis / ji',
    shortLt: '3 vns. (jis/ji)',
    label: {
      uk: 'Він / Вона (jis / ji)',
      lt: '3 asm. vns. (jis / ji)',
      en: 'He / She (jis / ji)',
    },
  },
  mes: {
    pronounLt: 'mes',
    shortLt: '1 dgs. (mes)',
    label: {
      uk: 'Ми (mes)',
      lt: '1 asm. dgs. (mes)',
      en: 'We (mes)',
    },
  },
  jus: {
    pronounLt: 'jūs',
    shortLt: '2 dgs. (jūs)',
    label: {
      uk: 'Ви (jūs)',
      lt: '2 asm. dgs. (jūs)',
      en: 'You pl./formal (jūs)',
    },
  },
  jie: {
    pronounLt: 'jie / jos',
    shortLt: '3 dgs. (jie/jos)',
    label: {
      uk: 'Вони (jie / jos)',
      lt: '3 asm. dgs. (jie / jos)',
      en: 'They (jie / jos)',
    },
  },
};

export const VERB_TENSES_METADATA: Record<
  VerbTense,
  {
    nameLt: string;
    shortLt: string;
    title: Record<AppLanguage, string>;
    questionLt: string;
    description: Record<AppLanguage, string>;
  }
> = {
  present: {
    nameLt: 'Esamasis laikas',
    shortLt: 'Esamasis l.',
    title: {
      uk: 'Теперішній час (Esamasis laikas)',
      lt: 'Esamasis laikas',
      en: 'Present Tense (Esamasis laikas)',
    },
    questionLt: 'Ką veikia?',
    description: {
      uk: 'Утворюється від 2-ї основної форми (3-тя особа теперішнього часу: -a, -i, -o).',
      lt: 'Sudaromas iš esamojo laiko 3 asmens kamieno (-a, -i, -o).',
      en: 'Formed from the 2nd principal form (3rd person present stem: -a, -i, -o).',
    },
  },
  past: {
    nameLt: 'Būtasis kartinis laikas',
    shortLt: 'Būtasis k. l.',
    title: {
      uk: 'Минулий час (Būtasis kartinis laikas)',
      lt: 'Būtasis kartinis laikas',
      en: 'Past Simple Tense (Būtasis kartinis laikas)',
    },
    questionLt: 'Ką veikė?',
    description: {
      uk: 'Утворюється від 3-ї основної форми (3-тя особа минулого часу на -o або -ė).',
      lt: 'Sudaromas iš būtojo kartinio laiko 3 asmens kamieno (-o arba -ė).',
      en: 'Formed from the 3rd principal form (3rd person past stem in -o or -ė).',
    },
  },
  future: {
    nameLt: 'Būsimasis laikas',
    shortLt: 'Būsimasis l.',
    title: {
      uk: 'Майбутній час (Būsimasis laikas)',
      lt: 'Būsimasis laikas',
      en: 'Future Tense (Būsimasis laikas)',
    },
    questionLt: 'Ką veiks?',
    description: {
      uk: 'Утворюється від основи інфінітива (без -ti) + суфікс -s- та особові закінчення (-siu, -si, -s, -sime, -site).',
      lt: 'Sudaromas iš bendraties kamieno (be -ti) + priesagos -s- ir galūnių (-siu, -si, -s, -sime, -site).',
      en: 'Formed from the infinitive stem (without -ti) + suffix -s- and person endings (-siu, -si, -s, -sime, -site).',
    },
  },
  imperative: {
    nameLt: 'Liepiamoji nuosaka',
    shortLt: 'Liepiamoji n.',
    title: {
      uk: 'Наказовий спосіб (Liepiamoji nuosaka)',
      lt: 'Liepiamoji nuosaka',
      en: 'Imperative Mood (Liepiamoji nuosaka)',
    },
    questionLt: 'Ką daryk?',
    description: {
      uk: 'Утворюється від основи інфінітива (без -ti) + суфікс -k- (tu -k, mes -kime, jūs -kite).',
      lt: 'Sudaroma iš bendraties kamieno (be -ti) + priesagos -k- (tu -k, mes -kime, jūs -kite).',
      en: 'Formed from the infinitive stem (without -ti) + suffix -k- (tu -k, mes -kime, jūs -kite).',
    },
  },
};

export const VERB_CONJUGATIONS_METADATA: Record<
  VerbConjugationType,
  {
    titleLt: string;
    endingBadge: string;
    title: Record<AppLanguage, string>;
    subtitle: Record<AppLanguage, string>;
    examplesLt: string[];
    endingsPresent: Record<VerbPerson, string>;
  }
> = {
  1: {
    titleLt: 'I asmenuotė (-a / -ia)',
    endingBadge: '3 asm. -a / -ia',
    title: {
      uk: 'I дієвідміна (3 ос. на -a / -ia)',
      lt: 'I asmenuotė (3 asm. -a / -ia)',
      en: '1st Conjugation (3rd pers. -a / -ia)',
    },
    subtitle: {
      uk: 'Найбільша група дієслів: dirbti (dirba), eiti (eina), kalbėti (kalba), gerti (geria), jausti (jaučia).',
      lt: 'Didžiausia veiksmažodžių grupė: dirbti (dirba), eiti (eina), kalbėti (kalba), gerti (geria).',
      en: 'Largest verb group: dirbti (dirba), eiti (eina), kalbėti (kalba), gerti (geria), jausti (jaučia).',
    },
    examplesLt: ['dirba', 'eina', 'kalba', 'geria', 'jaučia'],
    endingsPresent: {
      as: '-u / -iu',
      tu: '-i',
      jis: '-a / -ia',
      mes: '-ame / -iame',
      jus: '-ate / -iate',
      jie: '-a / -ia',
    },
  },
  2: {
    titleLt: 'II asmenuotė (-i)',
    endingBadge: '3 asm. -i',
    title: {
      uk: 'II дієвідміна (3 ос. на -i)',
      lt: 'II asmenuotė (3 asm. -i)',
      en: '2nd Conjugation (3rd pers. -i)',
    },
    subtitle: {
      uk: 'Дієслова з інфінітивом переважно на -ėti: mylėti (myli), turėti (turi), galėti (gali), žiūrėti (žiūri), girdėti (girdi).',
      lt: 'Veiksmažodžiai su galūne -i: mylėti (myli), turėti (turi), galėti (gali), žiūrėti (žiūri), girdėti (girdi).',
      en: 'Verbs with 3rd person in -i: mylėti (myli), turėti (turi), galėti (gali), žiūrėti (žiūri), girdėti (girdi).',
    },
    examplesLt: ['myli', 'turi', 'gali', 'žiūri', 'girdi'],
    endingsPresent: {
      as: '-iu (d→džiu)',
      tu: '-i',
      jis: '-i',
      mes: '-ime',
      jus: '-ite',
      jie: '-i',
    },
  },
  3: {
    titleLt: 'III asmenuotė (-o)',
    endingBadge: '3 asm. -o',
    title: {
      uk: 'III дієвідміна (3 ос. на -o)',
      lt: 'III asmenuotė (3 asm. -o)',
      en: '3rd Conjugation (3rd pers. -o)',
    },
    subtitle: {
      uk: 'Дієслова з інфінітивом переважно на -yti, -oti: skaityti (skaito), rašyti (rašo), daryti (daro), žinoti (žino).',
      lt: 'Veiksmažodžiai su galūne -o: skaityti (skaito), rašyti (rašo), daryti (daro), žinoti (žino).',
      en: 'Verbs with 3rd person in -o: skaityti (skaito), rašyti (rašo), daryti (daro), žinoti (žino).',
    },
    examplesLt: ['skaito', 'rašo', 'daro', 'valgo', 'žino'],
    endingsPresent: {
      as: '-au',
      tu: '-ai',
      jis: '-o',
      mes: '-ome',
      jus: '-ote',
      jie: '-o',
    },
  },
};

export const VERB_GOVERNED_CASES_METADATA: Record<
  VerbGovernedCase,
  {
    shortBadge: Record<AppLanguage, string>;
    fullLabel: Record<AppLanguage, string>;
    questionLt: string;
    exampleLt: string;
  }
> = {
  acc: {
    shortBadge: {
      uk: '+ Ką? (Знахідний)',
      lt: '+ Ką? (Galininkas)',
      en: '+ Ką? (Accusative)',
    },
    fullLabel: {
      uk: 'Керує знахідним відмінком (Galininkas — ką? кого? що?)',
      lt: 'Reikalauja galininko linksnio (ką?)',
      en: 'Governs the Accusative case (Galininkas — ką?)',
    },
    questionLt: 'ką?',
    exampleLt: 'skaityti knygą, matyti draugą, gerti kavą',
  },
  gen: {
    shortBadge: {
      uk: '+ Ko? (Родовий)',
      lt: '+ Ko? (Kilmininkas)',
      en: '+ Ko? (Genitive)',
    },
    fullLabel: {
      uk: 'Керує родовим відмінком (Kilmininkas — ko? чого? кого?) — дієслова бажання, пошуку, очікування, страху',
      lt: 'Reikalauja kilmininko linksnio (ko?) — noro, ieškojimo, laukimo veiksmažodžiai',
      en: 'Governs the Genitive case (Kilmininkas — ko?) — verbs of wanting, seeking, waiting, fearing',
    },
    questionLt: 'ko?',
    exampleLt: 'norėti kavos, ieškoti darbo, laukti autobuso, bijoti šuns',
  },
  dat: {
    shortBadge: {
      uk: '+ Kam? (Давальний)',
      lt: '+ Kam? (Naudininkas)',
      en: '+ Kam? (Dative)',
    },
    fullLabel: {
      uk: 'Керує давальним відмінком (Naudininkas — kam? кому? чому?)',
      lt: 'Reikalauja naudininko linksnio (kam?)',
      en: 'Governs the Dative case (Naudininkas — kam?)',
    },
    questionLt: 'kam?',
    exampleLt: 'padėti draugui, skambinti mamai, dėkoti mokytojui',
  },
  ins: {
    shortBadge: {
      uk: '+ Kuo? (Орудний)',
      lt: '+ Kuo? (Įnagininkas)',
      en: '+ Kuo? (Instrumental)',
    },
    fullLabel: {
      uk: 'Керує орудним відмінком (Įnagininkas — kuo? ким? чим?) — дієслова захоплення, довіри, ставання',
      lt: 'Reikalauja įnagininko linksnio (kuo?)',
      en: 'Governs the Instrumental case (Įnagininkas — kuo?)',
    },
    questionLt: 'kuo?',
    exampleLt: 'domėtis muzika, džiaugtis vasara, tapti gydytoju, tikėti sėkme',
  },
  loc: {
    shortBadge: {
      uk: '+ Kur? (Місцевий / į ką?)',
      lt: '+ Kur? (Vietininkas)',
      en: '+ Kur? (Locative)',
    },
    fullLabel: {
      uk: 'Вживається з місцевим відмінком (kur? kame? — де?) або прийменником напрямку (į ką?)',
      lt: 'Vartojamas su vietininku (kur? kame?) arba krypties prielinksniu',
      en: 'Used with Locative case (kur? — where?) or directional prepositions',
    },
    questionLt: 'kur? / į ką?',
    exampleLt: 'gyventi mieste, dirbti biure, eiti į parduotuvę',
  },
  intransitive: {
    shortBadge: {
      uk: 'Неперехідне',
      lt: 'Intranzytyvinis',
      en: 'Intransitive',
    },
    fullLabel: {
      uk: 'Неперехідне дієслово дії або стану (вживається без прямого додатка або з обставиною)',
      lt: 'veiksmo ar būsenos veiksmažodis be tiesioginio papildinio',
      en: 'Intransitive action or state verb (used without a direct object)',
    },
    questionLt: 'kaip? / kada?',
    exampleLt: 'miegoti ramiai, šypsotis, juoktis, anksti keltis',
  },
};

export function detectConjugationType(
  infinitive: string,
  present3: string
): VerbConjugationType {
  const cleanPres3 = infinitive.endsWith('tis') && present3.endsWith('si')
    ? present3.slice(0, -2)
    : present3;

  if (cleanPres3.endsWith('o')) return 3;
  if (cleanPres3.endsWith('i')) return 2;
  return 1;
}

export function conjugatePresentTense(
  infinitive: string,
  present3: string
): VerbPersonForms {
  if (infinitive === 'būti') {
    return {
      as: 'esu',
      tu: 'esi',
      jis: 'yra',
      mes: 'esame',
      jus: 'esate',
      jie: 'yra',
    };
  }

  const isEndReflexive = infinitive.endsWith('tis') && present3.endsWith('si');
  const basePres3 = isEndReflexive ? present3.slice(0, -2) : present3;
  const conj = detectConjugationType(infinitive, present3);

  if (conj === 3) {
    // 3rd conjugation (-o)
    const stem = basePres3.slice(0, -1);
    if (isEndReflexive) {
      return {
        as: `${stem}ausi`,
        tu: `${stem}aisi`,
        jis: `${stem}osi`,
        mes: `${stem}omės`,
        jus: `${stem}otės`,
        jie: `${stem}osi`,
      };
    }
    return {
      as: `${stem}au`,
      tu: `${stem}ai`,
      jis: `${stem}o`,
      mes: `${stem}ome`,
      jus: `${stem}ote`,
      jie: `${stem}o`,
    };
  }

  if (conj === 2) {
    // 2nd conjugation (-i)
    const stem = basePres3.slice(0, -1);
    let asStem = `${stem}i`;
    if (stem.endsWith('d')) {
      asStem = `${stem.slice(0, -1)}dži`;
    } else if (stem.endsWith('t')) {
      asStem = `${stem.slice(0, -1)}či`;
    }
    if (isEndReflexive) {
      return {
        as: `${asStem}uosi`,
        tu: `${stem}iesi`,
        jis: `${stem}isi`,
        mes: `${stem}imės`,
        jus: `${stem}itės`,
        jie: `${stem}isi`,
      };
    }
    return {
      as: `${asStem}u`,
      tu: `${stem}i`,
      jis: `${stem}i`,
      mes: `${stem}ime`,
      jus: `${stem}ite`,
      jie: `${stem}i`,
    };
  }

  // 1st conjugation (-a or -ia)
  if (basePres3.endsWith('ia')) {
    const stemBeforeIa = basePres3.slice(0, -2);
    let tuForm = `${stemBeforeIa}i`;
    if (stemBeforeIa.endsWith('dž')) {
      tuForm = `${stemBeforeIa.slice(0, -2)}di`;
    } else if (stemBeforeIa.endsWith('č')) {
      tuForm = `${stemBeforeIa.slice(0, -1)}ti`;
    }

    if (isEndReflexive) {
      const tuRefl = tuForm.slice(0, -1) + 'iesi';
      return {
        as: `${stemBeforeIa}iuosi`,
        tu: tuRefl,
        jis: `${stemBeforeIa}iasi`,
        mes: `${stemBeforeIa}iamės`,
        jus: `${stemBeforeIa}iatės`,
        jie: `${stemBeforeIa}iasi`,
      };
    }

    return {
      as: `${stemBeforeIa}iu`,
      tu: tuForm,
      jis: `${stemBeforeIa}ia`,
      mes: `${stemBeforeIa}iame`,
      jus: `${stemBeforeIa}iate`,
      jie: `${stemBeforeIa}ia`,
    };
  }

  // Standard -a
  const stem = basePres3.slice(0, -1);
  if (isEndReflexive) {
    return {
      as: `${stem}uosi`,
      tu: `${stem}iesi`,
      jis: `${stem}asi`,
      mes: `${stem}amės`,
      jus: `${stem}atės`,
      jie: `${stem}asi`,
    };
  }
  return {
    as: `${stem}u`,
    tu: `${stem}i`,
    jis: `${stem}a`,
    mes: `${stem}ame`,
    jus: `${stem}ate`,
    jie: `${stem}a`,
  };
}

export function conjugatePastTense(
  infinitive: string,
  past3: string
): VerbPersonForms {
  const isEndReflexive = infinitive.endsWith('tis') && past3.endsWith('si');
  const basePast3 = isEndReflexive ? past3.slice(0, -2) : past3;

  if (basePast3.endsWith('ė')) {
    const stem = basePast3.slice(0, -1);
    let asStem = `${stem}i`;
    if (stem.endsWith('d')) {
      asStem = `${stem.slice(0, -1)}dži`;
    } else if (stem.endsWith('t')) {
      asStem = `${stem.slice(0, -1)}či`;
    } else if (stem.endsWith('j')) {
      asStem = stem;
    }

    if (isEndReflexive) {
      return {
        as: `${asStem}ausi`,
        tu: `${stem}eisi`,
        jis: `${stem}ėsi`,
        mes: `${stem}ėmės`,
        jus: `${stem}ėtės`,
        jie: `${stem}ėsi`,
      };
    }

    return {
      as: `${asStem}au`,
      tu: `${stem}ei`,
      jis: `${stem}ė`,
      mes: `${stem}ėme`,
      jus: `${stem}ėte`,
      jie: `${stem}ė`,
    };
  }

  // Ends in -o
  const stem = basePast3.slice(0, -1);
  if (isEndReflexive) {
    return {
      as: `${stem}ausi`,
      tu: `${stem}aisi`,
      jis: `${stem}osi`,
      mes: `${stem}omės`,
      jus: `${stem}otės`,
      jie: `${stem}osi`,
    };
  }

  return {
    as: `${stem}au`,
    tu: `${stem}ai`,
    jis: `${stem}o`,
    mes: `${stem}ome`,
    jus: `${stem}ote`,
    jie: `${stem}o`,
  };
}

export function conjugateFutureTense(infinitive: string): VerbPersonForms {
  if (infinitive === 'būti') {
    return {
      as: 'būsiu',
      tu: 'būsi',
      jis: 'bus',
      mes: 'būsime',
      jus: 'būsite',
      jie: 'bus',
    };
  }

  const isEndReflexive = infinitive.endsWith('tis');
  const infStem = isEndReflexive
    ? infinitive.slice(0, -3)
    : infinitive.slice(0, -2);

  let futStemWithS = `${infStem}s`;
  if (infStem.endsWith('š') || infStem.endsWith('ž')) {
    futStemWithS = `${infStem.slice(0, -1)}š`;
  } else if (infStem.endsWith('s') || infStem.endsWith('z')) {
    futStemWithS = `${infStem.slice(0, -1)}s`;
  }

  // Handle monosyllabic 3rd person shortening (e.g. lyti -> lys, gyti -> gis, vyti -> vis, siūti -> siūs)
  let thirdPersonBase = futStemWithS;
  if (infinitive === 'gyti') thirdPersonBase = 'gis';
  if (infinitive === 'vyti') thirdPersonBase = 'vis';
  if (infinitive === 'pūti') thirdPersonBase = 'pus';
  if (infinitive === 'žūti') thirdPersonBase = 'žus';
  if (infinitive === 'griūti') thirdPersonBase = 'grius';

  if (isEndReflexive) {
    return {
      as: `${futStemWithS}iuosi`,
      tu: `${futStemWithS}iesi`,
      jis: `${thirdPersonBase}is`,
      mes: `${futStemWithS}imės`,
      jus: `${futStemWithS}itės`,
      jie: `${thirdPersonBase}is`,
    };
  }

  return {
    as: `${futStemWithS}iu`,
    tu: `${futStemWithS}i`,
    jis: thirdPersonBase,
    mes: `${futStemWithS}ime`,
    jus: `${futStemWithS}ite`,
    jie: thirdPersonBase,
  };
}

export function conjugateImperative(infinitive: string): {
  tu: string;
  mes: string;
  jus: string;
} {
  const isEndReflexive = infinitive.endsWith('tis');
  const infStem = isEndReflexive
    ? infinitive.slice(0, -3)
    : infinitive.slice(0, -2);

  let impStemWithK = `${infStem}k`;
  if (infStem.endsWith('k') || infStem.endsWith('g')) {
    impStemWithK = `${infStem.slice(0, -1)}k`;
  }

  if (isEndReflexive) {
    return {
      tu: `${impStemWithK}is`,
      mes: `${impStemWithK}imės`,
      jus: `${impStemWithK}itės`,
    };
  }

  return {
    tu: impStemWithK,
    mes: `${impStemWithK}ime`,
    jus: `${impStemWithK}ite`,
  };
}

export function segmentLithuanianVerbForm(
  form: string,
  tense: VerbTense,
  person: VerbPerson,
  isReflexive: boolean
): SegmentedWord {
  const endings = isReflexive
    ? [
        'siuosi',
        'siesi',
        'simės',
        'sitės',
        'kimės',
        'kitės',
        'iamės',
        'iatės',
        'iuosi',
        'amės',
        'atės',
        'imės',
        'itės',
        'omės',
        'otės',
        'ėmės',
        'ėtės',
        'ausi',
        'aisi',
        'eisi',
        'iesi',
        'uosi',
        'iasi',
        'asi',
        'isi',
        'osi',
        'ėsi',
        'sis',
        'kis',
        'si',
        'is',
      ]
    : [
        'siu',
        'sime',
        'site',
        'kime',
        'kite',
        'iame',
        'iate',
        'ame',
        'ate',
        'ime',
        'ite',
        'ome',
        'ote',
        'ėme',
        'ėte',
        'iau',
        'au',
        'ai',
        'ei',
        'iu',
        'ia',
        'si',
        'ti',
        'u',
        'i',
        'a',
        'o',
        'ė',
        's',
        'k',
      ];

  for (const end of endings) {
    if (form.length > end.length && form.endsWith(end)) {
      return {
        stem: form.slice(0, form.length - end.length),
        ending: end,
      };
    }
  }

  if (form.length <= 2) {
    return { stem: form, ending: '' };
  }
  return {
    stem: form.slice(0, -1),
    ending: form.slice(-1),
  };
}

const TOPIC_CONTEXT_COMPLEMENTS: Record<
  TopicId,
  Record<
    VerbGovernedCase,
    { lt: string; uk: string; en: string }
  >
> = {
  family: {
    acc: { lt: 'savo šeimą', uk: 'свою родину', en: 'their family' },
    gen: { lt: 'brolio patarimo', uk: 'поради брата', en: 'brother’s advice' },
    dat: { lt: 'mamai ir tėčiui', uk: 'мамі й татові', en: 'mom and dad' },
    ins: { lt: 'šeimos tradicijomis', uk: 'сімейними традиціями', en: 'family traditions' },
    loc: { lt: 'kartu su šeima namuose', uk: 'разом із сім’єю вдома', en: 'together with family at home' },
    intransitive: { lt: 'kartu su artimaisiais', uk: 'разом із близькими', en: 'together with loved ones' },
  },
  home: {
    acc: { lt: 'kambarį ir namus', uk: 'кімнату та дім', en: 'the room and home' },
    gen: { lt: 'naujo buto', uk: 'нової квартири', en: 'a new apartment' },
    dat: { lt: 'kaimynui', uk: 'сусідові', en: 'the neighbor' },
    ins: { lt: 'jaukiais namais', uk: 'затишним домом', en: 'the cozy home' },
    loc: { lt: 'savo namuose', uk: 'у себе вдома', en: 'at home' },
    intransitive: { lt: 'virtuvėje ir svetainėje', uk: 'на кухні та у вітальні', en: 'in the kitchen and living room' },
  },
  food: {
    acc: { lt: 'skanią vakarienę', uk: 'смачну вечерю', en: 'a delicious dinner' },
    gen: { lt: 'šiltos kavos', uk: 'теплої кави', en: 'warm coffee' },
    dat: { lt: 'svečiams prie stalo', uk: 'гостям за столом', en: 'the guests at the table' },
    ins: { lt: 'šviežiu maistu', uk: 'свіжою їжею', en: 'fresh food' },
    loc: { lt: 'jaukioje kavinėje', uk: 'у затишній кав’ярні', en: 'in a cozy cafe' },
    intransitive: { lt: 'prie pusryčių stalo', uk: 'за сніданком', en: 'at the breakfast table' },
  },
  shopping: {
    acc: { lt: 'reikalingas prekes', uk: 'потрібні товари', en: 'necessary goods' },
    gen: { lt: 'geros nuolaidos', uk: 'хорошої знижки', en: 'a good discount' },
    dat: { lt: 'pirkėjui parduotuvėje', uk: 'покупцеві в магазині', en: 'the customer in the store' },
    ins: { lt: 'banko kortele', uk: 'банківською карткою', en: 'by bank card' },
    loc: { lt: 'prekybos centre', uk: 'у торговому центрі', en: 'at the shopping mall' },
    intransitive: { lt: 'kasoje be eilės', uk: 'на касі без черги', en: 'at the checkout without a line' },
  },
  work: {
    acc: { lt: 'svarbų projektą', uk: 'важливий проєкт', en: 'an important project' },
    gen: { lt: 'gero rezultato', uk: 'хорошого результату', en: 'a good result' },
    dat: { lt: 'kolegai darbe', uk: 'колезі на роботі', en: 'a colleague at work' },
    ins: { lt: 'naujomis technologijomis', uk: 'новими технологіями', en: 'new technologies' },
    loc: { lt: 'moderniame biure', uk: 'у сучасному офісі', en: 'in a modern office' },
    intransitive: { lt: 'visą darbo dieną', uk: 'увесь робочий день', en: 'the whole working day' },
  },
  transport: {
    acc: { lt: 'bilietą ir maršrutą', uk: 'квиток і маршрут', en: 'the ticket and route' },
    gen: { lt: 'greitojo traukinio', uk: 'швидкісного потяга', en: 'the express train' },
    dat: { lt: 'vairuotojui ir keleiviams', uk: 'водієві та пасажирам', en: 'the driver and passengers' },
    ins: { lt: 'miesto autobusu', uk: 'міським автобусом', en: 'by city bus' },
    loc: { lt: 'geležinkelio stotyje', uk: 'на залізничному вокзалі', en: 'at the train station' },
    intransitive: { lt: 'pagrindine gatve laiku', uk: 'головною вулицею вчасно', en: 'along the main street on time' },
  },
  city: {
    acc: { lt: 'senamiestį ir gatves', uk: 'старе місто та вулиці', en: 'the old town and streets' },
    gen: { lt: 'gražaus parko', uk: 'гарного парку', en: 'a beautiful park' },
    dat: { lt: 'miesto gyventojams', uk: 'жителям міста', en: 'city residents' },
    ins: { lt: 'miesto architektūra', uk: 'архітектурою міста', en: 'the city architecture' },
    loc: { lt: 'Vilniaus centre', uk: 'у центрі Вільнюса', en: 'in the center of Vilnius' },
    intransitive: { lt: 'miesto aikštėje', uk: 'на міській площі', en: 'in the city square' },
  },
  school: {
    acc: { lt: 'lietuvių kalbą ir taisykles', uk: 'литовську мову та правила', en: 'Lithuanian language and rules' },
    gen: { lt: 'naujų žodžių', uk: 'нових слів', en: 'new words' },
    dat: { lt: 'mokytojui ir studentams', uk: 'вчителеві та студентам', en: 'the teacher and students' },
    ins: { lt: 'lietuvių kalbos gramatika', uk: 'граматикою литовської мови', en: 'Lithuanian grammar' },
    loc: { lt: 'universitete ir bibliotekoje', uk: 'в університеті та бібліотеці', en: 'at the university and library' },
    intransitive: { lt: 'per pamoką labai atidžiai', uk: 'під час уроку дуже уважно', en: 'very attentively during the lesson' },
  },
  nature: {
    acc: { lt: 'mišką ir ežerą', uk: 'ліс та озеро', en: 'the forest and lake' },
    gen: { lt: 'šilto oro ir saulės', uk: 'теплої погоди та сонця', en: 'warm weather and sun' },
    dat: { lt: 'gamtai ir paukščiams', uk: 'природі та птахам', en: 'nature and birds' },
    ins: { lt: 'grynu miško oru', uk: 'свіжим лісовим повітрям', en: 'fresh forest air' },
    loc: { lt: 'žaliame miške prie upės', uk: 'у зеленому лісі біля річки', en: 'in the green forest by the river' },
    intransitive: { lt: 'lauke po lietaus', uk: 'надворі після дощу', en: 'outside after the rain' },
  },
  health: {
    acc: { lt: 'sveikatą ir jėgas', uk: 'здоров’я та сили', en: 'health and strength' },
    gen: { lt: 'gydytojo konsultacijos', uk: 'консультації лікаря', en: 'a doctor’s consultation' },
    dat: { lt: 'pacientui klinikoje', uk: 'пацієнтові в клініці', en: 'the patient at the clinic' },
    ins: { lt: 'gera savijauta', uk: 'гарним самопочуттям', en: 'good well-being' },
    loc: { lt: 'miesto poliklinikoje', uk: 'у міській поліклініці', en: 'at the city clinic' },
    intransitive: { lt: 'daug geriau ir žvaliau', uk: 'значно краще й бадьоріше', en: 'much better and more energetic' },
  },
  clothing: {
    acc: { lt: 'šiltą paltą ir batus', uk: 'тепле пальто та взуття', en: 'a warm coat and shoes' },
    gen: { lt: 'tinkamo dydžio marškinių', uk: 'сорочки потрібного розміру', en: 'a right-sized shirt' },
    dat: { lt: 'sau naują aprangą', uk: 'собі нове вбрання', en: 'new attire for oneself' },
    ins: { lt: 'stilingais drabužiais', uk: 'стильним одягом', en: 'stylish clothes' },
    loc: { lt: 'drabužių parduotuvėje', uk: 'у магазині одягу', en: 'in the clothing store' },
    intransitive: { lt: 'tvarkingai ir patogiai', uk: 'охайно та зручно', en: 'neatly and comfortably' },
  },
  travel: {
    acc: { lt: 'lagaminą ir dokumentus', uk: 'валізу та документи', en: 'the suitcase and documents' },
    gen: { lt: 'įdomios kelionės', uk: 'цікавої подорожі', en: 'an interesting trip' },
    dat: { lt: 'keliautojams ir turistams', uk: 'мандрівникам і туристам', en: 'travelers and tourists' },
    ins: { lt: 'kelione prie Baltijos jūros', uk: 'подорожжю до Балтійського моря', en: 'a trip to the Baltic Sea' },
    loc: { lt: 'viešbutyje prie jūros', uk: 'у готелі біля моря', en: 'at a hotel by the sea' },
    intransitive: { lt: 'po Lietuvą vasarą', uk: 'Литвою влітку', en: 'around Lithuania in summer' },
  },
  time: {
    acc: { lt: 'kiekvieną minutę ir dieną', uk: 'кожну хвилину та день', en: 'every minute and day' },
    gen: { lt: 'laisvo laiko vakare', uk: 'вільного часу ввечері', en: 'free time in the evening' },
    dat: { lt: 'ateities planams', uk: 'планам на майбутнє', en: 'future plans' },
    ins: { lt: 'laisvalaikiu savaitgalį', uk: 'дозвіллям на вихідних', en: 'leisure time on the weekend' },
    loc: { lt: 'šią savaitę laiku', uk: 'цього тижня вчасно', en: 'on time this week' },
    intransitive: { lt: 'nuo ryto iki vakaro', uk: 'з ранку до вечора', en: 'from morning till evening' },
  },
  abstract: {
    acc: { lt: 'tiesą ir sprendimą', uk: 'правду та рішення', en: 'the truth and decision' },
    gen: { lt: 'naujų galimybių', uk: 'нових можливостей', en: 'new opportunities' },
    dat: { lt: 'bendram tikslui', uk: 'спільній меті', en: 'a common goal' },
    ins: { lt: 'savo patirtimi ir idėjomis', uk: 'своїм досвідом та ідеями', en: 'one’s experience and ideas' },
    loc: { lt: 'šioje situacijoje', uk: 'у цій ситуації', en: 'in this situation' },
    intransitive: { lt: 'ramiai ir užtikrintai', uk: 'спокійно та впевнено', en: 'calmly and confidently' },
  },
};

interface UkVerbParadigm {
  nonPast: [string, string, string, string, string, string]; // as, tu, jis, mes, jus, jie
  pastSg: string; // masc sg (Він / Я / Ти)
  pastPl: string; // pl (Ми / Ви / Вони)
  impTu: string;
  impMes: string;
  impJus: string;
  isPerfective: boolean;
}

const EXACT_UK_VERB_PARADIGMS: Record<string, UkVerbParadigm> = {
  бути: {
    nonPast: ['є', 'є', 'є', 'є', 'є', 'є'],
    pastSg: 'був',
    pastPl: 'були',
    impTu: 'будь',
    impMes: 'будьмо',
    impJus: 'будьте',
    isPerfective: false,
  },
  мати: {
    nonPast: ['маю', 'маєш', 'має', 'маємо', 'маєте', 'мають'],
    pastSg: 'мав',
    pastPl: 'мали',
    impTu: 'май',
    impMes: 'маймо',
    impJus: 'майте',
    isPerfective: false,
  },
  могти: {
    nonPast: ['можу', 'можеш', 'може', 'можемо', 'можете', 'можуть'],
    pastSg: 'міг',
    pastPl: 'могли',
    impTu: 'зможи',
    impMes: 'зможімо',
    impJus: 'зможіть',
    isPerfective: false,
  },
  допомогти: {
    nonPast: ['допоможу', 'допоможеш', 'допоможе', 'допоможемо', 'допоможете', 'допоможуть'],
    pastSg: 'допоміг',
    pastPl: 'допомогли',
    impTu: 'допоможи',
    impMes: 'допоможімо',
    impJus: 'допоможіть',
    isPerfective: true,
  },
  хотіти: {
    nonPast: ['хочу', 'хочеш', 'хоче', 'хочемо', 'хочете', 'хочуть'],
    pastSg: 'хотів',
    pastPl: 'хотіли',
    impTu: 'захочи',
    impMes: 'захочімо',
    impJus: 'захочіть',
    isPerfective: false,
  },
  захотіти: {
    nonPast: ['захочу', 'захочеш', 'захоче', 'захочемо', 'захочете', 'захочуть'],
    pastSg: 'захотів',
    pastPl: 'захотіли',
    impTu: 'захочи',
    impMes: 'захочімо',
    impJus: 'захочіть',
    isPerfective: true,
  },
  їсти: {
    nonPast: ['їм', 'їси', 'їсть', 'їмо', 'їсте', 'їдять'],
    pastSg: 'їв',
    pastPl: 'їли',
    impTu: 'їж',
    impMes: 'їжмо',
    impJus: 'їжте',
    isPerfective: false,
  },
  'з’їсти': {
    nonPast: ['з’їм', 'з’їси', 'з’їсть', 'з’їмо', 'з’їсте', 'з’їдять'],
    pastSg: 'з’їв',
    pastPl: 'з’їли',
    impTu: 'з’їж',
    impMes: 'з’їжмо',
    impJus: 'з’їжте',
    isPerfective: true,
  },
  дати: {
    nonPast: ['дам', 'даси', 'дасть', 'дамо', 'дасте', 'дадуть'],
    pastSg: 'дав',
    pastPl: 'дали',
    impTu: 'дай',
    impMes: 'даймо',
    impJus: 'дайте',
    isPerfective: true,
  },
  віддати: {
    nonPast: ['віддам', 'віддаси', 'віддасть', 'віддамо', 'віддасте', 'віддадуть'],
    pastSg: 'віддав',
    pastPl: 'віддали',
    impTu: 'віддай',
    impMes: 'віддаймо',
    impJus: 'віддайте',
    isPerfective: true,
  },
  продати: {
    nonPast: ['продам', 'продаси', 'продасть', 'продамо', 'продасте', 'продадуть'],
    pastSg: 'продав',
    pastPl: 'продали',
    impTu: 'продай',
    impMes: 'продаймо',
    impJus: 'продайте',
    isPerfective: true,
  },
  іти: {
    nonPast: ['іду', 'ідеш', 'іде', 'ідемо', 'ідете', 'ідуть'],
    pastSg: 'ішов',
    pastPl: 'ішли',
    impTu: 'іди',
    impMes: 'ідімо',
    impJus: 'ідіть',
    isPerfective: false,
  },
  прийти: {
    nonPast: ['прийду', 'прийдеш', 'прийде', 'прийдемо', 'прийдете', 'прийдуть'],
    pastSg: 'прийшов',
    pastPl: 'прийшли',
    impTu: 'прийди',
    impMes: 'прийдімо',
    impJus: 'прийдіть',
    isPerfective: true,
  },
  вийти: {
    nonPast: ['вийду', 'вийдеш', 'вийде', 'вийдемо', 'вийдете', 'вийдуть'],
    pastSg: 'вийшов',
    pastPl: 'вийшли',
    impTu: 'вийди',
    impMes: 'вийдімо',
    impJus: 'вийдіть',
    isPerfective: true,
  },
  піти: {
    nonPast: ['піду', 'підеш', 'піде', 'підемо', 'підете', 'підуть'],
    pastSg: 'пішов',
    pastPl: 'пішли',
    impTu: 'піди',
    impMes: 'підімо',
    impJus: 'підіть',
    isPerfective: true,
  },
  перейти: {
    nonPast: ['перейду', 'перейдеш', 'перейде', 'перейдемо', 'перейдете', 'перейдуть'],
    pastSg: 'перейшов',
    pastPl: 'перейшли',
    impTu: 'перейди',
    impMes: 'перейдімо',
    impJus: 'перейдіть',
    isPerfective: true,
  },
  пройти: {
    nonPast: ['пройду', 'пройдеш', 'пройде', 'пройдемо', 'пройдете', 'пройдуть'],
    pastSg: 'пройшов',
    pastPl: 'пройшли',
    impTu: 'пройди',
    impMes: 'пройдімо',
    impJus: 'пройдіть',
    isPerfective: true,
  },
  знайти: {
    nonPast: ['знайду', 'знайдеш', 'знайде', 'знайдемо', 'знайдете', 'знайдуть'],
    pastSg: 'знайшов',
    pastPl: 'знайшли',
    impTu: 'знайди',
    impMes: 'знайдімо',
    impJus: 'знайдіть',
    isPerfective: true,
  },
  їхати: {
    nonPast: ['їду', 'їдеш', 'їде', 'їдемо', 'їдете', 'їдуть'],
    pastSg: 'їхав',
    pastPl: 'їхали',
    impTu: 'їдь',
    impMes: 'їдьмо',
    impJus: 'їдьте',
    isPerfective: false,
  },
  приїхати: {
    nonPast: ['приїду', 'приїдеш', 'приїде', 'приїдемо', 'приїдете', 'приїдуть'],
    pastSg: 'приїхав',
    pastPl: 'приїхали',
    impTu: 'приїдь',
    impMes: 'приїдьмо',
    impJus: 'приїдьте',
    isPerfective: true,
  },
  виїхати: {
    nonPast: ['виїду', 'виїдеш', 'виїде', 'виїдемо', 'виїдете', 'виїдуть'],
    pastSg: 'виїхав',
    pastPl: 'виїхали',
    impTu: 'виїдь',
    impMes: 'виїдьмо',
    impJus: 'виїдьте',
    isPerfective: true,
  },
  доїхати: {
    nonPast: ['доїду', 'доїдеш', 'доїде', 'доїдемо', 'доїдете', 'доїдуть'],
    pastSg: 'доїхав',
    pastPl: 'доїхали',
    impTu: 'доїдь',
    impMes: 'доїдьмо',
    impJus: 'доїдьте',
    isPerfective: true,
  },
  поїхати: {
    nonPast: ['поїду', 'поїдеш', 'поїде', 'поїдемо', 'поїдете', 'поїдуть'],
    pastSg: 'поїхав',
    pastPl: 'поїхали',
    impTu: 'поїдь',
    impMes: 'поїдьмо',
    impJus: 'поїдьте',
    isPerfective: true,
  },
  переїхати: {
    nonPast: ['переїду', 'переїдеш', 'переїде', 'переїдемо', 'переїдете', 'переїдуть'],
    pastSg: 'переїхав',
    pastPl: 'переїхали',
    impTu: 'переїдь',
    impMes: 'переїдьмо',
    impJus: 'переїдьте',
    isPerfective: true,
  },
  бігти: {
    nonPast: ['біжу', 'біжиш', 'біжить', 'біжимо', 'біжите', 'біжать'],
    pastSg: 'біг',
    pastPl: 'бігли',
    impTu: 'біжи',
    impMes: 'біжімо',
    impJus: 'біжіть',
    isPerfective: false,
  },
  прибігти: {
    nonPast: ['прибіжу', 'прибіжиш', 'прибіжить', 'прибіжимо', 'прибіжите', 'прибіжать'],
    pastSg: 'прибіг',
    pastPl: 'прибігли',
    impTu: 'прибіжи',
    impMes: 'прибіжімо',
    impJus: 'прибіжіть',
    isPerfective: true,
  },
  втекти: {
    nonPast: ['втечу', 'втечеш', 'втече', 'втечемо', 'втечете', 'втечуть'],
    pastSg: 'втік',
    pastPl: 'втекли',
    impTu: 'втечи',
    impMes: 'втечімо',
    impJus: 'втечіть',
    isPerfective: true,
  },
  текти: {
    nonPast: ['течу', 'течеш', 'тече', 'течемо', 'течете', 'течуть'],
    pastSg: 'тік',
    pastPl: 'текли',
    impTu: 'течи',
    impMes: 'течімо',
    impJus: 'течіть',
    isPerfective: false,
  },
  пекти: {
    nonPast: ['печу', 'печеш', 'пече', 'печемо', 'печете', 'печуть'],
    pastSg: 'пік',
    pastPl: 'пекли',
    impTu: 'печи',
    impMes: 'печімо',
    impJus: 'печіть',
    isPerfective: false,
  },
  спекти: {
    nonPast: ['спечу', 'спечеш', 'спече', 'спечемо', 'спечете', 'спечуть'],
    pastSg: 'спік',
    pastPl: 'спекли',
    impTu: 'спечи',
    impMes: 'спечімо',
    impJus: 'спечіть',
    isPerfective: true,
  },
  берегти: {
    nonPast: ['бережу', 'бережеш', 'береже', 'бережемо', 'бережете', 'бережуть'],
    pastSg: 'беріг',
    pastPl: 'берегли',
    impTu: 'бережи',
    impMes: 'бережімо',
    impJus: 'бережіть',
    isPerfective: false,
  },
  стригти: {
    nonPast: ['стрижу', 'стрижеш', 'стриже', 'стрижемо', 'стрижете', 'стрижуть'],
    pastSg: 'стриг',
    pastPl: 'стригли',
    impTu: 'стрижи',
    impMes: 'стрижімо',
    impJus: 'стрижіть',
    isPerfective: false,
  },
  підстригти: {
    nonPast: ['підстрижу', 'підстрижеш', 'підстриже', 'підстрижемо', 'підстрижете', 'підстрижуть'],
    pastSg: 'підстриг',
    pastPl: 'підстригли',
    impTu: 'підстрижи',
    impMes: 'підстрижімо',
    impJus: 'підстрижіть',
    isPerfective: true,
  },
  лягти: {
    nonPast: ['ляжу', 'ляжеш', 'ляже', 'ляжемо', 'ляжете', 'ляжуть'],
    pastSg: 'ліг',
    pastPl: 'лягли',
    impTu: 'ляж',
    impMes: 'ляжмо',
    impJus: 'ляжте',
    isPerfective: true,
  },
  сісти: {
    nonPast: ['сяду', 'сядеш', 'сяде', 'сядемо', 'сядете', 'сядуть'],
    pastSg: 'сів',
    pastPl: 'сіли',
    impTu: 'сядь',
    impMes: 'сядьмо',
    impJus: 'сядьте',
    isPerfective: true,
  },
  пересісти: {
    nonPast: ['пересяду', 'пересядеш', 'пересяде', 'пересядемо', 'пересядете', 'пересядуть'],
    pastSg: 'пересів',
    pastPl: 'пересіли',
    impTu: 'пересядь',
    impMes: 'пересядьмо',
    impJus: 'пересядьте',
    isPerfective: true,
  },
  спати: {
    nonPast: ['сплю', 'спиш', 'спить', 'спимо', 'спите', 'сплять'],
    pastSg: 'спав',
    pastPl: 'спали',
    impTu: 'спи',
    impMes: 'спімо',
    impJus: 'спіть',
    isPerfective: false,
  },
  стояти: {
    nonPast: ['стою', 'стоїш', 'стоїть', 'стоїмо', 'стоїте', 'стоять'],
    pastSg: 'стояв',
    pastPl: 'стояли',
    impTu: 'стій',
    impMes: 'стіймо',
    impJus: 'стійте',
    isPerfective: false,
  },
  боятися: {
    nonPast: ['боюся', 'боїшся', 'боїться', 'боїмося', 'боїтеся', 'бояться'],
    pastSg: 'боявся',
    pastPl: 'боялися',
    impTu: 'бійся',
    impMes: 'біймося',
    impJus: 'бійтеся',
    isPerfective: false,
  },
  лежати: {
    nonPast: ['лежу', 'лежиш', 'лежить', 'лежимо', 'лежите', 'лежать'],
    pastSg: 'лежав',
    pastPl: 'лежали',
    impTu: 'лежи',
    impMes: 'лежімо',
    impJus: 'лежіть',
    isPerfective: false,
  },
  сидіти: {
    nonPast: ['сиджу', 'сидиш', 'сидить', 'сидимо', 'сидите', 'сидять'],
    pastSg: 'сидів',
    pastPl: 'сиділи',
    impTu: 'сиди',
    impMes: 'сидімо',
    impJus: 'сидіть',
    isPerfective: false,
  },
  летіти: {
    nonPast: ['лечу', 'летиш', 'летить', 'летимо', 'летите', 'летять'],
    pastSg: 'летів',
    pastPl: 'летіли',
    impTu: 'лети',
    impMes: 'летімо',
    impJus: 'летіть',
    isPerfective: false,
  },
  прилетіти: {
    nonPast: ['прилечу', 'прилетиш', 'прилетить', 'прилетимо', 'прилетите', 'прилетять'],
    pastSg: 'прилетів',
    pastPl: 'прилетіли',
    impTu: 'прилети',
    impMes: 'прилетімо',
    impJus: 'прилетіть',
    isPerfective: true,
  },
  вилетіти: {
    nonPast: ['вилечу', 'вилетиш', 'вилетить', 'вилетимо', 'вилетите', 'вилетять'],
    pastSg: 'вилетів',
    pastPl: 'вилетіли',
    impTu: 'вилети',
    impMes: 'вилетімо',
    impJus: 'вилетіть',
    isPerfective: true,
  },
  гриміти: {
    nonPast: ['гримлю', 'гримиш', 'гримить', 'гримимо', 'гримите', 'гримлять'],
    pastSg: 'гримів',
    pastPl: 'гриміли',
    impTu: 'грими',
    impMes: 'гримімо',
    impJus: 'гриміть',
    isPerfective: false,
  },
  боліти: {
    nonPast: ['болю', 'болиш', 'болить', 'болимо', 'болите', 'болять'],
    pastSg: 'болів',
    pastPl: 'боліли',
    impTu: 'не боли',
    impMes: 'не болімо',
    impJus: 'не боліть',
    isPerfective: false,
  },
  горіти: {
    nonPast: ['горю', 'гориш', 'горить', 'горимо', 'горите', 'горять'],
    pastSg: 'горів',
    pastPl: 'горіли',
    impTu: 'гори',
    impMes: 'горімо',
    impJus: 'горіть',
    isPerfective: false,
  },
  дивитися: {
    nonPast: ['дивлюся', 'дивишся', 'дивиться', 'дивимося', 'дивитеся', 'дивляться'],
    pastSg: 'дивився',
    pastPl: 'дивилися',
    impTu: 'дивися',
    impMes: 'дивімося',
    impJus: 'дивіться',
    isPerfective: false,
  },
  подивитися: {
    nonPast: ['подивлюся', 'подивишся', 'подивиться', 'подивимося', 'подивитеся', 'подивляться'],
    pastSg: 'подивився',
    pastPl: 'подивилися',
    impTu: 'подивися',
    impMes: 'подивімося',
    impJus: 'подивіться',
    isPerfective: true,
  },
  жити: {
    nonPast: ['живу', 'живеш', 'живе', 'живемо', 'живете', 'живуть'],
    pastSg: 'жив',
    pastPl: 'жили',
    impTu: 'живи',
    impMes: 'живімо',
    impJus: 'живіть',
    isPerfective: false,
  },
  шити: {
    nonPast: ['шию', 'шиєш', 'шиє', 'шиємо', 'шиєте', 'шиють'],
    pastSg: 'шив',
    pastPl: 'шили',
    impTu: 'ший',
    impMes: 'шиймо',
    impJus: 'шийте',
    isPerfective: false,
  },
  пошити: {
    nonPast: ['пошию', 'пошиєш', 'пошиє', 'пошиємо', 'пошиєте', 'пошиють'],
    pastSg: 'пошив',
    pastPl: 'пошили',
    impTu: 'поший',
    impMes: 'пошиймо',
    impJus: 'пошийте',
    isPerfective: true,
  },
  мити: {
    nonPast: ['мию', 'миєш', 'миє', 'миємо', 'миєте', 'миють'],
    pastSg: 'мив',
    pastPl: 'мили',
    impTu: 'мий',
    impMes: 'миймо',
    impJus: 'мийте',
    isPerfective: false,
  },
  вимити: {
    nonPast: ['вимию', 'вимиєш', 'вимиє', 'вимиємо', 'вимиєте', 'вимиють'],
    pastSg: 'вимив',
    pastPl: 'вимили',
    impTu: 'вимий',
    impMes: 'вимиймо',
    impJus: 'вимийте',
    isPerfective: true,
  },
  вмитися: {
    nonPast: ['вмиюся', 'вмиєшся', 'вмиється', 'вмиємося', 'вмиєтеся', 'вмиються'],
    pastSg: 'вмився',
    pastPl: 'вмилися',
    impTu: 'вмийся',
    impMes: 'вмиймося',
    impJus: 'вмийтеся',
    isPerfective: true,
  },
  пити: {
    nonPast: ['п’ю', 'п’єш', 'п’є', 'п’ємо', 'п’єте', 'п’ють'],
    pastSg: 'пив',
    pastPl: 'пили',
    impTu: 'пий',
    impMes: 'пиймо',
    impJus: 'пийте',
    isPerfective: false,
  },
  випити: {
    nonPast: ['вип’ю', 'вип’єш', 'вип’є', 'вип’ємо', 'вип’єте', 'вип’ють'],
    pastSg: 'випив',
    pastPl: 'випили',
    impTu: 'випий',
    impMes: 'випиймо',
    impJus: 'випийте',
    isPerfective: true,
  },
  налити: {
    nonPast: ['наллю', 'наллєш', 'наллє', 'наллємо', 'наллєте', 'наллють'],
    pastSg: 'налив',
    pastPl: 'налили',
    impTu: 'налий',
    impMes: 'налиймо',
    impJus: 'налийте',
    isPerfective: true,
  },
  відкрити: {
    nonPast: ['відкрию', 'відкриєш', 'відкриє', 'відкриємо', 'відкриєте', 'відкриють'],
    pastSg: 'відкрив',
    pastPl: 'відкрили',
    impTu: 'відкрий',
    impMes: 'відкриймо',
    impJus: 'відкрийте',
    isPerfective: true,
  },
  закрити: {
    nonPast: ['закрию', 'закриєш', 'закриє', 'закриємо', 'закриєте', 'закриють'],
    pastSg: 'закрив',
    pastPl: 'закрили',
    impTu: 'закрий',
    impMes: 'закриймо',
    impJus: 'закрийте',
    isPerfective: true,
  },
  чути: {
    nonPast: ['чую', 'чуєш', 'чує', 'чуємо', 'чуєте', 'чують'],
    pastSg: 'чув',
    pastPl: 'чули',
    impTu: 'чуй',
    impMes: 'чуймо',
    impJus: 'чуйте',
    isPerfective: false,
  },
  почути: {
    nonPast: ['почую', 'почуєш', 'почує', 'почуємо', 'почуєте', 'почують'],
    pastSg: 'почув',
    pastPl: 'почули',
    impTu: 'почуй',
    impMes: 'почуймо',
    impJus: 'почуйте',
    isPerfective: true,
  },
  взутися: {
    nonPast: ['взуюся', 'взуєшся', 'взується', 'взуємося', 'взуєтеся', 'взуються'],
    pastSg: 'взувся',
    pastPl: 'взулися',
    impTu: 'взуйся',
    impMes: 'взуймося',
    impJus: 'взуйтеся',
    isPerfective: true,
  },
  роззутися: {
    nonPast: ['роззуюся', 'роззуєшся', 'роззується', 'роззуємося', 'роззуєтеся', 'роззуються'],
    pastSg: 'роззувся',
    pastPl: 'роззулися',
    impTu: 'роззуйся',
    impMes: 'роззуймося',
    impJus: 'роззуйтеся',
    isPerfective: true,
  },
  дути: {
    nonPast: ['дму', 'дмеш', 'дме', 'дмемо', 'дмете', 'дмуть'],
    pastSg: 'дув',
    pastPl: 'дули',
    impTu: 'дми',
    impMes: 'дмімо',
    impJus: 'дміть',
    isPerfective: false,
  },
  забути: {
    nonPast: ['забуду', 'забудеш', 'забуде', 'забудемо', 'забудете', 'забудуть'],
    pastSg: 'забув',
    pastPl: 'забули',
    impTu: 'забудь',
    impMes: 'забудьмо',
    impJus: 'забудьте',
    isPerfective: true,
  },
  прибути: {
    nonPast: ['прибуду', 'прибудеш', 'прибуде', 'прибудемо', 'прибудете', 'прибудуть'],
    pastSg: 'прибув',
    pastPl: 'прибули',
    impTu: 'прибудь',
    impMes: 'прибудьмо',
    impJus: 'прибудьте',
    isPerfective: true,
  },
  відбутися: {
    nonPast: ['відбудуся', 'відбудешся', 'відбудеться', 'відбудемося', 'відбудетеся', 'відбудуться'],
    pastSg: 'відбувся',
    pastPl: 'відбулися',
    impTu: 'відбудься',
    impMes: 'відбудьмося',
    impJus: 'відбудьтеся',
    isPerfective: true,
  },
  надіти: {
    nonPast: ['надіну', 'надінеш', 'надіне', 'надінемо', 'надінете', 'надінуть'],
    pastSg: 'надів',
    pastPl: 'наділи',
    impTu: 'надінь',
    impMes: 'надіньмо',
    impJus: 'надіньте',
    isPerfective: true,
  },
  відпочити: {
    nonPast: ['відпочину', 'відпочинеш', 'відпочине', 'відпочинемо', 'відпочинете', 'відпочинуть'],
    pastSg: 'відпочив',
    pastPl: 'відпочили',
    impTu: 'відпочинь',
    impMes: 'відпочиньмо',
    impJus: 'відпочиньте',
    isPerfective: true,
  },
  зустріти: {
    nonPast: ['зустріну', 'зустрінеш', 'зустріне', 'зустрінемо', 'зустрінете', 'зустрінуть'],
    pastSg: 'зустрів',
    pastPl: 'зустріли',
    impTu: 'зустрінь',
    impMes: 'зустріньмо',
    impJus: 'зустріньте',
    isPerfective: true,
  },
  зустрітися: {
    nonPast: ['зустрінуся', 'зустрінешся', 'зустрінеться', 'зустрінемося', 'зустрінетеся', 'зустрінуться'],
    pastSg: 'зустрівся',
    pastPl: 'зустрілися',
    impTu: 'зустрінься',
    impMes: 'зустріньмося',
    impJus: 'зустріньтеся',
    isPerfective: true,
  },
  встати: {
    nonPast: ['встану', 'встанеш', 'встане', 'встанемо', 'встанете', 'встануть'],
    pastSg: 'встав',
    pastPl: 'встали',
    impTu: 'встань',
    impMes: 'встаньмо',
    impJus: 'встаньте',
    isPerfective: true,
  },
  стати: {
    nonPast: ['стану', 'станеш', 'стане', 'станемо', 'станете', 'стануть'],
    pastSg: 'став',
    pastPl: 'стали',
    impTu: 'стань',
    impMes: 'станьмо',
    impJus: 'станьте',
    isPerfective: true,
  },
  статися: {
    nonPast: ['стануся', 'станешся', 'станеться', 'станемося', 'станетеся', 'стануться'],
    pastSg: 'стався',
    pastPl: 'сталися',
    impTu: 'станься',
    impMes: 'станьмося',
    impJus: 'станьтеся',
    isPerfective: true,
  },
  почати: {
    nonPast: ['почну', 'почнеш', 'почне', 'почнемо', 'почнете', 'почнуть'],
    pastSg: 'почав',
    pastPl: 'почали',
    impTu: 'почни',
    impMes: 'почнімо',
    impJus: 'почніть',
    isPerfective: true,
  },
  взяти: {
    nonPast: ['візьму', 'візьмеш', 'візьме', 'візьмемо', 'візьмете', 'візьмуть'],
    pastSg: 'взяв',
    pastPl: 'взяли',
    impTu: 'візьми',
    impMes: 'візьмімо',
    impJus: 'візьміть',
    isPerfective: true,
  },
  зайняти: {
    nonPast: ['займу', 'займеш', 'займе', 'займемо', 'займете', 'займуть'],
    pastSg: 'зайняв',
    pastPl: 'зайняли',
    impTu: 'займи',
    impMes: 'займімо',
    impJus: 'займіть',
    isPerfective: true,
  },
  зняти: {
    nonPast: ['зніму', 'знімеш', 'зніме', 'знімемо', 'знімете', 'знімуть'],
    pastSg: 'зняв',
    pastPl: 'зняли',
    impTu: 'зніми',
    impMes: 'знімімо',
    impJus: 'зніміть',
    isPerfective: true,
  },
  обійняти: {
    nonPast: ['обійму', 'обіймеш', 'обійме', 'обіймемо', 'обіймете', 'обіймуть'],
    pastSg: 'обійняв',
    pastPl: 'обійняли',
    impTu: 'обійми',
    impMes: 'обіймімо',
    impJus: 'обійміть',
    isPerfective: true,
  },
  брати: {
    nonPast: ['беру', 'береш', 'бере', 'беремо', 'берете', 'беруть'],
    pastSg: 'брав',
    pastPl: 'брали',
    impTu: 'бери',
    impMes: 'берімо',
    impJus: 'беріть',
    isPerfective: false,
  },
  обрати: {
    nonPast: ['оберу', 'обереш', 'обере', 'оберемо', 'оберете', 'оберуть'],
    pastSg: 'обрав',
    pastPl: 'обрали',
    impTu: 'обери',
    impMes: 'оберімо',
    impJus: 'оберіть',
    isPerfective: true,
  },
  вибрати: {
    nonPast: ['виберу', 'вибереш', 'вибере', 'виберемо', 'виберете', 'виберуть'],
    pastSg: 'вибрав',
    pastPl: 'вибрали',
    impTu: 'вибери',
    impMes: 'виберімо',
    impJus: 'виберіть',
    isPerfective: true,
  },
  прибрати: {
    nonPast: ['приберу', 'прибереш', 'прибере', 'приберемо', 'приберете', 'приберуть'],
    pastSg: 'прибрав',
    pastPl: 'прибрали',
    impTu: 'прибери',
    impMes: 'приберімо',
    impJus: 'приберіть',
    isPerfective: true,
  },
  прати: {
    nonPast: ['перу', 'переш', 'пере', 'перемо', 'перете', 'перуть'],
    pastSg: 'прав',
    pastPl: 'прали',
    impTu: 'пери',
    impMes: 'перімо',
    impJus: 'періть',
    isPerfective: false,
  },
  випрати: {
    nonPast: ['виперу', 'випереш', 'випере', 'виперемо', 'виперете', 'виперуть'],
    pastSg: 'виправ',
    pastPl: 'випрали',
    impTu: 'випери',
    impMes: 'виперімо',
    impJus: 'виперіть',
    isPerfective: true,
  },
  надіслати: {
    nonPast: ['надішлю', 'надішлеш', 'надішле', 'надішлемо', 'надішлете', 'надішлють'],
    pastSg: 'надіслав',
    pastPl: 'надіслали',
    impTu: 'надішли',
    impMes: 'надішлімо',
    impJus: 'надішліть',
    isPerfective: true,
  },
  прислати: {
    nonPast: ['пришлю', 'пришлеш', 'пришле', 'пришлемо', 'пришлете', 'пришлють'],
    pastSg: 'прислав',
    pastPl: 'прислали',
    impTu: 'пришли',
    impMes: 'пришлімо',
    impJus: 'пришліть',
    isPerfective: true,
  },
  писати: {
    nonPast: ['пишу', 'пишеш', 'пише', 'пишемо', 'пишете', 'пишуть'],
    pastSg: 'писав',
    pastPl: 'писали',
    impTu: 'пиши',
    impMes: 'пишімо',
    impJus: 'пишіть',
    isPerfective: false,
  },
  написати: {
    nonPast: ['напишу', 'напишеш', 'напише', 'напишемо', 'напишете', 'напишуть'],
    pastSg: 'написав',
    pastPl: 'написали',
    impTu: 'напиши',
    impMes: 'напишімо',
    impJus: 'напишіть',
    isPerfective: true,
  },
  записати: {
    nonPast: ['запишу', 'запишеш', 'запише', 'запишемо', 'запишете', 'запишуть'],
    pastSg: 'записав',
    pastPl: 'записали',
    impTu: 'запиши',
    impMes: 'запишімо',
    impJus: 'запишіть',
    isPerfective: true,
  },
  підписати: {
    nonPast: ['підпишу', 'підпишеш', 'підпише', 'підпишемо', 'підпишете', 'підпишуть'],
    pastSg: 'підписав',
    pastPl: 'підписали',
    impTu: 'підпиши',
    impMes: 'підпишімо',
    impJus: 'підпишіть',
    isPerfective: true,
  },
  казати: {
    nonPast: ['кажу', 'кажеш', 'каже', 'кажемо', 'кажете', 'кажуть'],
    pastSg: 'казав',
    pastPl: 'казали',
    impTu: 'кажи',
    impMes: 'кажімо',
    impJus: 'кажіть',
    isPerfective: false,
  },
  сказати: {
    nonPast: ['скажу', 'скажеш', 'скаже', 'скажемо', 'скажете', 'скажуть'],
    pastSg: 'сказав',
    pastPl: 'сказали',
    impTu: 'скажи',
    impMes: 'скажімо',
    impJus: 'скажіть',
    isPerfective: true,
  },
  показати: {
    nonPast: ['покажу', 'покажеш', 'покаже', 'покажемо', 'покажете', 'покажуть'],
    pastSg: 'показав',
    pastPl: 'показали',
    impTu: 'покажи',
    impMes: 'покажімо',
    impJus: 'покажіть',
    isPerfective: true,
  },
  різати: {
    nonPast: ['ріжу', 'ріжеш', 'ріже', 'ріжемо', 'ріжете', 'ріжуть'],
    pastSg: 'різав',
    pastPl: 'різали',
    impTu: 'ріж',
    impMes: 'ріжмо',
    impJus: 'ріжте',
    isPerfective: false,
  },
  нарізати: {
    nonPast: ['наріжу', 'наріжеш', 'наріже', 'наріжемо', 'наріжете', 'наріжуть'],
    pastSg: 'нарізав',
    pastPl: 'нарізали',
    impTu: 'наріж',
    impMes: 'наріжмо',
    impJus: 'наріжте',
    isPerfective: true,
  },
  плакати: {
    nonPast: ['плачу', 'плачеш', 'плаче', 'плачемо', 'плачете', 'плачуть'],
    pastSg: 'плакав',
    pastPl: 'плакали',
    impTu: 'не плач',
    impMes: 'не плачмо',
    impJus: 'не плачте',
    isPerfective: false,
  },
  причесатися: {
    nonPast: ['причешуся', 'причешешся', 'причешеться', 'причешемося', 'причешетеся', 'причешуться'],
    pastSg: 'причесався',
    pastPl: 'причесалися',
    impTu: 'причешися',
    impMes: 'причешімося',
    impJus: 'причешіться',
    isPerfective: true,
  },
  'в’язати': {
    nonPast: ['в’яжу', 'в’яжеш', 'в’яже', 'в’яжемо', 'в’яжете', 'в’яжуть'],
    pastSg: 'в’язав',
    pastPl: 'в’язали',
    impTu: 'в’яжи',
    impMes: 'в’яжімо',
    impJus: 'в’яжіть',
    isPerfective: false,
  },
  'розв’язати': {
    nonPast: ['розв’яжу', 'розв’яжеш', 'розв’яже', 'розв’яжемо', 'розв’яжете', 'розв’яжуть'],
    pastSg: 'розв’язав',
    pastPl: 'розв’язали',
    impTu: 'розв’яжи',
    impMes: 'розв’яжімо',
    impJus: 'розв’яжіть',
    isPerfective: true,
  },
  покласти: {
    nonPast: ['покладу', 'покладеш', 'покладе', 'покладемо', 'покладете', 'покладуть'],
    pastSg: 'поклав',
    pastPl: 'поклали',
    impTu: 'поклади',
    impMes: 'покладімо',
    impJus: 'покладіть',
    isPerfective: true,
  },
  скласти: {
    nonPast: ['складу', 'складеш', 'складе', 'складемо', 'складете', 'складуть'],
    pastSg: 'склав',
    pastPl: 'склали',
    impTu: 'склади',
    impMes: 'складімо',
    impJus: 'складіть',
    isPerfective: true,
  },
  перекласти: {
    nonPast: ['перекладу', 'перекладеш', 'перекладе', 'перекладемо', 'перекладете', 'перекладуть'],
    pastSg: 'переклав',
    pastPl: 'переклали',
    impTu: 'переклади',
    impMes: 'перекладімо',
    impJus: 'перекладіть',
    isPerfective: true,
  },
  відкласти: {
    nonPast: ['відкладу', 'відкладеш', 'відкладе', 'відкладемо', 'відкладете', 'відкладуть'],
    pastSg: 'відклав',
    pastPl: 'відклали',
    impTu: 'відклади',
    impMes: 'відкладімо',
    impJus: 'відкладіть',
    isPerfective: true,
  },
  провести: {
    nonPast: ['проведу', 'проведеш', 'проведе', 'проведемо', 'проведете', 'проведуть'],
    pastSg: 'провів',
    pastPl: 'провели',
    impTu: 'проведи',
    impMes: 'проведімо',
    impJus: 'проведіть',
    isPerfective: true,
  },
  підвестися: {
    nonPast: ['підведуся', 'підведешся', 'підведеться', 'підведемося', 'підведетеся', 'підведуться'],
    pastSg: 'підвівся',
    pastPl: 'підвелися',
    impTu: 'підведися',
    impMes: 'підведімося',
    impJus: 'підведіться',
    isPerfective: true,
  },
  рости: {
    nonPast: ['росту', 'ростеш', 'росте', 'ростемо', 'ростете', 'ростуть'],
    pastSg: 'ріс',
    pastPl: 'росли',
    impTu: 'рости',
    impMes: 'ростімо',
    impJus: 'ростіть',
    isPerfective: false,
  },
  вирости: {
    nonPast: ['виросту', 'виростеш', 'виросте', 'виростемо', 'виростете', 'виростуть'],
    pastSg: 'виріс',
    pastPl: 'виросли',
    impTu: 'вирости',
    impMes: 'виростімо',
    impJus: 'виростіть',
    isPerfective: true,
  },
  цвісти: {
    nonPast: ['цвіту', 'цвітеш', 'цвіте', 'цвітемо', 'цвітете', 'цвітуть'],
    pastSg: 'цвів',
    pastPl: 'цвіли',
    impTu: 'цвіти',
    impMes: 'цвітімо',
    impJus: 'цвітіть',
    isPerfective: false,
  },
  нести: {
    nonPast: ['несу', 'несеш', 'несе', 'несемо', 'несете', 'несуть'],
    pastSg: 'ніс',
    pastPl: 'несли',
    impTu: 'неси',
    impMes: 'несімо',
    impJus: 'несіть',
    isPerfective: false,
  },
  принести: {
    nonPast: ['принесу', 'принесеш', 'принесе', 'принесемо', 'принесете', 'принесуть'],
    pastSg: 'приніс',
    pastPl: 'принесли',
    impTu: 'принеси',
    impMes: 'принесімо',
    impJus: 'принесіть',
    isPerfective: true,
  },
  віднести: {
    nonPast: ['віднесу', 'віднесеш', 'віднесе', 'віднесемо', 'віднесете', 'віднесуть'],
    pastSg: 'відніс',
    pastPl: 'віднесли',
    impTu: 'віднеси',
    impMes: 'віднесімо',
    impJus: 'віднесіть',
    isPerfective: true,
  },
  везти: {
    nonPast: ['везу', 'везеш', 'везе', 'веземо', 'везете', 'везуть'],
    pastSg: 'віз',
    pastPl: 'везли',
    impTu: 'вези',
    impMes: 'везімо',
    impJus: 'везіть',
    isPerfective: false,
  },
  привезти: {
    nonPast: ['привезу', 'привезеш', 'привезе', 'привеземо', 'привезете', 'привезуть'],
    pastSg: 'привіз',
    pastPl: 'привезли',
    impTu: 'привези',
    impMes: 'привезімо',
    impJus: 'привезіть',
    isPerfective: true,
  },
  відвезти: {
    nonPast: ['відвезу', 'відвезеш', 'відвезе', 'відвеземо', 'відвезете', 'відвезуть'],
    pastSg: 'відвіз',
    pastPl: 'відвезли',
    impTu: 'відвези',
    impMes: 'відвезімо',
    impJus: 'відвезіть',
    isPerfective: true,
  },
  лізти: {
    nonPast: ['лізу', 'лізеш', 'лізе', 'ліземо', 'лізете', 'лізуть'],
    pastSg: 'ліз',
    pastPl: 'лізли',
    impTu: 'лізь',
    impMes: 'лізьмо',
    impJus: 'лізьте',
    isPerfective: false,
  },
  плисти: {
    nonPast: ['пливу', 'пливеш', 'пливе', 'пливемо', 'пливете', 'пливуть'],
    pastSg: 'плив',
    pastPl: 'пливли',
    impTu: 'пливи',
    impMes: 'пливімо',
    impJus: 'пливіть',
    isPerfective: false,
  },
  терти: {
    nonPast: ['тру', 'треш', 'тре', 'тремо', 'трете', 'труть'],
    pastSg: 'тер',
    pastPl: 'терли',
    impTu: 'три',
    impMes: 'трімо',
    impJus: 'тріть',
    isPerfective: false,
  },
  мерзнути: {
    nonPast: ['мерзну', 'мерзнеш', 'мерзне', 'мерзнемо', 'мерзнете', 'мерзнуть'],
    pastSg: 'мерз',
    pastPl: 'мерзли',
    impTu: 'не мерзни',
    impMes: 'не мерзнімо',
    impJus: 'не мерзніть',
    isPerfective: false,
  },
  замерзнути: {
    nonPast: ['замерзну', 'замерзнеш', 'замерзне', 'замерзнемо', 'замерзнете', 'замерзнуть'],
    pastSg: 'замерз',
    pastPl: 'замерзли',
    impTu: 'не замерзни',
    impMes: 'не замерзнімо',
    impJus: 'не замерзніть',
    isPerfective: true,
  },
  сохнути: {
    nonPast: ['сохну', 'сохнеш', 'сохне', 'сохнемо', 'сохнете', 'сохнуть'],
    pastSg: 'сох',
    pastPl: 'сохли',
    impTu: 'сохни',
    impMes: 'сохнімо',
    impJus: 'сохніть',
    isPerfective: false,
  },
  стигнути: {
    nonPast: ['стигну', 'стигнеш', 'стигне', 'стигнемо', 'стигнете', 'стигнуть'],
    pastSg: 'стиг',
    pastPl: 'стигли',
    impTu: 'стигни',
    impMes: 'стигнімо',
    impJus: 'стигніть',
    isPerfective: false,
  },
  встигнути: {
    nonPast: ['встигну', 'встигнеш', 'встигне', 'встигнемо', 'встигнете', 'встигнуть'],
    pastSg: 'встиг',
    pastPl: 'встигли',
    impTu: 'встигни',
    impMes: 'встигнімо',
    impJus: 'встигніть',
    isPerfective: true,
  },
  досягти: {
    nonPast: ['досягну', 'досягнеш', 'досягне', 'досягнемо', 'досягнете', 'досягнуть'],
    pastSg: 'досяг',
    pastPl: 'досягли',
    impTu: 'досягни',
    impMes: 'досягнімо',
    impJus: 'досягніть',
    isPerfective: true,
  },
  наїстися: {
    nonPast: ['наїмся', 'наїсися', 'наїсться', 'наїмося', 'наїстеся', 'наїдяться'],
    pastSg: 'наївся',
    pastPl: 'наїлися',
    impTu: 'наїжся',
    impMes: 'наїжмося',
    impJus: 'наїжтеся',
    isPerfective: true,
  },
  щебетати: {
    nonPast: ['щебечу', 'щебечеш', 'щебече', 'щебечемо', 'щебечете', 'щебечуть'],
    pastSg: 'щебетав',
    pastPl: 'щебетали',
    impTu: 'щебечи',
    impMes: 'щебечімо',
    impJus: 'щебечіть',
    isPerfective: false,
  },
};

const PERFECTIVE_UK_VERBS = new Set([
  'народитися',
  'одружитися',
  'познайомитися',
  'запросити',
  'відвідати',
  'помиритися',
  'пробачити',
  'вибачитися',
  'подякувати',
  'привітати',
  'скучити',
  'заснути',
  'прокинутися',
  'встати',
  'вмитися',
  'сісти',
  'лягти',
  'вичистити',
  'прибрати',
  'вимити',
  'побудувати',
  'покласти',
  'взяти',
  'викинути',
  'заселитися',
  'з’їсти',
  'випити',
  'приготувати',
  'зварити',
  'спекти',
  'змішати',
  'скуштувати',
  'пригостити',
  'замовити',
  'налити',
  'розігріти',
  'наїстися',
  'купити',
  'заплатити',
  'оплатити',
  'обрати',
  'вибрати',
  'зекономити',
  'витратити',
  'поміняти',
  'позичити',
  'зважити',
  'запакувати',
  'знизити',
  'попрацювати',
  'зробити',
  'створити',
  'запланувати',
  'досягти',
  'підписати',
  'працевлаштувати',
  'влаштуватися',
  'перевірити',
  'виправити',
  'полагодити',
  'використати',
  'надіслати',
  'прислати',
  'приїхати',
  'виїхати',
  'доїхати',
  'повернутися',
  'прилетіти',
  'вилетіти',
  'прибігти',
  'втекти',
  'зупинитися',
  'повернути',
  'привезти',
  'відвезти',
  'принести',
  'віднести',
  'зустрітися',
  'зустріти',
  'знайти',
  'зачекати',
  'дочекатися',
  'зателефонувати',
  'прогулятися',
  'показати',
  'побачити',
  'подивитися',
  'почути',
  'послухати',
  'захистити',
  'врятувати',
  'зареєструватися',
  'повідомити',
  'вивчити',
  'навчити',
  'прочитати',
  'написати',
  'записати',
  'порахувати',
  'дізнатися',
  'запитати',
  'повторити',
  'пояснити',
  'перекласти',
  'вимовити',
  'розповісти',
  'сказати',
  'пригадати',
  'забути',
  'намалювати',
  'скласти',
  'посадити',
  'запалити',
  'замерзнути',
  'затопити',
  'захворіти',
  'одужати',
  'вилікувати',
  'вдихнути',
  'видихнути',
  'відпочити',
  'втомитися',
  'виміряти',
  'поранити',
  'зламати',
  'розслабити',
  'розслабитися',
  'одягнутися',
  'роздягнутися',
  'переодягнутися',
  'взутися',
  'роззутися',
  'надіти',
  'зняти',
  'випрати',
  'випрасувати',
  'пошити',
  'причесатися',
  'підстригтися',
  'оглянути',
  'сфотографувати',
  'заблукати',
  'провести',
  'спакувати',
  'скупатися',
  'закінчитися',
  'завершити',
  'зайняти',
  'встигнути',
  'відкласти',
  'підготувати',
  'підготуватися',
  'залишитися',
  'залишити',
  'змінитися',
  'відбутися',
  'трапитися',
  'статися',
  'захотіти',
  'полюбити',
  'подумати',
  'придумати',
  'спробувати',
  'постаратися',
  'вирішити',
  'розв’язати',
  'зацікавити',
  'побажати',
  'віддати',
]);

function addUkReflexiveToParadigm(p: UkVerbParadigm): UkVerbParadigm {
  const attachRefl = (form: string, isThirdSg: boolean) => {
    if (form.endsWith('ся') || form.endsWith('сь')) return form;
    if (isThirdSg && (form.endsWith('є') || form.endsWith('е'))) {
      return `${form}ться`;
    }
    return `${form}ся`;
  };
  return {
    nonPast: [
      attachRefl(p.nonPast[0], false),
      attachRefl(p.nonPast[1], false),
      attachRefl(p.nonPast[2], true),
      attachRefl(p.nonPast[3], false),
      attachRefl(p.nonPast[4], false),
      attachRefl(p.nonPast[5], false),
    ],
    pastSg: attachRefl(p.pastSg, false),
    pastPl: attachRefl(p.pastPl, false),
    impTu: attachRefl(p.impTu, false),
    impMes: attachRefl(p.impMes, false),
    impJus: attachRefl(p.impJus, false),
    isPerfective: p.isPerfective,
  };
}

function buildUkrainianVerbParadigm(infUk: string): UkVerbParadigm {
  const lower = infUk.trim().toLowerCase();
  if (EXACT_UK_VERB_PARADIGMS[lower]) {
    return EXACT_UK_VERB_PARADIGMS[lower];
  }

  const isRefl = lower.endsWith('тися') || lower.endsWith('тись');
  const baseInf = isRefl ? lower.replace(/(тися|тись)$/, 'ти') : lower;

  if (EXACT_UK_VERB_PARADIGMS[baseInf]) {
    const baseP = EXACT_UK_VERB_PARADIGMS[baseInf];
    const p = isRefl ? addUkReflexiveToParadigm(baseP) : baseP;
    return {
      ...p,
      isPerfective: p.isPerfective || PERFECTIVE_UK_VERBS.has(lower),
    };
  }

  const isPerf = PERFECTIVE_UK_VERBS.has(lower) || PERFECTIVE_UK_VERBS.has(baseInf);
  let baseParadigm: UkVerbParadigm;

  if (baseInf === 'розповісти' || baseInf === 'відповісти') {
    const pref = baseInf.slice(0, -3); // розпові / відпові
    baseParadigm = {
      nonPast: [
        `${pref}м`,
        `${pref}си`,
        `${pref}сть`,
        `${pref}мо`,
        `${pref}сте`,
        `${pref}дять`,
      ],
      pastSg: `${pref}в`,
      pastPl: `${pref}ли`,
      impTu: `${pref}ж`,
      impMes: `${pref}жмо`,
      impJus: `${pref}жте`,
      isPerfective: true,
    };
  } else if (
    baseInf.endsWith('увати') &&
    baseInf !== 'почувати' &&
    baseInf !== 'відчувати' &&
    baseInf !== 'відбувати' &&
    baseInf !== 'забувати' &&
    baseInf !== 'прибувати' &&
    baseInf !== 'перебувати' &&
    baseInf !== 'взувати' &&
    baseInf !== 'роззувати'
  ) {
    const stem = baseInf.slice(0, -5);
    baseParadigm = {
      nonPast: [
        `${stem}ую`,
        `${stem}уєш`,
        `${stem}ує`,
        `${stem}уємо`,
        `${stem}уєте`,
        `${stem}ують`,
      ],
      pastSg: `${stem}ував`,
      pastPl: `${stem}ували`,
      impTu: `${stem}уй`,
      impMes: `${stem}уймо`,
      impJus: `${stem}уйте`,
      isPerfective: isPerf,
    };
  } else if (baseInf.endsWith('ювати')) {
    const stem = baseInf.slice(0, -5);
    baseParadigm = {
      nonPast: [
        `${stem}юю`,
        `${stem}юєш`,
        `${stem}ює`,
        `${stem}юємо`,
        `${stem}юєте`,
        `${stem}юють`,
      ],
      pastSg: `${stem}ював`,
      pastPl: `${stem}ювали`,
      impTu: `${stem}юй`,
      impMes: `${stem}юймо`,
      impJus: `${stem}юйте`,
      isPerfective: isPerf,
    };
  } else if (
    baseInf === 'давати' ||
    baseInf === 'продавати' ||
    baseInf === 'подавати' ||
    baseInf === 'вставати' ||
    baseInf === 'ставати'
  ) {
    const stem = baseInf.slice(0, -4); // да, прода, пода, вста, ста
    baseParadigm = {
      nonPast: [
        `${stem}ю`,
        `${stem}єш`,
        `${stem}є`,
        `${stem}ємо`,
        `${stem}єте`,
        `${stem}ють`,
      ],
      pastSg: `${stem}вав`,
      pastPl: `${stem}вали`,
      impTu: `${stem}вай`,
      impMes: `${stem}ваймо`,
      impJus: `${stem}вайте`,
      isPerfective: isPerf,
    };
  } else if (baseInf.endsWith('ати')) {
    const stem = baseInf.slice(0, -2); // ends with 'а'
    baseParadigm = {
      nonPast: [
        `${stem}ю`,
        `${stem}єш`,
        `${stem}є`,
        `${stem}ємо`,
        `${stem}єте`,
        `${stem}ють`,
      ],
      pastSg: `${stem}в`,
      pastPl: `${stem}ли`,
      impTu: `${stem}й`,
      impMes: `${stem}ймо`,
      impJus: `${stem}йте`,
      isPerfective: isPerf,
    };
  } else if (baseInf.endsWith('яти')) {
    const beforeYa = baseInf.slice(0, -3);
    const endsInVowel = /[аеєиіїоуюя]$/.test(beforeYa);
    const presStem = endsInVowel ? beforeYa : `${beforeYa}я`;
    baseParadigm = {
      nonPast: [
        `${presStem}ю`,
        `${presStem}єш`,
        `${presStem}є`,
        `${presStem}ємо`,
        `${presStem}єте`,
        `${presStem}ють`,
      ],
      pastSg: `${beforeYa}яв`,
      pastPl: `${beforeYa}яли`,
      impTu: `${presStem}й`,
      impMes: `${presStem}ймо`,
      impJus: `${presStem}йте`,
      isPerfective: isPerf,
    };
  } else if (baseInf.endsWith('іти')) {
    const stem = baseInf.slice(0, -3);
    baseParadigm = {
      nonPast: [
        `${stem}ію`,
        `${stem}ієш`,
        `${stem}іє`,
        `${stem}іємо`,
        `${stem}ієте`,
        `${stem}іють`,
      ],
      pastSg: `${stem}ів`,
      pastPl: `${stem}іли`,
      impTu: `${stem}ій`,
      impMes: `${stem}іймо`,
      impJus: `${stem}ійте`,
      isPerfective: isPerf,
    };
  } else if (baseInf.endsWith('їти')) {
    const stem = baseInf.slice(0, -3);
    baseParadigm = {
      nonPast: [
        `${stem}ю`,
        `${stem}їш`,
        `${stem}їть`,
        `${stem}їмо`,
        `${stem}їте`,
        `${stem}ять`,
      ],
      pastSg: `${stem}їв`,
      pastPl: `${stem}їли`,
      impTu: `${stem}й`,
      impMes: `${stem}ймо`,
      impJus: `${stem}йте`,
      isPerfective: isPerf,
    };
  } else if (baseInf.endsWith('нути')) {
    const stem = baseInf.slice(0, -4);
    baseParadigm = {
      nonPast: [
        `${stem}ну`,
        `${stem}неш`,
        `${stem}не`,
        `${stem}немо`,
        `${stem}нете`,
        `${stem}нуть`,
      ],
      pastSg: `${stem}нув`,
      pastPl: `${stem}нули`,
      impTu: `${stem}ни`,
      impMes: `${stem}німо`,
      impJus: `${stem}ніть`,
      isPerfective: isPerf,
    };
  } else if (baseInf.endsWith('ити')) {
    const stem = baseInf.slice(0, -3);
    let firstSg = `${stem}ю`;
    let thirdPl = `${stem}ять`;

    if (/[бпвмф]$/.test(stem)) {
      firstSg = `${stem}лю`;
      thirdPl = `${stem}лять`;
    } else if (stem.endsWith('ст')) {
      firstSg = `${stem.slice(0, -2)}щу`;
      thirdPl = `${stem}ять`;
    } else if (stem.endsWith('зд')) {
      firstSg = `${stem.slice(0, -2)}жджу`;
      thirdPl = `${stem}ять`;
    } else if (stem.endsWith('д')) {
      firstSg = `${stem.slice(0, -1)}джу`;
      thirdPl = `${stem}ять`;
    } else if (stem.endsWith('т')) {
      firstSg = `${stem.slice(0, -1)}чу`;
      thirdPl = `${stem}ять`;
    } else if (stem.endsWith('з')) {
      firstSg = `${stem.slice(0, -1)}жу`;
      thirdPl = `${stem}ять`;
    } else if (stem.endsWith('с')) {
      firstSg = `${stem.slice(0, -1)}шу`;
      thirdPl = `${stem}ять`;
    } else if (/[жчшщ]$/.test(stem)) {
      firstSg = `${stem}у`;
      thirdPl = `${stem}ать`;
    }

    baseParadigm = {
      nonPast: [
        firstSg,
        `${stem}иш`,
        `${stem}ить`,
        `${stem}имо`,
        `${stem}ите`,
        thirdPl,
      ],
      pastSg: `${stem}ив`,
      pastPl: `${stem}или`,
      impTu: `${stem}и`,
      impMes: `${stem}імо`,
      impJus: `${stem}іть`,
      isPerfective: isPerf,
    };
  } else {
    const stem = baseInf.replace(/ти$/, '');
    baseParadigm = {
      nonPast: [
        `${stem}у`,
        `${stem}еш`,
        `${stem}е`,
        `${stem}емо`,
        `${stem}ете`,
        `${stem}уть`,
      ],
      pastSg: `${stem}в`,
      pastPl: `${stem}ли`,
      impTu: `${stem}и`,
      impMes: `${stem}імо`,
      impJus: `${stem}іть`,
      isPerfective: isPerf,
    };
  }

  return isRefl ? addUkReflexiveToParadigm(baseParadigm) : baseParadigm;
}

export function conjugateUkrainianVerbPhrase(
  ltInfinitive: string,
  rawUk: string,
  tense: VerbTense,
  person: VerbPerson
): string {
  const cleanLt = ltInfinitive.replace(/\s*\([^)]*\)\s*/g, '').trim();

  // Special impersonal/modal overrides for natural Ukrainian sentences
  let effectiveUk = rawUk;
  if (cleanLt === 'lyti') effectiveUk = 'дощити';
  else if (cleanLt === 'snigti') effectiveUk = 'сніжити';
  else if (cleanLt === 'reikėti') effectiveUk = 'потребувати';
  else if (cleanLt === 'trokšti') effectiveUk = 'прагнути';

  // Remove parenthetical notes first so '/' inside parentheses doesn't split the phrase
  const withoutParens = effectiveUk.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
  const primaryPhrase = withoutParens
    .split(/[,;/]/)[0]
    .trim()
    .replace(/\s+/g, ' ');

  const words = primaryPhrase.split(' ');
  const firstWord = words[0];
  const restWords = words.slice(1).join(' ');
  const suffix = restWords ? ` ${restWords}` : '';

  const paradigm = buildUkrainianVerbParadigm(firstWord);
  const personIdx: Record<VerbPerson, number> = {
    as: 0,
    tu: 1,
    jis: 2,
    mes: 3,
    jus: 4,
    jie: 5,
  };

  if (tense === 'present') {
    return `${paradigm.nonPast[personIdx[person]]}${suffix}`;
  }

  if (tense === 'past') {
    const pastForm =
      person === 'as' || person === 'tu' || person === 'jis'
        ? paradigm.pastSg
        : paradigm.pastPl;
    return `${pastForm}${suffix}`;
  }

  if (tense === 'future') {
    if (firstWord === 'бути') {
      const futBe: Record<VerbPerson, string> = {
        as: 'буду',
        tu: 'будеш',
        jis: 'буде',
        mes: 'будемо',
        jus: 'будете',
        jie: 'будуть',
      };
      return `${futBe[person]}${suffix}`;
    }
    if (firstWord === 'могти') {
      const futCan: Record<VerbPerson, string> = {
        as: 'зможу',
        tu: 'зможеш',
        jis: 'зможе',
        mes: 'зможемо',
        jus: 'зможете',
        jie: 'зможуть',
      };
      return `${futCan[person]}${suffix}`;
    }
    if (paradigm.isPerfective) {
      return `${paradigm.nonPast[personIdx[person]]}${suffix}`;
    }
    const auxBe: Record<VerbPerson, string> = {
      as: 'буду',
      tu: 'будеш',
      jis: 'буде',
      mes: 'будемо',
      jus: 'будете',
      jie: 'будуть',
    };
    return `${auxBe[person]} ${firstWord}${suffix}`;
  }

  // imperative
  if (person === 'mes') return `${paradigm.impMes}${suffix}`;
  if (person === 'jus') return `${paradigm.impJus}${suffix}`;
  return `${paradigm.impTu}${suffix}`;
}

const IRREGULAR_EN_PAST: Record<string, string> = {
  be: 'was',
  have: 'had',
  do: 'did',
  make: 'made',
  go: 'went',
  come: 'came',
  take: 'took',
  give: 'gave',
  get: 'got',
  find: 'found',
  think: 'thought',
  know: 'knew',
  see: 'saw',
  hear: 'heard',
  speak: 'spoke',
  say: 'said',
  tell: 'told',
  write: 'wrote',
  read: 'read',
  eat: 'ate',
  drink: 'drank',
  sleep: 'slept',
  wake: 'woke',
  sit: 'sat',
  stand: 'stood',
  lie: 'lay',
  put: 'put',
  keep: 'kept',
  hold: 'held',
  throw: 'threw',
  buy: 'bought',
  sell: 'sold',
  pay: 'paid',
  cost: 'cost',
  choose: 'chose',
  spend: 'spent',
  lend: 'lent',
  build: 'built',
  send: 'sent',
  drive: 'drove',
  fly: 'flew',
  swim: 'swam',
  run: 'ran',
  bring: 'brought',
  meet: 'met',
  teach: 'taught',
  understand: 'understood',
  forget: 'forgot',
  draw: 'drew',
  sing: 'sang',
  shine: 'shone',
  blow: 'blew',
  freeze: 'froze',
  grow: 'grew',
  rise: 'rose',
  burn: 'burnt',
  feel: 'felt',
  fall: 'fell',
  hurt: 'hurt',
  break: 'broke',
  wear: 'wore',
  sew: 'sewed',
  cut: 'cut',
  leave: 'left',
  begin: 'began',
  become: 'became',
  feed: 'fed',
  pour: 'poured',
};

export function conjugateEnglishVerbPhrase(
  rawEn: string,
  tense: VerbTense,
  person: VerbPerson
): string {
  const withoutParens = rawEn.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
  const primary = withoutParens
    .replace(/^to\s+/i, '')
    .split(/[,;/]/)[0]
    .trim()
    .replace(/\s+/g, ' ');

  const words = primary.split(' ');
  const first = words[0].toLowerCase();
  const rest = words.slice(1).join(' ');
  const suffix = rest ? ` ${rest}` : '';

  if (tense === 'imperative') {
    if (person === 'mes') return `let's ${first}${suffix}`;
    return `${first}${suffix}`;
  }

  if (tense === 'future') {
    if (first === 'can') return `will be able to${suffix}`;
    return `will ${first}${suffix}`;
  }

  if (tense === 'past') {
    if (first === 'be') {
      const bePast =
        person === 'as' || person === 'jis' ? 'was' : 'were';
      return `${bePast}${suffix}`;
    }
    if (first === 'can') return `could${suffix}`;
    if (IRREGULAR_EN_PAST[first]) {
      return `${IRREGULAR_EN_PAST[first]}${suffix}`;
    }
    if (first.endsWith('e')) return `${first}d${suffix}`;
    if (/[^aeiou]y$/.test(first)) {
      return `${first.slice(0, -1)}ied${suffix}`;
    }
    if (/^[a-z]*[^aeiou][aeiou][b-df-hj-np-tv-z]$/.test(first) && !/[wxy]$/.test(first) && first.length <= 4) {
      return `${first}${first.slice(-1)}ed${suffix}`;
    }
    return `${first}ed${suffix}`;
  }

  // present
  if (first === 'be') {
    const bePres =
      person === 'as' ? 'am' : person === 'jis' ? 'is' : 'are';
    return `${bePres}${suffix}`;
  }
  if (first === 'have') {
    return `${person === 'jis' ? 'has' : 'have'}${suffix}`;
  }
  if (first === 'can') {
    return `can${suffix}`;
  }
  if (person === 'jis') {
    if (/(s|sh|ch|x|z|o)$/.test(first)) return `${first}es${suffix}`;
    if (/[^aeiou]y$/.test(first)) return `${first.slice(0, -1)}ies${suffix}`;
    return `${first}s${suffix}`;
  }
  return `${first}${suffix}`;
}

export function generateVerbContextExample(
  verb: {
    infinitive: string;
    uk: string;
    en: string;
    topic: TopicId;
    governedCase: VerbGovernedCase;
    present: VerbPersonForms;
    past: VerbPersonForms;
    future: VerbPersonForms;
    imperative: { tu: string; mes: string; jus: string };
  },
  tense: VerbTense,
  person: VerbPerson
): VerbSentenceExample {
  const comp = TOPIC_CONTEXT_COMPLEMENTS[verb.topic][verb.governedCase];

  const pronounsLt: Record<VerbPerson, string> = {
    as: 'Aš',
    tu: 'Tu',
    jis: 'Jis',
    mes: 'Mes',
    jus: 'Jūs',
    jie: 'Jie',
  };
  const pronounsUk: Record<VerbPerson, string> = {
    as: 'Я',
    tu: 'Ти',
    jis: 'Він',
    mes: 'Ми',
    jus: 'Ви',
    jie: 'Вони',
  };
  const pronounsEn: Record<VerbPerson, string> = {
    as: 'I',
    tu: 'You',
    jis: 'He',
    mes: 'We',
    jus: 'You',
    jie: 'They',
  };

  if (tense === 'imperative') {
    const impPerson: 'tu' | 'mes' | 'jus' =
      person === 'mes' ? 'mes' : person === 'jus' ? 'jus' : 'tu';
    const targetForm = verb.imperative[impPerson];
    const ukImpVerb = conjugateUkrainianVerbPhrase(
      verb.infinitive,
      verb.uk,
      'imperative',
      impPerson
    );
    const enImpVerb = conjugateEnglishVerbPhrase(
      verb.en,
      'imperative',
      impPerson
    );
    return {
      tense: 'imperative',
      person: impPerson,
      sentenceWithBlank: `Prašau, ___ (${verb.infinitive}) ${comp.lt}!`,
      fullSentenceLt: `Prašau, ${targetForm} ${comp.lt}!`,
      translationUk: `Будь ласка, ${ukImpVerb} ${comp.uk}!`,
      translationEn: `Please ${enImpVerb} ${comp.en}!`,
    };
  }

  const timeAdv =
    tense === 'present'
      ? { lt: 'šiandien', uk: 'сьогодні', en: 'today' }
      : tense === 'past'
      ? { lt: 'vakar', uk: 'вчора', en: 'yesterday' }
      : { lt: 'rytoj', uk: 'завтра', en: 'tomorrow' };

  const targetForm =
    tense === 'present'
      ? verb.present[person]
      : tense === 'past'
      ? verb.past[person]
      : verb.future[person];

  const ukVerbForm = conjugateUkrainianVerbPhrase(
    verb.infinitive,
    verb.uk,
    tense,
    person
  );
  const enVerbForm = conjugateEnglishVerbPhrase(verb.en, tense, person);

  return {
    tense,
    person,
    sentenceWithBlank: `${pronounsLt[person]} ${timeAdv.lt} ___ (${verb.infinitive}) ${comp.lt}.`,
    fullSentenceLt: `${pronounsLt[person]} ${timeAdv.lt} ${targetForm} ${comp.lt}.`,
    translationUk: `${pronounsUk[person]} ${timeAdv.uk} ${ukVerbForm} ${comp.uk}.`,
    translationEn: `${pronounsEn[person]} ${enVerbForm} ${comp.en} ${timeAdv.en}.`,
  };
}

export interface RankedVerbMatch {
  verb: VerbEntry;
  score: number;
  matchedForm?: string;
}

export function searchAndRankVerbs(
  verbs: VerbEntry[],
  rawQuery: string
): RankedVerbMatch[] {
  const q = rawQuery.trim().toLowerCase();
  if (!q) {
    return verbs.map((verb) => ({ verb, score: 100 }));
  }

  const qAscii = stripLithuanianDiacritics(q);
  const results: RankedVerbMatch[] = [];

  for (const verb of verbs) {
    const infLower = verb.infinitive.toLowerCase();
    const infAscii = stripLithuanianDiacritics(infLower);
    const pres3Lower = verb.present3.toLowerCase();
    const pres3Ascii = stripLithuanianDiacritics(pres3Lower);
    const past3Lower = verb.past3.toLowerCase();
    const past3Ascii = stripLithuanianDiacritics(past3Lower);
    const ukLower = verb.uk.toLowerCase();
    const enLower = verb.en.toLowerCase();

    let bestScore = 0;
    let matchedForm: string | undefined;

    if (infLower === q) {
      bestScore = 1000;
    } else if (infAscii === qAscii) {
      bestScore = 960;
    } else if (pres3Lower === q || past3Lower === q) {
      bestScore = 930;
      matchedForm = pres3Lower === q ? verb.present3 : verb.past3;
    } else if (pres3Ascii === qAscii || past3Ascii === qAscii) {
      bestScore = 900;
      matchedForm = pres3Ascii === qAscii ? verb.present3 : verb.past3;
    } else if (infLower.startsWith(q)) {
      bestScore = 860;
    } else if (infAscii.startsWith(qAscii)) {
      bestScore = 820;
    } else if (ukLower === q || enLower === q || enLower === `to ${q}`) {
      bestScore = 800;
    } else if (ukLower.includes(q) || enLower.includes(q)) {
      bestScore = 720;
    } else if (
      infLower.includes(q) ||
      infAscii.includes(qAscii) ||
      pres3Ascii.includes(qAscii) ||
      past3Ascii.includes(qAscii)
    ) {
      bestScore = 650;
    } else {
      // Check all conjugated forms across present, past, future, imperative
      const allForms = [
        ...Object.values(verb.present),
        ...Object.values(verb.past),
        ...Object.values(verb.future),
        verb.imperative.tu,
        verb.imperative.mes,
        verb.imperative.jus,
      ];
      for (const f of allForms) {
        const fLower = f.toLowerCase();
        const fAscii = stripLithuanianDiacritics(fLower);
        if (fLower === q || fAscii === qAscii) {
          bestScore = 600;
          matchedForm = f;
          break;
        }
        if (fLower.startsWith(q) || fAscii.startsWith(qAscii)) {
          bestScore = 520;
          matchedForm = f;
          break;
        }
      }
    }

    if (bestScore > 0) {
      results.push({ verb, score: bestScore, matchedForm });
    }
  }

  return results.sort(
    (a, b) =>
      b.score - a.score ||
      a.verb.difficulty - b.verb.difficulty ||
      a.verb.infinitive.localeCompare(b.verb.infinitive, 'lt')
  );
}
