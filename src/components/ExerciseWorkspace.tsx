import React, { useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Play,
  Settings,
  SkipForward,
  Sparkles,
  Star,
  Table2,
  X,
  XCircle,
} from 'lucide-react';
import {
  CASES_METADATA,
  CASE_ORDER,
  DECLENSION_PDF_TABLE,
  DIFFICULTY_METADATA,
  LITHUANIAN_DIACRITICS,
  SUBTYPE_ENDINGS,
  TOPICS_METADATA,
  TRAINING_MODES_METADATA,
  segmentLithuanianWord,
} from '../data/grammarRules';
import { UI_TEXT } from '../i18n/translations';
import {
  AnswerEvaluation,
  AppLanguage,
  DeclensionType,
  GrammaticalCase,
  GrammaticalNumber,
  NounEntry,
  TopicId,
  TrainingMode,
  UserProgress,
} from '../types/grammar';
import { evaluateUserAnswer } from '../utils/answerChecker';
import {
  getNounContextExample,
  getNounTranslationInCase,
} from '../utils/nounInflections';
import { getNounUsageGuide } from '../utils/nounUsage';
import {
  ExerciseTask,
  generateNextExerciseTask,
  resolveEffectiveDifficulty,
} from '../utils/progressStorage';

interface ExerciseWorkspaceProps {
  language: AppLanguage;
  progress: UserProgress;
  mode: TrainingMode;
  selectedCase: GrammaticalCase;
  selectedDeclension: DeclensionType;
  selectedNumber: GrammaticalNumber | 'both';
  selectedTopic: TopicId;
  onOpenSettings: () => void;
  onRecordOutcome: (
    noun: NounEntry,
    targetCase: GrammaticalCase,
    targetNumber: GrammaticalNumber,
    userAnswer: string,
    correctAnswer: string,
    isCorrect: boolean
  ) => void;
  onToggleFavorite: (wordId: string) => void;
  forcedNounId?: string;
  onClearForcedNoun: () => void;
  onInputFocusChange?: (focused: boolean) => void;
}

