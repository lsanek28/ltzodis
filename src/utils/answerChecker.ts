import {
  CASES_METADATA,
  CASE_ORDER,
  DECLENSION_PDF_TABLE,
  SUBTYPE_ENDINGS,
  segmentLithuanianWord,
} from '../data/grammarRules';
import {
  AnswerEvaluation,
  GrammaticalCase,
  GrammaticalNumber,
  NounEntry,
} from '../types/grammar';

const DIACRITIC_FOLD_MAP: Record<string, string> = {
  ą: 'a',
  č: 'c',
  ę: 'e',
  ė: 'e',
  į: 'i',
  š: 's',
  ų: 'u',
  ū: 'u',
  ž: 'z',
};

export function stripLithuanianDiacritics(input: string): string {
  return input
    .toLowerCase()
    .split('')
    .map((ch) => DIACRITIC_FOLD_MAP[ch] ?? ch)
    .join('');
}

export function hasLithuanianDiacritics(input: string): boolean {
  return /[ąčęėįšųūžĄČĘĖĮŠŲŪŽ]/.test(input);
}

export function normalizeEnglishPhoneticToLtAscii(input: string): string {
  return stripLithuanianDiacritics(input)
    .replace(/zh/g, 'z')
    .replace(/sh/g, 's')
    .replace(/ch/g, 'c')
    .replace(/tz/g, 'c')
    .replace(/ts/g, 'c');
}

export interface NounSearchMatch {
  noun: NounEntry;
  matchType:
    | 'exact_lemma'
    | 'ascii_lemma'
    | 'prefix_lemma'
    | 'inflected_form'
    | 'substring_lemma'
    | 'translation';
  matchedForm?: string;
  matchedCase?: GrammaticalCase;
  matchedNumber?: GrammaticalNumber;
  score: number;
}

/**
 * Searches and ranks Lithuanian nouns supporting English/ASCII keyboard input without diacritics
 * (e.g., "tetis" -> "tėtis", "zmogus" -> "žmogus", "sunus" -> "sūnus", "zmoniu" -> "žmogus"),
 * phonetic digraphs ("sh", "ch", "zh"), all 14 declined forms, and Ukrainian/English translations.
 */
