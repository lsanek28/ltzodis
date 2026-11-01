import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeftRight,
  BookOpen,
  Check,
  CheckCircle2,
  Filter,
  Keyboard,
  Layers,
  ListChecks,
  RotateCcw,
  Shuffle,
  SkipForward,
  Sparkles,
  Star,
  Table2,
  Volume2,
  X,
  XCircle,
} from 'lucide-react';
import { ALL_VERIFIED_NOUNS } from '../data/nounsDatabase';
import { ALL_VERIFIED_VERBS } from '../data/verbsDatabase';
import {
  CASES_METADATA,
  CASE_ORDER,
  DECLENSION_PDF_TABLE,
  DIFFICULTY_CEFR_LABELS,
  DIFFICULTY_METADATA,
  LITHUANIAN_DIACRITICS,
  SUBTYPE_ENDINGS,
  TOPICS_METADATA,
  segmentLithuanianWord,
} from '../data/grammarRules';
import {
  AppLanguage,
  DeclensionSubtype,
  DeclensionType,
  DifficultyLevel,
  NounEntry,
  TopicId,
  UserProgress,
  VerbConjugationType,
  VerbEntry,
  VerbGovernedCase,
} from '../types/grammar';
import { getNounContextExample } from '../utils/nounInflections';
import {
  segmentLithuanianVerbForm,
  VERB_CONJUGATIONS_METADATA,
  VERB_GOVERNED_CASES_METADATA,
  VERB_PERSONS_METADATA,
  VERB_PERSON_ORDER,
} from '../utils/verbConjugations';

export type FlashcardDirection = 'lt_to_target' | 'target_to_lt' | 'mixed';
export type FlashcardInteractionMode = 'flip' | 'quiz' | 'typing';
export type FlashcardDeckFilter = 'all' | 'unmastered' | 'favorites' | 'mastered';
export type FlashcardPartOfSpeechFilter = 'all' | 'nouns' | 'verbs';

export type FlashcardItem =
  | { kind: 'noun'; data: NounEntry }
  | { kind: 'verb'; data: VerbEntry };

const SUBTYPE_META_LIST: {
  id: DeclensionSubtype;
  declension: DeclensionType;
  endingLabel: string;
  gender: 'm' | 'f';
}[] = [
  { id: '1_as', declension: 1, endingLabel: '-as (namas)', gender: 'm' },
  { id: '1_ias', declension: 1, endingLabel: '-ias (kelias)', gender: 'm' },
  { id: '1_is', declension: 1, endingLabel: '-is → -io (brolis)', gender: 'm' },
  { id: '1_ys', declension: 1, endingLabel: '-ys → -io (kambarys)', gender: 'm' },
  { id: '2_a', declension: 2, endingLabel: '-a (knyga)', gender: 'f' },
  { id: '2_ia', declension: 2, endingLabel: '-ia (vyšnia)', gender: 'f' },
  { id: '2_e', declension: 2, endingLabel: '-ė (gatvė)', gender: 'f' },
  { id: '3_is_f', declension: 3, endingLabel: '-is → -ies жін. (pilis)', gender: 'f' },
  { id: '3_is_m', declension: 3, endingLabel: '-is → -ies чол. (dantis)', gender: 'm' },
  { id: '4_us', declension: 4, endingLabel: '-us (sūnus)', gender: 'm' },
  { id: '4_ius', declension: 4, endingLabel: '-ius (vaisius)', gender: 'm' },
  { id: '5_uo', declension: 5, endingLabel: '-uo → -ens (akmuo)', gender: 'm' },
  { id: '5_e', declension: 5, endingLabel: '-uo/-ė → -ers (sesuo, duktė)', gender: 'f' },
];

interface VocabularyFlashcardsProps {
  language: AppLanguage;
  progress: UserProgress;
  onRecordOutcome: (
    noun: NounEntry,
    targetCase: 'nom',
    targetNumber: 'sg',
    userAnswer: string,
    correctAnswer: string,
    isCorrect: boolean
  ) => void;
  onRecordVerbOutcome?: (verb: VerbEntry, isCorrect: boolean) => void;
  onToggleFavorite: (wordId: string) => void;
  onSwitchToDeclensionForNoun: (wordId: string) => void;
  onSwitchToConjugationForVerb?: (verbId: string) => void;
  onOpenSettings: () => void;
  forcedNounId?: string;
  onClearForcedNoun: () => void;
  onInputFocusChange?: (focused: boolean) => void;
}

