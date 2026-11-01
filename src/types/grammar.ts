export type AppLanguage = 'uk' | 'lt' | 'en';

export type GrammaticalCase = 'nom' | 'gen' | 'dat' | 'acc' | 'ins' | 'loc' | 'voc';

export type GrammaticalNumber = 'sg' | 'pl';

export type DeclensionType = 1 | 2 | 3 | 4 | 5;

export type DifficultyLevel = 1 | 2 | 3 | 4;

export type DeclensionSubtype =
  | '1_as'     // namas
  | '1_ias'    // kelias, vėjas
  | '1_is'     // brolis, peilis
  | '1_ys'     // kambarys, traukinys
  | '2_a'      // knyga, mama
  | '2_ia'     // vyšnia, galia
  | '2_e'      // gatvė, kavinė
  | '3_is_f'   // pilis, naktis, širdis
  | '3_is_m'   // dantis, vagis, debesis
  | '4_us'     // sūnus, turgus, alus
  | '4_ius'    // vaisius, profesorius, muziejus
  | '5_uo'     // akmuo, vanduo, šuo, mėnuo
  | '5_e';     // sesuo, duktė

export type TopicId =
  | 'family'
  | 'home'
  | 'food'
  | 'shopping'
  | 'work'
  | 'transport'
  | 'city'
  | 'school'
  | 'nature'
  | 'health'
  | 'clothing'
  | 'travel'
  | 'time'
  | 'abstract';

export type TrainingMode =
  | 'random'
  | 'by_case'
  | 'by_declension'
  | 'by_number'
  | 'by_topic'
  | 'exam'
  | 'mistakes'
  | 'full_paradigm'
  | 'sentences';

export interface CaseForms {
  nom: string;
  gen: string;
  dat: string;
  acc: string;
  ins: string;
  loc: string;
  voc: string;
  variants?: Partial<Record<GrammaticalCase, string[]>>;
}

export interface SentenceExample {
  targetCase: GrammaticalCase;
  targetNumber: GrammaticalNumber;
  preposition?: string;
  sentenceWithBlank: string; // e.g. "Aš einu į ___."
  fullSentenceLt: string;    // e.g. "Aš einu į parduotuvę."
  translationUk: string;
  translationEn: string;
}

export interface NounEntry {
  id: string;
  lemma: string;
  uk: string;
  en: string;
  topic: TopicId;
  declension: DeclensionType;
  subtype: DeclensionSubtype;
  gender: 'm' | 'f';
  difficulty: DifficultyLevel;
  frequency: number; // 1 (most frequent) to 100
  verified: boolean;
  stemAlternation?: {
    uk: string;
    lt: string;
    en: string;
  };
  notes?: {
    uk: string;
    lt: string;
    en: string;
  };
  sg: CaseForms;
  pl: CaseForms;
  sentences?: SentenceExample[];
}

export type VerbConjugationType = 1 | 2 | 3;

export type VerbTense = 'present' | 'past' | 'future' | 'imperative';

export type VerbPerson = 'as' | 'tu' | 'jis' | 'mes' | 'jus' | 'jie';

export type VerbGovernedCase =
  | 'acc'          // Galininkas (ką?)
  | 'gen'          // Kilmininkas (ko?)
  | 'dat'          // Naudininkas (kam?)
  | 'ins'          // Įnagininkas (kuo?)
  | 'loc'          // Vietininkas (kur? kame?)
  | 'intransitive'; // Неперехідне дієслово (без прямого додатка або з прийменником)

export interface VerbPersonForms {
  as: string;   // aš
  tu: string;   // tu
  jis: string;  // jis / ji
  mes: string;  // mes
  jus: string;  // jūs
  jie: string;  // jie / jos (in Lithuanian always identical to jis/ji)
}

export interface VerbSentenceExample {
  tense: VerbTense;
  person: VerbPerson;
  sentenceWithBlank: string;
  fullSentenceLt: string;
  translationUk: string;
  translationEn: string;
}