export function searchAndRankNouns(
  nouns: NounEntry[],
  rawQuery: string
): NounSearchMatch[] {
  const qRaw = rawQuery.trim().toLowerCase();
  if (!qRaw) {
    return nouns.map((noun) => ({
      noun,
      matchType: 'exact_lemma',
      score: 0,
    }));
  }

  const qAscii = stripLithuanianDiacritics(qRaw);
  const qPhonetic = normalizeEnglishPhoneticToLtAscii(qRaw);

  const matches: NounSearchMatch[] = [];

  for (const noun of nouns) {
    const lemmaLower = noun.lemma.toLowerCase();
    const lemmaAscii = stripLithuanianDiacritics(lemmaLower);

    // 1. Exact lemma match
    if (lemmaLower === qRaw) {
      matches.push({
        noun,
        matchType: 'exact_lemma',
        score: 1000 + noun.frequency,
      });
      continue;
    }

    // 2. Exact ASCII / English-keyboard lemma match (e.g., "tetis" -> "tėtis", "zmogus" -> "žmogus")
    if (lemmaAscii === qAscii || (qPhonetic.length >= 2 && lemmaAscii === qPhonetic)) {
      matches.push({
        noun,
        matchType: 'ascii_lemma',
        matchedForm: noun.lemma,
        score: 950 + noun.frequency,
      });
      continue;
    }

    // 3. Prefix lemma match (exact characters)
    if (lemmaLower.startsWith(qRaw)) {
      matches.push({
        noun,
        matchType: 'prefix_lemma',
        score: 880 - Math.min(lemmaLower.length, 30) + noun.frequency * 0.1,
      });
      continue;
    }

    // 4. Prefix ASCII / English-keyboard lemma match (e.g., "tet" -> "tėtis", "zmog" -> "žmogus")
    if (
      lemmaAscii.startsWith(qAscii) ||
      (qPhonetic.length >= 2 && lemmaAscii.startsWith(qPhonetic))
    ) {
      matches.push({
        noun,
        matchType: 'ascii_lemma',
        matchedForm: noun.lemma,
        score: 840 - Math.min(lemmaLower.length, 30) + noun.frequency * 0.1,
      });
      continue;
    }

    // 5. Exact declined form match across all 14 forms (sg & pl, with or without diacritics)
    let exactInflected: {
      form: string;
      grammaticalCase: GrammaticalCase;
      grammaticalNumber: GrammaticalNumber;
      exactDiacritics: boolean;
    } | null = null;

    for (const num of ['sg', 'pl'] as GrammaticalNumber[]) {
      const formsObj = num === 'sg' ? noun.sg : noun.pl;
      for (const c of CASE_ORDER) {
        const f = formsObj[c];
        if (!f) continue;
        const fLower = f.toLowerCase();
        const fAscii = stripLithuanianDiacritics(fLower);
        if (fLower === qRaw) {
          exactInflected = {
            form: f,
            grammaticalCase: c,
            grammaticalNumber: num,
            exactDiacritics: true,
          };
          break;
        }
        if (
          !exactInflected &&
          (fAscii === qAscii || (qPhonetic.length >= 2 && fAscii === qPhonetic))
        ) {
          exactInflected = {
            form: f,
            grammaticalCase: c,
            grammaticalNumber: num,
            exactDiacritics: false,
          };
        }
      }
      if (exactInflected?.exactDiacritics) break;
    }

    if (exactInflected) {
      matches.push({
        noun,
        matchType: 'inflected_form',
        matchedForm: exactInflected.form,
        matchedCase: exactInflected.grammaticalCase,
        matchedNumber: exactInflected.grammaticalNumber,
        score: (exactInflected.exactDiacritics ? 800 : 780) + noun.frequency * 0.1,
      });
      continue;
    }

    // 6. Substring in lemma (exact or ASCII-folded)
    if (
      lemmaLower.includes(qRaw) ||
      lemmaAscii.includes(qAscii) ||
      (qPhonetic.length >= 3 && lemmaAscii.includes(qPhonetic))
    ) {
      matches.push({
        noun,
        matchType: 'substring_lemma',
        matchedForm: noun.lemma,
        score: 680 + noun.frequency * 0.1,
      });
      continue;
    }

    // 7. Translation match (Ukrainian or English)
    const ukLower = noun.uk.toLowerCase();
    const enLower = noun.en.toLowerCase();
    if (ukLower === qRaw || enLower === qRaw) {
      matches.push({
        noun,
        matchType: 'translation',
        score: 640 + noun.frequency * 0.1,
      });
      continue;
    }
    if (ukLower.includes(qRaw) || enLower.includes(qRaw)) {
      const starts =
        ukLower.startsWith(qRaw) ||
        enLower.startsWith(qRaw) ||
        ukLower.includes(` ${qRaw}`) ||
        enLower.includes(` ${qRaw}`);
      matches.push({
        noun,
        matchType: 'translation',
        score: (starts ? 580 : 500) + noun.frequency * 0.1,
      });
      continue;
    }

    // 8. Prefix or substring in any of the 14 declined forms (exact or ASCII-folded)
    let partialInflected: {
      form: string;
      grammaticalCase: GrammaticalCase;
      grammaticalNumber: GrammaticalNumber;
      isPrefix: boolean;
    } | null = null;

    for (const num of ['sg', 'pl'] as GrammaticalNumber[]) {
      const formsObj = num === 'sg' ? noun.sg : noun.pl;
      for (const c of CASE_ORDER) {
        const f = formsObj[c];
        if (!f) continue;
        const fLower = f.toLowerCase();
        const fAscii = stripLithuanianDiacritics(fLower);
        if (fLower.startsWith(qRaw) || fAscii.startsWith(qAscii)) {
          partialInflected = {
            form: f,
            grammaticalCase: c,
            grammaticalNumber: num,
            isPrefix: true,
          };
          break;
        }
        if (
          !partialInflected &&
          (fLower.includes(qRaw) || fAscii.includes(qAscii))
        ) {
          partialInflected = {
            form: f,
            grammaticalCase: c,
            grammaticalNumber: num,
            isPrefix: false,
          };
        }
      }
      if (partialInflected?.isPrefix) break;
    }

    if (partialInflected) {
      matches.push({
        noun,
        matchType: 'inflected_form',
        matchedForm: partialInflected.form,
        matchedCase: partialInflected.grammaticalCase,
        matchedNumber: partialInflected.grammaticalNumber,
        score: (partialInflected.isPrefix ? 460 : 380) + noun.frequency * 0.1,
      });
    }
  }

  return matches.sort((a, b) => b.score - a.score);
}

/**
 * Evaluates a user's manually typed Lithuanian noun form against the verified database entry.
 * Strictly checks Lithuanian diacritics (ą, č, ę, ė, į, š, ų, ū, ž), trims whitespace,
 * identifies confused cases (e.g., typing "knygą" Accusative instead of "knygos" Genitive),
 * and produces a tailored grammatical explanation in Ukrainian, Lithuanian, and English.
 */
