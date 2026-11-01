import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Compass,
  GraduationCap,
  Layers,
  Play,
  RefreshCw,
  Settings,
  Sparkles,
  Star,
  Table2,
  Volume2,
} from 'lucide-react';
import { ALL_VERIFIED_NOUNS } from '../data/nounsDatabase';
import { ALL_VERIFIED_VERBS } from '../data/verbsDatabase';
import {
  CASES_METADATA,
  CASE_ORDER,
  DECLENSION_PDF_TABLE,
  DIFFICULTY_CEFR_LABELS,
  DIFFICULTY_METADATA,
  TOPICS_METADATA,
  TRAINING_MODES_METADATA,
  segmentLithuanianWord,
} from '../data/grammarRules';
import {
  segmentLithuanianVerbForm,
  VERB_CONJUGATIONS_METADATA,
  VERB_GOVERNED_CASES_METADATA,
  VERB_PERSONS_METADATA,
  VERB_PERSON_ORDER,
  VERB_TENSES_METADATA,
} from '../utils/verbConjugations';
import { UI_TEXT } from '../i18n/translations';
import {
  AppLanguage,
  DeclensionType,
  DifficultyLevel,
  GrammaticalCase,
  NounEntry,
  TrainingMode,
  UserProgress,
  VerbConjugationType,
  VerbEntry,
  VerbPerson,
  VerbTense,
} from '../types/grammar';
import {
  GrammarAnalysisModal,
  GrammarAnalysisTarget,
} from './GrammarAnalysisModal';

interface HomeDashboardProps {
  language: AppLanguage;
  progress: UserProgress;
  effectiveDifficulty: DifficultyLevel;
  trainingMode: TrainingMode;
  todayCompleted: number;
  masteredCount: number;
  overallAccuracy: number;
  onStartDeclension: (modeOverride?: TrainingMode) => void;
  onStartCasePractice: (grammaticalCase: GrammaticalCase) => void;
  onStartDeclensionTypePractice: (declension: DeclensionType) => void;
  onStartVerbs: () => void;
  onStartFlashcards: () => void;
  onOpenDictionary: () => void;
  onOpenReference: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
  onToggleFavorite: (wordId: string) => void;
  onPracticeSpecificNoun: (nounId: string) => void;
  onPracticeSpecificVerb: (verbId: string) => void;
}

interface GovernanceBridgePreset {
  id: string;
  governedCase: 'acc' | 'gen' | 'dat' | 'ins' | 'loc';
  questionLt: string;
  verbId: string;
  nounId: string;
  prepositionLt?: string;
  noteUk: string;
  noteLt: string;
  noteEn: string;
}

