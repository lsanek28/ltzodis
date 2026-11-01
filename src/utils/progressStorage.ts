import { ALL_VERIFIED_NOUNS } from '../data/nounsDatabase';
import { CASES_METADATA, CASE_ORDER, TOPICS_METADATA } from '../data/grammarRules';
import { getNounContextExample } from './nounInflections';
import {
  AppLanguage,
  BadgeId,
  DeclensionType,
  DifficultyLevel,
  GrammaticalCase,
  GrammaticalNumber,
  NounEntry,
  SentenceExample,
  TopicId,
  TrainingMode,
  UserProgress,
} from '../types/grammar';

const STORAGE_KEY = 'lietuviu_galunes_progress_v1';

export interface BadgeDefinition {
  id: BadgeId;
  title: Record<AppLanguage, string>;
  description: Record<AppLanguage, string>;
  getProgressText: (progress: UserProgress) => string;
}

export const BADGES_CATALOG: BadgeDefinition[] = [
  {
    id: 'first_steps',
    title: {
      uk: 'Перші кроки (First Steps)',
      lt: 'Pirmieji žingsniai (First Steps)',
      en: 'First Steps',
    },
    description: {
      uk: 'Виконайте щонайменше 5 тренувальних вправ із відмінювання.',
      lt: 'Atlikite bent 5 linksniavimo pratimus.',
      en: 'Complete at least 5 noun declension practice exercises.',
    },
    getProgressText: (p) => `${Math.min(p.totalExercisesCompleted, 5)} / 5`,
  },
  {
    id: 'early_bird',
    title: {
      uk: 'Рання пташка (Early Bird)',
      lt: 'Ankstyvas paukštis (Early Bird)',
      en: 'Early Bird',
    },
    description: {
      uk: 'Виконайте вправу вранці до 10:00 за місцевим часом.',
      lt: 'Atlikite pratimą ryte iki 10:00 vietiniu laiku.',
      en: 'Complete a word-ending practice exercise before 10:00 AM local time.',
    },
    getProgressText: (p) =>
      p.unlockedBadges?.includes('early_bird') ? '1 / 1' : '0 / 1 (< 10:00)',
  },
  {
    id: 'streak_10',
    title: {
      uk: 'Влучна десятка (Streak 10)',
      lt: 'Dešimties serija (Streak 10)',
      en: 'Streak Master (10x)',
    },
    description: {
      uk: 'Досягніть серії з 10 правильних відповідей поспіль без помилок.',
      lt: 'Pasiekite 10 teisingų atsakymų iš eilės seriją.',
      en: 'Achieve a streak of 10 consecutive correct answers.',
    },
    getProgressText: (p) => `${Math.min(p.bestStreak, 10)} / 10`,
  },
  {
    id: 'consistency_king',
    title: {
      uk: 'Король стабільності (Consistency King)',
      lt: 'Nuoseklumo karalius (Consistency King)',
      en: 'Consistency King',
    },
    description: {
      uk: 'Досягніть серії з 25 правильних відповідей поспіль або тренуйтеся щонайменше 3 різні дні.',
      lt: 'Pasiekite 25 teisingų atsakymų seriją arba praktikuokitės bent 3 skirtingas dienas.',
      en: 'Reach a 25-answer streak or complete practice sessions across at least 3 distinct days.',
    },
    getProgressText: (p) => {
      const days = Object.keys(p.dailyActivity).length;
      return `Streak ${Math.min(p.bestStreak, 25)}/25 · Days ${Math.min(days, 3)}/3`;
    },
  },
  {
    id: 'daily_champion',
    title: {
      uk: 'Чемпіон дня (Daily Champion)',
      lt: 'Dienos čempionas (Daily Champion)',
      en: 'Daily Champion',
    },
    description: {
      uk: 'Виконайте свою щоденну норму вправ за один день.',
      lt: 'Įvykdykite savo dienos pratimų tikslą per vieną dieną.',
      en: 'Complete your full daily exercise goal within a single day.',
    },
    getProgressText: (p) => {
      const maxDaily = Object.values(p.dailyActivity).reduce(
        (max, d) => Math.max(max, d.completed),
        0
      );
      return `${Math.min(maxDaily, p.dailyGoal)} / ${p.dailyGoal}`;
    },
  },
  {
    id: 'declension_explorer',
    title: {
      uk: 'Знавець 5 типів (5 Linksniuotės)',
      lt: '5 linksniuočių žinovas',
      en: '5-Declension Explorer',
    },
    description: {
      uk: 'Дайте правильну відповідь для іменників усіх 5 типів відмінювання (1–5 linksniuotė).',
      lt: 'Teisingai atsakykite į visų 5 linksniuočių daiktavardžių užduotis.',
      en: 'Answer correctly in all 5 Lithuanian noun declension types (1–5 linksniuotė).',
    },
    getProgressText: (p) => {
      const count = ([1, 2, 3, 4, 5] as DeclensionType[]).filter(
        (d) => (p.declensionStats[d]?.correct ?? 0) >= 1
      ).length;
      return `${count} / 5`;
    },
  },
  {
    id: 'case_conqueror',
    title: {
      uk: 'Володар 7 відмінків (Case Conqueror)',
      lt: '7 linksnių valdovas (Case Conqueror)',
      en: '7-Case Conqueror',
    },
    description: {
      uk: 'Дайте щонайменше по 3 правильні відповіді у кожному з 7 відмінків.',
      lt: 'Teisingai atsakykite bent po 3 kartus kiekviename iš 7 linksnių.',
      en: 'Score at least 3 correct answers in each of the 7 grammatical cases.',
    },
    getProgressText: (p) => {
      const count = CASE_ORDER.filter(
        (c) => (p.caseStats[c]?.correct ?? 0) >= 3
      ).length;
      return `${count} / 7`;
    },
  },
  {
    id: 'lexicon_master',
    title: {
      uk: 'Майстер словника (Lexicon Master)',
      lt: 'Žodyno meistras (Lexicon Master)',
      en: 'Lexicon Master',
    },
    description: {
      uk: 'Повністю вивчіть щонайменше 10 литовських іменників (статус «Вивчено»).',
      lt: 'Pilnai išmokite bent 10 lietuviškų daiktavardžių.',
      en: 'Reach full mastery on at least 10 Lithuanian nouns.',
    },
    getProgressText: (p) => {
      const masteredCount = Object.values(p.wordStats).filter((w) => w.mastered).length;
      return `${Math.min(masteredCount, 10)} / 10`;
    },
  },
];