const FOLD_MAP: Record<string, string> = {
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

function foldLithuanianDiacritics(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .split('')
    .map((ch) => FOLD_MAP[ch] ?? ch)
    .join('');
}

function normalizeTranslationString(input: string): string {
  return input
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/^to\s+/i, '')
    .replace(/[.,;/\\!?'"«»—–-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const ALL_FLASHCARD_ITEMS: FlashcardItem[] = [
  ...ALL_VERIFIED_NOUNS.map((data): FlashcardItem => ({ kind: 'noun', data })),
  ...ALL_VERIFIED_VERBS.map((data): FlashcardItem => ({ kind: 'verb', data })),
];

export const VocabularyFlashcards: React.FC<VocabularyFlashcardsProps> = ({
  language,
  progress,
  onRecordOutcome,
  onRecordVerbOutcome,
  onToggleFavorite,
  onSwitchToDeclensionForNoun,
  onSwitchToConjugationForVerb,
  forcedNounId,
  onClearForcedNoun,
  onInputFocusChange,
}) => {
  const [ltBridgeLang, setLtBridgeLang] = useState<'uk' | 'en'>('uk');
  const targetTranslationLang: 'uk' | 'en' =
    language === 'en' ? 'en' : language === 'uk' ? 'uk' : ltBridgeLang;

  const [posFilter, setPosFilter] =
    useState<FlashcardPartOfSpeechFilter>('all');
  const [direction, setDirection] = useState<FlashcardDirection>('lt_to_target');
  const [interactionMode, setInteractionMode] =
    useState<FlashcardInteractionMode>('flip');
  const [deckFilter, setDeckFilter] = useState<FlashcardDeckFilter>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    DifficultyLevel | 'all'
  >('all');
  const [selectedGender, setSelectedGender] = useState<'all' | 'm' | 'f'>('all');
  const [selectedTopic, setSelectedTopic] = useState<TopicId | 'all'>('all');
  const [selectedDeclension, setSelectedDeclension] = useState<
    DeclensionType | 'all'
  >('all');
  const [selectedSubtype, setSelectedSubtype] = useState<
    DeclensionSubtype | 'all'
  >('all');
  const [selectedVerbConj, setSelectedVerbConj] = useState<
    VerbConjugationType | 'all'
  >('all');
  const [selectedVerbGov, setSelectedVerbGov] = useState<
    VerbGovernedCase | 'all'
  >('all');
  const [onlyReflexiveVerbs, setOnlyReflexiveVerbs] = useState(false);
  const [onlyExceptions, setOnlyExceptions] = useState(false);

  const [currentItem, setCurrentItem] = useState<FlashcardItem>(() => {
    if (forcedNounId) {
      const foundNoun = ALL_VERIFIED_NOUNS.find((n) => n.id === forcedNounId);
      if (foundNoun) return { kind: 'noun', data: foundNoun };
      const foundVerb = ALL_VERIFIED_VERBS.find((v) => v.id === forcedNounId);
      if (foundVerb) return { kind: 'verb', data: foundVerb };
    }
    const unmastered = ALL_FLASHCARD_ITEMS.filter(
      (item) => !progress.wordStats[item.data.id]?.mastered
    );
    if (unmastered.length > 0 && Math.random() < 0.75) {
      return unmastered[Math.floor(Math.random() * unmastered.length)];
    }
    return ALL_FLASHCARD_ITEMS[
      Math.floor(Math.random() * ALL_FLASHCARD_ITEMS.length)
    ];
  });

  const [activeCardDirection, setActiveCardDirection] = useState<
    'lt_to_target' | 'target_to_lt'
  >('lt_to_target');

  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [typedInput, setTypedInput] = useState('');
  const [typingChecked, setTypingChecked] = useState(false);
  const [typingIsCorrect, setTypingIsCorrect] = useState(false);
  const [typingDiacriticNote, setTypingDiacriticNote] = useState(false);
  const [fullTableModalOpen, setFullTableModalOpen] = useState(false);

  const [sessionReviewed, setSessionReviewed] = useState(0);
  const [sessionKnown, setSessionKnown] = useState(0);
  const [retryQueueIds, setRetryQueueIds] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  const availableSubtypes = useMemo(() => {
    return SUBTYPE_META_LIST.filter((s) => {
      if (selectedDeclension !== 'all' && s.declension !== selectedDeclension) {
        return false;
      }
      if (selectedGender !== 'all' && s.gender !== selectedGender) {
        return false;
      }
      return true;
    });
  }, [selectedDeclension, selectedGender]);

  useEffect(() => {
    if (
      selectedSubtype !== 'all' &&
      !availableSubtypes.some((s) => s.id === selectedSubtype)
    ) {
      setSelectedSubtype('all');
    }
  }, [availableSubtypes, selectedSubtype]);

  const hasActiveFilters =
    posFilter !== 'all' ||
    deckFilter !== 'all' ||
    selectedDifficulty !== 'all' ||
    selectedGender !== 'all' ||
    selectedTopic !== 'all' ||
    selectedDeclension !== 'all' ||
    selectedSubtype !== 'all' ||
    selectedVerbConj !== 'all' ||
    selectedVerbGov !== 'all' ||
    onlyReflexiveVerbs ||
    onlyExceptions;

  const handleResetAllFilters = () => {
    setPosFilter('all');
    setDeckFilter('all');
    setSelectedDifficulty('all');
    setSelectedGender('all');
    setSelectedTopic('all');
    setSelectedDeclension('all');
    setSelectedSubtype('all');
    setSelectedVerbConj('all');
    setSelectedVerbGov('all');
    setOnlyReflexiveVerbs(false);
    setOnlyExceptions(false);
  };

  const filteredPool = useMemo(() => {
    return ALL_FLASHCARD_ITEMS.filter((item) => {
      if (posFilter === 'nouns' && item.kind !== 'noun') return false;
      if (posFilter === 'verbs' && item.kind !== 'verb') return false;

      const w = item.data;
      if (
        selectedDifficulty !== 'all' &&
        w.difficulty !== selectedDifficulty
      ) {
        return false;
      }
      if (selectedTopic !== 'all' && w.topic !== selectedTopic) {
        return false;
      }
      if (onlyExceptions && !w.stemAlternation) {
        return false;
      }
      if (deckFilter === 'favorites' && !progress.favorites.includes(w.id)) {
        return false;
      }
      if (deckFilter === 'mastered' && !progress.wordStats[w.id]?.mastered) {
        return false;
      }
      if (deckFilter === 'unmastered' && progress.wordStats[w.id]?.mastered) {
        return false;
      }

      if (item.kind === 'noun') {
        if (selectedGender !== 'all' && item.data.gender !== selectedGender) {
          return false;
        }
        if (
          selectedDeclension !== 'all' &&
          item.data.declension !== selectedDeclension
        ) {
          return false;
        }
        if (
          selectedSubtype !== 'all' &&
          item.data.subtype !== selectedSubtype
        ) {
          return false;
        }
      } else {
        // Verb filters
        if (
          selectedVerbConj !== 'all' &&
          item.data.conjugation !== selectedVerbConj
        ) {
          return false;
        }
        if (
          selectedVerbGov !== 'all' &&
          item.data.governedCase !== selectedVerbGov
        ) {
          return false;
        }
        if (onlyReflexiveVerbs && !item.data.isReflexive) {
          return false;
        }
      }

      return true;
    });
  }, [
    posFilter,
    selectedDifficulty,
    selectedGender,
    selectedTopic,
    selectedDeclension,
    selectedSubtype,
    selectedVerbConj,
    selectedVerbGov,
    onlyReflexiveVerbs,
    onlyExceptions,
    deckFilter,
    progress.favorites,
    progress.wordStats,
  ]);

  const effectivePool =
    filteredPool.length > 0 ? filteredPool : ALL_FLASHCARD_ITEMS;

  const resolveCardDirection = (
    dir: FlashcardDirection
  ): 'lt_to_target' | 'target_to_lt' => {
    if (dir === 'mixed') {
      return Math.random() < 0.5 ? 'lt_to_target' : 'target_to_lt';
    }
    return dir;
  };

  const pickNextItem = (
    pool: FlashcardItem[],
    excludeId?: string,
    overrideId?: string
  ): FlashcardItem => {
    if (overrideId) {
      const forced = ALL_FLASHCARD_ITEMS.find((i) => i.data.id === overrideId);
      if (forced) return forced;
    }

    if (retryQueueIds.length > 0 && Math.random() < 0.35) {
      const retryCandidates = pool.filter(
        (i) => retryQueueIds.includes(i.data.id) && i.data.id !== excludeId
      );
      if (retryCandidates.length > 0) {
        return retryCandidates[
          Math.floor(Math.random() * retryCandidates.length)
        ];
      }
    }

    const candidates =
      pool.length > 1 ? pool.filter((i) => i.data.id !== excludeId) : pool;

    const unmastered = candidates.filter(
      (i) => !progress.wordStats[i.data.id]?.mastered
    );
    if (unmastered.length > 0 && Math.random() < 0.75) {
      return unmastered[Math.floor(Math.random() * unmastered.length)];
    }

    return candidates[Math.floor(Math.random() * candidates.length)];
  };

  const loadCard = (overrideWordId?: string, focusInput = false) => {
    const nextItem = pickNextItem(
      effectivePool,
      currentItem?.data.id,
      overrideWordId
    );
    const nextDir = resolveCardDirection(direction);
    setCurrentItem(nextItem);
    setActiveCardDirection(nextDir);
    setIsFlipped(false);
    setSelectedOptionId(null);
    setTypedInput('');
    setTypingChecked(false);
    setTypingIsCorrect(false);
    setTypingDiacriticNote(false);

    if (
      interactionMode === 'typing' &&
      (focusInput || (typeof window !== 'undefined' && window.innerWidth >= 768))
    ) {
      setTimeout(() => {
        inputRef.current?.focus({ preventScroll: true });
      }, 30);
    }
  };

  useEffect(() => {
    if (forcedNounId) {
      loadCard(forcedNounId);
    }
  }, [forcedNounId]);

  useEffect(() => {
    setActiveCardDirection(resolveCardDirection(direction));
    setIsFlipped(false);
    setSelectedOptionId(null);
    setTypedInput('');
    setTypingChecked(false);
  }, [direction, interactionMode]);

  useEffect(() => {
    if (
      filteredPool.length > 0 &&
      !filteredPool.some((i) => i.data.id === currentItem.data.id)
    ) {
      loadCard();
    }
  }, [
    posFilter,
    selectedDifficulty,
    selectedGender,
    selectedTopic,
    selectedDeclension,
    selectedSubtype,
    selectedVerbConj,
    selectedVerbGov,
    onlyReflexiveVerbs,
    onlyExceptions,
    deckFilter,
  ]);

  const getItemLemmaLt = (item: FlashcardItem): string => {
    if (item.kind === 'noun') return item.data.lemma;
    return item.data.infinitive.replace(/\s*\([^)]*\)\s*/g, '').trim();
  };

  const getItemDisplayLt = (item: FlashcardItem): string => {
    return item.kind === 'noun' ? item.data.lemma : item.data.infinitive;
  };

  const getItemTranslation = (item: FlashcardItem): string => {
    return targetTranslationLang === 'en' ? item.data.en : item.data.uk;
  };

  // Build 4 multiple-choice options for Quiz mode, matching part of speech (noun vs verb)
  const quizOptions = useMemo(() => {
    const sameKindPool = filteredPool.filter(
      (i) => i.kind === currentItem.kind && i.data.id !== currentItem.data.id
    );
    const fallbackSameKind = ALL_FLASHCARD_ITEMS.filter(
      (i) => i.kind === currentItem.kind && i.data.id !== currentItem.data.id
    );
    const distractorSource =
      sameKindPool.length >= 3 ? sameKindPool : fallbackSameKind;

    const shuffledDistractors = [...distractorSource]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    return [currentItem, ...shuffledDistractors].sort(
      () => Math.random() - 0.5
    );
  }, [
    currentItem.data.id,
    currentItem.kind,
    activeCardDirection,
    targetTranslationLang,
    filteredPool,
  ]);

  const speakLithuanian = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'lt-LT';
      utterance.rate = 0.92;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore speech synthesis errors on restricted browsers
    }
  };

  const promptText =
    activeCardDirection === 'lt_to_target'
      ? getItemDisplayLt(currentItem)
      : getItemTranslation(currentItem);

  const answerText =
    activeCardDirection === 'lt_to_target'
      ? getItemTranslation(currentItem)
      : getItemDisplayLt(currentItem);

  const recordCurrentOutcome = (
    userAns: string,
    correctAns: string,
    isCorrect: boolean
  ) => {
    if (currentItem.kind === 'noun') {
      onRecordOutcome(
        currentItem.data,
        'nom',
        'sg',
        userAns,
        correctAns,
        isCorrect
      );
    } else if (onRecordVerbOutcome) {
      onRecordVerbOutcome(currentItem.data, isCorrect);
    }
  };

  const handleMarkFlipResult = (known: boolean) => {
    const id = currentItem.data.id;
    const lemmaLt = getItemLemmaLt(currentItem);
    setSessionReviewed((c) => c + 1);
    if (known) {
      setSessionKnown((c) => c + 1);
      setRetryQueueIds((prev) => prev.filter((item) => item !== id));
    } else {
      setRetryQueueIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    }

    recordCurrentOutcome(known ? lemmaLt : '—', lemmaLt, known);

    if (forcedNounId) {
      onClearForcedNoun();
    }
    loadCard();
  };

  const handleSelectQuizOption = (option: FlashcardItem) => {
    if (selectedOptionId !== null) return;
    setSelectedOptionId(option.data.id);
    setIsFlipped(true);
    const id = currentItem.data.id;
    const isCorrect = option.data.id === id;

    setSessionReviewed((c) => c + 1);
    if (isCorrect) {
      setSessionKnown((c) => c + 1);
      setRetryQueueIds((prev) => prev.filter((item) => item !== id));
    } else {
      setRetryQueueIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    }

    const userAnsText =
      activeCardDirection === 'lt_to_target'
        ? getItemTranslation(option)
        : getItemLemmaLt(option);

    recordCurrentOutcome(userAnsText, answerText, isCorrect);
  };

  const handleCheckTyping = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!typedInput.trim() || typingChecked) return;

    let isCorrect = false;
    let diacriticWarning = false;

    if (activeCardDirection === 'target_to_lt') {
      const cleanedUser = typedInput.trim().toLowerCase();
      const expectedLt = getItemLemmaLt(currentItem).toLowerCase();
      if (cleanedUser === expectedLt) {
        isCorrect = true;
      } else if (
        foldLithuanianDiacritics(cleanedUser) ===
        foldLithuanianDiacritics(expectedLt)
      ) {
        isCorrect = true;
        diacriticWarning = true;
      }
    } else {
      const rawExpected = getItemTranslation(currentItem);
      const variants = rawExpected
        .split(/[,;/]/)
        .map((s) => normalizeTranslationString(s))
        .filter(Boolean);
      const fullNormalized = normalizeTranslationString(rawExpected);
      const userNorm = normalizeTranslationString(typedInput);

      if (
        userNorm.length > 0 &&
        (userNorm === fullNormalized || variants.includes(userNorm))
      ) {
        isCorrect = true;
      }
    }

    setTypingChecked(true);
    setTypingIsCorrect(isCorrect);
    setTypingDiacriticNote(diacriticWarning);
    setIsFlipped(true);

    const id = currentItem.data.id;
    setSessionReviewed((c) => c + 1);
    if (isCorrect) {
      setSessionKnown((c) => c + 1);
      setRetryQueueIds((prev) => prev.filter((item) => item !== id));
    } else {
      setRetryQueueIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    }

    recordCurrentOutcome(typedInput.trim(), answerText, isCorrect);
  };

  const handleInsertDiacritic = (char: string) => {
    if (!inputRef.current) {
      setTypedInput((prev) => prev + char);
      return;
    }
    const el = inputRef.current;
    const start = el.selectionStart ?? typedInput.length;
    const end = el.selectionEnd ?? typedInput.length;
    const updated = typedInput.slice(0, start) + char + typedInput.slice(end);
    setTypedInput(updated);
    setTimeout(() => {
      el.focus({ preventScroll: true });
      el.setSelectionRange(start + 1, start + 1);
    }, 10);
  };

  const isFavorite = progress.favorites.includes(currentItem.data.id);
  const wordState = progress.wordStats[currentItem.data.id];
  const currentLemmaLt = getItemLemmaLt(currentItem);

  const labels = {
    directionTitle:
      language === 'uk'
        ? 'Напрямок перекладу'
        : language === 'lt'
        ? 'Vertimo kryptis'
        : 'Translation Direction',
    ltToTarget:
      targetTranslationLang === 'uk'
        ? language === 'uk'
          ? 'Лит → Укр'
          : language === 'lt'
          ? 'Lietuvių → Ukrainiečių'
          : 'LT → UK'
        : language === 'uk'
        ? 'Лит → Англ'
        : language === 'lt'
        ? 'Lietuvių → Anglų'
        : 'LT → EN',
    targetToLt:
      targetTranslationLang === 'uk'
        ? language === 'uk'
          ? 'Укр → Лит'
          : language === 'lt'
          ? 'Ukrainiečių → Lietuvių'
          : 'UK → LT'
        : language === 'uk'
        ? 'Англ → Лит'
        : language === 'lt'
        ? 'Anglų → Lietuvių'
        : 'EN → LT',
    mixedDir:
      language === 'uk'
        ? 'Змішано'
        : language === 'lt'
        ? 'Mišriai'
        : 'Mixed',
    modeFlip:
      language === 'uk'
        ? 'Картки'
        : language === 'lt'
        ? 'Kortelės'
        : 'Flip Cards',
    modeQuiz:
      language === 'uk'
        ? 'Тест (4 варіанти)'
        : language === 'lt'
        ? 'Testas (4 variantai)'
        : 'Multiple Choice',
    modeTyping:
      language === 'uk'
        ? 'Письмово'
        : language === 'lt'
        ? 'Rašymas'
        : 'Type Answer',
    filterAll:
      language === 'uk'
        ? 'Усі'
        : language === 'lt'
        ? 'Visi'
        : 'All',
    filterUnmastered:
      language === 'uk'
        ? 'Невивчені'
        : language === 'lt'
        ? 'Neišmokti'
        : 'To Learn',
    filterFavorites:
      language === 'uk'
        ? 'Обрані ★'
        : language === 'lt'
        ? 'Įsiminti ★'
        : 'Favorites ★',
    filterMastered:
      language === 'uk'
        ? 'Вивчені ✓'
        : language === 'lt'
        ? 'Išmokti ✓'
        : 'Mastered ✓',
    allTopics:
      language === 'uk'
        ? 'Усі 14 тем'
        : language === 'lt'
        ? 'Visos 14 temų'
        : 'All 14 Topics',
    allDeclensions:
      language === 'uk'
        ? 'Усі 5 відмін'
        : language === 'lt'
        ? 'Visos 5 linksniuotės'
        : 'All 5 Declensions',
    allSubtypes:
      language === 'uk'
        ? 'Усі закінчення (підтипи)'
        : language === 'lt'
        ? 'Visos galūnės (potipiai)'
        : 'All Endings (Subtypes)',
    allLevels:
      language === 'uk'
        ? 'Усі рівні'
        : language === 'lt'
        ? 'Visi lygiai'
        : 'All Levels',
    allGenders:
      language === 'uk'
        ? 'Усі роди'
        : language === 'lt'
        ? 'Abi giminės'
        : 'All Genders',
    masculineShort:
      language === 'uk'
        ? 'Чол. (vyr.)'
        : language === 'lt'
        ? 'Vyr. g.'
        : 'Masc. (vyr.)',
    feminineShort:
      language === 'uk'
        ? 'Жін. (mot.)'
        : language === 'lt'
        ? 'Mot. g.'
        : 'Fem. (mot.)',
    exceptionsFilter:
      language === 'uk'
        ? 'Чергування / винятки'
        : language === 'lt'
        ? 'Kamieno kaita / išimtys'
        : 'Alternations / Exceptions',
    resetFilters:
      language === 'uk'
        ? 'Скинути фільтри'
        : language === 'lt'
        ? 'Atstatyti filtrus'
        : 'Reset Filters',
    noFilterMatches:
      language === 'uk'
        ? 'За вибраною комбінацією фільтрів слів не знайдено. Показано всі слова — або скиньте фільтри.'
        : language === 'lt'
        ? 'Pagal pasirinktus filtrus žodžių nerasta. Rodomi visi žodžiai arba atstatykite filtrus.'
        : 'No words match the selected filter combination. Showing all words, or reset filters.',
    promptBadgeLtNoun:
      language === 'uk'
        ? 'Литовський іменник (Vardininkas)'
        : language === 'lt'
        ? 'Lietuviškas daiktavardis (Vardininkas)'
        : 'Lithuanian Noun (Nominative)',
    promptBadgeLtVerb:
      language === 'uk'
        ? 'Литовське дієслово (Bendratis)'
        : language === 'lt'
        ? 'Lietuviškas veiksmažodis (Bendratis)'
        : 'Lithuanian Verb (Infinitive)',
    promptBadgeTarget:
      targetTranslationLang === 'uk'
        ? language === 'uk'
          ? 'Переклад українською'
          : language === 'lt'
          ? 'Vertimas ukrainiečių k.'
          : 'Ukrainian Translation'
        : language === 'uk'
        ? 'Переклад англійською'
        : language === 'lt'
        ? 'Vertimas anglų k.'
        : 'English Translation',
    revealBtn:
      language === 'uk'
        ? 'Показати переклад і форми'
        : language === 'lt'
        ? 'Rodyti vertimą ir formas'
        : 'Reveal Translation & Forms',
    needPracticeBtn:
      language === 'uk'
        ? 'Ще повторити'
        : language === 'lt'
        ? 'Dar kartoti'
        : 'Still Learning',
    knowItBtn:
      language === 'uk'
        ? 'Знаю це слово'
        : language === 'lt'
        ? 'Moku šį žodį'
        : 'I Know It',
    nextCardBtn:
      language === 'uk'
        ? 'Наступна картка'
        : language === 'lt'
        ? 'Kita kortelė'
        : 'Next Card',
    checkBtn:
      language === 'uk'
        ? 'Перевірити'
        : language === 'lt'
        ? 'Patikrinti'
        : 'Check Answer',
    listenPronunciation:
      language === 'uk'
        ? 'Озвучити литовською'
        : language === 'lt'
        ? 'Klausyti tarimo'
        : 'Listen in Lithuanian',
    exampleLabel:
      language === 'uk'
        ? 'Приклад уживання в реченні'
        : language === 'lt'
        ? 'Vartojimo sakinyje pavyzdys'
        : 'Example in a Sentence',
    poolCountLabel:
      language === 'uk'
        ? 'Карток у наборі:'
        : language === 'lt'
        ? 'Kortelių rinkinyje:'
        : 'Cards in deck:',
  };

  return (
    <div className="max-w-3xl mx-auto px-2.5 sm:px-6 pt-1.5 pb-2 sm:py-4 space-y-2.5 sm:space-y-4">
      {/* Control Strip: Part of Speech + Direction + Interaction Mode + Filters */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
        {/* Row 0: Part of Speech Selector (All 1500 / Nouns 1000 / Verbs 500) */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="inline-flex flex-wrap items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            {(
              [
                {
                  id: 'all',
                  label:
                    language === 'uk'
                      ? `Усі слова (${ALL_FLASHCARD_ITEMS.length})`
                      : language === 'lt'
                      ? `Visi žodžiai (${ALL_FLASHCARD_ITEMS.length})`
                      : `All Words (${ALL_FLASHCARD_ITEMS.length})`,
                },
                {
                  id: 'nouns',
                  label:
                    language === 'uk'
                      ? `Іменники (${ALL_VERIFIED_NOUNS.length})`
                      : language === 'lt'
                      ? `Daiktavardžiai (${ALL_VERIFIED_NOUNS.length})`
                      : `Nouns (${ALL_VERIFIED_NOUNS.length})`,
                },
                {
                  id: 'verbs',
                  label:
                    language === 'uk'
                      ? `Дієслова (${ALL_VERIFIED_VERBS.length})`
                      : language === 'lt'
                      ? `Veiksmažodžiai (${ALL_VERIFIED_VERBS.length})`
                      : `Verbs (${ALL_VERIFIED_VERBS.length})`,
                },
              ] as const
            ).map((pos) => (
              <button
                key={pos.id}
                type="button"
                onClick={() => setPosFilter(pos.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  posFilter === pos.id
                    ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {pos.label}
              </button>
            ))}
          </div>

          {/* Deck Progress Filter (All / Unmastered / Favorites / Mastered) */}
          <div className="flex flex-wrap items-center gap-1">
            {(
              [
                { id: 'all', label: labels.filterAll },
                { id: 'unmastered', label: labels.filterUnmastered },
                { id: 'favorites', label: labels.filterFavorites },
                { id: 'mastered', label: labels.filterMastered },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setDeckFilter(f.id)}
                className={`px-2 py-1 rounded-lg text-[11px] font-medium border transition-colors whitespace-nowrap ${
                  deckFilter === f.id
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-900 dark:text-amber-300 font-semibold'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Row 1: Direction Switcher + Interaction Format */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {language === 'lt' && (
              <div className="inline-flex p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mr-1">
                <button
                  type="button"
                  onClick={() => setLtBridgeLang('uk')}
                  className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                    ltBridgeLang === 'uk'
                      ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  UKR
                </button>
                <button
                  type="button"
                  onClick={() => setLtBridgeLang('en')}
                  className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                    ltBridgeLang === 'en'
                      ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  ENG
                </button>
              </div>
            )}

            <div
              role="group"
              aria-label={labels.directionTitle}
              className="inline-flex flex-wrap items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700"
            >
              <button
                type="button"
                onClick={() => setDirection('lt_to_target')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  direction === 'lt_to_target'
                    ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{labels.ltToTarget}</span>
              </button>

              <button
                type="button"
                onClick={() => setDirection('target_to_lt')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  direction === 'target_to_lt'
                    ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{labels.targetToLt}</span>
              </button>

              <button
                type="button"
                onClick={() => setDirection('mixed')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 whitespace-nowrap ${
                  direction === 'mixed'
                    ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>{labels.mixedDir}</span>
              </button>
            </div>
          </div>

          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setInteractionMode('flip')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                interactionMode === 'flip'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-amber-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{labels.modeFlip}</span>
            </button>
            <button
              type="button"
              onClick={() => setInteractionMode('quiz')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                interactionMode === 'quiz'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-amber-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ListChecks className="w-3.5 h-3.5" />
              <span>{labels.modeQuiz}</span>
            </button>
            <button
              type="button"
              onClick={() => setInteractionMode('typing')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                interactionMode === 'typing'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-amber-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>{labels.modeTyping}</span>
            </button>
          </div>
        </div>

        {/* Row 2: Difficulty Level (CEFR A0-B2) + Gender/Reflexive Filter */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mr-0.5 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              {language === 'uk'
                ? 'Рівень:'
                : language === 'lt'
                ? 'Lygis:'
                : 'Level:'}
            </span>
            <button
              type="button"
              onClick={() => setSelectedDifficulty('all')}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium border transition-colors whitespace-nowrap ${
                selectedDifficulty === 'all'
                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-amber-500 dark:text-slate-950 dark:border-amber-500 font-semibold'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {labels.allLevels}
            </button>
            {([1, 2, 3, 4] as DifficultyLevel[]).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setSelectedDifficulty(lvl)}
                title={DIFFICULTY_METADATA[lvl].title[language]}
                className={`px-2 py-1 rounded-lg text-[11px] font-mono font-semibold border transition-colors whitespace-nowrap ${
                  selectedDifficulty === lvl
                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-amber-500 dark:text-slate-950 dark:border-amber-500'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {DIFFICULTY_CEFR_LABELS[lvl]}
              </button>
            ))}
          </div>

          {posFilter !== 'verbs' && (
            <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              {(
                [
                  { id: 'all', label: labels.allGenders },
                  { id: 'm', label: labels.masculineShort },
                  { id: 'f', label: labels.feminineShort },
                ] as const
              ).map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setSelectedGender(g.id)}
                  className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors whitespace-nowrap ${
                    selectedGender === g.id
                      ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-amber-400'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          )}

          {posFilter !== 'nouns' && (
            <button
              type="button"
              onClick={() => setOnlyReflexiveVerbs((v) => !v)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${
                onlyReflexiveVerbs
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {language === 'uk'
                ? 'Зворотні (-tis / -si)'
                : language === 'lt'
                ? 'Sangrąžiniai (-si)'
                : 'Reflexive (-si)'}
            </button>
          )}
        </div>

        {/* Row 3: Grammatical Categories (Declension/Subtype for Nouns, Conjugation/Governed Case for Verbs) + Topic */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            {posFilter !== 'verbs' && (
              <>
                <select
                  value={selectedDeclension}
                  onChange={(e) =>
                    setSelectedDeclension(
                      e.target.value === 'all'
                        ? 'all'
                        : (Number(e.target.value) as DeclensionType)
                    )
                  }
                  aria-label="Declension filter"
                  className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] sm:text-xs font-medium text-slate-800 dark:text-slate-200"
                >
                  <option value="all">{labels.allDeclensions}</option>
                  {([1, 2, 3, 4, 5] as DeclensionType[]).map((d) => (
                    <option key={d} value={d}>
                      {d} linksniuotė (
                      {DECLENSION_PDF_TABLE[d - 1].singularEndings.nom.endings})
                    </option>
                  ))}
                </select>

                <select
                  value={selectedSubtype}
                  onChange={(e) =>
                    setSelectedSubtype(
                      e.target.value as DeclensionSubtype | 'all'
                    )
                  }
                  aria-label="Ending subtype filter"
                  className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] sm:text-xs font-medium text-slate-800 dark:text-slate-200"
                >
                  <option value="all">{labels.allSubtypes}</option>
                  {availableSubtypes.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.declension} відм.: {sub.endingLabel}
                    </option>
                  ))}
                </select>
              </>
            )}

            {posFilter !== 'nouns' && (
              <>
                <select
                  value={selectedVerbConj}
                  onChange={(e) =>
                    setSelectedVerbConj(
                      e.target.value === 'all'
                        ? 'all'
                        : (Number(e.target.value) as VerbConjugationType)
                    )
                  }
                  aria-label="Verb conjugation filter"
                  className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] sm:text-xs font-medium text-slate-800 dark:text-slate-200"
                >
                  <option value="all">
                    {language === 'uk'
                      ? 'Усі 3 дієвідміни (-a/-i/-o)'
                      : language === 'lt'
                      ? 'Visos 3 asmenuotės'
                      : 'All 3 Conjugations'}
                  </option>
                  {([1, 2, 3] as VerbConjugationType[]).map((c) => (
                    <option key={c} value={c}>
                      {VERB_CONJUGATIONS_METADATA[c].title[language]}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedVerbGov}
                  onChange={(e) =>
                    setSelectedVerbGov(
                      e.target.value as VerbGovernedCase | 'all'
                    )
                  }
                  aria-label="Governed case filter"
                  className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] sm:text-xs font-medium text-slate-800 dark:text-slate-200"
                >
                  <option value="all">
                    {language === 'uk'
                      ? 'Усі відмінки керування'
                      : language === 'lt'
                      ? 'Visi valdomi linksniai'
                      : 'All Governed Cases'}
                  </option>
                  {(
                    [
                      'acc',
                      'gen',
                      'dat',
                      'ins',
                      'loc',
                      'intransitive',
                    ] as VerbGovernedCase[]
                  ).map((g) => (
                    <option key={g} value={g}>
                      {VERB_GOVERNED_CASES_METADATA[g].shortBadge[language]}
                    </option>
                  ))}
                </select>
              </>
            )}

            {/* Topic Filter */}
            <select
              value={selectedTopic}
              onChange={(e) =>
                setSelectedTopic(e.target.value as TopicId | 'all')
              }
              aria-label="Topic filter"
              className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] sm:text-xs font-medium text-slate-800 dark:text-slate-200"
            >
              <option value="all">{labels.allTopics}</option>
              {(Object.keys(TOPICS_METADATA) as TopicId[]).map((top) => (
                <option key={top} value={top}>
                  {TOPICS_METADATA[top].label[language]}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setOnlyExceptions((prev) => !prev)}
              className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-medium border transition-colors flex items-center gap-1 whitespace-nowrap ${
                onlyExceptions
                  ? 'bg-amber-500/15 border-amber-500/50 text-amber-900 dark:text-amber-300 font-semibold'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>{labels.exceptionsFilter}</span>
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetAllFilters}
                className="px-2 py-1 rounded-lg text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-1 whitespace-nowrap"
              >
                <X className="w-3 h-3" />
                <span>{labels.resetFilters}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 tabular-nums ml-auto">
            <span>
              {labels.poolCountLabel}{' '}
              <strong
                className={
                  filteredPool.length === 0
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-slate-900 dark:text-white'
                }
              >
                {filteredPool.length}
              </strong>
            </span>
            <span>·</span>
            <span>
              {language === 'uk'
                ? 'Сесія:'
                : language === 'lt'
                ? 'Sesija:'
                : 'Session:'}{' '}
              <strong className="text-emerald-600 dark:text-emerald-400">
                {sessionKnown}
              </strong>{' '}
              / {sessionReviewed}
            </span>
          </div>
        </div>

        {filteredPool.length === 0 && (
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-900 dark:text-amber-200">
            <span>{labels.noFilterMatches}</span>
            <button
              type="button"
              onClick={handleResetAllFilters}
              className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-500 transition-colors shrink-0"
            >
              {labels.resetFilters}
            </button>
          </div>
        )}
      </div>

      {/* Main Flashcard Stage */}
      <div className="p-4 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        {/* Card Header */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <span
              className={`px-2 py-0.5 rounded-md font-bold ${
                currentItem.kind === 'verb'
                  ? 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
              }`}
            >
              {currentItem.kind === 'verb'
                ? language === 'uk'
                  ? 'Дієслово'
                  : language === 'lt'
                  ? 'Veiksmažodis'
                  : 'Verb'
                : language === 'uk'
                ? 'Іменник'
                : language === 'lt'
                ? 'Daiktavardis'
                : 'Noun'}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-900 dark:text-amber-300 font-mono font-bold">
              {DIFFICULTY_CEFR_LABELS[currentItem.data.difficulty]}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
              {TOPICS_METADATA[currentItem.data.topic].label[language]}
            </span>
            <span>·</span>
            {currentItem.kind === 'noun' ? (
              <>
                <span>
                  {
                    DECLENSION_PDF_TABLE[currentItem.data.declension - 1].title[
                      language
                    ]
                  }
                </span>
                <span>·</span>
                <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {language === 'uk'
                    ? `зразок: ${SUBTYPE_ENDINGS[currentItem.data.subtype].modelWord}`
                    : language === 'lt'
                    ? `pvz.: ${SUBTYPE_ENDINGS[currentItem.data.subtype].modelWord}`
                    : `model: ${SUBTYPE_ENDINGS[currentItem.data.subtype].modelWord}`}
                </span>
                <span>·</span>
                <span>
                  {currentItem.data.gender === 'm'
                    ? language === 'uk'
                      ? 'чол. рід (vyr. g.)'
                      : 'vyr. g.'
                    : language === 'uk'
                    ? 'жін. рід (mot. g.)'
                    : 'mot. g.'}
                </span>
              </>
            ) : (
              <>
                <span>
                  {
                    VERB_CONJUGATIONS_METADATA[currentItem.data.conjugation]
                      .title[language]
                  }
                </span>
                <span>·</span>
                <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 font-semibold">
                  {
                    VERB_GOVERNED_CASES_METADATA[currentItem.data.governedCase]
                      .shortBadge[language]
                  }
                </span>
              </>
            )}

            {currentItem.data.stemAlternation && (
              <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-mono text-[11px]">
                {currentItem.data.stemAlternation[language]}
              </span>
            )}
            {wordState?.mastered && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold">
                <CheckCircle2 className="w-3 h-3" />
                {language === 'uk'
                  ? 'Вивчено'
                  : language === 'lt'
                  ? 'Išmokta'
                  : 'Mastered'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => onToggleFavorite(currentItem.data.id)}
              title="Toggle Favorite"
              className={`p-2 rounded-xl border transition-colors ${
                isFavorite
                  ? 'border-amber-300 bg-amber-50 text-amber-600 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Star
                className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* Prompt Display Area */}
        <div
          onClick={() => {
            if (interactionMode === 'flip' && !isFlipped) {
              setIsFlipped(true);
            }
          }}
          className={`py-6 sm:py-10 px-4 rounded-2xl border text-center transition-all ${
            interactionMode === 'flip' && !isFlipped
              ? 'cursor-pointer bg-slate-50/70 hover:bg-slate-100/70 dark:bg-slate-800/40 dark:hover:bg-slate-800/70 border-slate-200/80 dark:border-slate-800'
              : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/60 dark:border-slate-800'
          }`}
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs font-semibold mb-3">
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>
              {activeCardDirection === 'lt_to_target'
                ? currentItem.kind === 'noun'
                  ? labels.promptBadgeLtNoun
                  : labels.promptBadgeLtVerb
                : labels.promptBadgeTarget}
            </span>
          </div>

          <div className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white font-display break-words flex items-center justify-center gap-3">
            {activeCardDirection === 'lt_to_target' ? (
              <>
                {currentItem.kind === 'noun' ? (
                  (() => {
                    const nomSeg = segmentLithuanianWord(
                      currentItem.data.lemma,
                      currentItem.data.subtype,
                      'nom',
                      'sg'
                    );
                    return (
                      <span>
                        <span>{nomSeg.stem}</span>
                        <span className="text-amber-600 dark:text-amber-400 underline decoration-2 underline-offset-4">
                          {nomSeg.ending}
                        </span>
                      </span>
                    );
                  })()
                ) : (
                  <span>{currentItem.data.infinitive}</span>
                )}
                <button
                  type="button"
                  onClick={(e) => speakLithuanian(currentLemmaLt, e)}
                  title={labels.listenPronunciation}
                  className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors shrink-0 shadow-2xs"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </>
            ) : (
              <span>{promptText}</span>
            )}
          </div>

          {activeCardDirection === 'lt_to_target' && (
            <div className="mt-2 text-xs font-mono text-slate-500 dark:text-slate-400">
              {currentItem.kind === 'noun' ? (
                <>
                  Kilmininkas (Ko?):{' '}
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {currentItem.data.sg.gen}
                  </span>{' '}
                  · Dgs. Vardininkas:{' '}
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {currentItem.data.pl.nom}
                  </span>
                </>
              ) : (
                <>
                  Esamojo l. 3 asm. (jis/ji):{' '}
                  <span className="font-semibold text-amber-700 dark:text-amber-400">
                    {currentItem.data.present3}
                  </span>{' '}
                  · Būtojo k. l. 3 asm.:{' '}
                  <span className="font-semibold text-indigo-700 dark:text-indigo-400">
                    {currentItem.data.past3}
                  </span>
                </>
              )}
            </div>
          )}

          {interactionMode === 'flip' && !isFlipped && (
            <div className="mt-6">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(true);
                }}
                className="px-6 py-3 rounded-xl bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-semibold text-sm hover:opacity-90 transition-opacity shadow-xs"
              >
                {labels.revealBtn}
              </button>
            </div>
          )}
        </div>

        {/* QUIZ MODE: 4 Multiple-Choice Options */}
        {interactionMode === 'quiz' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {quizOptions.map((opt, idx) => {
              const optionLabel =
                activeCardDirection === 'lt_to_target'
                  ? getItemTranslation(opt)
                  : getItemDisplayLt(opt);
              const isSelected = selectedOptionId === opt.data.id;
              const isCorrectOption = opt.data.id === currentItem.data.id;

              let btnStyle =
                'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800';
              if (selectedOptionId !== null) {
                if (isCorrectOption) {
                  btnStyle =
                    'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold';
                } else if (isSelected && !isCorrectOption) {
                  btnStyle =
                    'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-900 dark:text-rose-200 font-semibold';
                } else {
                  btnStyle =
                    'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 opacity-75';
                }
              }

              return (
                <button
                  key={opt.data.id}
                  type="button"
                  disabled={selectedOptionId !== null}
                  onClick={() => handleSelectQuizOption(opt)}
                  className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all flex items-center justify-between gap-3 min-h-[52px] ${btnStyle}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-sm sm:text-base truncate">
                      {optionLabel}
                    </span>
                  </div>
                  {selectedOptionId !== null && isCorrectOption && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  )}
                  {selectedOptionId !== null &&
                    isSelected &&
                    !isCorrectOption && (
                      <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                    )}
                </button>
              );
            })}
          </div>
        )}

        {/* TYPING MODE: Active Recall Input */}
        {interactionMode === 'typing' && !typingChecked && (
          <form onSubmit={handleCheckTyping} className="space-y-3">
            {activeCardDirection === 'target_to_lt' && (
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mr-1">
                  Lietuviškos raidės:
                </span>
                {LITHUANIAN_DIACRITICS.map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleInsertDiacritic(ch)}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-mono font-bold text-sm transition-colors"
                  >
                    {ch}
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                ref={inputRef}
                type="text"
                value={typedInput}
                onChange={(e) => setTypedInput(e.target.value)}
                onFocus={() => onInputFocusChange?.(true)}
                onBlur={() => onInputFocusChange?.(false)}
                placeholder={
                  activeCardDirection === 'target_to_lt'
                    ? language === 'uk'
                      ? 'Введіть слово литовською...'
                      : 'Type the Lithuanian word...'
                    : targetTranslationLang === 'uk'
                    ? 'Введіть переклад українською...'
                    : 'Type the English translation...'
                }
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-base font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="submit"
                disabled={!typedInput.trim()}
                className="px-6 py-3 rounded-xl bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition-opacity shrink-0 min-h-[46px]"
              >
                {labels.checkBtn}
              </button>
            </div>
          </form>
        )}

        {/* Revealed Back of Card */}
        {isFlipped && (
          <div className="p-4 sm:p-6 rounded-2xl bg-amber-50/60 dark:bg-slate-800/70 border border-amber-200/80 dark:border-slate-700 space-y-4">
            {interactionMode === 'typing' && typingChecked && (
              <div
                className={`p-3 rounded-xl border flex items-center justify-between gap-2 text-xs sm:text-sm font-semibold ${
                  typingIsCorrect
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {typingIsCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  )}
                  <span>
                    {typingIsCorrect
                      ? typingDiacriticNote
                        ? language === 'uk'
                          ? `Правильно! Зверніть увагу на литовські літери: ${currentLemmaLt}`
                          : `Correct! Watch the Lithuanian diacritics: ${currentLemmaLt}`
                        : language === 'uk'
                        ? 'Чудово! Правильна відповідь'
                        : 'Excellent! Correct answer'
                      : language === 'uk'
                      ? `Ваша відповідь: «${typedInput}»`
                      : `Your answer: "${typedInput}"`}
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                  {activeCardDirection === 'lt_to_target'
                    ? labels.promptBadgeTarget
                    : currentItem.kind === 'noun'
                    ? labels.promptBadgeLtNoun
                    : labels.promptBadgeLtVerb}
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-2.5">
                  <span>{answerText}</span>
                  {activeCardDirection === 'target_to_lt' && (
                    <button
                      type="button"
                      onClick={(e) => speakLithuanian(currentLemmaLt, e)}
                      className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors shrink-0"
                      title={labels.listenPronunciation}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  <span className="font-semibold">
                    {getItemDisplayLt(currentItem)}
                  </span>{' '}
                  — <span>{currentItem.data.uk}</span> ·{' '}
                  <span className="italic text-slate-500 dark:text-slate-400">
                    {currentItem.data.en}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFullTableModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                >
                  <Table2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>
                    {currentItem.kind === 'noun'
                      ? language === 'uk'
                        ? 'Усі 7 відмінків'
                        : 'All 7 Cases'
                      : language === 'uk'
                      ? 'Усі часи та особи'
                      : 'All Tenses & Persons'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (
                      currentItem.kind === 'verb' &&
                      onSwitchToConjugationForVerb
                    ) {
                      onSwitchToConjugationForVerb(currentItem.data.id);
                    } else {
                      onSwitchToDeclensionForNoun(currentItem.data.id);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    {currentItem.kind === 'noun'
                      ? language === 'uk'
                        ? 'Тренувати відмінювання'
                        : 'Practice Declension'
                      : language === 'uk'
                      ? 'Тренувати дієвідмінювання'
                      : 'Practice Conjugation'}
                  </span>
                </button>
              </div>
            </div>

            {/* Key Dictionary Forms Mini-Strip */}
            {currentItem.kind === 'noun' ? (
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-amber-200/60 dark:border-slate-700/80 text-xs">
                <div className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    Vns. Vardininkas (Kas?)
                  </div>
                  <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                    {currentItem.data.sg.nom}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    Vns. Kilmininkas (Ko?)
                  </div>
                  <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                    {currentItem.data.sg.gen}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    Dgs. Vardininkas (Kas?)
                  </div>
                  <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                    {currentItem.data.pl.nom}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-amber-200/60 dark:border-slate-700/80 text-xs">
                <div className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    1. Bendratis (Інфінітив)
                  </div>
                  <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                    {currentLemmaLt}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    2. Esamojo l. 3 asm. ({currentItem.data.conjugation} дієв.)
                  </div>
                  <div className="font-mono font-bold text-amber-700 dark:text-amber-400 mt-0.5">
                    jis/ji {currentItem.data.present3}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    3. Būtojo k. l. 3 asm.
                  </div>
                  <div className="font-mono font-bold text-indigo-700 dark:text-indigo-400 mt-0.5">
                    jis/ji {currentItem.data.past3}
                  </div>
                </div>
              </div>
            )}

            {/* Dictionary Example Sentence */}
            {(() => {
              const ex =
                currentItem.kind === 'noun'
                  ? getNounContextExample(currentItem.data, 'nom', 'sg')
                  : {
                      lt: currentItem.data.examples.present.fullSentenceLt,
                      uk: currentItem.data.examples.present.translationUk,
                      en: currentItem.data.examples.present.translationEn,
                    };
              return (
                <div className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {labels.exampleLabel}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => speakLithuanian(ex.lt, e)}
                      className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>LT</span>
                    </button>
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white">
                    {ex.lt}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 italic">
                    {targetTranslationLang === 'en' ? ex.en : ex.uk}
                  </div>
                </div>
              );
            })()}

            {/* Action Buttons After Flip / Evaluation */}
            {interactionMode === 'flip' ? (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleMarkFlipResult(false)}
                  className="py-3 px-4 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-950 text-rose-900 dark:text-rose-200 font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 min-h-[46px]"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{labels.needPracticeBtn}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkFlipResult(true)}
                  className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 min-h-[46px]"
                >
                  <Check className="w-4 h-4" />
                  <span>{labels.knowItBtn}</span>
                </button>
              </div>
            ) : (
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (forcedNounId) onClearForcedNoun();
                    loadCard(undefined, true);
                  }}
                  className="px-6 py-3 rounded-xl bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-semibold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 min-h-[44px]"
                >
                  <span>{labels.nextCardBtn}</span>
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal: Full Table for Current Flashcard (7-Case Noun Table or 4-Tense Verb Table) */}
      {fullTableModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setFullTableModalOpen(false)}
        >
          <div
            className="w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{getItemDisplayLt(currentItem)}</span>
                  <span className="text-sm font-normal text-slate-500">
                    — {currentItem.data.uk} / {currentItem.data.en}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {currentItem.kind === 'noun'
                    ? DECLENSION_PDF_TABLE[currentItem.data.declension - 1]
                        .title[language]
                    : VERB_CONJUGATIONS_METADATA[currentItem.data.conjugation]
                        .title[language]}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFullTableModalOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-x-auto">
              {currentItem.kind === 'noun' ? (
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                      <th className="py-2 pr-3 font-semibold">Linksnis</th>
                      <th className="py-2 px-3 font-semibold">
                        Vienaskaita (Sg)
                      </th>
                      <th className="py-2 pl-3 font-semibold">
                        Daugiskaita (Pl)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {CASE_ORDER.map((c) => {
                      const sgSeg = segmentLithuanianWord(
                        currentItem.data.sg[c],
                        currentItem.data.subtype,
                        c,
                        'sg'
                      );
                      const plSeg = segmentLithuanianWord(
                        currentItem.data.pl[c],
                        currentItem.data.subtype,
                        c,
                        'pl'
                      );
                      return (
                        <tr key={c}>
                          <td className="py-2.5 pr-3 font-medium text-slate-800 dark:text-slate-200">
                            {CASES_METADATA[c].name[language]}{' '}
                            <span className="text-xs text-slate-400">
                              ({CASES_METADATA[c].questionLt})
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono">
                            <span>{sgSeg.stem}</span>
                            <span className="font-bold text-amber-700 dark:text-amber-400">
                              {sgSeg.ending}
                            </span>
                          </td>
                          <td className="py-2.5 pl-3 font-mono">
                            <span>{plSeg.stem}</span>
                            <span className="font-bold text-amber-700 dark:text-amber-400">
                              {plSeg.ending}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                      <th className="py-2 pr-3 font-semibold">Особа (Asmuo)</th>
                      <th className="py-2 px-3 font-semibold">
                        Esamasis (Тепер.)
                      </th>
                      <th className="py-2 px-3 font-semibold">
                        Būtasis k. (Мин.)
                      </th>
                      <th className="py-2 px-3 font-semibold">
                        Būsimasis (Майб.)
                      </th>
                      <th className="py-2 pl-3 font-semibold">
                        Liepiamoji (Наказ.)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {VERB_PERSON_ORDER.map((pKey) => {
                      const v = currentItem.data;
                      const presSeg = segmentLithuanianVerbForm(
                        v.present[pKey],
                        'present',
                        pKey,
                        v.isReflexive
                      );
                      const pastSeg = segmentLithuanianVerbForm(
                        v.past[pKey],
                        'past',
                        pKey,
                        v.isReflexive
                      );
                      const futSeg = segmentLithuanianVerbForm(
                        v.future[pKey],
                        'future',
                        pKey,
                        v.isReflexive
                      );
                      const impForm =
                        pKey === 'tu'
                          ? v.imperative.tu
                          : pKey === 'mes'
                          ? v.imperative.mes
                          : pKey === 'jus'
                          ? v.imperative.jus
                          : '—';
                      return (
                        <tr key={pKey}>
                          <td className="py-2.5 pr-3 font-semibold text-slate-800 dark:text-slate-200">
                            {VERB_PERSONS_METADATA[pKey].label[language]}
                          </td>
                          <td className="py-2.5 px-3 font-mono">
                            <span>{presSeg.stem}</span>
                            <span className="font-bold text-amber-700 dark:text-amber-400">
                              {presSeg.ending}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono">
                            <span>{pastSeg.stem}</span>
                            <span className="font-bold text-indigo-700 dark:text-indigo-400">
                              {pastSeg.ending}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono">
                            <span>{futSeg.stem}</span>
                            <span className="font-bold text-emerald-700 dark:text-emerald-400">
                              {futSeg.ending}
                            </span>
                          </td>
                          <td className="py-2.5 pl-3 font-mono font-bold">
                            {impForm !== '—' ? `${impForm}!` : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
