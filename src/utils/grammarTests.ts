import { ALL_VERIFIED_NOUNS } from '../data/nounsDatabase';
import { ALL_VERIFIED_VERBS } from '../data/verbsDatabase';
import { CASE_ORDER, TOPICS_METADATA } from '../data/grammarRules';
import { evaluateUserAnswer, searchAndRankNouns } from './answerChecker';
import { searchAndRankVerbs, VERB_PERSON_ORDER } from './verbConjugations';
import { AppLanguage, TopicId } from '../types/grammar';

export interface TestCaseResult {
  id: string;
  title: Record<AppLanguage, string>;
  passed: boolean;
  details: string;
}

export function runAllGrammarAndEvaluationTests(): {
  allPassed: boolean;
  passedCount: number;
  totalCount: number;
  results: TestCaseResult[];
} {
  const results: TestCaseResult[] = [];

  // Test 1: Uniqueness & minimum count (1,000 verified nouns = 14,000 forms across CEFR A0-B2)
  const ids = new Set(ALL_VERIFIED_NOUNS.map((n) => n.id));
  const lemmas = new Set(ALL_VERIFIED_NOUNS.map((n) => n.lemma));
  const allVerified = ALL_VERIFIED_NOUNS.every((n) => n.verified);
  const cefrCounts = [1, 2, 3, 4].map(
    (lvl) => ALL_VERIFIED_NOUNS.filter((n) => n.difficulty === lvl).length
  );
  results.push({
    id: 'test_01_uniqueness',
    title: {
      uk: 'Унікальність іменників та обсяг перевіреного словника (1000 іменників = 14 000 форм, рівні A0–B2)',
      lt: 'Daiktavardžių unikalumas ir patikrinto žodyno apimtis (1000 žodžių = 14 000 formų, A0–B2)',
      en: 'Noun uniqueness & verified dictionary size (1,000 nouns = 14,000 forms, CEFR A0–B2)',
    },
    passed:
      ALL_VERIFIED_NOUNS.length === 1000 &&
      ids.size === ALL_VERIFIED_NOUNS.length &&
      lemmas.size === ALL_VERIFIED_NOUNS.length &&
      cefrCounts.every((c) => c >= 100) &&
      allVerified,
    details: `Всього іменників: ${ALL_VERIFIED_NOUNS.length}, унікальних ID: ${ids.size}, унікальних лем: ${lemmas.size}, форм: ${ALL_VERIFIED_NOUNS.length * 14}; A0–A1: ${cefrCounts[0]}, A1–A2: ${cefrCounts[1]}, A2–B1: ${cefrCounts[2]}, B1–B2: ${cefrCounts[3]}`,
  });

  // Test 2: 500 Popular Lithuanian Verbs Uniqueness & Conjugation Completeness
  const verbIds = new Set(ALL_VERIFIED_VERBS.map((v) => v.id));
  const verbInfinitives = new Set(ALL_VERIFIED_VERBS.map((v) => v.infinitive));
  let missingVerbForms = 0;
  for (const v of ALL_VERIFIED_VERBS) {
    if (!v.uk.trim() || !v.en.trim() || !v.present3.trim() || !v.past3.trim()) {
      missingVerbForms++;
    }
    for (const p of VERB_PERSON_ORDER) {
      if (!v.present[p]?.trim() || !v.past[p]?.trim() || !v.future[p]?.trim()) {
        missingVerbForms++;
      }
    }
  }
  const conjCounts = [1, 2, 3].map(
    (c) => ALL_VERIFIED_VERBS.filter((v) => v.conjugation === c).length
  );
  results.push({
    id: 'test_02_verbs_500',
    title: {
      uk: 'База 500 популярних литовських дієслів (3 основні форми, I–III дієвідміни та 4 часи/способи)',
      lt: '500 populiariausių lietuvių veiksmažodžių bazė (3 pagrindinės formos, I–III asmenuotės)',
      en: '500 Popular Lithuanian Verbs database (3 principal forms, conjugations I–III & all tenses)',
    },
    passed:
      ALL_VERIFIED_VERBS.length === 500 &&
      verbIds.size === 500 &&
      verbInfinitives.size === 500 &&
      missingVerbForms === 0 &&
      conjCounts.every((c) => c > 0),
    details: `Всього дієслів: ${ALL_VERIFIED_VERBS.length}, унікальних інфінітивів: ${verbInfinitives.size}, розподіл за I–III дієвідмінами: [${conjCounts.join(', ')}], пропущених форм: ${missingVerbForms}`,
  });

  // Test 3: Completeness of translations and all 14 forms for nouns
  let missingForms = 0;
  let missingTranslations = 0;
  for (const noun of ALL_VERIFIED_NOUNS) {
    if (!noun.uk.trim() || !noun.en.trim()) missingTranslations++;
    for (const c of CASE_ORDER) {
      if (!noun.sg[c]?.trim() || !noun.pl[c]?.trim()) missingForms++;
    }
  }
  results.push({
    id: 'test_03_completeness',
    title: {
      uk: 'Наявність перекладів (UK/EN) та всіх 14 форм (7 одн. + 7 мн.) для кожного іменника',
      lt: 'Vertimų (UK/EN) ir visų 14 formų (7 vns. + 7 dgs.) buvimas kiekvienam daiktavardžiui',
      en: 'Presence of translations (UK/EN) and all 14 case forms for every noun',
    },
    passed: missingForms === 0 && missingTranslations === 0,
    details: `Пропущених форм: ${missingForms}, пропущених перекладів: ${missingTranslations}`,
  });

  // Test 4: PDF Reference Table 14 Model Words Verification
  const pdfModels = [
    'namas', 'kelias', 'brolis', 'kambarys',
    'knyga', 'vyšnia', 'gatvė',
    'pilis', 'dantis',
    'sūnus', 'vaisius',
    'akmuo', 'sesuo', 'duktė',
  ];
  const foundModels = pdfModels.filter((m) =>
    ALL_VERIFIED_NOUNS.some((n) => n.lemma === m)
  );
  results.push({
    id: 'test_04_pdf_models',
    title: {
      uk: 'Відповідність усім 14 еталонним словам із PDF-таблиці «Daiktavardžių linksniavimas»',
      lt: 'Visų 14 pavyzdinių žodžių iš PDF lentelės „Daiktavardžių linksniavimas“ atitikimas',
      en: 'Exact presence of all 14 reference nouns from the PDF declension table',
    },
    passed: foundModels.length === pdfModels.length,
    details: `Знайдено ${foundModels.length}/${pdfModels.length}: ${foundModels.join(', ')}`,
  });

  // Test 5: Coverage of all 5 declensions & all 14 topics
  const declCounts = [1, 2, 3, 4, 5].map(
    (d) => ALL_VERIFIED_NOUNS.filter((n) => n.declension === d).length
  );
  const allTopics = Object.keys(TOPICS_METADATA) as TopicId[];
  const coveredTopics = allTopics.filter((t) =>
    ALL_VERIFIED_NOUNS.some((n) => n.topic === t)
  );
  const coveredVerbTopics = allTopics.filter((t) =>
    ALL_VERIFIED_VERBS.some((v) => v.topic === t)
  );
  results.push({
    id: 'test_05_taxonomy_coverage',
    title: {
      uk: 'Покриття всіх 5 відмін іменників, 3 дієвідмін дієслів та всіх 14 тематичних категорій',
      lt: 'Visų 5 linksniuočių, 3 asmenuočių ir visų 14 teminių kategorijų aprėptis',
      en: 'Coverage of all 5 noun declensions, 3 verb conjugations, and all 14 thematic categories',
    },
    passed:
      declCounts.every((c) => c > 0) &&
      coveredTopics.length === allTopics.length &&
      coveredVerbTopics.length === allTopics.length,
    details: `Іменники (1–5 відм.): [${declCounts.join(', ')}]; Покрито тем іменниками: ${coveredTopics.length}/14, дієсловами: ${coveredVerbTopics.length}/14`,
  });

  // Test 6: Stem Alternation & Exceptions Verification (dantis, žmogus, šuo, mėnuo, būti, eiti, duoti)
  const dantis = ALL_VERIFIED_NOUNS.find((n) => n.lemma === 'dantis');
  const zmogus = ALL_VERIFIED_NOUNS.find((n) => n.lemma === 'žmogus');
  const suo = ALL_VERIFIED_NOUNS.find((n) => n.lemma === 'šuo');
  const menuo = ALL_VERIFIED_NOUNS.find((n) => n.lemma === 'mėnuo');
  const buti = ALL_VERIFIED_VERBS.find((v) => v.infinitive.startsWith('būti'));
  const skaityti = ALL_VERIFIED_VERBS.find((v) => v.infinitive === 'skaityti');

  const stemAlternationsValid =
    dantis?.sg.dat === 'dančiui' &&
    dantis?.pl.gen === 'dantų' &&
    zmogus?.sg.gen === 'žmogaus' &&
    zmogus?.pl.nom === 'žmonės' &&
    suo?.sg.gen === 'šuns' &&
    menuo?.sg.gen === 'mėnesio' &&
    buti?.present.as === 'esu' &&
    buti?.past.as === 'buvau' &&
    skaityti?.past.as === 'skaičiau';

  results.push({
    id: 'test_06_stem_alternations',
    title: {
      uk: 'Перевірка чергувань основи в іменниках (dantis → dančiui) та дієсловах (būti → esu/buvau, skaityti → skaičiau)',
      lt: 'Kamieno kaitos daiktavardžiuose (dantis → dančiui) ir veiksmažodžiuose (būti → esu/buvau, skaityti → skaičiau) patikra',
      en: 'Verification of stem alternations in nouns (dantis → dančiui) and verbs (būti → esu/buvau, skaityti → skaičiau)',
    },
    passed: Boolean(stemAlternationsValid),
    details: `dantis→${dantis?.sg.dat}, žmogus→${zmogus?.pl.nom}, būti→${buti?.present.as}/${buti?.past.as}, skaityti→${skaityti?.past.as}`,
  });

  // Test 7: Strict Diacritic Validation (knyga vs knygą, namu vs namų)
  const knyga = ALL_VERIFIED_NOUNS.find((n) => n.lemma === 'knyga')!;
  const namas = ALL_VERIFIED_NOUNS.find((n) => n.lemma === 'namas')!;
  const evalKnygaAccWrong = evaluateUserAnswer(knyga, 'acc', 'sg', 'knyga');
  const evalKnygaAccRight = evaluateUserAnswer(knyga, 'acc', 'sg', '  Knygą  ');
  const evalNamasGenPlWrong = evaluateUserAnswer(namas, 'gen', 'pl', 'namu');

  results.push({
    id: 'test_07_diacritics_and_trim',
    title: {
      uk: 'Сувора перевірка литовських діакритиків (ą, č, ę, ė, į, š, ų, ū, ž) та обрізання пробілів',
      lt: 'Griežta lietuviškų diakritinių raidžių (ą, č, ę, ė, į, š, ų, ū, ž) ir tarpų patikra',
      en: 'Strict Lithuanian diacritic enforcement and whitespace trimming',
    },
    passed:
      !evalKnygaAccWrong.isCorrect &&
      Boolean(evalKnygaAccWrong.diacriticWarning) &&
      evalKnygaAccRight.isCorrect &&
      !evalNamasGenPlWrong.isCorrect &&
      Boolean(evalNamasGenPlWrong.diacriticWarning),
    details: `knyga замість knygą → відхилено (попередження про діакритик); "  Knygą  " → зараховано; namu замість namų → відхилено`,
  });

  // Test 8: Optimized English/ASCII Keyboard Layout Search for Nouns & Verbs
  const searchTetis = searchAndRankNouns(ALL_VERIFIED_NOUNS, 'tetis');
  const searchZmogus = searchAndRankNouns(ALL_VERIFIED_NOUNS, 'zmogus');
  const searchKalbeti = searchAndRankVerbs(ALL_VERIFIED_VERBS, 'kalbeti');
  const searchRasyti = searchAndRankVerbs(ALL_VERIFIED_VERBS, 'rasyti');
  results.push({
    id: 'test_08_ascii_search_suggestions',
    title: {
      uk: 'Оптимізований пошук англійською розкладкою для іменників та дієслів (tetis → tėtis, zmogus → žmogus, kalbeti → kalbėti, rasyti → rašyti)',
      lt: 'Optimizuota paieška be diakritinių ženklų (tetis → tėtis, zmogus → žmogus, kalbeti → kalbėti, rasyti → rašyti)',
      en: 'Optimized ASCII / English-layout search for nouns and verbs (tetis → tėtis, kalbeti → kalbėti)',
    },
    passed:
      searchTetis[0]?.noun.lemma === 'tėtis' &&
      searchZmogus[0]?.noun.lemma === 'žmogus' &&
      searchKalbeti[0]?.verb.infinitive === 'kalbėti' &&
      searchRasyti[0]?.verb.infinitive === 'rašyti',
    details: `"tetis" → ${searchTetis[0]?.noun.lemma ?? '—'}, "zmogus" → ${searchZmogus[0]?.noun.lemma ?? '—'}, "kalbeti" → ${searchKalbeti[0]?.verb.infinitive ?? '—'}, "rasyti" → ${searchRasyti[0]?.verb.infinitive ?? '—'}`,
  });

  const passedCount = results.filter((r) => r.passed).length;
  return {
    allPassed: passedCount === results.length,
    passedCount,
    totalCount: results.length,
    results,
  };
}
