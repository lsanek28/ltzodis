import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Filter,
  HelpCircle,
  Lightbulb,
  RotateCcw,
  SkipForward,
  Sparkles,
  Star,
  Table2,
  Volume2,
  X,
  XCircle,
} from 'lucide-react';
import { ALL_VERIFIED_VERBS } from '../data/verbsDatabase';
import {
  DIFFICULTY_CEFR_LABELS,
  LITHUANIAN_DIACRITICS,
  TOPICS_METADATA,
} from '../data/grammarRules';
import {
  AppLanguage,
  DifficultyLevel,
  TopicId,
  UserProgress,
  VerbConjugationType,
  VerbEntry,
  VerbPerson,
  VerbTense,
} from '../types/grammar';
import { stripLithuanianDiacritics } from '../utils/answerChecker';
import {
  generateVerbContextExample,
  segmentLithuanianVerbForm,
  VERB_CONJUGATIONS_METADATA,
  VERB_GOVERNED_CASES_METADATA,
  VERB_PERSONS_METADATA,
  VERB_PERSON_ORDER,
  VERB_TENSES_METADATA,
} from '../utils/verbConjugations';

interface VerbConjugationWorkspaceProps {
  language: AppLanguage;
  progress: UserProgress;
  onRecordVerbOutcome: (verb: VerbEntry, isCorrect: boolean) => void;
  onToggleFavorite: (wordId: string) => void;
  forcedVerbId?: string;
  onClearForcedVerb: () => void;
  onInputFocusChange?: (focused: boolean) => void;
}

function speakLithuanian(text: string, e?: React.MouseEvent) {
  if (e) e.stopPropagation();
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'lt-LT';
    utterance.rate = 0.92;
    window.speechSynthesis.speak(utterance);
  } catch {
    // Ignore speech synthesis errors on unsupported browsers
  }
}

interface VerbTask {
  verb: VerbEntry;
  tense: VerbTense;
  person: VerbPerson;
  expectedForm: string;
}

export const VerbConjugationWorkspace: React.FC<
  VerbConjugationWorkspaceProps