export function evaluateUserAnswer(
  noun: NounEntry,
  targetCase: GrammaticalCase,
  targetNumber: GrammaticalNumber,
  rawUserInput: string
): AnswerEvaluation {
  const normalizedUserAnswer = rawUserInput.trim().toLowerCase();
  const numberForms = targetNumber === 'sg' ? noun.sg : noun.pl;
  const expectedForm = numberForms[targetCase].toLowerCase();
  const acceptedVariants = (numberForms.variants?.[targetCase] ?? []).map((v) =>
    v.toLowerCase()
  );

  const isExactPrimary = normalizedUserAnswer === expectedForm;
  const isVariantMatch =
    !isExactPrimary && acceptedVariants.includes(normalizedUserAnswer);
  const isCorrect = isExactPrimary || isVariantMatch;

  const expectedSegmented = segmentLithuanianWord(
    expectedForm,
    noun.subtype,
    targetCase,
    targetNumber
  );

  // Segment the user's answer using the same stem prefix if possible
  let userSegmented: { stem: string; ending: string } | undefined;
  if (normalizedUserAnswer.length > 0) {
    if (
      normalizedUserAnswer.startsWith(expectedSegmented.stem) &&
      normalizedUserAnswer.length >= expectedSegmented.stem.length
    ) {
      userSegmented = {
        stem: expectedSegmented.stem,
        ending: normalizedUserAnswer.slice(expectedSegmented.stem.length),
      };
    } else {
      userSegmented = segmentLithuanianWord(
        normalizedUserAnswer,
        noun.subtype,
        targetCase,
        targetNumber
      );
    }
  }

  // Check if the user entered a form that matches another case/number of the same noun
  const confusedWithCases: Array<{
    grammaticalCase: GrammaticalCase;
    grammaticalNumber: GrammaticalNumber;
  }> = [];

  if (!isCorrect && normalizedUserAnswer.length > 0) {
    for (const num of ['sg', 'pl'] as GrammaticalNumber[]) {
      const formsObj = num === 'sg' ? noun.sg : noun.pl;
      for (const c of CASE_ORDER) {
        if (num === targetNumber && c === targetCase) continue;
        if (formsObj[c].toLowerCase() === normalizedUserAnswer) {
          confusedWithCases.push({ grammaticalCase: c, grammaticalNumber: num });
        }
      }
    }
  }

  // Check if user only missed or mismatched Lithuanian diacritics (e.g. knyga vs knygą, namu vs namų)
  let diacriticWarning: { uk: string; lt: string; en: string } | undefined;
  if (
    !isCorrect &&
    normalizedUserAnswer.length > 0 &&
    stripLithuanianDiacritics(normalizedUserAnswer) ===
      stripLithuanianDiacritics(expectedForm)
  ) {
    diacriticWarning = {
      uk: `Увага до литовських діакритичних знаків! Ви ввели „${normalizedUserAnswer}“, але правильна форма пишеться як „${expectedForm}“ (різниця в літерах ą, č, ę, ė, į, š, ų, ū, ž змінює відмінок слова).`,
      lt: `Dėmesio lietuviškoms raidėms! Įvedėte „${normalizedUserAnswer}“, tačiau taisyklinga forma yra „${expectedForm}“ (nosinės ir ilgosios balsės keičia žodžio linksnį).`,
      en: `Watch out for Lithuanian diacritics! You typed "${normalizedUserAnswer}", but the correct form is "${expectedForm}" (diacritic marks change the grammatical case).`,
    };
  }

  const caseMeta = CASES_METADATA[targetCase];
  const declTable = DECLENSION_PDF_TABLE[noun.declension - 1];
  const subtypeRule = SUBTYPE_ENDINGS[noun.subtype];
  const numberLabel = {
    uk: targetNumber === 'sg' ? 'однини (Vienaskaita)' : 'множини (Daugiskaita)',
    lt: targetNumber === 'sg' ? 'vienaskaitos' : 'daugiskaitos',
    en: targetNumber === 'sg' ? 'singular (Vienaskaita)' : 'plural (Daugiskaita)',
  };

  const ruleFormula = `${declTable.titleLt} (${subtypeRule.modelWord}) · ${
    targetNumber === 'sg' ? 'Vns.' : 'Dgs.'
  } ${caseMeta.shortLt} (${caseMeta.questionLt}) → -${expectedSegmented.ending}`;

  // Build tailored explanation
  let confusedNoteUk = '';
  let confusedNoteLt = '';
  let confusedNoteEn = '';

  if (confusedWithCases.length > 0) {
    const firstConfused = confusedWithCases[0];
    const confCaseMeta = CASES_METADATA[firstConfused.grammaticalCase];
    const confNumUk = firstConfused.grammaticalNumber === 'sg' ? 'однини' : 'множини';
    const confNumLt =
      firstConfused.grammaticalNumber === 'sg' ? 'vienaskaitos' : 'daugiskaitos';
    const confNumEn =
      firstConfused.grammaticalNumber === 'sg' ? 'singular' : 'plural';
    const userEnd = userSegmented?.ending ? `„-${userSegmented.ending}“` : `„${normalizedUserAnswer}“`;

    confusedNoteUk = ` Введена форма „${normalizedUserAnswer}“ із закінченням ${userEnd} відповідає іншому відмінку — це ${confCaseMeta.name.uk} ${confNumUk} (${confCaseMeta.questionLt}).`;
    confusedNoteLt = ` Jūsų įvesta forma „${normalizedUserAnswer}“ (galūnė ${userEnd}) yra ${confNumLt} ${confCaseMeta.name.lt} (${confCaseMeta.questionLt}), o ne reikiamas linksnis.`;
    confusedNoteEn = ` Your answer "${normalizedUserAnswer}" (ending ${userEnd}) is actually the ${confCaseMeta.name.en} ${confNumEn} (${confCaseMeta.questionLt}), not the requested case.`;
  } else if (!isCorrect && userSegmented?.ending) {
    confusedNoteUk = ` Закінчення „-${userSegmented.ending}“ у відповіді „${normalizedUserAnswer}“ не відповідає потрібному відмінку.`;
    confusedNoteLt = ` Galūnė „-${userSegmented.ending}“ atsakyme „${normalizedUserAnswer}“ netinka šiam linksniui.`;
    confusedNoteEn = ` The ending "-${userSegmented.ending}" in "${normalizedUserAnswer}" does not match the required case.`;
  }

  const alternationUk = noun.stemAlternation ? ` ${noun.stemAlternation.uk}` : '';
  const alternationLt = noun.stemAlternation ? ` ${noun.stemAlternation.lt}` : '';
  const alternationEn = noun.stemAlternation ? ` ${noun.stemAlternation.en}` : '';

  const explanation = {
    uk: isCorrect
      ? `Правильно! Іменник „${noun.lemma}“ (${noun.uk}) належить до ${noun.declension}-го типу відмінювання (зразок „${subtypeRule.modelWord}“). У відмінку ${caseMeta.name.uk} ${numberLabel.uk} на питання „${caseMeta.questionLt}“ основа „${expectedSegmented.stem}-“ приймає закінчення „-${expectedSegmented.ending}“ → „${expectedForm}“.${alternationUk}`
      : `${caseMeta.name.uk} ${numberLabel.uk} (${caseMeta.questionLt}) іменника „${noun.lemma}“ (${noun.declension} тип відмінювання, зразок „${subtypeRule.modelWord}“) має форму „${expectedForm}“: основа „${expectedSegmented.stem}-“ + закінчення „-${expectedSegmented.ending}“.${confusedNoteUk}${alternationUk}`,
    lt: isCorrect
      ? `Teisingai! Daiktavardis „${noun.lemma}“ priklauso ${noun.declension} linksniuotei (pavyzdys „${subtypeRule.modelWord}“). ${numberLabel.lt} ${caseMeta.name.lt} (${caseMeta.questionLt}) turi kamieną „${expectedSegmented.stem}-“ ir galūnę „-${expectedSegmented.ending}“ → „${expectedForm}“.${alternationLt}`
      : `Daiktavardžio „${noun.lemma}“ (${noun.declension} linksniuotė, pavyzdys „${subtypeRule.modelWord}“) ${numberLabel.lt} ${caseMeta.name.lt} (${caseMeta.questionLt}) turi formą „${expectedForm}“: kamienas „${expectedSegmented.stem}-“ + galūnė „-${expectedSegmented.ending}“.${confusedNoteLt}${alternationLt}`,
    en: isCorrect
      ? `Correct! The noun "${noun.lemma}" (${noun.en}) belongs to the ${noun.declension}th declension (model "${subtypeRule.modelWord}"). In the ${caseMeta.name.en} ${numberLabel.en} (${caseMeta.questionLt}), the stem "${expectedSegmented.stem}-" takes the ending "-${expectedSegmented.ending}" → "${expectedForm}".${alternationEn}`
      : `The ${caseMeta.name.en} ${numberLabel.en} (${caseMeta.questionLt}) of "${noun.lemma}" (Declension ${noun.declension}, model "${subtypeRule.modelWord}") is "${expectedForm}": stem "${expectedSegmented.stem}-" + ending "-${expectedSegmented.ending}".${confusedNoteEn}${alternationEn}`,
  };

  return {
    isCorrect,
    isVariantMatch,
    normalizedUserAnswer,
    expectedForm,
    acceptedVariants,
    expectedSegmented,
    userSegmented,
    diacriticWarning,
    confusedWithCases,
    explanation,
    ruleFormula,
  };
}