export function evaluateUnlockedBadges(
  progress: UserProgress,
  exercisedAt?: Date
): BadgeId[] {
  const unlocked = new Set<BadgeId>(progress.unlockedBadges ?? []);

  if (progress.totalExercisesCompleted >= 5) {
    unlocked.add('first_steps');
  }

  if (exercisedAt) {
    const hour = exercisedAt.getHours();
    if (hour >= 4 && hour < 10) {
      unlocked.add('early_bird');
    }
  }

  if (progress.bestStreak >= 10) {
    unlocked.add('streak_10');
  }

  const activeDaysCount = Object.keys(progress.dailyActivity).length;
  if (progress.bestStreak >= 25 || activeDaysCount >= 3) {
    unlocked.add('consistency_king');
  }

  const reachedDailyGoal = Object.values(progress.dailyActivity).some(
    (d) => d.completed >= progress.dailyGoal
  );
  if (reachedDailyGoal) {
    unlocked.add('daily_champion');
  }

  const allDeclensionsCovered = ([1, 2, 3, 4, 5] as DeclensionType[]).every(
    (d) => (progress.declensionStats[d]?.correct ?? 0) >= 1
  );
  if (allDeclensionsCovered) {
    unlocked.add('declension_explorer');
  }

  const allCasesConquered = CASE_ORDER.every(
    (c) => (progress.caseStats[c]?.correct ?? 0) >= 3
  );
  if (allCasesConquered) {
    unlocked.add('case_conqueror');
  }

  const masteredWordsCount = Object.values(progress.wordStats).filter(
    (w) => w.mastered
  ).length;
  if (masteredWordsCount >= 10) {
    unlocked.add('lexicon_master');
  }

  return Array.from(unlocked);
}

