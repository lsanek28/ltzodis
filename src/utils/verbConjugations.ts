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
  const baseUk = verb.uk.split(/[,;/]/)[0].trim();
  const baseEn = verb.en.replace(/^to\s+/i, '').split(/[,;/]/)[0].trim();

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
    return {
      tense: 'imperative',
      person: impPerson,
      sentenceWithBlank: `Prašau, ___ (${verb.infinitive}) ${comp.lt}!`,
      fullSentenceLt: `Prašau, ${targetForm} ${comp.lt}!`,
      translationUk: `Будь ласка, (${baseUk} — ${VERB_PERSONS_METADATA[impPerson].pronounLt}) ${comp.uk}!`,
      translationEn: `Please (${baseEn} — ${VERB_PERSONS_METADATA[impPerson].pronounLt}) ${comp.en}!`,
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

  const tenseTagUk =
    tense === 'present'
      ? 'тепер. час'
      : tense === 'past'
      ? 'мин. час'
      : 'майб. час';
  const tenseTagEn =
    tense === 'present'
      ? 'present'
      : tense === 'past'
      ? 'past'
      : 'future';

  return {
    tense,
    person,
    sentenceWithBlank: `${pronounsLt[person]} ${timeAdv.lt} ___ (${verb.infinitive}) ${comp.lt}.`,
    fullSentenceLt: `${pronounsLt[person]} ${timeAdv.lt} ${targetForm} ${comp.lt}.`,
    translationUk: `${pronounsUk[person]} ${timeAdv.uk} [${baseUk}, ${tenseTagUk}] ${comp.uk}.`,
    translationEn: `${pronounsEn[person]} [${baseEn}, ${tenseTagEn}] ${comp.en} ${timeAdv.en}.`,
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