export interface VerbEntry {
  id: string;
  infinitive: string; // Bendratis (-ti / -tis)
  present3: string;   // Esamojo laiko 3 asmuo (jis/ji)
  past3: string;      // Būtojo kartinio laiko 3 asmuo (jis/ji)
  uk: string;
  en: string;
  topic: TopicId;
  conjugation: VerbConjugationType; // 1 (-a/-ia), 2 (-i), 3 (-o)
  difficulty: DifficultyLevel;      // 1 (A0-A1) .. 4 (B1-B2)
  frequency: number;
  isReflexive: boolean;
  governedCase: VerbGovernedCase;
  verified: boolean;
  stemAlternation?: {
    uk: string;
    lt: string;
    en: string;
  };
  notes?: {
    uk: string;
    lt: string;
    en: string;
  };
  present: VerbPersonForms;
  past: VerbPersonForms;
  future: VerbPersonForms;
  imperative: {
    tu: string;
    mes: string;
    jus: string;
  };
  examples: {
    present: VerbSentenceExample;
    past: VerbSentenceExample;
    future: VerbSentenceExample;
  };
}

export interface SegmentedWord {
  stem: string;
  ending: string;
}

export interface AnswerEvaluation {
  isCorrect: boolean;
  isVariantMatch: boolean;
  normalizedUserAnswer: string;
  expectedForm: string;
  acceptedVariants: string[];
  expectedSegmented: SegmentedWord;
  userSegmented?: SegmentedWord;
  diacriticWarning?: {
    uk: string;
    lt: string;
    en: string;
  };
  confusedWithCases: Array<{
    grammaticalCase: GrammaticalCase;
    grammaticalNumber: GrammaticalNumber;
  }>;
  explanation: {
    uk: string;
    lt: string;
    en: string;
  };
  ruleFormula: string;
}

export interface WordLearningState {
  wordId: string;
  correctCount: number;
  incorrectCount: number;
  consecutiveCorrect: number;
  sessionsPracticed: string[]; // YYYY-MM-DD dates to ensure multi-session mastery
  lastPracticedAt: string;
  mastered: boolean; // requires >= 4 correct across >= 2 distinct sessions or >= 5 consecutive
}

export interface MistakeRecord {
  id: string;
  timestamp: string;
  wordId: string;
  lemma: string;
  targetCase: GrammaticalCase;
  targetNumber: GrammaticalNumber;
  userAnswer: string;
  correctAnswer: string;
  declension: DeclensionType;
}

export type BadgeId =
  | 'first_steps'
  | 'early_bird'
  | 'streak_10'
  | 'consistency_king'
  | 'daily_champion'
  | 'declension_explorer'
  | 'case_conqueror'
  | 'lexicon_master';

export interface UserProgress {
  language: AppLanguage;
  darkMode: boolean;
  dailyGoal: number; // 10 | 20 | 50
  selectedDifficulty: DifficultyLevel | 'auto';
  soundEffectsEnabled: boolean;
  hapticFeedbackEnabled: boolean;
  reminderEnabled: boolean;
  reminderTime: string; // "HH:MM" 24h format, e.g. "19:00"
  lastReminderSentDate?: string; // "YYYY-MM-DD"
  totalExercisesCompleted: number;
  totalCorrectAnswers: number;
  currentStreak: number;
  bestStreak: number;
  unlockedBadges: BadgeId[];
  favorites: string[];
  wordStats: Record<string, WordLearningState>;
  caseStats: Record<GrammaticalCase, { correct: number; total: number }>;
  declensionStats: Record<DeclensionType, { correct: number; total: number }>;
  topicStats: Record<TopicId, { correct: number; total: number }>;
  dailyActivity: Record<string, { completed: number; correct: number }>; // key: YYYY-MM-DD
  recentMistakes: MistakeRecord[];
}