const GOVERNANCE_PRESETS: GovernanceBridgePreset[] = [
  {
    id: 'acc_book',
    governedCase: 'acc',
    questionLt: 'Ką? (Galininkas)',
    verbId: 'vb_019', // skaityti
    nounId: 'school_001', // knyga
    noteUk:
      'Перехідні дієслова дії (skaityti, rašyti, matyti, pirkti) керують знахідним відмінком (Galininkas — ką?).',
    noteLt:
      'Galininkas (ką?) vartojamas su tiesioginio objekto veiksmažodžiais: skaityti knygą, matyti draugą.',
    noteEn:
      'Transitive action verbs (skaityti, rašyti, matyti, pirkti) govern the Accusative case (Galininkas — ką?).',
  },
  {
    id: 'gen_key',
    governedCase: 'gen',
    questionLt: 'Ko? (Kilmininkas)',
    verbId: 'vb_039', // ieškoti
    nounId: 'home_001', // namas / raktas fallback
    noteUk:
      'Дієслова пошуку, бажання, очікування та потреби (ieškoti, norėti, laukti, reikėti) завжди вимагають родового відмінка (Kilmininkas — ko?).',
    noteLt:
      'Kilmininkas (ko?) būtinas po veiksmažodžių ieškoti, norėti, laukti, reikėti bei su neiginiu ne-.',
    noteEn:
      'Verbs of searching, wanting, waiting, and needing (ieškoti, norėti, laukti, reikėti) govern the Genitive case (Kilmininkas — ko?).',
  },
  {
    id: 'dat_friend',
    governedCase: 'dat',
    questionLt: 'Kam? (Naudininkas)',
    verbId: 'vb_055', // padėti
    nounId: 'family_003', // brolis
    noteUk:
      'Дієслова допомоги, дарування, подяки та спілкування (padėti, duoti, dėkoti, skambinti) керують давальним відмінком (Naudininkas — kam?).',
    noteLt:
      'Naudininkas (kam?) rodo adresatą, kuriam skiriamas veiksmas: padėti broliui, skambinti draugui.',
    noteEn:
      'Verbs of helping, giving, thanking, and calling (padėti, duoti, dėkoti, skambinti) govern the Dative case (Naudininkas — kam?).',
  },
  {
    id: 'ins_result',
    governedCase: 'ins',
    questionLt: 'Kuo? (Įnagininkas)',
    verbId: 'vb_074', // domėtis / džiaugtis fallback
    nounId: 'city_001', // miestas
    noteUk:
      'Зворотні дієслова на -tis (džiaugtis, domėtis, didžiuotis) та дієслова становлення (tapti, būti) керують орудним відмінком (Įnagininkas — kuo?).',
    noteLt:
      'Įnagininkas (kuo?) vartojamas su sangrąžiniais veiksmažodžiais (domėtis, džiaugtis) bei veiksmažodžiu tapti.',
    noteEn:
      'Reflexive verbs in -tis (džiaugtis, domėtis, didžiuotis) and verbs of becoming (tapti) govern the Instrumental case (Įnagininkas — kuo?).',
  },
  {
    id: 'loc_city',
    governedCase: 'loc',
    questionLt: 'Kur? Kame? (Vietininkas)',
    verbId: 'vb_009', // gyventi
    nounId: 'city_001', // miestas
    noteUk:
      'Дієслова перебування та праці (gyventi, dirbti, mokytis, būti) відповідають на питання Kur? і поєднуються з місцевим відмінком (Vietininkas) без прийменника.',
    noteLt:
      'Vietininkas (kur? kame?) su veiksmažodžiais gyventi, dirbti, būti vartojamas be prielinksnio: gyvenu mieste.',
    noteEn:
      'Verbs of location and living (gyventi, dirbti, mokytis, būti) use the Locative case (Vietininkas — kur?) without a preposition.',
  },
];

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  language,
  progress,
  effectiveDifficulty,
  trainingMode,
  todayCompleted,
  masteredCount,
  overallAccuracy,
  onStartDeclension,
  onStartCasePractice,
  onStartDeclensionTypePractice,
  onStartVerbs,
  onStartFlashcards,
  onOpenDictionary,
  onOpenReference,
  onOpenStats,
  onOpenSettings,
  onToggleFavorite,
  onPracticeSpecificNoun,
  onPracticeSpecificVerb,
}) => {
  const t = UI_TEXT[language];

  // Switcher in right hero panel: 'verbs' | 'nouns'
  const [cheatSheetTab, setCheatSheetTab] = useState<'verbs' | 'nouns'>('verbs');

  // Interactive Verb + Noun Governance Sandbox state
  const [selectedPresetId, setSelectedPresetId] = useState<string>('acc_book');
  const [sandboxTense, setSandboxTense] = useState<VerbTense>('present');
  const [sandboxPerson, setSandboxPerson] = useState<VerbPerson>('as');
  const [sandboxNumber, setSandboxNumber] = useState<'sg' | 'pl'>('sg');

  // Featured "Word & Verb of the Day" pair index
  const [featuredPairOffset, setFeaturedPairOffset] = useState<number>(0);

  // Grammar Analysis Modal target
  const [analysisTarget, setAnalysisTarget] =
    useState<GrammarAnalysisTarget | null>(null);

  const speakLithuanian = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const cleaned = text.replace(/\[|\]/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.lang = 'lt-LT';
      utterance.rate = 0.92;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore speech synthesis errors on unsupported browsers
    }
  };

  // Separate mastery counts for Nouns vs Verbs
  const { masteredNounsCount, masteredVerbsCount } = useMemo(() => {
    let nouns = 0;
    let verbs = 0;
    Object.entries(progress.wordStats).forEach(([id, st]) => {
      if (st.mastered) {
        if (id.startsWith('vb_')) {
          verbs += 1;
        } else {
          nouns += 1;
        }
      }
    });
    return { masteredNounsCount: nouns, masteredVerbsCount: verbs };
  }, [progress.wordStats]);

  // Resolve active Governance Preset with guaranteed fallback entries
  const activePreset = useMemo(() => {
    return (
      GOVERNANCE_PRESETS.find((p) => p.id === selectedPresetId) ||
      GOVERNANCE_PRESETS[0]
    );
  }, [selectedPresetId]);

  const sandboxVerb: VerbEntry = useMemo(() => {
    const byId = ALL_VERIFIED_VERBS.find((v) => v.id === activePreset.verbId);
    if (byId) return byId;
    const byCase = ALL_VERIFIED_VERBS.find(
      (v) => v.governedCase === activePreset.governedCase
    );
    return byCase || ALL_VERIFIED_VERBS[0];
  }, [activePreset]);

  const sandboxNoun: NounEntry = useMemo(() => {
    const byId = ALL_VERIFIED_NOUNS.find((n) => n.id === activePreset.nounId);
    return byId || ALL_VERIFIED_NOUNS[0];
  }, [activePreset]);

  // Compute live conjugated verb form & segmented parts
  const sandboxVerbForm = useMemo(() => {
    if (sandboxTense === 'imperative') {
      const impPerson =
        sandboxPerson === 'tu' || sandboxPerson === 'mes' || sandboxPerson === 'jus'
          ? sandboxPerson
          : 'tu';
      return sandboxVerb.imperative[impPerson];
    }
    return sandboxVerb[sandboxTense][sandboxPerson];
  }, [sandboxVerb, sandboxTense, sandboxPerson]);

  const effectiveSandboxPerson: VerbPerson =
    sandboxTense === 'imperative' &&
    sandboxPerson !== 'tu' &&
    sandboxPerson !== 'mes' &&
    sandboxPerson !== 'jus'
      ? 'tu'
      : sandboxPerson;

  const sandboxVerbSeg = useMemo(
    () =>
      segmentLithuanianVerbForm(
        sandboxVerbForm,
        sandboxTense,
        effectiveSandboxPerson,
        sandboxVerb.isReflexive
      ),
    [
      sandboxVerbForm,
      sandboxTense,
      effectiveSandboxPerson,
      sandboxVerb.isReflexive,
    ]
  );

  // Compute live declined noun form & segmented parts
  const sandboxNounForm =
    sandboxNoun[sandboxNumber][activePreset.governedCase];
  const sandboxNounSeg = useMemo(
    () =>
      segmentLithuanianWord(
        sandboxNounForm,
        sandboxNoun.subtype,
        activePreset.governedCase,
        sandboxNumber
      ),
    [sandboxNounForm, sandboxNoun.subtype, activePreset.governedCase, sandboxNumber]
  );

  const pronounDisplay = useMemo(() => {
    const raw = VERB_PERSONS_METADATA[effectiveSandboxPerson].pronounLt;
    const firstPart = raw.split('/')[0].trim();
    return firstPart.charAt(0).toUpperCase() + firstPart.slice(1);
  }, [effectiveSandboxPerson]);

  const liveFullSentenceLt = `${pronounDisplay} ${sandboxVerbForm} ${sandboxNounForm}${
    sandboxTense === 'imperative' ? '!' : '.'
  }`;

  // Featured Noun & Verb of the Day (deterministic daily seed + manual offset)
  const { featuredNoun, featuredVerb } = useMemo(() => {
    const todaySeed = new Date().getDate() + new Date().getMonth() * 31;
    const nounIdx =
      (todaySeed * 7 + featuredPairOffset * 13) % ALL_VERIFIED_NOUNS.length;
    const verbIdx =
      (todaySeed * 11 + featuredPairOffset * 17) % ALL_VERIFIED_VERBS.length;
    return {
      featuredNoun: ALL_VERIFIED_NOUNS[nounIdx],
      featuredVerb: ALL_VERIFIED_VERBS[verbIdx],
    };
  }, [featuredPairOffset]);

  const dailyGoalPct = Math.min(
    100,
    Math.round((todayCompleted / progress.dailyGoal) * 100)
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8">
      {/* SECTION 1: UNIFIED HERO & 3 TRAINING TRACKS + INTERACTIVE CHEAT-SHEET */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 7 Columns: Unified Command Hub for Nouns, Verbs & Flashcards */}
        <div className="lg:col-span-7 p-5 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-5 shadow-xs">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.heroTagline}</span>
              </span>
              <button
                type="button"
                onClick={onOpenSettings}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>
                  {DIFFICULTY_CEFR_LABELS[effectiveDifficulty]} ·{' '}
                  {t.nav.settings}
                </span>
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              {language === 'uk'
                ? 'Литовські іменники та дієслова: відмінки, часи й керування'
                : language === 'lt'
                ? 'Lietuvių daiktavardžiai ir veiksmažodžiai: linksniai ir laikai'
                : 'Lithuanian Nouns & Verbs: Cases, Tenses & Governance'}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.heroDescription}
            </p>
          </div>

          {/* 3 Structured Quick-Launch Training Tracks */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Track 1: Noun Declension */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/80 flex flex-col justify-between gap-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    {language === 'uk'
                      ? '1. Іменники'
                      : language === 'lt'
                      ? '1. Daiktavardžiai'
                      : '1. Nouns'}
                  </span>
                  <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                    {masteredNounsCount}/{ALL_VERIFIED_NOUNS.length}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {language === 'uk'
                    ? 'Відмінювання (7 відмінків)'
                    : language === 'lt'
                    ? 'Linksniavimas (7 linksniai)'
                    : 'Declension (7 Cases)'}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                  {language === 'uk'
                    ? '5 типів відмінювання, однина і множина, чергування основи та контекст.'
                    : language === 'lt'
                    ? '5 linksniuotės, vienaskaita ir daugiskaita, kamieno kaita.'
                    : '5 declensions, singular & plural, stem alternations & context.'}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {(
                    [
                      {
                        mode: 'random' as TrainingMode,
                        labelUk: 'Випадкові',
                        labelLt: 'Atsitiktiniai',
                        labelEn: 'Random',
                      },
                      {
                        mode: 'sentences' as TrainingMode,
                        labelUk: 'Речення',
                        labelLt: 'Sakiniai',
                        labelEn: 'Sentences',
                      },
                      {
                        mode: 'full_paradigm' as TrainingMode,
                        labelUk: 'Усі 7 форм',
                        labelLt: '7 formos',
                        labelEn: 'All 7 Forms',
                      },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.mode}
                      type="button"
                      onClick={() => onStartDeclension(item.mode)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-colors ${
                        trainingMode === item.mode
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-900 dark:text-amber-300'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                      }`}
                    >
                      {language === 'uk'
                        ? item.labelUk
                        : language === 'lt'
                        ? item.labelLt
                        : item.labelEn}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => onStartDeclension()}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-semibold text-xs hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 min-h-[38px]"
                >
                  <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                  <span>
                    {language === 'uk'
                      ? 'Тренувати іменники'
                      : language === 'lt'
                      ? 'Treniruoti daiktavardžius'
                      : 'Practice Nouns'}
                  </span>
                </button>
              </div>
            </div>

            {/* Track 2: Verb Conjugation */}
            <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/90 dark:border-indigo-800/70 flex flex-col justify-between gap-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                    {language === 'uk'
                      ? '2. Дієслова'
                      : language === 'lt'
                      ? '2. Veiksmažodžiai'
                      : '2. Verbs'}
                  </span>
                  <span className="text-[11px] font-mono font-semibold text-indigo-700 dark:text-indigo-300 tabular-nums">
                    {masteredVerbsCount}/{ALL_VERIFIED_VERBS.length}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {language === 'uk'
                    ? 'Дієвідмінювання (4 часи)'
                    : language === 'lt'
                    ? 'Asmenavimas (4 laikai)'
                    : 'Conjugation (4 Tenses)'}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                  {language === 'uk'
                    ? 'I–III дієвідміни (-a/-ia, -i, -o), 3 основні форми, особові закінчення та зворотні -tis.'
                    : language === 'lt'
                    ? 'I–III asmenuotės (-a/-ia, -i, -o), 3 pagrindinės formos, sangrąža -tis.'
                    : 'I–III conjugations (-a/-ia, -i, -o), 3 stems, person endings & reflexive -tis.'}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  <span className="px-2 py-0.5 rounded-md bg-white/90 dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/70 text-[10px] font-mono font-semibold text-indigo-900 dark:text-indigo-300">
                    Esamasis
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white/90 dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/70 text-[10px] font-mono font-semibold text-indigo-900 dark:text-indigo-300">
                    Būtasis
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white/90 dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/70 text-[10px] font-mono font-semibold text-indigo-900 dark:text-indigo-300">
                    Būsimasis
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onStartVerbs}
                  className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 min-h-[38px]"
                >
                  <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                  <span>
                    {language === 'uk'
                      ? 'Тренувати дієслова'
                      : language === 'lt'
                      ? 'Treniruoti veiksmažodžius'
                      : 'Practice Verbs'}
                  </span>
                </button>
              </div>
            </div>

            {/* Track 3: Vocabulary Flashcards & Dictionary */}
            <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/90 dark:border-amber-800/60 flex flex-col justify-between gap-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                    {language === 'uk'
                      ? '3. Картки'
                      : language === 'lt'
                      ? '3. Kortelės'
                      : '3. Flashcards'}
                  </span>
                  <span className="text-[11px] font-mono font-semibold text-amber-800 dark:text-amber-300 tabular-nums">
                    1500{' '}
                    {language === 'uk'
                      ? 'слів'
                      : language === 'lt'
                      ? 'žodž.'
                      : 'words'}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {language === 'uk'
                    ? 'Словникові картки (LT ↔ УКР)'
                    : language === 'lt'
                    ? 'Žodyno kortelės (1000 + 500)'
                    : 'Vocabulary Cards (LT ↔ EN)'}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                  {language === 'uk'
                    ? 'Запам’ятовуйте іменники та дієслова за рівнями A0–B2, темами та обраними словами.'
                    : language === 'lt'
                    ? 'Mokykitės daiktavardžių ir veiksmažodžių pagal A0–B2 lygius ir temas.'
                    : 'Memorize nouns and verbs filtered by CEFR A0–B2 levels, topics, and favorites.'}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={onOpenDictionary}
                    className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-amber-300/80 dark:border-amber-800 text-[10px] font-semibold text-amber-900 dark:text-amber-300 hover:bg-amber-100/60 transition-colors"
                  >
                    {t.nav.dictionary} (1500)
                  </button>
                  {progress.favorites.length > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-[10px] font-semibold text-amber-900 dark:text-amber-300">
                      ★ {progress.favorites.length}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onStartFlashcards}
                  className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 min-h-[38px]"
                >
                  <Layers className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {language === 'uk'
                      ? 'Відкрити картки'
                      : language === 'lt'
                      ? 'Atverti korteles'
                      : 'Open Flashcards'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar inside Left Hero: Quick Shortcuts (Dictionary, Reference Table, Mistakes, Favorites) */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onOpenDictionary}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>
                  {language === 'uk'
                    ? 'Словник + Грам. аналіз'
                    : language === 'lt'
                    ? 'Žodynas + Gram. analizė'
                    : 'Dictionary + Grammar Analysis'}
                </span>
              </button>

              <button
                type="button"
                onClick={onOpenReference}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
              >
                <Table2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>
                  {language === 'uk'
                    ? 'Таблиці закінчень та правила'
                    : language === 'lt'
                    ? 'Galūnių lentelės ir taisyklės'
                    : 'Endings Tables & Rules'}
                </span>
              </button>

              {progress.recentMistakes.length > 0 && (
                <button
                  type="button"
                  onClick={() => onStartDeclension('mistakes')}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/70 text-xs font-semibold text-rose-800 dark:text-rose-300 hover:bg-rose-100 transition-colors"
                >
                  {language === 'uk'
                    ? `Помилки (${progress.recentMistakes.length})`
                    : language === 'lt'
                    ? `Klaidos (${progress.recentMistakes.length})`
                    : `Mistakes (${progress.recentMistakes.length})`}
                </button>
              )}
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              {t.dailyGoalTitle}:{' '}
              <strong className="text-slate-900 dark:text-white">
                {todayCompleted}/{progress.dailyGoal}
              </strong>{' '}
              ({dailyGoalPct}%)
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Dual Grammar Cheat-Sheet Switcher (Дієслова I–III vs Іменники I–V) */}
        <div className="lg:col-span-5 p-5 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4 shadow-xs">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {language === 'uk'
                    ? 'Інтерактивна шпаргалка системи'
                    : language === 'lt'
                    ? 'Interaktyvi sistemos atmintinė'
                    : 'Interactive Grammar Cheat-Sheet'}
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {cheatSheetTab === 'verbs'
                    ? language === 'uk'
                      ? 'Дієслова: I–III дієвідміни та 4 часи'
                      : language === 'lt'
                      ? 'Veiksmažodžiai: I–III asmenuotės ir 4 laikai'
                      : 'Verbs: I–III Conjugations & 4 Tenses'
                    : language === 'uk'
                    ? 'Іменники: 5 відмін та 7 відмінків'
                    : language === 'lt'
                    ? 'Daiktavardžiai: 5 linksniuotės ir 7 linksniai'
                    : 'Nouns: 5 Declensions & 7 Cases'}
                </h2>
              </div>

              {/* 2-Tab Switcher: Дієслова | Іменники */}
              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                <button
                  type="button"
                  onClick={() => setCheatSheetTab('verbs')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    cheatSheetTab === 'verbs'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {language === 'uk'
                    ? 'Дієслова'
                    : language === 'lt'
                    ? 'Veiksmažodžiai'
                    : 'Verbs'}
                </button>
                <button
                  type="button"
                  onClick={() => setCheatSheetTab('nouns')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    cheatSheetTab === 'nouns'
                      ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {language === 'uk'
                    ? 'Іменники'
                    : language === 'lt'
                    ? 'Daiktavardžiai'
                    : 'Nouns'}
                </button>
              </div>
            </div>

            {cheatSheetTab === 'verbs' ? (
              <div className="space-y-3">
                {/* 3 Principal Forms Formula Banner */}
                <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60">
                  <div className="text-[11px] font-bold text-indigo-900 dark:text-indigo-300">
                    {language === 'uk'
                      ? '3 основні форми литовського дієслова (Pagrindinės formos):'
                      : language === 'lt'
                      ? '3 pagrindinės veiksmažodžio formos:'
                      : '3 Principal Forms of Every Lithuanian Verb:'}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs font-mono font-bold text-slate-900 dark:text-white">
                    <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800">
                      1. Bendratis (-ti)
                    </span>
                    <span className="text-indigo-500">→</span>
                    <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800">
                      2. Esamasis 3 asm. (-a / -i / -o)
                    </span>
                    <span className="text-indigo-500">→</span>
                    <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800">
                      3. Būtasis 3 asm. (-o / -ė)
                    </span>
                  </div>
                </div>

                {/* I-III Conjugations Table */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {([1, 2, 3] as VerbConjugationType[]).map((conj) => {
                    const meta = VERB_CONJUGATIONS_METADATA[conj];
                    return (
                      <div
                        key={conj}
                        className="py-2 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {meta.titleLt}
                            </span>
                            <span className="font-mono text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                              aš {meta.endingsPresent.as}, tu{' '}
                              {meta.endingsPresent.tu}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {meta.examplesLt.join(', ')}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={onStartVerbs}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition-colors shrink-0"
                        >
                          {language === 'uk'
                            ? 'Тренувати'
                            : language === 'lt'
                            ? 'Treniruoti'
                            : 'Practice'}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* 4 Tenses / Moods Summary Grid */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {(
                    [
                      {
                        tense: 'present' as VerbTense,
                        formula: '2 осн. (-a/-i/-o)',
                      },
                      {
                        tense: 'past' as VerbTense,
                        formula: '3 осн. (-o / -ė)',
                      },
                      {
                        tense: 'future' as VerbTense,
                        formula: 'Інф. + -s- (-siu, -si, -s)',
                      },
                      {
                        tense: 'imperative' as VerbTense,
                        formula: 'Інф. + -k- (-k, -kite)',
                      },
                    ] as const
                  ).map((item) => (
                    <div
                      key={item.tense}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70"
                    >
                      <div className="text-[11px] font-bold text-slate-900 dark:text-white">
                        {VERB_TENSES_METADATA[item.tense].shortLt} (
                        {VERB_TENSES_METADATA[item.tense].questionLt})
                      </div>
                      <div className="text-[10px] font-mono text-indigo-700 dark:text-indigo-300 mt-0.5">
                        {item.formula}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* 5 Declensions List with 1-click practice */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {DECLENSION_PDF_TABLE.map((col) => (
                    <div
                      key={col.declension}
                      className="py-2 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {col.titleLt}
                        </span>
                        <span className="text-slate-400 mx-1.5">·</span>
                        <span className="font-mono text-amber-700 dark:text-amber-400 font-semibold">
                          {col.singularEndings.nom.endings} →{' '}
                          {col.singularEndings.gen.endings}
                        </span>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 italic truncate">
                          {col.singularEndings.gen.examples}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          onStartDeclensionTypePractice(col.declension)
                        }
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-900 hover:text-white dark:hover:bg-amber-500 dark:hover:text-slate-950 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition-colors shrink-0"
                      >
                        {language === 'uk'
                          ? 'Тренувати'
                          : language === 'lt'
                          ? 'Treniruoti'
                          : 'Practice'}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Clickable 7 Cases Quick Launch */}
                <div className="pt-1">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                    {language === 'uk'
                      ? 'Швидке тренування за відмінком:'
                      : language === 'lt'
                      ? 'Greita treniruotė pagal linksnį:'
                      : 'Quick practice by grammatical case:'}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {CASE_ORDER.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => onStartCasePractice(c)}
                        className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        {CASES_METADATA[c].nameLt} (
                        {CASES_METADATA[c].questionLt})
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={onOpenReference}
              className="text-amber-700 dark:text-amber-400 font-semibold hover:underline flex items-center gap-1"
            >
              <span>
                {language === 'uk'
                  ? 'Повна таблиця закінчень іменників та дієслів'
                  : language === 'lt'
                  ? 'Pilna daiktavardžių ir veiksmažodžių lentelė'
                  : 'Full Noun & Verb Endings Reference'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: INTERACTIVE LIVE CONSTRUCTOR — VERB + NOUN (CASE GOVERNANCE) */}
      <div className="p-5 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <Compass className="w-4 h-4" />
              <span>
                {language === 'uk'
                  ? 'Живий конструктор речень: Дієслово + Іменник (Керування відмінками)'
                  : language === 'lt'
                  ? 'Gyvas sakinių konstruktorius: Veiksmažodis + Daiktavardis (Linksnių valdymas)'
                  : 'Interactive Sentence Builder: Verb + Noun (Case Governance)'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {language === 'uk'
                ? 'Як литовське дієслово змінює закінчення іменника у реченні'
                : language === 'lt'
                ? 'Kaip veiksmažodis valdo daiktavardžio linksnį sakinyje'
                : 'How Lithuanian Verbs Govern Noun Case Endings in Real Sentences'}
            </h2>
          </div>

          {/* 5 Case Governance Pattern Selector Buttons */}
          <div className="flex flex-wrap gap-1.5">
            {GOVERNANCE_PRESETS.map((preset) => {
              const active = preset.id === activePreset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedPresetId(preset.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                    active
                      ? 'bg-slate-900 text-white border-slate-900 dark:bg-amber-500 dark:text-slate-950 dark:border-amber-500'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  + {preset.questionLt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Controls Row: Tense, Person, Number */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70">
          {/* Tense Selector */}
          <div className="md:col-span-5 space-y-1.5">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {language === 'uk'
                ? '1. Час / спосіб дієслова:'
                : language === 'lt'
                ? '1. Veiksmažodžio laikas:'
                : '1. Verb Tense / Mood:'}
            </div>
            <div className="flex flex-wrap gap-1">
              {(
                ['present', 'past', 'future', 'imperative'] as VerbTense[]
              ).map((tense) => (
                <button
                  key={tense}
                  type="button"
                  onClick={() => setSandboxTense(tense)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    sandboxTense === tense
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {VERB_TENSES_METADATA[tense].shortLt}
                </button>
              ))}
            </div>
          </div>

          {/* Person Selector */}
          <div className="md:col-span-5 space-y-1.5">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {language === 'uk'
                ? '2. Особа займенника:'
                : language === 'lt'
                ? '2. Asmuo:'
                : '2. Grammatical Person:'}
            </div>
            <div className="flex flex-wrap gap-1">
              {VERB_PERSON_ORDER.map((person) => {
                const disabledInImp =
                  sandboxTense === 'imperative' &&
                  person !== 'tu' &&
                  person !== 'mes' &&
                  person !== 'jus';
                return (
                  <button
                    key={person}
                    type="button"
                    disabled={disabledInImp}
                    onClick={() => setSandboxPerson(person)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      effectiveSandboxPerson === person
                        ? 'bg-indigo-600 text-white'
                        : disabledInImp
                        ? 'opacity-35 cursor-not-allowed bg-slate-100 dark:bg-slate-900 text-slate-400'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {VERB_PERSONS_METADATA[person].pronounLt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Noun Number Selector */}
          <div className="md:col-span-2 space-y-1.5">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {language === 'uk'
                ? '3. Число іменника:'
                : language === 'lt'
                ? '3. Daiktavardžio sk.:'
                : '3. Noun Number:'}
            </div>
            <div className="flex gap-1">
              {(['sg', 'pl'] as const).map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setSandboxNumber(num)}
                  className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold transition-colors ${
                    sandboxNumber === num
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {num === 'sg'
                    ? language === 'uk'
                      ? 'Одн.'
                      : 'Vns.'
                    : language === 'uk'
                    ? 'Мн.'
                    : 'Dgs.'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Sentence Display + Segmented Breakdown Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* Synthesized Live Sentence Box */}
          <div className="lg:col-span-5 p-4 sm:p-5 rounded-xl bg-slate-900 dark:bg-slate-950 text-white flex flex-col justify-between gap-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400">
                  {VERB_TENSES_METADATA[sandboxTense].nameLt} ·{' '}
                  {CASES_METADATA[activePreset.governedCase].nameLt}
                </span>
                <button
                  type="button"
                  onClick={(e) => speakLithuanian(liveFullSentenceLt, e)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors flex items-center gap-1 text-xs font-semibold"
                  title="Озвучити речення"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Highlighted Stem + Ending Live Formula */}
              <div className="text-xl sm:text-2xl font-bold tracking-tight leading-snug pt-1">
                <span className="text-slate-300">{pronounDisplay} </span>
                <span className="text-white">{sandboxVerbSeg.stem}</span>
                <span className="text-indigo-400 underline decoration-indigo-400/80 decoration-2 underline-offset-4">
                  {sandboxVerbSeg.ending}
                </span>{' '}
                <span className="text-white">{sandboxNounSeg.stem}</span>
                <span className="text-amber-400 underline decoration-amber-400/80 decoration-2 underline-offset-4">
                  {sandboxNounSeg.ending}
                </span>
                {sandboxTense === 'imperative' ? '!' : '.'}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                {language === 'uk'
                  ? activePreset.noteUk
                  : language === 'lt'
                  ? activePreset.noteLt
                  : activePreset.noteEn}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
              <span>
                {language === 'uk' ? 'Дієслово:' : 'Verb:'}{' '}
                <strong className="text-indigo-300">
                  {sandboxVerb.infinitive}
                </strong>{' '}
                ({language === 'en' ? sandboxVerb.en : sandboxVerb.uk})
              </span>
              <span>
                {language === 'uk' ? 'Іменник:' : 'Noun:'}{' '}
                <strong className="text-amber-300">{sandboxNoun.lemma}</strong>{' '}
                ({language === 'en' ? sandboxNoun.en : sandboxNoun.uk})
              </span>
            </div>
          </div>

          {/* Verb Morphological Breakdown Card */}
          <div className="lg:col-span-3.5 p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-800/60 flex flex-col justify-between gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                  {language === 'uk'
                    ? 'Дієслово у фразі'
                    : language === 'lt'
                    ? 'Veiksmažodis'
                    : 'Verb in Phrase'}
                </span>
                <span className="text-[11px] font-mono font-semibold text-indigo-700 dark:text-indigo-300">
                  {VERB_CONJUGATIONS_METADATA[sandboxVerb.conjugation].titleLt}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="text-base font-bold font-mono text-slate-900 dark:text-white">
                  {sandboxVerb.infinitive} → {sandboxVerb.present3} →{' '}
                  {sandboxVerb.past3}
                </div>
                <button
                  type="button"
                  onClick={(e) => speakLithuanian(sandboxVerb.infinitive, e)}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 transition-colors shrink-0"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300">
                {language === 'uk' ? 'Форма:' : 'Form:'}{' '}
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {sandboxVerbSeg.stem}
                  <span className="text-indigo-600 dark:text-indigo-400">
                    -{sandboxVerbSeg.ending || '∅'}
                  </span>
                </span>{' '}
                ·{' '}
                {
                  VERB_GOVERNED_CASES_METADATA[sandboxVerb.governedCase]
                    .shortBadge[language]
                }
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <button
                type="button"
                onClick={() =>
                  setAnalysisTarget({
                    kind: 'verb',
                    verb: sandboxVerb,
                    matchedForm: sandboxVerbForm,
                  })
                }
                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100/60 transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>
                  {language === 'uk'
                    ? 'Грам. аналіз'
                    : language === 'lt'
                    ? 'Gram. analizė'
                    : 'Grammar Analysis'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onPracticeSpecificVerb(sandboxVerb.id)}
                className="px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white text-[11px] font-semibold hover:bg-indigo-500 transition-colors flex items-center gap-1"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>
                  {language === 'uk'
                    ? 'Тренувати'
                    : language === 'lt'
                    ? 'Treniruoti'
                    : 'Practice'}
                </span>
              </button>
            </div>
          </div>

          {/* Noun Morphological Breakdown Card */}
          <div className="lg:col-span-3.5 p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/60 flex flex-col justify-between gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  {language === 'uk'
                    ? 'Керований іменник'
                    : language === 'lt'
                    ? 'Valdomas daiktavardis'
                    : 'Governed Noun'}
                </span>
                <span className="text-[11px] font-mono font-semibold text-amber-800 dark:text-amber-300">
                  {sandboxNoun.declension} linksniuotė
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="text-base font-bold font-mono text-slate-900 dark:text-white">
                  {sandboxNoun.sg.nom} → {sandboxNounForm}
                </div>
                <button
                  type="button"
                  onClick={(e) => speakLithuanian(sandboxNounForm, e)}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 transition-colors shrink-0"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300">
                {CASES_METADATA[activePreset.governedCase].nameLt} (
                {CASES_METADATA[activePreset.governedCase].questionLt}):{' '}
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {sandboxNounSeg.stem}
                  <span className="text-amber-700 dark:text-amber-400">
                    -{sandboxNounSeg.ending}
                  </span>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <button
                type="button"
                onClick={() =>
                  setAnalysisTarget({
                    kind: 'noun',
                    noun: sandboxNoun,
                    initialCase: activePreset.governedCase,
                    initialNumber: sandboxNumber,
                  })
                }
                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-[11px] font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-100/60 transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>
                  {language === 'uk'
                    ? 'Грам. аналіз'
                    : language === 'lt'
                    ? 'Gram. analizė'
                    : 'Grammar Analysis'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onPracticeSpecificNoun(sandboxNoun.id)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 text-[11px] font-semibold hover:opacity-90 transition-opacity flex items-center gap-1"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>
                  {language === 'uk'
                    ? 'Тренувати'
                    : language === 'lt'
                    ? 'Treniruoti'
                    : 'Practice'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: FEATURED NOUN & VERB OF THE DAY (QUICK ANALYSIS & PRACTICE) */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {language === 'uk'
                ? 'Іменник та Дієслово для швидкого розбору'
                : language === 'lt'
                ? 'Dienos daiktavardis ir veiksmažodis'
                : 'Featured Noun & Verb Spotlight'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'uk'
                ? 'Прослухайте вимову, перегляньте основні граматичні форми або відкрийте повний морфологічний розбір.'
                : language === 'lt'
                ? 'Paklausykite tarimo, peržiūrėkite pagrindines formas arba atverkite gramatinę analizę.'
                : 'Listen to pronunciation, inspect principal forms, or open the full morphological breakdown.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setFeaturedPairOffset((prev) => prev + 1)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>
              {language === 'uk'
                ? 'Інша пара слів'
                : language === 'lt'
                ? 'Kita žodžių pora'
                : 'Show Another Pair'}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Featured Noun Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-4 shadow-xs">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-800 dark:text-amber-300 text-[11px] font-bold">
                    {language === 'uk'
                      ? 'Іменник'
                      : language === 'lt'
                      ? 'Daiktavardis'
                      : 'Noun'}{' '}
                    · {featuredNoun.declension} linksn.
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-semibold">
                    {DIFFICULTY_CEFR_LABELS[featuredNoun.difficulty]} ·{' '}
                    {TOPICS_METADATA[featuredNoun.topic].label[language]}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleFavorite(featuredNoun.id)}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    progress.favorites.includes(featuredNoun.id)
                      ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 text-amber-500'
                      : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Star
                    className={`w-4 h-4 ${
                      progress.favorites.includes(featuredNoun.id)
                        ? 'fill-amber-400 text-amber-400'
                        : ''
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {featuredNoun.lemma}
                  </h3>
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    {language === 'en' ? featuredNoun.en : featuredNoun.uk}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => speakLithuanian(featuredNoun.lemma, e)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/20 text-slate-700 dark:text-slate-200 transition-colors shrink-0"
                  title="Озвучити"
                >
                  <Volume2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 text-xs space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2 font-mono">
                  <span className="text-slate-500 dark:text-slate-400">
                    Vns. Vard. / Kilm. / Gal.:
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {featuredNoun.sg.nom} → {featuredNoun.sg.gen} →{' '}
                    {featuredNoun.sg.acc}
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 font-mono">
                  <span className="text-slate-500 dark:text-slate-400">
                    Dgs. Vard. / Kilm.:
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {featuredNoun.pl.nom} → {featuredNoun.pl.gen}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() =>
                  setAnalysisTarget({
                    kind: 'noun',
                    noun: featuredNoun,
                    initialCase: 'gen',
                    initialNumber: 'sg',
                  })
                }
                className="px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {language === 'uk'
                    ? 'Грам. аналіз'
                    : language === 'lt'
                    ? 'Gram. analizė'
                    : 'Grammar Analysis'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onPracticeSpecificNoun(featuredNoun.id)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>
                  {language === 'uk'
                    ? 'Тренувати слово'
                    : language === 'lt'
                    ? 'Treniruoti žodį'
                    : 'Practice Word'}
                </span>
              </button>
            </div>
          </div>

          {/* Featured Verb Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-4 shadow-xs">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold">
                    {language === 'uk'
                      ? 'Дієслово'
                      : language === 'lt'
                      ? 'Veiksmažodis'
                      : 'Verb'}{' '}
                    · {VERB_CONJUGATIONS_METADATA[featuredVerb.conjugation].titleLt}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-semibold">
                    {
                      VERB_GOVERNED_CASES_METADATA[featuredVerb.governedCase]
                        .shortBadge[language]
                    }
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleFavorite(featuredVerb.id)}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    progress.favorites.includes(featuredVerb.id)
                      ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 text-amber-500'
                      : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Star
                    className={`w-4 h-4 ${
                      progress.favorites.includes(featuredVerb.id)
                        ? 'fill-amber-400 text-amber-400'
                        : ''
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                    {featuredVerb.infinitive}{' '}
                    <span className="text-sm font-normal text-slate-500">
                      ({featuredVerb.present3}, {featuredVerb.past3})
                    </span>
                  </h3>
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    {language === 'en' ? featuredVerb.en : featuredVerb.uk}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) =>
                    speakLithuanian(
                      `${featuredVerb.infinitive}, ${featuredVerb.present3}, ${featuredVerb.past3}`,
                      e
                    )
                  }
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-500/20 text-slate-700 dark:text-slate-200 transition-colors shrink-0"
                  title="Озвучити 3 форми"
                >
                  <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {featuredVerb.examples.present.fullSentenceLt}
                  </span>
                  <button
                    type="button"
                    onClick={(e) =>
                      speakLithuanian(
                        featuredVerb.examples.present.fullSentenceLt,
                        e
                      )
                    }
                    className="text-indigo-600 dark:text-indigo-400 hover:opacity-80 shrink-0"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-slate-500 dark:text-slate-400">
                  {language === 'en'
                    ? featuredVerb.examples.present.translationEn
                    : featuredVerb.examples.present.translationUk}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() =>
                  setAnalysisTarget({
                    kind: 'verb',
                    verb: featuredVerb,
                  })
                }
                className="px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {language === 'uk'
                    ? 'Грам. аналіз'
                    : language === 'lt'
                    ? 'Gram. analizė'
                    : 'Grammar Analysis'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onPracticeSpecificVerb(featuredVerb.id)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>
                  {language === 'uk'
                    ? 'Тренувати дієслово'
                    : language === 'lt'
                    ? 'Treniruoti veiksmažodį'
                    : 'Practice Verb'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: 4-COLUMN KPI & PROGRESS SUMMARY STRIP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'uk'
              ? 'База: Іменники + Дієслова'
              : language === 'lt'
              ? 'Bazė: Daiktavardžiai + Veiksmažodžiai'
              : 'Database: Nouns + Verbs'}
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
            {ALL_VERIFIED_NOUNS.length} + {ALL_VERIFIED_VERBS.length}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'uk'
              ? '14 000 відмінкових + 11 500 часових форм'
              : language === 'lt'
              ? '14 000 linksnių + 11 500 laikų formų'
              : '14,000 case forms + 11,500 verb forms'}
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {t.kpiMasteredWords}
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
            {masteredCount} /{' '}
            {ALL_VERIFIED_NOUNS.length + ALL_VERIFIED_VERBS.length}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
            {language === 'uk'
              ? `Іменники: ${masteredNounsCount} · Дієслова: ${masteredVerbsCount}`
              : language === 'lt'
              ? `Daiktav.: ${masteredNounsCount} · Veiksmaž.: ${masteredVerbsCount}`
              : `Nouns: ${masteredNounsCount} · Verbs: ${masteredVerbsCount}`}
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {t.kpiAccuracy}
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400 mt-1">
            {overallAccuracy}%
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
            {progress.totalCorrectAnswers} / {progress.totalExercisesCompleted}{' '}
            {language === 'uk'
              ? 'правильних'
              : language === 'lt'
              ? 'teisingų'
              : 'correct'}
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {t.kpiDailyStreak}
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
              {progress.currentStreak}{' '}
              <span className="text-sm font-normal text-slate-500">
                (max {progress.bestStreak})
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenStats}
            className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 mt-1"
          >
            <BarChart3 className="w-3 h-3" />
            <span>{t.nav.stats}</span>
          </button>
        </div>
      </div>

      {/* Grammar Analysis Modal for Home Page Quick Inspection */}
      {analysisTarget && (
        <GrammarAnalysisModal
          target={analysisTarget}
          language={language}
          onClose={() => setAnalysisTarget(null)}
          onSpeak={speakLithuanian}
        />
      )}
    </div>
  );
};