export const ExerciseWorkspace: React.FC<ExerciseWorkspaceProps> = ({
  language,
  progress,
  mode,
  selectedCase,
  selectedDeclension,
  selectedNumber,
  selectedTopic,
  onOpenSettings,
  onRecordOutcome,
  onToggleFavorite,
  forcedNounId,
  onClearForcedNoun,
  onInputFocusChange,
}) => {
  const t = UI_TEXT[language];
  const effectiveDifficulty = resolveEffectiveDifficulty(progress);

  // Single-form exercise state
  const [currentTask, setCurrentTask] = useState<ExerciseTask>(() =>
    generateNextExerciseTask(progress, {
      mode,
      difficulty: effectiveDifficulty,
      selectedCase,
      selectedDeclension,
      selectedNumber,
      selectedTopic,
      forcedNounId,
    })
  );
  const [userInput, setUserInput] = useState('');
  const [evaluation, setEvaluation] = useState<AnswerEvaluation | null>(null);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [sessionExerciseCount, setSessionExerciseCount] = useState(0);
  const [sessionCorrectCount, setSessionCorrectCount] = useState(0);
  const [exampleModalOpen, setExampleModalOpen] = useState(false);

  // Exam mode state (15 questions, no hints)
  const EXAM_TOTAL = 15;
  const [examStep, setExamStep] = useState(1);
  const [examScore, setExamScore] = useState(0);
  const [examFinished, setExamFinished] = useState(false);

  // Full Paradigm mode state (all 7 cases at once)
  const [paradigmNumber, setParadigmNumber] = useState<GrammaticalNumber>('sg');
  const [paradigmInputs, setParadigmInputs] = useState<
    Record<GrammaticalCase, string>
  >({
    nom: '',
    gen: '',
    dat: '',
    acc: '',
    ins: '',
    loc: '',
    voc: '',
  });
  const [paradigmResults, setParadigmResults] = useState<
    Record<GrammaticalCase, AnswerEvaluation> | null
  >(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const cardTopRef = useRef<HTMLDivElement>(null);

  const loadNewTask = (overrideNounId?: string, shouldFocusInput = false) => {
    const next = generateNextExerciseTask(progress, {
      mode,
      difficulty: effectiveDifficulty,
      selectedCase,
      selectedDeclension,
      selectedNumber,
      selectedTopic,
      forcedNounId: overrideNounId,
      previousNounId: currentTask.noun.id,
    });
    setCurrentTask(next);
    setUserInput('');
    setEvaluation(null);
    setAnswerRevealed(false);
    setHintVisible(false);
    setExampleModalOpen(false);
    setAttemptCount(0);
    setParadigmInputs({
      nom: next.noun.lemma,
      gen: '',
      dat: '',
      acc: '',
      ins: '',
      loc: '',
      voc: '',
    });
    setParadigmResults(null);
    if (shouldFocusInput || window.innerWidth >= 768) {
      setTimeout(() => {
        inputRef.current?.focus({ preventScroll: true });
      }, 30);
    }
  };

  useEffect(() => {
    if (forcedNounId) {
      loadNewTask(forcedNounId);
    }
  }, [forcedNounId]);

  useEffect(() => {
    if (mode === 'exam') {
      setExamStep(1);
      setExamScore(0);
      setExamFinished(false);
    }
    loadNewTask(forcedNounId);
  }, [
    mode,
    selectedCase,
    selectedDeclension,
    selectedNumber,
    selectedTopic,
    effectiveDifficulty,
  ]);

  const handleInsertDiacritic = (char: string) => {
    if (!inputRef.current) {
      setUserInput((prev) => prev + char);
      return;
    }
    const el = inputRef.current;
    const start = el.selectionStart ?? userInput.length;
    const end = el.selectionEnd ?? userInput.length;
    const updated = userInput.slice(0, start) + char + userInput.slice(end);
    setUserInput(updated);
    setTimeout(() => {
      el.focus({ preventScroll: true });
      el.setSelectionRange(start + 1, start + 1);
    }, 10);
  };

  const handleSubmitSingle = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInput.trim()) return;

    const result = evaluateUserAnswer(
      currentTask.noun,
      currentTask.targetCase,
      currentTask.targetNumber,
      userInput
    );
    setEvaluation(result);
    setAnswerRevealed(true);
    const nextAttempt = attemptCount + 1;
    setAttemptCount(nextAttempt);

    if (result.isCorrect) {
      if (nextAttempt === 1) {
        setSessionExerciseCount((c) => c + 1);
        setSessionCorrectCount((c) => c + 1);
        if (mode === 'exam') {
          setExamScore((s) => s + 1);
        }
      }
      onRecordOutcome(
        currentTask.noun,
        currentTask.targetCase,
        currentTask.targetNumber,
        userInput,
        result.expectedForm,
        true
      );
    } else {
      if (nextAttempt === 1) {
        setSessionExerciseCount((c) => c + 1);
        onRecordOutcome(
          currentTask.noun,
          currentTask.targetCase,
          currentTask.targetNumber,
          userInput,
          result.expectedForm,
          false
        );
      }
    }
  };

  const handleRevealCorrectAnswer = () => {
    const result =
      evaluation ??
      evaluateUserAnswer(
        currentTask.noun,
        currentTask.targetCase,
        currentTask.targetNumber,
        userInput
      );
    setEvaluation(result);
    setAnswerRevealed(true);
    if (attemptCount === 0) {
      setSessionExerciseCount((c) => c + 1);
      onRecordOutcome(
        currentTask.noun,
        currentTask.targetCase,
        currentTask.targetNumber,
        userInput,
        result.expectedForm,
        false
      );
    }
  };

  const handleNextWord = () => {
    if (forcedNounId) {
      onClearForcedNoun();
    }
    if (mode === 'exam') {
      if (examStep >= EXAM_TOTAL) {
        setExamFinished(true);
        return;
      }
      setExamStep((s) => s + 1);
    }
    loadNewTask(undefined, true);
  };

  const handleCheckFullParadigm = (e: React.FormEvent) => {
    e.preventDefault();
    const res = {} as Record<GrammaticalCase, AnswerEvaluation>;
    let allCorrect = true;
    for (const c of CASE_ORDER) {
      const ev = evaluateUserAnswer(
        currentTask.noun,
        c,
        paradigmNumber,
        paradigmInputs[c]
      );
      res[c] = ev;
      if (!ev.isCorrect) allCorrect = false;
      onRecordOutcome(
        currentTask.noun,
        c,
        paradigmNumber,
        paradigmInputs[c],
        ev.expectedForm,
        ev.isCorrect
      );
    }
    setParadigmResults(res);
    setSessionExerciseCount((cnt) => cnt + 1);
    if (allCorrect) setSessionCorrectCount((cnt) => cnt + 1);
  };

  const caseMeta = CASES_METADATA[currentTask.targetCase];
  const declMeta = DECLENSION_PDF_TABLE[currentTask.noun.declension - 1];
  const subtypeMeta = SUBTYPE_ENDINGS[currentTask.noun.subtype];
  const isFavorite = progress.favorites.includes(currentTask.noun.id);
  const expectedHintEnding =
    subtypeMeta[currentTask.targetNumber][currentTask.targetCase];
  const modelExampleSeg = segmentLithuanianWord(
    currentTask.noun.lemma,
    currentTask.noun.subtype,
    'nom',
    'sg'
  );
  const contextExample = getNounContextExample(
    currentTask.noun,
    currentTask.targetCase,
    currentTask.targetNumber
  );
  const targetCaseWordTranslation = getNounTranslationInCase(
    currentTask.noun,
    currentTask.targetCase,
    currentTask.targetNumber,
    language
  );
  const nounUsageGuide = getNounUsageGuide(currentTask.noun);

  // Match case-specific collocation & governance item for the active targetCase
  const caseKeywordsMap: Record<GrammaticalCase, string[]> = {
    nom: ['Vardininkas', 'Būdvardis'],
    gen: ['Kilmininkas'],
    dat: ['Naudininkas'],
    acc: ['Galininkas'],
    ins: ['Įnagininkas'],
    loc: ['Vietininkas'],
    voc: ['Šauksmininkas'],
  };
  const activeCaseKeywords = caseKeywordsMap[currentTask.targetCase];
  const matchingCollocation = nounUsageGuide.collocations.find((col) =>
    activeCaseKeywords.some((kw) => col.caseBadge?.includes(kw))
  );
  const matchingGovernance = nounUsageGuide.governance.find((gov) =>
    activeCaseKeywords.some((kw) => gov.caseName.includes(kw))
  );

  const findWordIndexInSentence = (sentence: string, word: string): number => {
    const lowerSentence = sentence.toLowerCase();
    const lowerWord = word.toLowerCase().trim();
    if (!lowerWord) return -1;
    const isLetter = (ch: string | undefined) =>
      Boolean(ch && /[a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ]/.test(ch));

    let searchPos = 0;
    while (searchPos <= lowerSentence.length - lowerWord.length) {
      const idx = lowerSentence.indexOf(lowerWord, searchPos);
      if (idx === -1) break;
      const beforeChar = idx > 0 ? lowerSentence[idx - 1] : undefined;
      const afterChar =
        idx + lowerWord.length < lowerSentence.length
          ? lowerSentence[idx + lowerWord.length]
          : undefined;
      if (!isLetter(beforeChar) && !isLetter(afterChar)) {
        return idx;
      }
      searchPos = idx + 1;
    }
    return lowerSentence.indexOf(lowerWord);
  };

  const renderHighlightedSentenceLt = (
    sentenceLt: string,
    expectedForm: string,
    stemLen: number
  ) => {
    const idx = findWordIndexInSentence(sentenceLt, expectedForm);
    if (idx === -1) {
      return <span>{sentenceLt}</span>;
    }
    const before = sentenceLt.slice(0, idx);
    const matched = sentenceLt.slice(idx, idx + expectedForm.length);
    const after = sentenceLt.slice(idx + expectedForm.length);
    const matchedStem = matched.slice(0, stemLen);
    const matchedEnding = matched.slice(stemLen);

    return (
      <>
        <span>{before}</span>
        <span className="inline-flex items-baseline font-bold px-1.5 py-0.5 rounded-md bg-amber-100/90 dark:bg-amber-950/80 border border-amber-300/70 dark:border-amber-700/60 text-slate-900 dark:text-white mx-0.5">
          <span>{matchedStem}</span>
          <span className="text-amber-700 dark:text-amber-400 underline decoration-2 underline-offset-2">
            {matchedEnding}
          </span>
        </span>
        <span>{after}</span>
      </>
    );
  };

  // Build concise subtitle for active sub-filter
  let modeDetailText = '';
  if (mode === 'by_case') {
    modeDetailText = ` · ${CASES_METADATA[selectedCase].nameLt}`;
  } else if (mode === 'by_declension') {
    modeDetailText = ` · ${selectedDeclension} linksniuotė`;
  } else if (mode === 'by_number') {
    modeDetailText =
      selectedNumber === 'sg'
        ? ` · ${t.singularLabel}`
        : selectedNumber === 'pl'
        ? ` · ${t.pluralLabel}`
        : ` · ${t.bothNumbersLabel}`;
  } else if (mode === 'by_topic') {
    modeDetailText = ` · ${TOPICS_METADATA[selectedTopic].label[language]}`;
  }

  return (
    <div className="max-w-3xl mx-auto px-2.5 sm:px-6 pt-1.5 pb-1 sm:py-6 space-y-1.5 sm:space-y-5">
      {/* Compact, Non-Distracting Top Status Bar with Quick Settings Trigger */}
      <div className="flex items-center justify-between gap-2 pb-1.5 sm:pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 min-w-0 truncate">
          <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
            {TRAINING_MODES_METADATA[mode].title[language]}
            {modeDetailText}
          </span>
          <span aria-hidden="true" className="shrink-0">
            ·
          </span>
          <span className="truncate">
            {DIFFICULTY_METADATA[effectiveDifficulty].title[language]}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 text-[11px] sm:text-xs tabular-nums shrink-0">
          {mode === 'exam' ? (
            <span className="font-semibold text-amber-700 dark:text-amber-400">
              {t.exercise.examProgressLabel}: {examStep} / {EXAM_TOTAL}
            </span>
          ) : (
            <span className="text-slate-600 dark:text-slate-300">
              <span className="hidden sm:inline">
                {t.exercise.sessionProgress}:{' '}
              </span>
              <strong className="text-slate-900 dark:text-white">
                {sessionCorrectCount} / {sessionExerciseCount}
              </strong>
            </span>
          )}

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onPointerDown={(e) => e.preventDefault()}
            onClick={onOpenSettings}
            className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors flex items-center gap-1 whitespace-nowrap shrink-0"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.nav.settings}</span>
          </button>
        </div>
      </div>

      {/* Exam Completed Summary View */}
      {mode === 'exam' && examFinished ? (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t.exercise.examCompleteTitle}
          </h2>
          <div className="text-5xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {examScore} / {EXAM_TOTAL} (
            {Math.round((examScore / EXAM_TOTAL) * 100)}%)
          </div>
          <button
            type="button"
            onClick={() => {
              setExamStep(1);
              setExamScore(0);
              setExamFinished(false);
              loadNewTask();
            }}
            className="px-6 py-3 rounded-xl bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-semibold text-sm hover:opacity-90 transition-opacity min-h-[44px]"
          >
            {t.exercise.examRestartBtn}
          </button>
        </div>
      ) : mode === 'full_paradigm' ? (
        /* FULL PARADIGM MODE (7 Forms of 1 Word) */
        <div className="p-4 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
          <div className="sticky top-0 z-20 -mx-4 px-4 py-2.5 sm:static sm:mx-0 sm:px-0 sm:py-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                <span>{declMeta.title[language]}</span>
                <span className="mx-2">·</span>
                <span>
                  {TOPICS_METADATA[currentTask.noun.topic].label[language]}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  {currentTask.noun.lemma}
                </h2>
              </div>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-0.5">
                {language === 'en'
                  ? currentTask.noun.en
                  : currentTask.noun.uk}{' '}
                (
                {language === 'en'
                  ? currentTask.noun.uk
                  : currentTask.noun.en}
                )
              </p>
            </div>

            {/* Toggle Singular / Plural for Full Paradigm */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setParadigmNumber('sg');
                  setParadigmResults(null);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 min-h-[36px] ${
                  paradigmNumber === 'sg'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {t.singularLabel}
              </button>
              <button
                type="button"
                onClick={() => {
                  setParadigmNumber('pl');
                  setParadigmInputs((prev) => ({ ...prev, nom: '' }));
                  setParadigmResults(null);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 min-h-[36px] ${
                  paradigmNumber === 'pl'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {t.pluralLabel}
              </button>
            </div>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300">
            {t.exercise.fullParadigmInstruction}
          </p>

          <form onSubmit={handleCheckFullParadigm} className="space-y-3">
            {CASE_ORDER.map((c) => {
              const cMeta = CASES_METADATA[c];
              const res = paradigmResults?.[c];
              return (
                <div
                  key={c}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800"
                >
                  <div className="sm:col-span-4">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      {cMeta.name[language]}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {cMeta.questionLt} · {cMeta.questionTranslated[language]}
                    </div>
                  </div>
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      value={paradigmInputs[c]}
                      onChange={(e) =>
                        setParadigmInputs((prev) => ({
                          ...prev,
                          [c]: e.target.value,
                        }))
                      }
                      placeholder={`${currentTask.noun.lemma} → ${cMeta.nameLt}...`}
                      className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div className="sm:col-span-4 text-sm">
                    {res && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          {res.isCorrect ? (
                            <span className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 shrink-0" />
                              <span>{res.expectedSegmented.stem}</span>
                              <span className="font-bold underline decoration-2">
                                {res.expectedSegmented.ending}
                              </span>
                            </span>
                          ) : (
                            <span className="text-rose-700 dark:text-rose-400 font-medium flex items-center gap-1">
                              <XCircle className="w-4 h-4 shrink-0" />
                              <span>{res.expectedSegmented.stem}</span>
                              <span className="font-bold bg-rose-100 dark:bg-rose-950/80 px-1 rounded">
                                -{res.expectedSegmented.ending}
                              </span>
                            </span>
                          )}
                        </div>
                        {(() => {
                          const rowEx = getNounContextExample(
                            currentTask.noun,
                            c,
                            paradigmNumber
                          );
                          return (
                            <div className="text-[11px] leading-snug text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 space-y-0.5">
                              <div className="font-mono text-slate-800 dark:text-slate-200">
                                <span className="text-amber-700 dark:text-amber-400 font-bold mr-1">
                                  LT:
                                </span>
                                {renderHighlightedSentenceLt(
                                  rowEx.lt,
                                  res.expectedForm,
                                  res.expectedSegmented.stem.length
                                )}
                              </div>
                              <div className="italic text-slate-500 dark:text-slate-400">
                                {language === 'en' ? rowEx.en : rowEx.uk}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-semibold text-sm hover:opacity-90 transition-opacity min-h-[44px]"
              >
                {t.exercise.checkAllFormsBtn}
              </button>
              <button
                type="button"
                onClick={handleNextWord}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 min-h-[44px]"
              >
                <span>{t.exercise.nextWordBtn}</span>
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* STANDARD INTERACTIVE SINGLE-FORM EXERCISE CARD */
        <div
          ref={cardTopRef}
          className="p-3 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 sm:space-y-6"
        >
          {/* Compact Top Word + Target Case Header */}
          <div className="pb-2 sm:pb-4 border-b border-slate-100 dark:border-slate-800 space-y-1.5 sm:space-y-4">
            {/* Top Metadata Row */}
            <div className="flex items-center justify-between gap-1.5 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1 sm:gap-2 min-w-0 truncate">
                <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                  {declMeta.title[language]}
                </span>
                <span aria-hidden="true" className="shrink-0">
                  ·
                </span>
                <span className="truncate">
                  {TOPICS_METADATA[currentTask.noun.topic].label[language]}
                </span>
                <span aria-hidden="true" className="shrink-0">
                  ·
                </span>
                <span className="shrink-0">
                  {currentTask.noun.gender === 'm'
                    ? 'vyr. g. (чол.)'
                    : 'mot. g. (жін.)'}
                </span>
              </div>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => onToggleFavorite(currentTask.noun.id)}
                title={t.exercise.favoriteToggle}
                className={`p-1 sm:p-2 rounded-lg transition-colors min-h-[26px] min-w-[26px] sm:min-h-[40px] sm:min-w-[40px] flex items-center justify-center shrink-0 ${
                  isFavorite
                    ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-slate-800'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Star
                  className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : ''}`}
                />
              </button>
            </div>

            {/* Side-by-side 2-column grid on BOTH mobile and desktop so Base Word and Target Case stay on the same horizontal plane */}
            <div className="grid grid-cols-12 gap-2 sm:gap-6 items-stretch sm:py-1">
              {/* Left Column: Base Word & Translation */}
              <div className="col-span-5 sm:col-span-6 flex flex-col justify-center pr-1">
                <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mb-0.5 truncate">
                  {t.exercise.baseWordLabel}
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white break-words leading-tight">
                    {modelExampleSeg.stem}
                    <span className="text-amber-700 dark:text-amber-400 underline decoration-amber-400/70 decoration-2 underline-offset-4">
                      {modelExampleSeg.ending}
                    </span>
                  </span>
                </div>
                <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-snug">
                  <span className="hidden sm:inline text-slate-400 dark:text-slate-500 mr-1.5">
                    {t.exercise.translationLabel}:
                  </span>
                  {currentTask.hideTranslation && !answerRevealed ? (
                    <span className="italic text-slate-400">
                      {t.exercise.hiddenInAdvanced}
                    </span>
                  ) : (
                    <span className="font-medium">
                      {language === 'en'
                        ? `${currentTask.noun.en} (${currentTask.noun.uk})`
                        : `${currentTask.noun.uk} (${currentTask.noun.en})`}
                    </span>
                  )}
                </div>
              </div>

              {/* Right Column: Target Grammatical Task Specification */}
              <div className="col-span-7 sm:col-span-6 p-2 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 flex flex-col justify-center">
                <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                  {t.exercise.targetCaseLabel} · {t.exercise.targetNumberLabel}
                </div>
                <div className="text-sm sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5 leading-snug">
                  {caseMeta.name[language]}
                </div>
                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-0.5 text-xs sm:text-sm">
                  <span className="font-semibold text-amber-700 dark:text-amber-400">
                    {currentTask.targetNumber === 'sg'
                      ? t.singularLabel
                      : t.pluralLabel}
                  </span>
                  <span className="text-slate-400" aria-hidden="true">
                    ·
                  </span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {caseMeta.questionLt}
                  </span>
                  <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                    ({caseMeta.questionTranslated[language]})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contextual Sentence Prompt */}
          {currentTask.sentence && (
            <div className="p-2 sm:p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/50 space-y-1">
              <div className="flex items-center justify-between text-[11px] sm:text-xs text-amber-800 dark:text-amber-300 font-medium">
                <span>{t.exercise.sentenceContextLabel}</span>
                {currentTask.sentence.preposition && (
                  <span>
                    {t.exercise.prepositionNote}: „
                    {currentTask.sentence.preposition}“ + {caseMeta.nameLt}
                  </span>
                )}
              </div>
              <div className="text-sm sm:text-lg font-semibold text-slate-900 dark:text-white">
                {answerRevealed
                  ? currentTask.sentence.fullSentenceLt
                  : currentTask.sentence.sentenceWithBlank}
              </div>
              {!currentTask.hideTranslation && (
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  {language === 'en'
                    ? currentTask.sentence.translationEn
                    : currentTask.sentence.translationUk}
                </div>
              )}
            </div>
          )}

          {/* Active Keyboard Answer Input Form */}
          <form onSubmit={handleSubmitSingle} className="space-y-2 sm:space-y-4">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 mb-1.5">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="lithuanian-answer-input"
                    className="text-xs font-medium text-slate-600 dark:text-slate-300"
                  >
                    {t.exercise.diacriticBarLabel}
                  </label>
                  {/* Inline Compact Reminder right above the diacritic keys & input on mobile */}
                  <span className="sm:hidden text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    <span className="text-amber-700 dark:text-amber-400 font-bold">
                      {currentTask.noun.lemma}
                    </span>
                    {!currentTask.hideTranslation && (
                      <span className="font-normal text-slate-500 dark:text-slate-400">
                        {' '}
                        ({language === 'en' ? currentTask.noun.en : currentTask.noun.uk})
                      </span>
                    )}{' '}
                    → {caseMeta.shortLt} ({caseMeta.questionLt})
                  </span>
                </div>
                <div className="grid grid-cols-9 gap-1 sm:flex sm:flex-wrap">
                  {LITHUANIAN_DIACRITICS.map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onPointerDown={(e) => e.preventDefault()}
                      onClick={() => handleInsertDiacritic(ch)}
                      className="h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-mono font-semibold text-sm transition-all flex items-center justify-center"
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-row gap-2 sm:gap-3">
                <input
                  id="lithuanian-answer-input"
                  ref={inputRef}
                  type="text"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  readOnly={Boolean(answerRevealed && evaluation?.isCorrect)}
                  value={userInput}
                  onTouchStart={() => onInputFocusChange?.(true)}
                  onPointerDown={() => onInputFocusChange?.(true)}
                  onFocus={() => {
                    onInputFocusChange?.(true);
                    if (window.innerWidth < 768) {
                      window.scrollTo(0, 0);
                    }
                  }}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder={`${currentTask.noun.lemma} → ${caseMeta.questionLt}`}
                  className="flex-1 min-w-0 px-3 sm:px-4 py-2 sm:py-3 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-base sm:text-lg font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-amber-400"
                />

                {!evaluation ? (
                  <button
                    type="submit"
                    onMouseDown={(e) => e.preventDefault()}
                    onPointerDown={(e) => e.preventDefault()}
                    className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap shrink-0 min-h-[42px] sm:min-h-[48px] bg-slate-900 text-white hover:bg-slate-800 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400"
                  >
                    {t.exercise.checkBtn}
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {!evaluation.isCorrect && mode !== 'exam' && (
                      <button
                        type="submit"
                        onMouseDown={(e) => e.preventDefault()}
                        onPointerDown={(e) => e.preventDefault()}
                        className="px-3 sm:px-4 py-2 sm:py-3 rounded-xl bg-rose-600 text-white font-semibold text-xs sm:text-sm hover:bg-rose-500 transition-colors whitespace-nowrap shrink-0 min-h-[42px] sm:min-h-[48px]"
                      >
                        {t.exercise.retryBtn}
                      </button>
                    )}
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onPointerDown={(e) => e.preventDefault()}
                      onClick={handleNextWord}
                      className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-emerald-600 text-white font-semibold text-xs sm:text-sm hover:bg-emerald-500 transition-colors flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 min-h-[42px] sm:min-h-[48px]"
                    >
                      <span>{t.exercise.nextWordBtn}</span>
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Action Bar: Hint, Reveal Answer, Skip */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                {mode !== 'exam' && (
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onPointerDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setHintVisible((v) => !v);
                      if (!(answerRevealed && evaluation?.isCorrect)) {
                        inputRef.current?.focus({ preventScroll: true });
                      }
                    }}
                    className="px-3 py-1 sm:px-3.5 sm:py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 min-h-[34px] sm:min-h-[40px]"
                  >
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <span>{t.exercise.hintBtn}</span>
                  </button>
                )}

                {!evaluation && mode !== 'exam' && (
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onPointerDown={(e) => e.preventDefault()}
                    onClick={handleRevealCorrectAnswer}
                    className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-xs font-semibold hover:bg-amber-200 transition-colors flex items-center gap-1.5 min-h-[36px] sm:min-h-[40px]"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>{t.exercise.revealAnswerBtn}</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onPointerDown={(e) => e.preventDefault()}
                onClick={handleNextWord}
                className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors flex items-center gap-1.5 min-h-[36px] sm:min-h-[40px]"
              >
                <span>
                  {evaluation ? t.exercise.nextWordBtn : t.exercise.skipBtn}
                </span>
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Non-Spoiler Grammar Hint Box */}
          {hintVisible && mode !== 'exam' && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm space-y-1.5">
              <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{t.exercise.hintBoxTitle}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                • {declMeta.title[language]} (зразок з таблиці:{' '}
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  {subtypeMeta.modelWord}
                </span>
                ). Типове закінчення для {caseMeta.shortLt} (
                {caseMeta.questionLt}) —{' '}
                <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
                  -{expectedHintEnding}
                </span>
                .
              </p>
              {currentTask.noun.stemAlternation && (
                <p className="text-amber-800 dark:text-amber-300 font-medium">
                  • {currentTask.noun.stemAlternation[language]}
                </p>
              )}
            </div>
          )}

          {/* Full Evaluation Result, Grammatical Explanation & Word Database Sentence Example */}
          {evaluation && (
            <div
              className={`p-5 rounded-xl border space-y-4 ${
                evaluation.isCorrect
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/25 border-emerald-200 dark:border-emerald-800/60'
                  : 'bg-rose-50/70 dark:bg-rose-950/25 border-rose-200 dark:border-rose-800/60'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {evaluation.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                  )}
                  <span
                    className={`font-bold text-base ${
                      evaluation.isCorrect
                        ? 'text-emerald-900 dark:text-emerald-300'
                        : 'text-rose-900 dark:text-rose-300'
                    }`}
                  >
                    {evaluation.isCorrect
                      ? t.exercise.correctBanner
                      : t.exercise.incorrectBanner}
                  </span>
                </div>

                <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  {currentTask.noun[currentTask.targetNumber][currentTask.targetCase]}
                </span>
              </div>

              {/* Visual Color-Coded Stem + Ending Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    {t.exercise.expectedFormLabel} ({t.exercise.stemLabel} +{' '}
                    {t.exercise.endingLabel})
                  </div>
                  <div className="text-2xl font-bold tracking-tight font-mono">
                    <span className="text-slate-900 dark:text-white">
                      {evaluation.expectedSegmented.stem}
                    </span>
                    <span className="text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded ml-0.5">
                      -{evaluation.expectedSegmented.ending}
                    </span>
                  </div>
                </div>

                {!evaluation.isCorrect && (
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      {t.exercise.yourAnswerLabel}
                    </div>
                    <div className="text-2xl font-bold tracking-tight font-mono">
                      {evaluation.userSegmented ? (
                        <>
                          <span className="text-slate-700 dark:text-slate-300">
                            {evaluation.userSegmented.stem}
                          </span>
                          <span className="text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/60 px-1.5 py-0.5 rounded ml-0.5 line-through">
                            -{evaluation.userSegmented.ending}
                          </span>
                        </>
                      ) : (
                        <span className="text-rose-600">
                          {evaluation.normalizedUserAnswer || '—'}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {evaluation.diacriticWarning && (
                <div className="text-xs sm:text-sm font-medium text-amber-900 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/40 p-3 rounded-lg">
                  {evaluation.diacriticWarning[language]}
                </div>
              )}

              {/* Detailed Specific Rule Explanation */}
              <div className="space-y-1 text-sm text-slate-700 dark:text-slate-200">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {t.exercise.grammarRuleTitle} · {evaluation.ruleFormula}
                </div>
                <p className="leading-relaxed">
                  {evaluation.explanation[language]}
                </p>
              </div>

              {/* Additional Block: Example Sentence from the Word Database Declined in Context */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-white/95 dark:bg-slate-900/95 border border-amber-200/90 dark:border-amber-800/60 shadow-xs space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-400">
                    <BookOpen className="w-3.5 h-3.5 shrink-0" />
                    <span>{t.exercise.dictionaryExampleTitle}</span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 font-mono text-[11px]">
                      {caseMeta.nameLt} ({caseMeta.questionLt}) ·{' '}
                      {currentTask.targetNumber === 'sg'
                        ? t.singularLabel
                        : t.pluralLabel}
                    </span>
                  </div>

                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onPointerDown={(e) => e.preventDefault()}
                    onClick={() => setExampleModalOpen(true)}
                    className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-amber-900 dark:text-amber-300 border border-amber-200/80 dark:border-slate-700 text-[11px] font-semibold transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    <Table2 className="w-3.5 h-3.5" />
                    <span>
                      {language === 'uk'
                        ? 'Усі відмінки та речення'
                        : language === 'lt'
                        ? 'Visi linksniai ir sakiniai'
                        : 'All cases & sentences'}
                    </span>
                  </button>
                </div>

                {/* Declined Word Form & Case Translation */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg">
                  <span className="font-mono text-slate-500 dark:text-slate-400">
                    {currentTask.noun.lemma}
                  </span>
                  <span className="text-slate-400">→</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {currentTask.noun[currentTask.targetNumber][currentTask.targetCase]}
                  </span>
                  <span className="text-slate-400">—</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {targetCaseWordTranslation.primary}
                  </span>
                  {targetCaseWordTranslation.secondary && (
                    <span className="text-slate-400 dark:text-slate-500">
                      ({targetCaseWordTranslation.secondary})
                    </span>
                  )}
                </div>

                {/* Contextual Example Sentence for Active Case + Number */}
                <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div className="font-mono text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-relaxed">
                    <span className="text-amber-700 dark:text-amber-400 font-bold mr-1.5">
                      LT:
                    </span>
                    {renderHighlightedSentenceLt(
                      contextExample.lt,
                      currentTask.noun[currentTask.targetNumber][currentTask.targetCase],
                      evaluation.expectedSegmented.stem.length
                    )}
                  </div>

                  <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-sans">
                    <span className="text-sky-600 dark:text-sky-400 font-semibold mr-1.5">
                      {language === 'en' ? 'EN:' : 'UA:'}
                    </span>
                    <span className="italic">
                      {language === 'en' ? contextExample.en : contextExample.uk}
                    </span>
                  </div>

                  {language === 'uk' && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                      <span className="font-semibold mr-1.5">EN:</span>
                      <span className="italic">{contextExample.en}</span>
                    </div>
                  )}
                  {language === 'en' && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                      <span className="font-semibold mr-1.5">UA:</span>
                      <span className="italic">{contextExample.uk}</span>
                    </div>
                  )}
                  {language === 'lt' && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                      <span className="font-semibold mr-1.5">EN:</span>
                      <span className="italic">{contextExample.en}</span>
                    </div>
                  )}
                </div>

                {/* Case-Relevant Collocation or Prepositional Governance Pattern */}
                {(matchingCollocation || matchingGovernance) && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {matchingCollocation && (
                      <div className="p-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                        <div className="flex items-center justify-between gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            {language === 'uk'
                              ? 'Словосполучення'
                              : language === 'lt'
                              ? 'Žodžių junginys'
                              : 'Collocation'}
                          </span>
                          {matchingCollocation.caseBadge && (
                            <span className="text-amber-700 dark:text-amber-400 font-mono">
                              {matchingCollocation.caseBadge}
                            </span>
                          )}
                        </div>
                        <div className="font-mono font-bold text-slate-900 dark:text-white">
                          {matchingCollocation.phraseLt}
                        </div>
                        <div className="text-slate-600 dark:text-slate-300 mt-0.5">
                          {language === 'en'
                            ? matchingCollocation.transEn
                            : matchingCollocation.transUk}
                        </div>
                      </div>
                    )}

                    {matchingGovernance && (
                      <div className="p-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                        <div className="flex items-center justify-between gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">
                          <span>
                            {language === 'uk'
                              ? 'Керування у реченні'
                              : language === 'lt'
                              ? 'Linksnio valdymas'
                              : 'Case Governance'}
                          </span>
                          <span className="text-emerald-700 dark:text-emerald-400 font-mono">
                            {matchingGovernance.caseName}
                          </span>
                        </div>
                        <div className="font-mono font-bold text-slate-900 dark:text-white">
                          {matchingGovernance.patternLt}
                        </div>
                        <div className="text-slate-600 dark:text-slate-300 mt-0.5">
                          {matchingGovernance.exampleLt}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Contextual Sentence & Full Paradigm Modal Window */}
      {exampleModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-xs"
          onClick={() => setExampleModalOpen(false)}
        >
          <div
            className="w-full max-w-4xl max-h-[88vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 sm:p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {declMeta.title[language]} ·{' '}
                  {TOPICS_METADATA[currentTask.noun.topic].label[language]}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {currentTask.noun.lemma}{' '}
                  <span className="text-base font-normal text-slate-500 dark:text-slate-400">
                    — {currentTask.noun.uk} · {currentTask.noun.en}
                  </span>
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setExampleModalOpen(false)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Highlighted Active Case + Number Context Card */}
            <div className="p-4 rounded-xl bg-amber-50/90 dark:bg-amber-950/35 border-2 border-amber-300 dark:border-amber-700/80 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-300">
                  <BookOpen className="w-4 h-4 shrink-0" />
                  <span>
                    {language === 'uk'
                      ? 'Поточний відмінок та число з завдання:'
                      : language === 'lt'
                      ? 'Dabartinis užduoties linksnis ir skaičius:'
                      : 'Active Task Case & Number:'}{' '}
                    {caseMeta.name[language]} ({caseMeta.questionLt}) ·{' '}
                    {currentTask.targetNumber === 'sg'
                      ? t.singularLabel
                      : t.pluralLabel}
                  </span>
                </div>
                <span className="font-mono text-sm font-bold px-2.5 py-0.5 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-amber-300 dark:border-amber-700">
                  {currentTask.noun.lemma} →{' '}
                  {currentTask.noun[currentTask.targetNumber][currentTask.targetCase]}
                </span>
              </div>

              <div className="font-mono text-sm sm:text-base text-slate-900 dark:text-white pt-1">
                <span className="text-amber-700 dark:text-amber-400 font-bold mr-1.5">
                  LT:
                </span>
                {renderHighlightedSentenceLt(
                  contextExample.lt,
                  currentTask.noun[currentTask.targetNumber][currentTask.targetCase],
                  segmentLithuanianWord(
                    currentTask.noun[currentTask.targetNumber][currentTask.targetCase],
                    currentTask.noun.subtype,
                    currentTask.targetCase,
                    currentTask.targetNumber
                  ).stem.length
                )}
              </div>

              <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 italic">
                <span className="not-italic font-semibold text-sky-700 dark:text-sky-400 mr-1.5">
                  UA:
                </span>
                {contextExample.uk}
              </div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 italic">
                <span className="not-italic font-semibold mr-1.5">EN:</span>
                {contextExample.en}
              </div>
            </div>

            {/* Full 14-Form Table with Contextual Sentences */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                    <th className="py-2 pr-3 font-semibold">
                      {t.reference.caseColumn}
                    </th>
                    <th className="py-2 px-3 font-semibold">
                      {t.singularLabel}
                    </th>
                    <th className="py-2 pl-3 font-semibold">
                      {t.pluralLabel}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {CASE_ORDER.map((c) => {
                    const cMeta = CASES_METADATA[c];
                    const sgForm = currentTask.noun.sg[c];
                    const plForm = currentTask.noun.pl[c];
                    const sgSeg = segmentLithuanianWord(
                      sgForm,
                      currentTask.noun.subtype,
                      c,
                      'sg'
                    );
                    const plSeg = segmentLithuanianWord(
                      plForm,
                      currentTask.noun.subtype,
                      c,
                      'pl'
                    );
                    const sgEx = getNounContextExample(currentTask.noun, c, 'sg');
                    const plEx = getNounContextExample(currentTask.noun, c, 'pl');
                    const isTargetSg =
                      c === currentTask.targetCase &&
                      currentTask.targetNumber === 'sg';
                    const isTargetPl =
                      c === currentTask.targetCase &&
                      currentTask.targetNumber === 'pl';

                    return (
                      <tr key={c}>
                        <td className="py-3 pr-3 align-top min-w-[120px]">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {cMeta.name[language]}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {cMeta.questionLt}
                          </div>
                        </td>
                        <td
                          className={`py-3 px-3 align-top rounded-lg ${
                            isTargetSg
                              ? 'bg-amber-50/90 dark:bg-amber-950/40 ring-1 ring-amber-400/70'
                              : ''
                          }`}
                        >
                          <div className="font-mono font-bold text-slate-900 dark:text-white">
                            <span>{sgSeg.stem}</span>
                            <span className="text-amber-700 dark:text-amber-400 underline decoration-2">
                              {sgSeg.ending}
                            </span>
                          </div>
                          <div className="mt-1 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                            {renderHighlightedSentenceLt(
                              sgEx.lt,
                              sgForm,
                              sgSeg.stem.length
                            )}
                          </div>
                          <div className="text-[11px] italic text-slate-500 dark:text-slate-400 mt-0.5">
                            {language === 'en' ? sgEx.en : sgEx.uk}
                          </div>
                        </td>
                        <td
                          className={`py-3 pl-3 align-top rounded-lg ${
                            isTargetPl
                              ? 'bg-amber-50/90 dark:bg-amber-950/40 ring-1 ring-amber-400/70'
                              : ''
                          }`}
                        >
                          <div className="font-mono font-bold text-slate-900 dark:text-white">
                            <span>{plSeg.stem}</span>
                            <span className="text-emerald-700 dark:text-emerald-400 underline decoration-2">
                              {plSeg.ending}
                            </span>
                          </div>
                          <div className="mt-1 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                            {renderHighlightedSentenceLt(
                              plEx.lt,
                              plForm,
                              plSeg.stem.length
                            )}
                          </div>
                          <div className="text-[11px] italic text-slate-500 dark:text-slate-400 mt-0.5">
                            {language === 'en' ? plEx.en : plEx.uk}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