export function getTodayDateString(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export function createInitialProgress(): UserProgress {
  const caseStats = {} as UserProgress['caseStats'];
  for (const c of CASE_ORDER) {
    caseStats[c] = { correct: 0, total: 0 };
  }

  const declensionStats: UserProgress['declensionStats'] = {
    1: { correct: 0, total: 0 },
    2: { correct: 0, total: 0 },
    3: { correct: 0, total: 0 },
    4: { correct: 0, total: 0 },
    5: { correct: 0, total: 0 },
  };

  const topicStats = {} as UserProgress['topicStats'];
  for (const t of Object.keys(TOPICS_METADATA) as TopicId[]) {
    topicStats[t] = { correct: 0, total: 0 };
  }

  return {
    language: 'uk', // Ukrainian is default per specification
    darkMode: false,
    dailyGoal: 20,
    selectedDifficulty: 1,
    soundEffectsEnabled: true,
    hapticFeedbackEnabled: true,
    reminderEnabled: false,
    reminderTime: '19:00',
    totalExercisesCompleted: 0,
    totalCorrectAnswers: 0,
    currentStreak: 0,
    bestStreak: 0,
    unlockedBadges: [],
    favorites: ['lt_013', 'lt_076', 'lt_098', 'lt_087', 'lt_002'],
    wordStats: {},
    caseStats,
    declensionStats,
    topicStats,
    dailyActivity: {},
    recentMistakes: [],
  };
}

export function loadUserProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialProgress();
    const parsed = JSON.parse(raw) as Partial<UserProgress>;
    const base = createInitialProgress();
    const merged: UserProgress = {
      ...base,
      ...parsed,
      soundEffectsEnabled: parsed.soundEffectsEnabled ?? true,
      hapticFeedbackEnabled: parsed.hapticFeedbackEnabled ?? true,
      unlockedBadges: Array.isArray(parsed.unlockedBadges)
        ? parsed.unlockedBadges
        : [],
      caseStats: { ...base.caseStats, ...(parsed.caseStats ?? {}) },
      declensionStats: { ...base.declensionStats, ...(parsed.declensionStats ?? {}) },
      topicStats: { ...base.topicStats, ...(parsed.topicStats ?? {}) },
      wordStats: parsed.wordStats ?? {},
      dailyActivity: parsed.dailyActivity ?? {},
      recentMistakes: parsed.recentMistakes ?? [],
      favorites: parsed.favorites ?? base.favorites,
    };
    merged.unlockedBadges = evaluateUnlockedBadges(merged);
    return merged;
  } catch {
    return createInitialProgress();
  }
}

export function saveUserProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage quota errors
  }
}

export function resolveEffectiveDifficulty(progress: UserProgress): DifficultyLevel {
  if (progress.selectedDifficulty !== 'auto') {
    return progress.selectedDifficulty;
  }
  const total = progress.totalExercisesCompleted;
  const acc = total > 0 ? progress.totalCorrectAnswers / total : 0;
  if (total < 10 || acc < 0.65) return 1;
  if (total < 25 || acc < 0.78) return 2;
  if (total < 50 || acc < 0.88) return 3;
  return 4;
}