> = ({
  language,
  progress,
  onRecordVerbOutcome,
  onToggleFavorite,
  forcedVerbId,
  onClearForcedVerb,
  onInputFocusChange,
}) => {
  const [selectedTenseFilter, setSelectedTenseFilter] = useState<
    VerbTense | 'mixed' | 'full_paradigm'
  >('mixed');
  const [selectedConjugation, setSelectedConjugation] = useState<
    VerbConjugationType | 'all'
  >('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    DifficultyLevel | 'all'
  >('all');
  const [selectedTopic, setSelectedTopic] = useState<TopicId | 'all'>('all');
  const [onlyReflexive, setOnlyReflexive] = useState(false);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [userInput, setUserInput] = useState('');
  const [checkedResult, setCheckedResult] = useState<{
    isCorrect: boolean;
    diacriticWarning: boolean;
    userAnswer: string;
    expectedForm: string;
  } | null>(null);
  const [hintVisible, setHintVisible] = useState(false);
  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);

  // Full paradigm mode state (all 5 distinct person forms for a chosen tense)
  const [paradigmTense, setParadigmTense] = useState<
    'present' | 'past' | 'future'
  >('present');
  const [paradigmInputs, setParadigmInputs] = useState<
    Record<'as' | 'tu' | 'jis' | 'mes' | 'jus', string>
  >({
    as: '',
    tu: '',
    jis: '',
    mes: '',
    jus: '',
  });
  const [paradigmChecked, setParadigmChecked] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const filteredPool = useMemo(() => {
    const pool = ALL_VERIFIED_VERBS.filter((v) => {
      if (selectedConjugation !== 'all' && v.conjugation !== selectedConjugation)
        return false;
      if (selectedDifficulty !== 'all' && v.difficulty !== selectedDifficulty)
        return false;
      if (selectedTopic !== 'all' && v.topic !== selectedTopic) return false;
      if (onlyReflexive && !v.isReflexive) return false;
      if (onlyFavorites && !progress.favorites.includes(v.id)) return false;
      return true;
    });
    return pool.length > 0 ? pool : ALL_VERIFIED_VERBS;
  }, [
    selectedConjugation,
    selectedDifficulty,
    selectedTopic,
    onlyReflexive,
    onlyFavorites,
    progress.favorites,
  ]);

  const buildRandomTask = (
    pool: VerbEntry[],
    overrideVerbId?: string,
    prevVerbId?: string
  ): VerbTask => {
    let chosenVerb: VerbEntry | undefined;
    if (overrideVerbId) {
      chosenVerb = ALL_VERIFIED_VERBS.find((v) => v.id === overrideVerbId);
    }
    if (!chosenVerb) {
      const candidates =
        pool.length > 1 && prevVerbId
          ? pool.filter((v) => v.id !== prevVerbId)
          : pool;
      chosenVerb =
        candidates[Math.floor(Math.random() * candidates.length)] ??
        ALL_VERIFIED_VERBS[0];
    }

    const activeTense: VerbTense =
      selectedTenseFilter === 'mixed' || selectedTenseFilter === 'full_paradigm'
        ? (['present', 'past', 'future', 'imperative'] as VerbTense[])[
            Math.floor(Math.random() * 4)
          ]
        : selectedTenseFilter;

    const personCandidates: VerbPerson[] =
      activeTense === 'imperative'
        ? ['tu', 'mes', 'jus']
        : ['as', 'tu', 'jis', 'mes', 'jus'];

    const chosenPerson =
      personCandidates[Math.floor(Math.random() * personCandidates.length)];

    const expectedForm =
      activeTense === 'present'
        ? chosenVerb.present[chosenPerson]
        : activeTense === 'past'
        ? chosenVerb.past[chosenPerson]
        : activeTense === 'future'
        ? chosenVerb.future[chosenPerson]
        : chosenVerb.imperative[chosenPerson as 'tu' | 'mes' | 'jus'];

    return {
      verb: chosenVerb,
      tense: activeTense,
      person: chosenPerson,
      expectedForm,
    };
  };

  const [currentTask, setCurrentTask] = useState<VerbTask>(() =>
    buildRandomTask(filteredPool, forcedVerbId)
  );

  useEffect(() => {
    if (forcedVerbId) {
      const next = buildRandomTask(filteredPool, forcedVerbId);
      setCurrentTask(next);
      setUserInput('');
      setCheckedResult(null);
      setHintVisible(false);
      onClearForcedVerb();
    }
  }, [forcedVerbId]);

  useEffect(() => {
    const next = buildRandomTask(filteredPool, undefined, currentTask.verb.id);
    setCurrentTask(next);
    setUserInput('');
    setCheckedResult(null);
    setHintVisible(false);
    setParadigmChecked(false);
    setParadigmInputs({ as: '', tu: '', jis: '', mes: '', jus: '' });
  }, [
    selectedTenseFilter,
    selectedConjugation,
    selectedDifficulty,
    selectedTopic,
    onlyReflexive,
    onlyFavorites,
  ]);

  const handleNextTask = () => {
    const next = buildRandomTask(filteredPool, undefined, currentTask.verb.id);
    setCurrentTask(next);
    setUserInput('');
    setCheckedResult(null);
    setHintVisible(false);
    setParadigmChecked(false);
    setParadigmInputs({ as: '', tu: '', jis: '', mes: '', jus: '' });
    setTimeout(() => inputRef.current?.focus(), 30);
  };

  const handleCheckAnswer = () => {
    if (checkedResult) {
      handleNextTask();
      return;
    }
    const trimmed = userInput.trim().toLowerCase();
    if (!trimmed) return;

    const expectedLower = currentTask.expectedForm.toLowerCase();
    const isExact = trimmed === expectedLower;
    const isAsciiMatch =
      !isExact &&
      stripLithuanianDiacritics(trimmed) ===
        stripLithuanianDiacritics(expectedLower);
    const isCorrect = isExact || isAsciiMatch;

    setCheckedResult({
      isCorrect,
      diacriticWarning: isAsciiMatch,
      userAnswer: userInput.trim(),
      expectedForm: currentTask.expectedForm,
    });
    setSessionCount((c) => c + 1);
    if (isCorrect) setSessionCorrect((c) => c + 1);
    onRecordVerbOutcome(currentTask.verb, isCorrect);
  };

  const handleRevealAnswer = () => {
    if (checkedResult) return;
    setCheckedResult({
      isCorrect: false,
      diacriticWarning: false,
      userAnswer: userInput.trim() || '—',
      expectedForm: currentTask.expectedForm,
    });
    setSessionCount((c) => c + 1);
    onRecordVerbOutcome(currentTask.verb, false);
  };

  const handleCheckParadigm = () => {
    if (paradigmChecked) {
      handleNextTask();
      return;
    }
    setParadigmChecked(true);
    const targetForms = currentTask.verb[paradigmTense];
    const allCorrect = (['as', 'tu', 'jis', 'mes', 'jus'] as const).every(
      (p) =>
        stripLithuanianDiacritics(paradigmInputs[p].trim().toLowerCase()) ===
        stripLithuanianDiacritics(targetForms[p].toLowerCase())
    );
    setSessionCount((c) => c + 1);
    if (allCorrect) setSessionCorrect((c) => c + 1);
    onRecordVerbOutcome(currentTask.verb, allCorrect);
  };

  const insertDiacritic = (ch: string) => {
    const input = inputRef.current;
    if (!input) {
      setUserInput((prev) => prev + ch);
      return;
    }
    const start = input.selectionStart ?? userInput.length;
    const end = input.selectionEnd ?? userInput.length;
    const nextVal = userInput.slice(0, start) + ch + userInput.slice(end);
    setUserInput(nextVal);
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + 1, start + 1);
    }, 10);
  };

  const { verb, tense, person, expectedForm } = currentTask;
  const cleanInf = verb.infinitive.replace(/\s*\([^)]*\)\s*/g, '').trim();
  const isFavorite = progress.favorites.includes(verb.id);
  const conjMeta = VERB_CONJUGATIONS_METADATA[verb.conjugation];
  const tenseMeta = VERB_TENSES_METADATA[tense];
  const personMeta = VERB_PERSONS_METADATA[person];
  const govMeta = VERB_GOVERNED_CASES_METADATA[verb.governedCase];
  const segmentedExpected = segmentLithuanianVerbForm(
    expectedForm,
    tense,
    person,
    verb.isReflexive
  );
  const contextExample = useMemo(
    () =>
      generateVerbContextExample(
        {
          infinitive: cleanInf,
          uk: verb.uk,
          en: verb.en,
          topic: verb.topic,
          governedCase: verb.governedCase,
          present: verb.present,
          past: verb.past,
          future: verb.future,
          imperative: verb.imperative,
        },
        tense,
        person
      ),
    [verb, cleanInf, tense, person]
  );

  return (
    <div className="max-w-3xl mx-auto px-2.5 sm:px-6 py-2 sm:py-5 space-y-3 sm:space-y-4">
      {/* Top Control & Filter Bar */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                {
                  id: 'mixed',
                  label:
                    language === 'uk'
                      ? 'Усі часи'
                      : language === 'lt'
                      ? 'Visi laikai'
                      : 'All Tenses',
                },
                {
                  id: 'present',
                  label:
                    language === 'uk'
                      ? 'Теперішній (Esam.)'
                      : language === 'lt'
                      ? 'Esamasis l.'
                      : 'Present',
                },
                {
                  id: 'past',
                  label:
                    language === 'uk'
                      ? 'Минулий (Būt.)'
                      : language === 'lt'
                      ? 'Būtasis k. l.'
                      : 'Past',
                },
                {
                  id: 'future',
                  label:
                    language === 'uk'
                      ? 'Майбутній (Būsim.)'
                      : language === 'lt'
                      ? 'Būsimasis l.'
                      : 'Future',
                },
                {
                  id: 'imperative',
                  label:
                    language === 'uk'
                      ? 'Наказовий (-k)'
                      : language === 'lt'
                      ? 'Liepiamoji n.'
                      : 'Imperative',
                },
                {
                  id: 'full_paradigm',
                  label:
                    language === 'uk'
                      ? 'Таблиця 6 осіб'
                      : language === 'lt'
                      ? 'Visi asmenys'
                      : 'Full Paradigm',
                },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedTenseFilter(tab.id)}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition-colors ${
                  selectedTenseFilter === tab.id
                    ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              {filteredPool.length} / {ALL_VERIFIED_VERBS.length}
            </span>
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
                filtersOpen ||
                selectedConjugation !== 'all' ||
                selectedDifficulty !== 'all' ||
                selectedTopic !== 'all' ||
                onlyReflexive ||
                onlyFavorites
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-900 dark:text-amber-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>
                {language === 'uk'
                  ? 'Фільтри'
                  : language === 'lt'
                  ? 'Filtrai'
                  : 'Filters'}
              </span>
            </button>
          </div>
        </div>

        {filtersOpen && (
          <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-2.5 text-xs">
            {/* Conjugation Type 1, 2, 3 */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-semibold text-slate-500 dark:text-slate-400 mr-1">
                {language === 'uk'
                  ? 'Дієвідміна:'
                  : language === 'lt'
                  ? 'Asmenuotė:'
                  : 'Conjugation:'}
              </span>
              {(['all', 1, 2, 3] as const).map((c) => (
                <button
                  key={String(c)}
                  type="button"
                  onClick={() => setSelectedConjugation(c)}
                  className={`px-2.5 py-1 rounded-lg font-medium border transition-colors ${
                    selectedConjugation === c
                      ? 'bg-slate-900 text-white border-slate-900 dark:bg-amber-500 dark:text-slate-950 dark:border-amber-500 font-semibold'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {c === 'all'
                    ? language === 'uk'
                      ? 'Усі (1–3)'
                      : 'Visos (1–3)'
                    : `${c} дієв. (${VERB_CONJUGATIONS_METADATA[c].endingBadge})`}
                </button>
              ))}
            </div>

            {/* Difficulty Level */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-semibold text-slate-500 dark:text-slate-400 mr-1">
                {language === 'uk'
                  ? 'Рівень:'
                  : language === 'lt'
                  ? 'Lygis:'
                  : 'Level:'}
              </span>
              {(['all', 1, 2, 3, 4] as const).map((lvl) => (
                <button
                  key={String(lvl)}
                  type="button"
                  onClick={() => setSelectedDifficulty(lvl)}
                  className={`px-2.5 py-1 rounded-lg font-medium border transition-colors ${
                    selectedDifficulty === lvl
                      ? 'bg-slate-900 text-white border-slate-900 dark:bg-amber-500 dark:text-slate-950 dark:border-amber-500 font-semibold'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {lvl === 'all'
                    ? language === 'uk'
                      ? 'Усі рівні'
                      : 'All'
                    : `L${lvl} (${DIFFICULTY_CEFR_LABELS[lvl]})`}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setOnlyReflexive((v) => !v)}
                className={`px-2.5 py-1 rounded-lg font-medium border transition-colors ${
                  onlyReflexive
                    ? 'bg-indigo-600 text-white border-indigo-600 font-semibold'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {language === 'uk'
                  ? 'Зворотні (-tis / -si)'
                  : language === 'lt'
                  ? 'Sangrąžiniai (-si)'
                  : 'Reflexive (-si)'}
              </button>

              <button
                type="button"
                onClick={() => setOnlyFavorites((v) => !v)}
                className={`px-2.5 py-1 rounded-lg font-medium border transition-colors ${
                  onlyFavorites
                    ? 'bg-amber-500 text-slate-950 border-amber-500 font-semibold'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                ★{' '}
                {language === 'uk'
                  ? 'Обрані'
                  : language === 'lt'
                  ? 'Mėgstami'
                  : 'Favorites'}
              </button>
            </div>

            {/* Topic Filter */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-semibold text-slate-500 dark:text-slate-400 mr-1">
                {language === 'uk'
                  ? 'Тема:'
                  : language === 'lt'
                  ? 'Tema:'
                  : 'Topic:'}
              </span>
              <button
                type="button"
                onClick={() => setSelectedTopic('all')}
                className={`px-2 py-1 rounded-lg font-medium border transition-colors ${
                  selectedTopic === 'all'
                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-amber-500 dark:text-slate-950'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {language === 'uk' ? 'Усі 14 тем' : 'All'}
              </button>
              {(Object.keys(TOPICS_METADATA) as TopicId[]).map((top) => (
                <button
                  key={top}
                  type="button"
                  onClick={() => setSelectedTopic(top)}
                  className={`px-2 py-1 rounded-lg font-medium border transition-colors ${
                    selectedTopic === top
                      ? 'bg-slate-900 text-white border-slate-900 dark:bg-amber-500 dark:text-slate-950'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {TOPICS_METADATA[top].label[language]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Verb Exercise Card */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        {/* Card Header: Badges & Favorite / Full Table Trigger */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-500/15 text-amber-900 dark:text-amber-300 font-bold">
              {conjMeta.title[language]}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
              {TOPICS_METADATA[verb.topic].label[language]}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 font-semibold">
              {govMeta.shortBadge[language]}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono font-bold">
              {DIFFICULTY_CEFR_LABELS[verb.difficulty]}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setTableModalOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 flex items-center gap-1"
            >
              <Table2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>
                {language === 'uk'
                  ? 'Таблиця'
                  : language === 'lt'
                  ? 'Lentelė'
                  : 'Table'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => onToggleFavorite(verb.id)}
              className={`p-1.5 rounded-lg border transition-colors ${
                isFavorite
                  ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 text-amber-500'
                  : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-amber-500'
              }`}
              title="Favorite"
            >
              <Star
                className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* Verb Base Lemma + 3 Principal Forms + Audio Button on the Right */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
                {language === 'uk'
                  ? 'Дієслово (3 основні форми)'
                  : language === 'lt'
                  ? 'Veiksmažodis (3 pagrindinės formos)'
                  : 'Verb (3 Principal Forms)'}
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
                {verb.infinitive}{' '}
                <span className="text-sm sm:text-base font-mono font-semibold text-amber-700 dark:text-amber-400">
                  ({cleanInf}, {verb.present3}, {verb.past3})
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) =>
                speakLithuanian(
                  `${cleanInf}, ${verb.present3}, ${verb.past3}`,
                  e
                )
              }
              className="p-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 transition-colors shrink-0"
              title="Прослухати 3 основні форми литовською"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          <div className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-200">
            {language === 'en' ? verb.en : `${verb.uk} · ${verb.en}`}
          </div>
        </div>

        {selectedTenseFilter === 'full_paradigm' ? (
          /* Full Paradigm Mode for Verbs */
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {language === 'uk'
                  ? 'Оберіть час для заповнення всіх осіб:'
                  : 'Select tense:'}
              </div>
              <div className="flex gap-1.5">
                {(['present', 'past', 'future'] as const).map((tKey) => (
                  <button
                    key={tKey}
                    type="button"
                    onClick={() => {
                      setParadigmTense(tKey);
                      setParadigmChecked(false);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      paradigmTense === tKey
                        ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {VERB_TENSES_METADATA[tKey].shortLt}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(['as', 'tu', 'jis', 'mes', 'jus'] as const).map((pKey) => {
                const expected = verb[paradigmTense][pKey];
                const userVal = paradigmInputs[pKey];
                const isMatch =
                  paradigmChecked &&
                  stripLithuanianDiacritics(userVal.trim().toLowerCase()) ===
                    stripLithuanianDiacritics(expected.toLowerCase());
                return (
                  <div
                    key={pKey}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center gap-2"
                  >
                    <span className="w-24 text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
                      {VERB_PERSONS_METADATA[pKey].label[language]}
                    </span>
                    <input
                      type="text"
                      value={userVal}
                      disabled={paradigmChecked}
                      onChange={(e) =>
                        setParadigmInputs((prev) => ({
                          ...prev,
                          [pKey]: e.target.value,
                        }))
                      }
                      placeholder="..."
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-mono font-bold"
                    />
                    {paradigmChecked && (
                      <span
                        className={`text-xs font-mono font-bold ${
                          isMatch
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {expected}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleCheckParadigm}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-bold text-xs sm:text-sm"
              >
                {paradigmChecked
                  ? language === 'uk'
                    ? 'Наступне дієслово →'
                    : 'Next Verb →'
                  : language === 'uk'
                  ? 'Перевірити всі особи'
                  : 'Check All Persons'}
              </button>
            </div>
          </div>
        ) : (
          /* Single-Form Verb Exercise */
          <div className="space-y-3">
            {/* Target Tense & Person Prompt */}
            <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-amber-900 dark:text-amber-300">
                  {tenseMeta.title[language]}
                </div>
                <div className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {personMeta.label[language]} —{' '}
                  <span className="font-mono text-amber-700 dark:text-amber-400">
                    {personMeta.pronounLt} ___
                  </span>
                </div>
              </div>
              <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {tenseMeta.questionLt}
              </div>
            </div>

            {/* Lithuanian Diacritics Virtual Key Strip */}
            <div className="flex flex-wrap items-center gap-1">
              {LITHUANIAN_DIACRITICS.map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => insertDiacritic(ch)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-mono font-bold text-xs sm:text-sm border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  {ch}
                </button>
              ))}
            </div>

            {/* Answer Input & Submit Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onFocus={() => onInputFocusChange?.(true)}
                  onBlur={() => onInputFocusChange?.(false)}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCheckAnswer();
                    }
                  }}
                  placeholder={`${personMeta.pronounLt} ... (${cleanInf})`}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 focus:border-amber-500 dark:focus:border-amber-400 outline-none text-base font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCheckAnswer}
                  className="flex-1 sm:flex-initial px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 font-bold text-sm transition-colors"
                >
                  {checkedResult
                    ? language === 'uk'
                      ? 'Далі →'
                      : language === 'lt'
                      ? 'Toliau →'
                      : 'Next →'
                    : language === 'uk'
                    ? 'Перевірити'
                    : language === 'lt'
                    ? 'Tikrinti'
                    : 'Check'}
                </button>

                {!checkedResult && (
                  <>
                    <button
                      type="button"
                      onClick={() => setHintVisible((v) => !v)}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Підказка"
                    >
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                    </button>
                    <button
                      type="button"
                      onClick={handleRevealAnswer}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Показати відповідь"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={handleNextTask}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Пропустити"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Hint Banner */}
            {hintVisible && !checkedResult && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-950 dark:text-amber-200 space-y-1">
                <div className="font-bold">
                  💡 {tenseMeta.description[language]}
                </div>
                <div>
                  Основа: <span className="font-mono font-bold">{segmentedExpected.stem}-</span> + закінчення{' '}
                  <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
                    -{segmentedExpected.ending}
                  </span>
                </div>
              </div>
            )}

            {/* Answer Evaluation & Contextual Sentence Block */}
            {checkedResult && (
              <div
                className={`p-4 rounded-2xl border space-y-3 ${
                  checkedResult.isCorrect
                    ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                    : 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {checkedResult.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                    )}
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {checkedResult.isCorrect
                          ? language === 'uk'
                            ? 'Правильно!'
                            : language === 'lt'
                            ? 'Teisingai!'
                            : 'Correct!'
                          : language === 'uk'
                          ? 'Потрібно запам’ятати правильну форму:'
                          : language === 'lt'
                          ? 'Teisinga forma:'
                          : 'Correct form:'}
                      </div>
                      <div className="text-lg font-extrabold font-mono mt-0.5 text-slate-900 dark:text-white">
                        {personMeta.pronounLt}{' '}
                        <span>{segmentedExpected.stem}</span>
                        <span className="text-amber-600 dark:text-amber-400 underline decoration-2 underline-offset-4">
                          {segmentedExpected.ending}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) =>
                      speakLithuanian(
                        `${personMeta.pronounLt.split('/')[0].trim()} ${expectedForm}`,
                        e
                      )
                    }
                    className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-amber-600 dark:text-amber-400"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {checkedResult.diacriticWarning && (
                  <div className="text-xs font-medium text-amber-800 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/60 px-3 py-1.5 rounded-lg">
                    ⚠️{' '}
                    {language === 'uk'
                      ? `Зараховано, але зверніть увагу на литовські діакритичні знаки: ${expectedForm}`
                      : `Accepted, but note the Lithuanian diacritics: ${expectedForm}`}
                  </div>
                )}

                {verb.stemAlternation && (
                  <div className="text-xs text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800">
                    <span className="font-bold">Граматична примітка: </span>
                    {verb.stemAlternation[language]}
                  </div>
                )}

                {/* Contextual Example Sentence Block */}
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                      {language === 'uk'
                        ? 'Приклад у реченні'
                        : language === 'lt'
                        ? 'Pavyzdys sakinyje'
                        : 'Example in a sentence'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) =>
                        speakLithuanian(contextExample.fullSentenceLt, e)
                      }
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-amber-600 dark:text-amber-400"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {contextExample.fullSentenceLt}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    {language === 'en'
                      ? contextExample.translationEn
                      : contextExample.translationUk}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Full Conjugation Modal for Current Verb */}
      {tableModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={() => setTableModalOpen(false)}
        >
          <div
            className="w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{verb.infinitive}</span>
                  <span className="text-sm font-mono text-amber-600 dark:text-amber-400">
                    ({cleanInf}, {verb.present3}, {verb.past3})
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {verb.uk} · {verb.en} · {conjMeta.title[language]}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTableModalOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[78vh] overflow-y-auto">
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                      <th className="p-2.5 border-b border-slate-200 dark:border-slate-700 font-bold">
                        Особа (Asmuo)
                      </th>
                      <th className="p-2.5 border-b border-slate-200 dark:border-slate-700 font-bold">
                        Теперішній (Esamasis)
                      </th>
                      <th className="p-2.5 border-b border-slate-200 dark:border-slate-700 font-bold">
                        Минулий (Būtasis k.)
                      </th>
                      <th className="p-2.5 border-b border-slate-200 dark:border-slate-700 font-bold">
                        Майбутній (Būsimasis)
                      </th>
                      <th className="p-2.5 border-b border-slate-200 dark:border-slate-700 font-bold">
                        Наказовий (Liepiamoji)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {VERB_PERSON_ORDER.map((pKey) => {
                      const impForm =
                        pKey === 'tu'
                          ? verb.imperative.tu
                          : pKey === 'mes'
                          ? verb.imperative.mes
                          : pKey === 'jus'
                          ? verb.imperative.jus
                          : '—';
                      return (
                        <tr
                          key={pKey}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                        >
                          <td className="p-2.5 font-bold text-slate-700 dark:text-slate-300">
                            {VERB_PERSONS_METADATA[pKey].label[language]}
                          </td>
                          <td className="p-2.5 font-mono font-bold text-slate-900 dark:text-white">
                            <button
                              type="button"
                              onClick={(e) =>
                                speakLithuanian(verb.present[pKey], e)
                              }
                              className="hover:text-amber-600 flex items-center gap-1"
                            >
                              <span>{verb.present[pKey]}</span>
                              <Volume2 className="w-3.5 h-3.5 opacity-60" />
                            </button>
                          </td>
                          <td className="p-2.5 font-mono font-bold text-slate-900 dark:text-white">
                            <button
                              type="button"
                              onClick={(e) =>
                                speakLithuanian(verb.past[pKey], e)
                              }
                              className="hover:text-amber-600 flex items-center gap-1"
                            >
                              <span>{verb.past[pKey]}</span>
                              <Volume2 className="w-3.5 h-3.5 opacity-60" />
                            </button>
                          </td>
                          <td className="p-2.5 font-mono font-bold text-slate-900 dark:text-white">
                            <button
                              type="button"
                              onClick={(e) =>
                                speakLithuanian(verb.future[pKey], e)
                              }
                              className="hover:text-amber-600 flex items-center gap-1"
                            >
                              <span>{verb.future[pKey]}</span>
                              <Volume2 className="w-3.5 h-3.5 opacity-60" />
                            </button>
                          </td>
                          <td className="p-2.5 font-mono font-bold text-slate-700 dark:text-slate-300">
                            {impForm !== '—' ? (
                              <button
                                type="button"
                                onClick={(e) => speakLithuanian(impForm, e)}
                                className="hover:text-amber-600 flex items-center gap-1"
                              >
                                <span>{impForm}!</span>
                                <Volume2 className="w-3.5 h-3.5 opacity-60" />
                              </button>
                            ) : (
                              '—'
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