export function recordExerciseOutcome(
  prev: UserProgress,
  noun: NounEntry,
  targetCase: GrammaticalCase,
  targetNumber: GrammaticalNumber,
  userAnswer: string,
  correctAnswer: string,
  isCorrect: boolean
): UserProgress {
  const now = new Date();
  const today = getTodayDateString();
  const prevWord = prev.wordStats[noun.id] ?? {
    wordId: noun.id,
    correctCount: 0,
    incorrectCount: 0,
    consecutiveCorrect: 0,
    sessionsPracticed: [],
    lastPracticedAt: now.toISOString(),
    mastered: false,
  };

  const sessionsPracticed = prevWord.sessionsPracticed.includes(today)
    ? prevWord.sessionsPracticed
    : [...prevWord.sessionsPracticed, today];

  const correctCount = prevWord.correctCount + (isCorrect ? 1 : 0);
  const incorrectCount = prevWord.incorrectCount + (isCorrect ? 0 : 1);
  const consecutiveCorrect = isCorrect ? prevWord.consecutiveCorrect + 1 : 0;

  // Multi-repetition mastery requirement: never mastered after just 1 answer!
  const mastered =
    (correctCount >= 4 && sessionsPracticed.length >= 2 && consecutiveCorrect >= 2) ||
    consecutiveCorrect >= 5;

  const updatedWordStats = {
    ...prev.wordStats,
    [noun.id]: {
      wordId: noun.id,
      correctCount,
      incorrectCount,
      consecutiveCorrect,
      sessionsPracticed,
      lastPracticedAt: now.toISOString(),
      mastered,
    },
  };

  const prevCase = prev.caseStats[targetCase] ?? { correct: 0, total: 0 };
  const updatedCaseStats = {
    ...prev.caseStats,
    [targetCase]: {
      correct: prevCase.correct + (isCorrect ? 1 : 0),
      total: prevCase.total + 1,
    },
  };

  const prevDecl = prev.declensionStats[noun.declension] ?? { correct: 0, total: 0 };
  const updatedDeclStats = {
    ...prev.declensionStats,
    [noun.declension]: {
      correct: prevDecl.correct + (isCorrect ? 1 : 0),
      total: prevDecl.total + 1,
    },
  };

  const prevTopic = prev.topicStats[noun.topic] ?? { correct: 0, total: 0 };
  const updatedTopicStats = {
    ...prev.topicStats,
    [noun.topic]: {
      correct: prevTopic.correct + (isCorrect ? 1 : 0),
      total: prevTopic.total + 1,
    },
  };

  const prevDaily = prev.dailyActivity[today] ?? { completed: 0, correct: 0 };
  const updatedDaily = {
    ...prev.dailyActivity,
    [today]: {
      completed: prevDaily.completed + 1,
      correct: prevDaily.correct + (isCorrect ? 1 : 0),
    },
  };

  const currentStreak = isCorrect ? prev.currentStreak + 1 : 0;
  const bestStreak = Math.max(prev.bestStreak, currentStreak);

  const recentMistakes = isCorrect
    ? prev.recentMistakes
    : [
        {
          id: `err_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          timestamp: now.toISOString(),
          wordId: noun.id,
          lemma: noun.lemma,
          targetCase,
          targetNumber,
          userAnswer: userAnswer.trim() || '—',
          correctAnswer,
          declension: noun.declension,
        },
        ...prev.recentMistakes,
      ].slice(0, 60);

  const next: UserProgress = {
    ...prev,
    totalExercisesCompleted: prev.totalExercisesCompleted + 1,
    totalCorrectAnswers: prev.totalCorrectAnswers + (isCorrect ? 1 : 0),
    currentStreak,
    bestStreak,
    wordStats: updatedWordStats,
    caseStats: updatedCaseStats,
    declensionStats: updatedDeclStats,
    topicStats: updatedTopicStats,
    dailyActivity: updatedDaily,
    recentMistakes,
  };

  next.unlockedBadges = evaluateUnlockedBadges(next, now);

  saveUserProgress(next);
  return next;
}

export function recordVerbExerciseOutcome(
  prev: UserProgress,
  verb: { id: string; infinitive: string; topic: TopicId },
  isCorrect: boolean
): UserProgress {
  const now = new Date();
  const today = getTodayDateString();
  const prevWord = prev.wordStats[verb.id] ?? {
    wordId: verb.id,
    correctCount: 0,
    incorrectCount: 0,
    consecutiveCorrect: 0,
    sessionsPracticed: [],
    lastPracticedAt: now.toISOString(),
    mastered: false,
  };

  const sessionsPracticed = prevWord.sessionsPracticed.includes(today)
    ? prevWord.sessionsPracticed
    : [...prevWord.sessionsPracticed, today];

  const correctCount = prevWord.correctCount + (isCorrect ? 1 : 0);
  const incorrectCount = prevWord.incorrectCount + (isCorrect ? 0 : 1);
  const consecutiveCorrect = isCorrect ? prevWord.consecutiveCorrect + 1 : 0;

  const mastered =
    (correctCount >= 4 && sessionsPracticed.length >= 2 && consecutiveCorrect >= 2) ||
    consecutiveCorrect >= 5;

  const updatedWordStats = {
    ...prev.wordStats,
    [verb.id]: {
      wordId: verb.id,
      correctCount,
      incorrectCount,
      consecutiveCorrect,
      sessionsPracticed,
      lastPracticedAt: now.toISOString(),
      mastered,
    },
  };

  const prevTopic = prev.topicStats[verb.topic] ?? { correct: 0, total: 0 };
  const updatedTopicStats = {
    ...prev.topicStats,
    [verb.topic]: {
      correct: prevTopic.correct + (isCorrect ? 1 : 0),
      total: prevTopic.total + 1,
    },
  };

  const prevDaily = prev.dailyActivity[today] ?? { completed: 0, correct: 0 };
  const updatedDaily = {
    ...prev.dailyActivity,
    [today]: {
      completed: prevDaily.completed + 1,
      correct: prevDaily.correct + (isCorrect ? 1 : 0),
    },
  };

  const currentStreak = isCorrect ? prev.currentStreak + 1 : 0;
  const bestStreak = Math.max(prev.bestStreak, currentStreak);

  const next: UserProgress = {
    ...prev,
    totalExercisesCompleted: prev.totalExercisesCompleted + 1,
    totalCorrectAnswers: prev.totalCorrectAnswers + (isCorrect ? 1 : 0),
    currentStreak,
    bestStreak,
    wordStats: updatedWordStats,
    topicStats: updatedTopicStats,
    dailyActivity: updatedDaily,
  };

  next.unlockedBadges = evaluateUnlockedBadges(next, now);

  saveUserProgress(next);
  return next;
}

/**
 * Generates or retrieves a contextual Lithuanian sentence with prepositions/verbs
 * for a given noun, target case, and target number.
 */
export function getContextualSentence(
  noun: NounEntry,
  targetCase: GrammaticalCase,
  targetNumber: GrammaticalNumber
): SentenceExample {
  const existing = noun.sentences?.find(
    (s) => s.targetCase === targetCase && s.targetNumber === targetNumber
  );
  if (existing) return existing;

  const expectedForm = (targetNumber === 'sg' ? noun.sg : noun.pl)[targetCase];
  const numHintLt = targetNumber === 'pl' ? `${noun.lemma}, dgs.` : noun.lemma;

  const contextEx = getNounContextExample(noun, targetCase, targetNumber);
  const escapedForm = expectedForm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const formRegex = new RegExp(`(^|[^a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ])(${escapedForm})(?=[^a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ]|$)`, 'i');

  if (formRegex.test(contextEx.lt)) {
    const sentenceWithBlank = contextEx.lt.replace(formRegex, `$1___ (${numHintLt})`);
    return {
      targetCase,
      targetNumber,
      sentenceWithBlank,
      fullSentenceLt: contextEx.lt,
      translationUk: contextEx.uk,
      translationEn: contextEx.en,
    };
  }

  return {
    targetCase,
    targetNumber,
    sentenceWithBlank: `${contextEx.lt} [___ (${numHintLt})]`,
    fullSentenceLt: contextEx.lt,
    translationUk: contextEx.uk,
    translationEn: contextEx.en,
  };
}

export interface ExerciseTask {
  noun: NounEntry;
  targetCase: GrammaticalCase;
  targetNumber: GrammaticalNumber;
  sentence?: SentenceExample;
  hideTranslation: boolean;
}

export interface ExerciseFilterOptions {
  mode: TrainingMode;
  difficulty: DifficultyLevel;
  selectedCase: GrammaticalCase;
  selectedDeclension: DeclensionType;
  selectedNumber: GrammaticalNumber | 'both';
  selectedTopic: TopicId;
  forcedNounId?: string;
  previousNounId?: string;
}

export function generateNextExerciseTask(
  progress: UserProgress,
  options: ExerciseFilterOptions
): ExerciseTask {
  let pool = ALL_VERIFIED_NOUNS.filter((n) => n.verified);

  if (options.forcedNounId) {
    const found = pool.find((n) => n.id === options.forcedNounId);
    if (found) pool = [found];
  } else {
    // Filter by mode
    if (options.mode === 'by_declension') {
      pool = pool.filter((n) => n.declension === options.selectedDeclension);
    } else if (options.mode === 'by_topic') {
      pool = pool.filter((n) => n.topic === options.selectedTopic);
    } else if (options.mode === 'mistakes') {
      const mistakeIds = new Set(progress.recentMistakes.map((m) => m.wordId));
      const errorWords = pool.filter(
        (n) =>
          mistakeIds.has(n.id) ||
          (progress.wordStats[n.id]?.incorrectCount ?? 0) > 0
      );
      if (errorWords.length > 0) {
        pool = errorWords;
      }
    }

    if (options.mode !== 'mistakes') {
      // Match the exact CEFR band for the selected level:
      // 1 = A0-A1 (Початковий), 2 = A1-A2 (Базовий), 3 = A2-B1 (Середній), 4 = B1-B2 (Просунутий)
      const exactBand = pool.filter((n) => n.difficulty === options.difficulty);
      if (exactBand.length >= 5) {
        pool = exactBand;
      } else {
        const ceilingBand = pool.filter(
          (n) => n.difficulty <= options.difficulty
        );
        if (ceilingBand.length >= 5) {
          pool = ceilingBand;
        }
      }
    }
  }

  if (pool.length > 1 && options.previousNounId) {
    pool = pool.filter((n) => n.id !== options.previousNounId);
  }

  // Weighted random selection for spaced repetition:
  // Words with mistakes get higher weight; already mastered words get lower weight
  const weightedPool: Array<{ noun: NounEntry; weight: number }> = pool.map(
    (noun) => {
      const stat = progress.wordStats[noun.id];
      let weight = 10;
      if (stat) {
        weight += stat.incorrectCount * 14;
        if (stat.mastered) {
          weight = Math.max(2, weight - 7);
        } else if (stat.correctCount === 0) {
          weight += 4;
        }
      } else {
        weight += 5; // Unseen words get a slight boost
      }
      if (noun.difficulty === options.difficulty) {
        weight += 6;
      }
      return { noun, weight };
    }
  );

  const totalWeight = weightedPool.reduce((acc, item) => acc + item.weight, 0);
  let randomCursor = Math.random() * totalWeight;
  let chosenNoun = weightedPool[0].noun;
  for (const item of weightedPool) {
    randomCursor -= item.weight;
    if (randomCursor <= 0) {
      chosenNoun = item.noun;
      break;
    }
  }

  // Determine target grammatical number
  let targetNumber: GrammaticalNumber = 'sg';
  if (options.mode === 'by_number' && options.selectedNumber !== 'both') {
    targetNumber = options.selectedNumber;
  } else if (options.difficulty === 1 && options.mode === 'random') {
    // Level 1: mostly singular (80% singular, 20% plural)
    targetNumber = Math.random() < 0.8 ? 'sg' : 'pl';
  } else {
    targetNumber = Math.random() < 0.55 ? 'sg' : 'pl';
  }

  // Determine target grammatical case
  let targetCase: GrammaticalCase = 'gen';
  if (options.mode === 'by_case') {
    targetCase = options.selectedCase;
  } else if (options.mode === 'mistakes') {
    // Check if there is a specific case mistake for this noun
    const matchingMistake = progress.recentMistakes.find(
      (m) => m.wordId === chosenNoun.id
    );
    if (matchingMistake) {
      targetCase = matchingMistake.targetCase;
      targetNumber = matchingMistake.targetNumber;
    } else {
      const nonNomCases: GrammaticalCase[] = ['gen', 'dat', 'acc', 'ins', 'loc', 'voc'];
      targetCase = nonNomCases[Math.floor(Math.random() * nonNomCases.length)];
    }
  } else if (options.difficulty === 1 && options.mode === 'random') {
    // Level 1: Nominative (plural or singular), Genitive, Dative, Accusative
    const level1Cases: GrammaticalCase[] =
      targetNumber === 'sg'
        ? ['gen', 'dat', 'acc']
        : ['nom', 'gen', 'dat', 'acc'];
    targetCase = level1Cases[Math.floor(Math.random() * level1Cases.length)];
  } else {
    // All 7 cases (avoid asking Nominative Singular unless in full_paradigm since base word is already Nominative Singular!)
    const candidateCases: GrammaticalCase[] =
      targetNumber === 'sg'
        ? ['gen', 'dat', 'acc', 'ins', 'loc', 'voc']
        : ['nom', 'gen', 'dat', 'acc', 'ins', 'loc', 'voc'];
    targetCase =
      candidateCases[Math.floor(Math.random() * candidateCases.length)];
  }

  // Include sentence context in 'sentences' mode or Levels 3 & 4
  const includeSentence =
    options.mode === 'sentences' ||
    options.difficulty >= 3 ||
    Boolean(
      chosenNoun.sentences?.some(
        (s) => s.targetCase === targetCase && s.targetNumber === targetNumber
      )
    );

  const sentence = includeSentence
    ? getContextualSentence(chosenNoun, targetCase, targetNumber)
    : undefined;

  return {
    noun: chosenNoun,
    targetCase,
    targetNumber,
    sentence,
    hideTranslation: options.difficulty === 4 && options.mode !== 'random',
  };
}
