import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Compass,
  Keyboard,
  Maximize2,
  MessageSquare,
  Minimize2,
  Play,
  Quote,
  Search,
  Sparkles,
  Star,
  Table2,
  Volume2,
  X,
} from 'lucide-react';
import { ALL_VERIFIED_NOUNS } from '../data/nounsDatabase';
import { ALL_VERIFIED_VERBS } from '../data/verbsDatabase';
import {
  CASES_METADATA,
  CASE_ORDER,
  DECLENSION_PDF_TABLE,
  DIFFICULTY_CEFR_LABELS,
  DIFFICULTY_METADATA,
  SUBTYPE_ENDINGS,
  TOPICS_METADATA,
  segmentLithuanianWord,
} from '../data/grammarRules';
import {
  hasLithuanianDiacritics,
  searchAndRankNouns,
  stripLithuanianDiacritics,
} from '../utils/answerChecker';
import {
  getNounContextExample,
  getNounTranslationInCase,
} from '../utils/nounInflections';
import { getNounUsageGuide } from '../utils/nounUsage';
import {
  searchAndRankVerbs,
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
  TopicId,
  UserProgress,
  VerbConjugationType,
  VerbEntry,
  VerbGovernedCase,
} from '../types/grammar';

interface DictionaryCatalogProps {
  language: AppLanguage;
  progress: UserProgress;
  onToggleFavorite: (wordId: string) => void;
  onPracticeNoun: (wordId: string) => void;
  onPracticeVerb?: (verbId: string) => void;
}

const ASCII_SEARCH_EXAMPLES = [
  { ascii: 'tetis', lt: 'tėtis', uk: 'тато', en: 'dad' },
  { ascii: 'zmogus', lt: 'žmogus', uk: 'людина', en: 'person' },
  { ascii: 'sunus', lt: 'sūnus', uk: 'син', en: 'son' },
  { ascii: 'seima', lt: 'šeima', uk: 'сім’я', en: 'family' },
  { ascii: 'svecias', lt: 'svečias', uk: 'гість', en: 'guest' },
  { ascii: 'azuolas', lt: 'ąžuolas', uk: 'дуб', en: 'oak' },
];

const ASCII_VERB_SEARCH_EXAMPLES = [
  { ascii: 'buti', lt: 'būti', uk: 'бути', en: 'to be' },
  { ascii: 'kalbeti', lt: 'kalbėti', uk: 'говорити', en: 'to speak' },
  { ascii: 'rasyti', lt: 'rašyti', uk: 'писати', en: 'to write' },
  { ascii: 'zinoti', lt: 'žinoti', uk: 'знати', en: 'to know' },
  { ascii: 'dziaugtis', lt: 'džiaugtis', uk: 'радіти', en: 'to rejoice' },
  { ascii: 'ziureti', lt: 'žiūrėti', uk: 'дивитися', en: 'to watch' },
];

function renderWordWithHighlightedDiacritics(word: string) {
  return word.split('').map((ch, idx) => {
    const isDiacritic = /[ąčęėįšųūžĄČĘĖĮŠŲŪŽ]/.test(ch);
    return isDiacritic ? (
      <span
        key={idx}
        className="text-amber-600 dark:text-amber-400 font-extrabold underline decoration-amber-500/80 decoration-2 underline-offset-2"
      >
        {ch}
      </span>
    ) : (
      <span key={idx}>{ch}</span>
    );
  });
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

export const DictionaryCatalog: React.FC<DictionaryCatalogProps> = ({
  language,
  progress,
  onToggleFavorite,
  onPracticeNoun,
  onPracticeVerb,
}) => {
  const t = UI_TEXT[language];
  const [dictionaryPos, setDictionaryPos] = useState<'nouns' | 'verbs'>('nouns');
  const [searchQuery, setSearchQuery] = useState('');
  const [topicFilter, setTopicFilter] = useState<TopicId | 'all'>('all');
  const [declFilter, setDeclFilter] = useState<DeclensionType | 'all'>('all');
  const [verbConjFilter, setVerbConjFilter] = useState<
    VerbConjugationType | 'all'
  >('all');
  const [verbGovFilter, setVerbGovFilter] = useState<VerbGovernedCase | 'all'>(
    'all'
  );
  const [onlyReflexiveVerbs, setOnlyReflexiveVerbs] = useState(false);
  const [levelFilter, setLevelFilter] = useState<DifficultyLevel | 'all'>('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [onlyExceptions, setOnlyExceptions] = useState(false);
  const [selectedNoun, setSelectedNoun] = useState<NounEntry | null>(
    ALL_VERIFIED_NOUNS[0]
  );
  const [selectedVerb, setSelectedVerb] = useState<VerbEntry | null>(
    ALL_VERIFIED_VERBS[0]
  );
  const [isDrillDownOpen, setIsDrillDownOpen] = useState(false);
  const [detailTab, setDetailTab] = useState<'forms' | 'usage'>('forms');
  const [showSentencesInTable, setShowSentencesInTable] = useState(false);
  const [focusedCase, setFocusedCase] = useState<GrammaticalCase>('nom');

  const preFilteredNouns = useMemo(() => {
    return ALL_VERIFIED_NOUNS.filter((noun) => {
      if (topicFilter !== 'all' && noun.topic !== topicFilter) return false;
      if (declFilter !== 'all' && noun.declension !== declFilter) return false;
      if (levelFilter !== 'all' && noun.difficulty !== levelFilter) return false;
      if (onlyFavorites && !progress.favorites.includes(noun.id)) return false;
      if (onlyExceptions && !noun.stemAlternation) return false;
      return true;
    });
  }, [
    topicFilter,
    declFilter,
    levelFilter,
    onlyFavorites,
    onlyExceptions,
    progress.favorites,
  ]);

  const rankedMatches = useMemo(() => {
    return searchAndRankNouns(preFilteredNouns, searchQuery);
  }, [preFilteredNouns, searchQuery]);

  const filteredNouns = useMemo(
    () => rankedMatches.map((m) => m.noun),
    [rankedMatches]
  );

  const preFilteredVerbs = useMemo(() => {
    return ALL_VERIFIED_VERBS.filter((verb) => {
      if (topicFilter !== 'all' && verb.topic !== topicFilter) return false;
      if (verbConjFilter !== 'all' && verb.conjugation !== verbConjFilter)
        return false;
      if (verbGovFilter !== 'all' && verb.governedCase !== verbGovFilter)
        return false;
      if (levelFilter !== 'all' && verb.difficulty !== levelFilter) return false;
      if (onlyFavorites && !progress.favorites.includes(verb.id)) return false;
      if (onlyReflexiveVerbs && !verb.isReflexive) return false;
      if (onlyExceptions && !verb.stemAlternation) return false;
      return true;
    });
  }, [
    topicFilter,
    verbConjFilter,
    verbGovFilter,
    levelFilter,
    onlyFavorites,
    onlyReflexiveVerbs,
    onlyExceptions,
    progress.favorites,
  ]);

  const rankedVerbMatches = useMemo(() => {
    return searchAndRankVerbs(preFilteredVerbs, searchQuery);
  }, [preFilteredVerbs, searchQuery]);

  const filteredVerbs = useMemo(
    () => rankedVerbMatches.map((m) => m.verb),
    [rankedVerbMatches]
  );

  // Keep selectedVerb synchronized with top search result when searching
  useEffect(() => {
    if (filteredVerbs.length === 0) return;
    if (searchQuery.trim().length > 0) {
      setSelectedVerb(filteredVerbs[0]);
    } else if (
      !selectedVerb ||
      !filteredVerbs.some((v) => v.id === selectedVerb.id)
    ) {
      setSelectedVerb(filteredVerbs[0]);
    }
  }, [filteredVerbs, searchQuery]);

  // Lithuanian word suggestions when typing with an English/ASCII keyboard layout
  const lithuanianSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const qHasNoDiacritics = !hasLithuanianDiacritics(q);
    return rankedMatches
      .filter((m) => {
        if (m.matchType === 'ascii_lemma' || m.matchType === 'prefix_lemma') {
          return true;
        }
        if (m.matchType === 'exact_lemma' && hasLithuanianDiacritics(m.noun.lemma)) {
          return true;
        }
        if (m.matchType === 'inflected_form') {
          return true;
        }
        if (qHasNoDiacritics && hasLithuanianDiacritics(m.noun.lemma)) {
          return true;
        }
        return false;
      })
      .slice(0, 8);
  }, [rankedMatches, searchQuery]);

  const lithuanianVerbSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const qHasNoDiacritics = !hasLithuanianDiacritics(q);
    return rankedVerbMatches
      .filter((m) => {
        if (m.matchedForm) return true;
        if (qHasNoDiacritics && hasLithuanianDiacritics(m.verb.infinitive)) {
          return true;
        }
        return true;
      })
      .slice(0, 8);
  }, [rankedVerbMatches, searchQuery]);

  // Keep selectedNoun synchronized with top search result when searching
  useEffect(() => {
    if (filteredNouns.length === 0) return;
    if (searchQuery.trim().length > 0) {
      setSelectedNoun(filteredNouns[0]);
    } else if (
      !selectedNoun ||
      !filteredNouns.some((n) => n.id === selectedNoun.id)
    ) {
      setSelectedNoun(filteredNouns[0]);
    }
  }, [filteredNouns, searchQuery]);

  const selectedNounUsage = useMemo(
    () => (selectedNoun ? getNounUsageGuide(selectedNoun) : null),
    [selectedNoun]
  );

  const selectedIndex = useMemo(() => {
    if (!selectedNoun) return -1;
    return filteredNouns.findIndex((n) => n.id === selectedNoun.id);
  }, [filteredNouns, selectedNoun]);

  const handleSelectPrevNoun = () => {
    if (selectedIndex > 0) {
      setSelectedNoun(filteredNouns[selectedIndex - 1]);
    }
  };

  const handleSelectNextNoun = () => {
    if (selectedIndex >= 0 && selectedIndex < filteredNouns.length - 1) {
      setSelectedNoun(filteredNouns[selectedIndex + 1]);
    }
  };

  const renderNounDrillDownPanel = (noun: NounEntry, fullScreenMode: boolean) => {
    const isFav = progress.favorites.includes(noun.id);
    const stat = progress.wordStats[noun.id];
    const subtypeRule = SUBTYPE_ENDINGS[noun.subtype];
    const genderLabel =
      noun.gender === 'm'
        ? language === 'uk'
          ? 'Чоловічий рід (vyr. g.)'
          : language === 'lt'
          ? 'Vyriškoji giminė'
          : 'Masculine (vyr. g.)'
        : language === 'uk'
        ? 'Жіночий рід (mot. g.)'
        : language === 'lt'
        ? 'Moteriškoji giminė'
        : 'Feminine (mot. g.)';

    const focusedCaseMeta = CASES_METADATA[focusedCase];
    const focusedSgEx = getNounContextExample(noun, focusedCase, 'sg');
    const focusedPlEx = getNounContextExample(noun, focusedCase, 'pl');
    const focusedSgSeg = segmentLithuanianWord(
      noun.sg[focusedCase],
      noun.subtype,
      focusedCase,
      'sg'
    );
    const focusedPlSeg = segmentLithuanianWord(
      noun.pl[focusedCase],
      noun.subtype,
      focusedCase,
      'pl'
    );

    return (
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-sm">
        {/* Top bar in Full-Screen Drill-Down Mode */}
        {fullScreenMode && (
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsDrillDownOpen(false)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>
                {language === 'uk'
                  ? 'Назад до списку слів'
                  : language === 'lt'
                  ? 'Atgal į žodyno sąrašą'
                  : 'Back to Dictionary List'}
              </span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={selectedIndex <= 0}
                onClick={handleSelectPrevNoun}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>
                  {language === 'uk'
                    ? 'Попереднє'
                    : language === 'lt'
                    ? 'Ankstesnis'
                    : 'Previous'}
                </span>
              </button>
              <span className="text-xs text-slate-400 font-mono tabular-nums px-1">
                {selectedIndex + 1} / {filteredNouns.length}
              </span>
              <button
                type="button"
                disabled={
                  selectedIndex < 0 || selectedIndex >= filteredNouns.length - 1
                }
                onClick={handleSelectNextNoun}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <span>
                  {language === 'uk'
                    ? 'Наступне'
                    : language === 'lt'
                    ? 'Kitas'
                    : 'Next'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Header with Lemma, Metadata, Star (Favorite) Button, and Practice Button */}
        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                {DECLENSION_PDF_TABLE[noun.declension - 1].title[language]}
              </span>
              <span>·</span>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50">
                {language === 'uk'
                  ? `зразок: ${subtypeRule.modelWord}`
                  : language === 'lt'
                  ? `pavyzdys: ${subtypeRule.modelWord}`
                  : `model: ${subtypeRule.modelWord}`}
              </span>
              <span>·</span>
              <span>{genderLabel}</span>
              <span>·</span>
              <span>{TOPICS_METADATA[noun.topic].label[language]}</span>
              <span>·</span>
              <span className="font-mono font-semibold">
                {DIFFICULTY_CEFR_LABELS[noun.difficulty]}
              </span>
              {stat?.mastered && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold">
                  ✓ {language === 'uk' ? 'Вивчено' : language === 'lt' ? 'Išmokta' : 'Mastered'}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                {noun.lemma}
              </h2>
              <button
                type="button"
                onClick={(e) => speakLithuanian(noun.lemma, e)}
                title={
                  language === 'uk'
                    ? 'Озвучити литовською'
                    : language === 'lt'
                    ? 'Klausyti tarimo'
                    : 'Listen in Lithuanian'
                }
                aria-label="Listen in Lithuanian"
                className="p-2 rounded-xl bg-slate-100 hover:bg-amber-100/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-amber-600 dark:text-amber-400 border border-slate-200/80 dark:border-slate-700 transition-colors shrink-0"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <span className="text-sm font-mono text-slate-500 dark:text-slate-400">
                (Kilm. <strong className="text-slate-700 dark:text-slate-200">{noun.sg.gen}</strong> · Dgs.{' '}
                <strong className="text-slate-700 dark:text-slate-200">{noun.pl.nom}</strong>)
              </span>
            </div>

            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 font-medium">
              🇺🇦 {noun.uk} <span className="mx-2 text-slate-300 dark:text-slate-600">|</span> 🇬🇧{' '}
              {noun.en}
            </p>
          </div>

          {/* Action Buttons: Star Favorite + Practice + Fullscreen Drill-Down Toggle */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onToggleFavorite(noun.id)}
              aria-label={
                isFav
                  ? language === 'uk'
                    ? 'Прибрати з обраного'
                    : 'Remove from favorites'
                  : language === 'uk'
                  ? 'Додати в обране'
                  : 'Star as favorite'
              }
              className={`px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-2 min-h-[42px] border ${
                isFav
                  ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50/60 hover:text-amber-700 hover:border-amber-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
              }`}
            >
              <Star
                className={`w-4 h-4 ${
                  isFav
                    ? 'fill-amber-400 text-amber-500'
                    : 'text-slate-400 dark:text-slate-400'
                }`}
              />
              <span>
                {isFav
                  ? language === 'uk'
                    ? 'В обраному ★'
                    : language === 'lt'
                    ? 'Įsiminta ★'
                    : 'Starred ★'
                  : language === 'uk'
                  ? 'В обране'
                  : language === 'lt'
                  ? 'Įsiminti'
                  : 'Star Favorite'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onPracticeNoun(noun.id)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-semibold text-xs hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap min-h-[42px]"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{t.dictionary.practiceThisWord}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDrillDownOpen((v) => !v)}
              title={
                fullScreenMode
                  ? language === 'uk'
                    ? 'Повернути розділений перегляд'
                    : 'Split View'
                  : language === 'uk'
                  ? 'Розгорнути таблицю на весь екран'
                  : 'Expand Full Drill-Down View'
              }
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[42px] min-w-[42px] flex items-center justify-center"
            >
              {fullScreenMode ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Stem Alternation / Irregularity Callout */}
        {noun.stemAlternation && (
          <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs sm:text-sm text-amber-900 dark:text-amber-300">
            <span className="font-semibold">
              {t.dictionary.stemAlternationBadge}:{' '}
            </span>
            {noun.stemAlternation[language]}
          </div>
        )}

        {noun.notes && (
          <div className="text-xs text-slate-600 dark:text-slate-400">
            {noun.notes[language]}
          </div>
        )}

        {/* Tab Switcher: 7 Cases × 2 Numbers Table vs Usage & Idioms */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDetailTab('forms')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                detailTab === 'forms'
                  ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Table2 className="w-4 h-4" />
              <span>
                {language === 'uk'
                  ? 'Таблиця: 7 відмінків × 2 числа'
                  : language === 'lt'
                  ? 'Lentelė: 7 linksniai × 2 skaičiai'
                  : '7 Cases × Both Numbers Table'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setDetailTab('usage')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                detailTab === 'usage'
                  ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>{t.dictionary.tabUsage}</span>
            </button>
          </div>

          {detailTab === 'forms' && (
            <button
              type="button"
              onClick={() => setShowSentencesInTable((v) => !v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                showSentencesInTable
                  ? 'bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-950/50 dark:border-amber-700 dark:text-amber-300'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
              }`}
            >
              {showSentencesInTable
                ? language === 'uk'
                  ? '✓ Приклади речень у кожній клітинці'
                  : language === 'lt'
                  ? '✓ Sakiniai lentelėje įjungti'
                  : '✓ Sentences shown in table'
                : language === 'uk'
                ? 'Показати речення в усіх клітинках'
                : language === 'lt'
                ? 'Rodyti sakinius visuose langeliuose'
                : 'Show sentences in all cells'}
            </button>
          )}
        </div>

        {/* TAB 1: Clear 7 Cases × Both Numbers (Singular & Plural) Table */}
        {detailTab === 'forms' && (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-3 pl-4 pr-3 font-semibold">
                      {language === 'uk'
                        ? 'Відмінок (Linksnis)'
                        : language === 'lt'
                        ? 'Linksnis'
                        : 'Case (Linksnis)'}
                    </th>
                    <th className="py-3 px-3 font-semibold">
                      {language === 'uk'
                        ? 'Питання'
                        : language === 'lt'
                        ? 'Klausimas'
                        : 'Question'}
                    </th>
                    <th className="py-3 px-4 font-semibold border-l border-slate-200/70 dark:border-slate-800">
                      <span className="inline-flex items-center gap-1.5 text-amber-800 dark:text-amber-400">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        {t.singularLabel}
                      </span>
                    </th>
                    <th className="py-3 px-4 font-semibold border-l border-slate-200/70 dark:border-slate-800">
                      <span className="inline-flex items-center gap-1.5 text-emerald-800 dark:text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        {t.pluralLabel}
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800">
                  {CASE_ORDER.map((c, idx) => {
                    const cMeta = CASES_METADATA[c];
                    const sgForm = noun.sg[c];
                    const plForm = noun.pl[c];
                    const sgVariants = noun.sg.variants?.[c];
                    const plVariants = noun.pl.variants?.[c];
                    const sgSeg = segmentLithuanianWord(
                      sgForm,
                      noun.subtype,
                      c,
                      'sg'
                    );
                    const plSeg = segmentLithuanianWord(
                      plForm,
                      noun.subtype,
                      c,
                      'pl'
                    );
                    const sgTrans = getNounTranslationInCase(
                      noun,
                      c,
                      'sg',
                      language
                    );
                    const plTrans = getNounTranslationInCase(
                      noun,
                      c,
                      'pl',
                      language
                    );
                    const sgEx = getNounContextExample(noun, c, 'sg');
                    const plEx = getNounContextExample(noun, c, 'pl');
                    const isFocused = focusedCase === c;

                    return (
                      <tr
                        key={c}
                        onClick={() => setFocusedCase(c)}
                        className={`cursor-pointer transition-colors ${
                          isFocused
                            ? 'bg-amber-50/60 dark:bg-slate-800/80'
                            : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        {/* Case Name */}
                        <td className="py-3.5 pl-4 pr-3 align-top min-w-[140px]">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500">
                              {idx + 1}.
                            </span>
                            <span className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">
                              {cMeta.name[language]}
                            </span>
                          </div>
                          {language !== 'lt' && (
                            <div className="text-[11px] text-slate-400 dark:text-slate-500 pl-5">
                              {cMeta.name.lt}
                            </div>
                          )}
                        </td>

                        {/* Case Question */}
                        <td className="py-3.5 px-3 align-top min-w-[115px]">
                          <div className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                            {cMeta.questionLt}
                          </div>
                          {language !== 'lt' &&
                            cMeta.questionTranslated[language] && (
                              <div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium mt-0.5">
                                {cMeta.questionTranslated[language]}
                              </div>
                            )}
                        </td>

                        {/* Singular Form (Vienaskaita) */}
                        <td className="py-3.5 px-4 align-top min-w-[185px] border-l border-slate-100 dark:border-slate-800/80">
                          <div className="font-mono text-sm sm:text-base">
                            <span className="inline-flex items-baseline">
                              <span className="text-slate-800 dark:text-slate-200 font-medium">
                                {sgSeg.stem}
                              </span>
                              <span className="font-bold text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/70 px-1.5 py-0.5 rounded ml-0.5">
                                {sgSeg.ending || '∅'}
                              </span>
                            </span>
                            {sgVariants && sgVariants.length > 0 && (
                              <span className="text-xs text-slate-400 ml-1.5">
                                ({sgVariants.join(', ')})
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                              {sgTrans.primary}
                            </span>
                            {sgTrans.secondary && (
                              <span className="text-[11px] text-slate-400 dark:text-slate-500 ml-1">
                                ({sgTrans.secondary})
                              </span>
                            )}
                          </div>

                          {showSentencesInTable && (
                            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] space-y-1">
                              <div className="font-mono text-slate-700 dark:text-slate-300">
                                <span className="text-amber-700 dark:text-amber-400 font-bold mr-1">
                                  LT:
                                </span>
                                {sgEx.lt}
                              </div>
                              <div className="text-slate-700 dark:text-slate-300 italic">
                                <span className="text-sky-600 dark:text-sky-400 font-semibold not-italic mr-1">
                                  {language === 'en' ? 'EN:' : 'UA:'}
                                </span>
                                {language === 'en' ? sgEx.en : sgEx.uk}
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Plural Form (Daugiskaita) */}
                        <td className="py-3.5 px-4 align-top min-w-[185px] border-l border-slate-100 dark:border-slate-800/80">
                          <div className="font-mono text-sm sm:text-base">
                            <span className="inline-flex items-baseline">
                              <span className="text-slate-800 dark:text-slate-200 font-medium">
                                {plSeg.stem}
                              </span>
                              <span className="font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/70 px-1.5 py-0.5 rounded ml-0.5">
                                {plSeg.ending || '∅'}
                              </span>
                            </span>
                            {plVariants && plVariants.length > 0 && (
                              <span className="text-xs text-slate-400 ml-1.5">
                                ({plVariants.join(', ')})
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                              {plTrans.primary}
                            </span>
                            {plTrans.secondary && (
                              <span className="text-[11px] text-slate-400 dark:text-slate-500 ml-1">
                                ({plTrans.secondary})
                              </span>
                            )}
                          </div>

                          {showSentencesInTable && (
                            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] space-y-1">
                              <div className="font-mono text-slate-700 dark:text-slate-300">
                                <span className="text-emerald-700 dark:text-emerald-400 font-bold mr-1">
                                  LT:
                                </span>
                                {plEx.lt}
                              </div>
                              <div className="text-slate-700 dark:text-slate-300 italic">
                                <span className="text-sky-600 dark:text-sky-400 font-semibold not-italic mr-1">
                                  {language === 'en' ? 'EN:' : 'UA:'}
                                </span>
                                {language === 'en' ? plEx.en : plEx.uk}
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Interactive Focused Case Contextual Sentence Card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span>
                    {language === 'uk'
                      ? 'Приклади речень для вибраного відмінка у таблиці:'
                      : language === 'lt'
                      ? 'Sakinių pavyzdžiai pasirinktam linksniui:'
                      : 'Sentence examples for selected case:'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 font-mono">
                    {focusedCaseMeta.name[language]} ({focusedCaseMeta.questionLt})
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {CASE_ORDER.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFocusedCase(c)}
                      className={`px-2 py-1 rounded text-[11px] font-mono font-semibold transition-colors ${
                        focusedCase === c
                          ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {CASES_METADATA[c].shortLt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/70 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-amber-800 dark:text-amber-400">
                      {t.singularLabel}
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {focusedSgSeg.stem}
                      <span className="text-amber-600 dark:text-amber-400">
                        -{focusedSgSeg.ending}
                      </span>
                    </span>
                  </div>
                  <div className="font-mono text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                    {focusedSgEx.lt}
                  </div>
                  <div className="text-xs text-slate-700 dark:text-slate-300">
                    🇺🇦 {focusedSgEx.uk}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                    🇬🇧 {focusedSgEx.en}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/70 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-800 dark:text-emerald-400">
                      {t.pluralLabel}
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {focusedPlSeg.stem}
                      <span className="text-emerald-600 dark:text-emerald-400">
                        -{focusedPlSeg.ending}
                      </span>
                    </span>
                  </div>
                  <div className="font-mono text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                    {focusedPlEx.lt}
                  </div>
                  <div className="text-xs text-slate-700 dark:text-slate-300">
                    🇺🇦 {focusedPlEx.uk}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                    🇬🇧 {focusedPlEx.en}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Usage, Collocations, Idioms & Conversational Phrases */}
        {detailTab === 'usage' && selectedNounUsage && (
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t.dictionary.usageCollocationsTitle}
                  </h3>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {selectedNounUsage.collocations.length}{' '}
                  {language === 'uk'
                    ? 'сполучень'
                    : language === 'lt'
                    ? 'junginiai'
                    : 'collocations'}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {t.dictionary.usageCollocationsDesc}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {selectedNounUsage.collocations.map((col, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 hover:border-amber-400/60 dark:hover:border-amber-500/50 transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900 dark:text-amber-300">
                        {col.phraseLt}
                      </span>
                      {col.caseBadge && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {col.caseBadge}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                      <span className="font-medium mr-1.5">🇺🇦 {col.transUk}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                      🇬🇧 {col.transEn}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedNounUsage.idioms.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Quote className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t.dictionary.usageIdiomsTitle}
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {t.dictionary.usageIdiomsDesc}
                </p>

                <div className="space-y-3 pt-1">
                  {selectedNounUsage.idioms.map((idiom, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/25 border border-amber-200/70 dark:border-amber-800/50 space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-base font-bold text-slate-900 dark:text-white font-serif">
                          „{idiom.phraseLt}“
                        </span>
                        {idiom.originOrStyle && (
                          <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded bg-amber-200/70 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200">
                            {idiom.originOrStyle}
                          </span>
                        )}
                      </div>

                      <div className="text-xs sm:text-sm font-medium text-amber-950 dark:text-amber-200">
                        🇺🇦 {idiom.transUk}{' '}
                        <span className="text-slate-400 mx-1.5">·</span> 🇬🇧{' '}
                        <span className="italic">{idiom.transEn}</span>
                      </div>

                      <div className="text-xs text-slate-700 dark:text-slate-300 pt-1 border-t border-amber-200/50 dark:border-amber-800/30 leading-relaxed">
                        <span className="font-semibold text-slate-900 dark:text-slate-200 mr-1.5">
                          {language === 'uk'
                            ? 'Значення:'
                            : language === 'en'
                            ? 'Meaning:'
                            : 'Reikšmė:'}
                        </span>
                        {language === 'uk'
                          ? idiom.explanationUk
                          : language === 'en'
                          ? idiom.explanationEn
                          : idiom.explanationLt}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedNounUsage.governance.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t.dictionary.usageGovernanceTitle}
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {t.dictionary.usageGovernanceDesc}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {selectedNounUsage.governance.map((gov, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-bold text-xs text-amber-800 dark:text-amber-400 bg-amber-100/70 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                          {gov.patternLt}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {gov.caseName}
                        </span>
                      </div>
                      <div className="text-xs text-slate-700 dark:text-slate-300">
                        {language === 'lt'
                          ? gov.meaningLt || gov.meaningUk
                          : language === 'en'
                          ? gov.meaningEn
                          : gov.meaningUk}
                      </div>
                      <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 italic pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                        „{gov.exampleLt}“
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedNounUsage.conversationalPhrases.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t.dictionary.usageConversationalTitle}
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {t.dictionary.usageConversationalDesc}
                </p>

                <div className="space-y-2.5 pt-1">
                  {selectedNounUsage.conversationalPhrases.map((phrase, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/70 space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10.5px] font-semibold text-slate-500 dark:text-slate-400">
                          💬 {phrase.context}
                        </span>
                      </div>
                      <div className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                        {phrase.lt}
                      </div>
                      <div className="text-xs text-slate-700 dark:text-slate-300">
                        🇺🇦 {phrase.uk}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                        🇬🇧 {phrase.en}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderVerbDrillDownPanel = (verb: VerbEntry, fullScreenMode: boolean) => {
    const isFav = progress.favorites.includes(verb.id);
    const stat = progress.wordStats[verb.id];
    const cleanInf = verb.infinitive.replace(/\s*\([^)]*\)\s*/g, '').trim();
    const conjMeta = VERB_CONJUGATIONS_METADATA[verb.conjugation];
    const govMeta = VERB_GOVERNED_CASES_METADATA[verb.governedCase];

    return (
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-sm">
        {fullScreenMode && (
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsDrillDownOpen(false)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>
                {language === 'uk'
                  ? 'Назад до списку дієслів'
                  : language === 'lt'
                  ? 'Atgal į veiksmažodžių sąrašą'
                  : 'Back to Verb List'}
              </span>
            </button>
          </div>
        )}

        {/* Header with Verb Infinitive, 3 Principal Forms, Audio, Favorite, and Practice */}
        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="px-2 py-0.5 rounded-md bg-amber-500/15 font-bold text-amber-900 dark:text-amber-300">
                {conjMeta.title[language]}
              </span>
              <span>·</span>
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 font-semibold">
                {govMeta.shortBadge[language]}
              </span>
              {verb.isReflexive && (
                <>
                  <span>·</span>
                  <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 font-semibold">
                    {language === 'uk'
                      ? 'Зворотне (-si)'
                      : language === 'lt'
                      ? 'Sangrąžinis (-si)'
                      : 'Reflexive (-si)'}
                  </span>
                </>
              )}
              <span>·</span>
              <span>{TOPICS_METADATA[verb.topic].label[language]}</span>
              <span>·</span>
              <span className="font-mono font-semibold">
                {DIFFICULTY_CEFR_LABELS[verb.difficulty]}
              </span>
              {stat?.mastered && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold">
                  ✓ {language === 'uk' ? 'Вивчено' : language === 'lt' ? 'Išmokta' : 'Mastered'}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                {verb.infinitive}
              </h2>
              <button
                type="button"
                onClick={(e) =>
                  speakLithuanian(
                    `${cleanInf}, ${verb.present3}, ${verb.past3}`,
                    e
                  )
                }
                title="Озвучити 3 основні форми литовською"
                aria-label="Listen in Lithuanian"
                className="p-2 rounded-xl bg-slate-100 hover:bg-amber-100/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-amber-600 dark:text-amber-400 border border-slate-200/80 dark:border-slate-700 transition-colors shrink-0"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <span className="text-sm font-mono text-slate-500 dark:text-slate-400">
                (Es. 3 asm.{' '}
                <strong className="text-amber-700 dark:text-amber-400">
                  {verb.present3}
                </strong>{' '}
                · Būt. 3 asm.{' '}
                <strong className="text-indigo-700 dark:text-indigo-400">
                  {verb.past3}
                </strong>
                )
              </span>
            </div>

            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 font-medium">
              🇺🇦 {verb.uk}{' '}
              <span className="mx-2 text-slate-300 dark:text-slate-600">|</span>{' '}
              🇬🇧 {verb.en}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onToggleFavorite(verb.id)}
              className={`px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-2 min-h-[42px] border ${
                isFav
                  ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50/60 hover:text-amber-700 hover:border-amber-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
              }`}
            >
              <Star
                className={`w-4 h-4 ${
                  isFav
                    ? 'fill-amber-400 text-amber-500'
                    : 'text-slate-400 dark:text-slate-400'
                }`}
              />
              <span>
                {isFav
                  ? language === 'uk'
                    ? 'В обраному ★'
                    : 'Starred ★'
                  : language === 'uk'
                  ? 'В обране'
                  : 'Star Favorite'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (onPracticeVerb) {
                  onPracticeVerb(verb.id);
                } else {
                  onPracticeNoun(verb.id);
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-semibold text-xs hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap min-h-[42px]"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>
                {language === 'uk'
                  ? 'Тренувати це дієслово'
                  : language === 'lt'
                  ? 'Praktikuoti veiksmažodį'
                  : 'Practice This Verb'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsDrillDownOpen((v) => !v)}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[42px] min-w-[42px] flex items-center justify-center"
            >
              {fullScreenMode ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* 3 Principal Forms Highlight Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase text-slate-400">
                1. Bendratis (Інфінітив)
              </div>
              <div className="text-lg font-mono font-extrabold text-slate-900 dark:text-white mt-0.5">
                {cleanInf}
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => speakLithuanian(cleanInf, e)}
              className="p-2 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-100/70 dark:hover:bg-slate-700"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase text-amber-800 dark:text-amber-300">
                2. Esamojo l. 3 asm. ({verb.conjugation} дієв.)
              </div>
              <div className="text-lg font-mono font-extrabold text-amber-900 dark:text-amber-300 mt-0.5">
                jis/ji {verb.present3}
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => speakLithuanian(verb.present3, e)}
              className="p-2 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-100/70 dark:hover:bg-slate-700"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase text-indigo-800 dark:text-indigo-300">
                3. Būtojo k. l. 3 asm.
              </div>
              <div className="text-lg font-mono font-extrabold text-indigo-900 dark:text-indigo-300 mt-0.5">
                jis/ji {verb.past3}
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => speakLithuanian(verb.past3, e)}
              className="p-2 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100/70 dark:hover:bg-slate-700"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Case Governance & Stem Alternation Note */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-500" />
            <span>{govMeta.fullLabel[language]}</span>
          </div>
          {verb.stemAlternation && (
            <div className="text-amber-800 dark:text-amber-300 font-medium pt-1 border-t border-slate-200/70 dark:border-slate-700">
              ⚡ {verb.stemAlternation[language]}
            </div>
          )}
        </div>

        {/* Full Verb Conjugation Table (6 Persons × 4 Tenses/Moods) */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                <th className="p-3 border-b border-r border-slate-200 dark:border-slate-700 font-bold">
                  {language === 'uk'
                    ? 'Особа (Asmuo)'
                    : language === 'lt'
                    ? 'Asmuo'
                    : 'Person'}
                </th>
                <th className="p-3 border-b border-r border-slate-200 dark:border-slate-700 font-bold">
                  <div>Esamasis laikas</div>
                  <div className="text-[11px] font-normal text-slate-500">
                    {language === 'uk' ? 'Теперішній час' : 'Present'}
                  </div>
                </th>
                <th className="p-3 border-b border-r border-slate-200 dark:border-slate-700 font-bold">
                  <div>Būtasis kartinis l.</div>
                  <div className="text-[11px] font-normal text-slate-500">
                    {language === 'uk' ? 'Минулий час' : 'Past Simple'}
                  </div>
                </th>
                <th className="p-3 border-b border-r border-slate-200 dark:border-slate-700 font-bold">
                  <div>Būsimasis laikas</div>
                  <div className="text-[11px] font-normal text-slate-500">
                    {language === 'uk' ? 'Майбутній час' : 'Future'}
                  </div>
                </th>
                <th className="p-3 border-b border-slate-200 dark:border-slate-700 font-bold">
                  <div>Liepiamoji nuosaka</div>
                  <div className="text-[11px] font-normal text-slate-500">
                    {language === 'uk' ? 'Наказовий спосіб' : 'Imperative'}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {VERB_PERSON_ORDER.map((pKey) => {
                const presSeg = segmentLithuanianVerbForm(
                  verb.present[pKey],
                  'present',
                  pKey,
                  verb.isReflexive
                );
                const pastSeg = segmentLithuanianVerbForm(
                  verb.past[pKey],
                  'past',
                  pKey,
                  verb.isReflexive
                );
                const futSeg = segmentLithuanianVerbForm(
                  verb.future[pKey],
                  'future',
                  pKey,
                  verb.isReflexive
                );
                const impForm =
                  pKey === 'tu'
                    ? verb.imperative.tu
                    : pKey === 'mes'
                    ? verb.imperative.mes
                    : pKey === 'jus'
                    ? verb.imperative.jus
                    : null;

                return (
                  <tr
                    key={pKey}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                  >
                    <td className="p-3 border-r border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {VERB_PERSONS_METADATA[pKey].label[language]}
                    </td>
                    <td className="p-3 border-r border-slate-200 dark:border-slate-800 font-mono font-bold">
                      <div className="flex items-center justify-between gap-1.5">
                        <span>
                          <span className="text-slate-900 dark:text-white">
                            {presSeg.stem}
                          </span>
                          <span className="text-amber-600 dark:text-amber-400 underline decoration-amber-500/80 decoration-2 underline-offset-4">
                            {presSeg.ending}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={(e) =>
                            speakLithuanian(verb.present[pKey], e)
                          }
                          className="p-1 rounded text-amber-600 dark:text-amber-400 hover:bg-amber-100/60 dark:hover:bg-slate-700"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="p-3 border-r border-slate-200 dark:border-slate-800 font-mono font-bold">
                      <div className="flex items-center justify-between gap-1.5">
                        <span>
                          <span className="text-slate-900 dark:text-white">
                            {pastSeg.stem}
                          </span>
                          <span className="text-indigo-600 dark:text-indigo-400 underline decoration-indigo-500/80 decoration-2 underline-offset-4">
                            {pastSeg.ending}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={(e) => speakLithuanian(verb.past[pKey], e)}
                          className="p-1 rounded text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100/60 dark:hover:bg-slate-700"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="p-3 border-r border-slate-200 dark:border-slate-800 font-mono font-bold">
                      <div className="flex items-center justify-between gap-1.5">
                        <span>
                          <span className="text-slate-900 dark:text-white">
                            {futSeg.stem}
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-400 underline decoration-emerald-500/80 decoration-2 underline-offset-4">
                            {futSeg.ending}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={(e) =>
                            speakLithuanian(verb.future[pKey], e)
                          }
                          className="p-1 rounded text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100/60 dark:hover:bg-slate-700"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {impForm ? (
                        <div className="flex items-center justify-between gap-1.5">
                          <span>{impForm}!</span>
                          <button
                            type="button"
                            onClick={(e) => speakLithuanian(impForm, e)}
                            className="p-1 rounded text-amber-600 dark:text-amber-400 hover:bg-amber-100/60 dark:hover:bg-slate-700"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Contextual Examples in Present, Past, and Future */}
        <div className="space-y-2.5 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {language === 'uk'
              ? 'Приклади вживання в реченнях (Теперішній / Минулий / Майбутній час)'
              : language === 'lt'
              ? 'Vartojimo pavyzdžiai sakiniuose'
              : 'Usage Examples in Sentences'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(
              [
                { key: 'present', label: 'Esamasis l. (Теперішній)' },
                { key: 'past', label: 'Būtasis k. l. (Минулий)' },
                { key: 'future', label: 'Būsimasis l. (Майбутній)' },
              ] as const
            ).map((item) => {
              const ex = verb.examples[item.key];
              return (
                <div
                  key={item.key}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10.5px] font-bold text-amber-700 dark:text-amber-400">
                      {item.label}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => speakLithuanian(ex.fullSentenceLt, e)}
                      className="p-1 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-100/70 dark:hover:bg-slate-700"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {ex.fullSentenceLt}
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">
                    {language === 'en' ? ex.translationEn : ex.translationUk}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header + Part of Speech Switcher (Іменники 1000 / Дієслова 500) */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {t.dictionary.title}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            {dictionaryPos === 'nouns'
              ? t.dictionary.subtitle
              : language === 'uk'
              ? '500 найпопулярніших литовських дієслів із 3 основними формами, дієвідмінюванням у всіх часах та керуванням відмінками'
              : language === 'lt'
              ? '500 populiariausių lietuvių kalbos veiksmažodžių su 3 pagrindinėmis formomis ir asmenavimo lentelėmis'
              : '500 most popular Lithuanian verbs with 3 principal forms, full tense conjugation tables, and case governance'}
          </p>
        </div>

        {/* Part-of-Speech Switcher */}
        <div
          role="tablist"
          className="grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl bg-slate-200/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0"
        >
          <button
            type="button"
            role="tab"
            aria-selected={dictionaryPos === 'nouns'}
            onClick={() => {
              setDictionaryPos('nouns');
              setIsDrillDownOpen(false);
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              dictionaryPos === 'nouns'
                ? 'bg-slate-900 text-white shadow-xs dark:bg-amber-500 dark:text-slate-950'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {language === 'uk'
              ? `Іменники (${ALL_VERIFIED_NOUNS.length})`
              : language === 'lt'
              ? `Daiktavardžiai (${ALL_VERIFIED_NOUNS.length})`
              : `Nouns (${ALL_VERIFIED_NOUNS.length})`}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={dictionaryPos === 'verbs'}
            onClick={() => {
              setDictionaryPos('verbs');
              setIsDrillDownOpen(false);
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              dictionaryPos === 'verbs'
                ? 'bg-slate-900 text-white shadow-xs dark:bg-amber-500 dark:text-slate-950'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {language === 'uk'
              ? `Дієслова (${ALL_VERIFIED_VERBS.length})`
              : language === 'lt'
              ? `Veiksmažodžiai (${ALL_VERIFIED_VERBS.length})`
              : `Verbs (${ALL_VERIFIED_VERBS.length})`}
          </button>
        </div>
      </div>

      {/* Search & Interactive Filter Controls */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                dictionaryPos === 'nouns'
                  ? language === 'uk'
                    ? 'Пошук іменника литовською (навіть англ. розкладкою: tetis → tėtis, zmogus → žmogus) або перекладом...'
                    : language === 'lt'
                    ? 'Paieška (tinka ir be lietuviškų raidžių: tetis → tėtis, zmogus → žmogus)...'
                    : 'Search nouns in Lithuanian (even ASCII: tetis → tėtis, zmogus → žmogus) or translation...'
                  : language === 'uk'
                  ? 'Пошук дієслова (навіть англ. розкладкою: buti → būti, kalbeti → kalbėti, rasyti → rašyti) або перекладом...'
                  : language === 'lt'
                  ? 'Veiksmažodžio paieška (pvz., buti → būti, kalbeti → kalbėti, rasyti → rašyti)...'
                  : 'Search verbs in Lithuanian (even ASCII: buti → būti, kalbeti → kalbėti) or translation...'
              }
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-amber-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value as TopicId | 'all')}
            className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200"
          >
            <option value="all">{t.dictionary.allTopics}</option>
            {(Object.keys(TOPICS_METADATA) as TopicId[]).map((top) => (
              <option key={top} value={top}>
                {TOPICS_METADATA[top].label[language]}
              </option>
            ))}
          </select>

          {dictionaryPos === 'nouns' ? (
            <select
              value={declFilter}
              onChange={(e) => {
                setDeclFilter(
                  e.target.value === 'all'
                    ? 'all'
                    : (Number(e.target.value) as DeclensionType)
                );
              }}
              className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200"
            >
              <option value="all">{t.dictionary.allDeclensions}</option>
              {([1, 2, 3, 4, 5] as DeclensionType[]).map((d) => (
                <option key={d} value={d}>
                  {DECLENSION_PDF_TABLE[d - 1].title[language]}
                </option>
              ))}
            </select>
          ) : (
            <>
              <select
                value={verbConjFilter}
                onChange={(e) => {
                  setVerbConjFilter(
                    e.target.value === 'all'
                      ? 'all'
                      : (Number(e.target.value) as VerbConjugationType)
                  );
                }}
                className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200"
              >
                <option value="all">
                  {language === 'uk'
                    ? 'Усі дієвідміни (I–III)'
                    : language === 'lt'
                    ? 'Visos asmenuotės (I–III)'
                    : 'All Conjugations (I–III)'}
                </option>
                {([1, 2, 3] as VerbConjugationType[]).map((c) => (
                  <option key={c} value={c}>
                    {VERB_CONJUGATIONS_METADATA[c].title[language]}
                  </option>
                ))}
              </select>

              <select
                value={verbGovFilter}
                onChange={(e) =>
                  setVerbGovFilter(
                    e.target.value as VerbGovernedCase | 'all'
                  )
                }
                className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200"
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

          <select
            value={levelFilter}
            onChange={(e) => {
              setLevelFilter(
                e.target.value === 'all'
                  ? 'all'
                  : (Number(e.target.value) as DifficultyLevel)
              );
            }}
            className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200"
          >
            <option value="all">
              {language === 'uk'
                ? 'Усі рівні (A0–B2)'
                : language === 'lt'
                ? 'Visi lygiai (A0–B2)'
                : 'All Levels (A0–B2)'}
            </option>
            {([1, 2, 3, 4] as DifficultyLevel[]).map((lvl) => (
              <option key={lvl} value={lvl}>
                {DIFFICULTY_METADATA[lvl].title[language]}
              </option>
            ))}
          </select>
        </div>

        {/* Smart Lithuanian Word Suggestions Bar (when typing in English/ASCII layout) */}
        {dictionaryPos === 'nouns' &&
          searchQuery.trim().length > 0 &&
          lithuanianSuggestions.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 dark:text-amber-300">
                <Keyboard className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>
                  {language === 'uk'
                    ? 'Литовські відповідники (пошук англійською розкладкою без діакритики):'
                    : language === 'lt'
                    ? 'Siūlomi lietuviški žodžiai:'
                    : 'Suggested Lithuanian words (ASCII / English keyboard match):'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {lithuanianSuggestions.map((sug) => {
                  const isSelected = selectedNoun?.id === sug.noun.id;
                  const asciiLemma = stripLithuanianDiacritics(sug.noun.lemma);
                  const showAsciiArrow =
                    !hasLithuanianDiacritics(searchQuery) &&
                    hasLithuanianDiacritics(sug.noun.lemma);

                  return (
                    <button
                      key={sug.noun.id}
                      type="button"
                      onClick={() => {
                        setSelectedNoun(sug.noun);
                        if (window.innerWidth < 1024) {
                          document
                            .getElementById('noun-paradigm-inspector')
                            ?.scrollIntoView({
                              behavior: 'smooth',
                              block: 'nearest',
                            });
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 border ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 dark:bg-amber-500 dark:text-slate-950 dark:border-amber-400 shadow-sm'
                          : 'bg-white text-slate-800 border-amber-200 hover:border-amber-400 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {showAsciiArrow && (
                        <span className="font-mono text-[11px] opacity-65">
                          {asciiLemma} →
                        </span>
                      )}
                      <span className="font-mono font-bold text-sm">
                        {isSelected
                          ? sug.noun.lemma
                          : renderWordWithHighlightedDiacritics(sug.noun.lemma)}
                      </span>
                      {sug.matchType === 'inflected_form' &&
                        sug.matchedForm &&
                        sug.matchedForm.toLowerCase() !==
                          sug.noun.lemma.toLowerCase() && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100/80 dark:bg-slate-800 text-amber-800 dark:text-amber-300">
                            {sug.matchedForm}
                          </span>
                        )}
                      <span className="text-[11px] opacity-80">
                        ({language === 'en' ? sug.noun.en : sug.noun.uk})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        {dictionaryPos === 'verbs' &&
          searchQuery.trim().length > 0 &&
          lithuanianVerbSuggestions.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 dark:text-amber-300">
                <Keyboard className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>
                  {language === 'uk'
                    ? 'Литовські дієслова (пошук англійською розкладкою без діакритики):'
                    : language === 'lt'
                    ? 'Siūlomi lietuviški veiksmažodžiai:'
                    : 'Suggested Lithuanian verbs (ASCII / English keyboard match):'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {lithuanianVerbSuggestions.map((sug) => {
                  const isSelected = selectedVerb?.id === sug.verb.id;
                  const cleanInf = sug.verb.infinitive
                    .replace(/\s*\([^)]*\)\s*/g, '')
                    .trim();
                  const asciiInf = stripLithuanianDiacritics(cleanInf);
                  const showAsciiArrow =
                    !hasLithuanianDiacritics(searchQuery) &&
                    hasLithuanianDiacritics(cleanInf);

                  return (
                    <button
                      key={sug.verb.id}
                      type="button"
                      onClick={() => {
                        setSelectedVerb(sug.verb);
                        if (window.innerWidth < 1024) {
                          document
                            .getElementById('verb-paradigm-inspector')
                            ?.scrollIntoView({
                              behavior: 'smooth',
                              block: 'nearest',
                            });
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 border ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 dark:bg-amber-500 dark:text-slate-950 dark:border-amber-400 shadow-sm'
                          : 'bg-white text-slate-800 border-amber-200 hover:border-amber-400 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {showAsciiArrow && (
                        <span className="font-mono text-[11px] opacity-65">
                          {asciiInf} →
                        </span>
                      )}
                      <span className="font-mono font-bold text-sm">
                        {isSelected
                          ? sug.verb.infinitive
                          : renderWordWithHighlightedDiacritics(
                              sug.verb.infinitive
                            )}
                      </span>
                      <span className="text-[11px] opacity-80">
                        ({language === 'en' ? sug.verb.en : sug.verb.uk})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        {/* Quick Examples of English-Keyboard Search when search bar is empty */}
        {!searchQuery.trim() && (
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <Keyboard className="w-3.5 h-3.5 text-amber-500 shrink-0 mr-0.5" />
            <span>
              {language === 'uk'
                ? 'Порада: вводьте слова англійською розкладкою —'
                : language === 'lt'
                ? 'Patarimas: galite vesti be diakritikų —'
                : 'Tip: type in English layout without diacritics —'}
            </span>
            {(dictionaryPos === 'nouns'
              ? ASCII_SEARCH_EXAMPLES
              : ASCII_VERB_SEARCH_EXAMPLES
            ).map((ex) => (
              <button
                key={ex.ascii}
                type="button"
                onClick={() => setSearchQuery(ex.ascii)}
                className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-amber-100/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono transition-colors"
              >
                {ex.ascii} →{' '}
                <strong className="text-amber-700 dark:text-amber-400">
                  {ex.lt}
                </strong>
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setOnlyFavorites((v) => !v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 min-h-[36px] ${
                onlyFavorites
                  ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              ★ {t.dictionary.onlyFavorites} ({progress.favorites.length})
            </button>
            <button
              type="button"
              onClick={() => setOnlyExceptions((v) => !v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 min-h-[36px] ${
                onlyExceptions
                  ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {t.dictionary.onlyExceptions}
            </button>
            {dictionaryPos === 'verbs' && (
              <button
                type="button"
                onClick={() => setOnlyReflexiveVerbs((v) => !v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 min-h-[36px] ${
                  onlyReflexiveVerbs
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
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

          <div className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {t.dictionary.showingCount}{' '}
            <span className="font-semibold text-slate-900 dark:text-white">
              {dictionaryPos === 'nouns'
                ? filteredNouns.length
                : filteredVerbs.length}
            </span>{' '}
            /{' '}
            {dictionaryPos === 'nouns'
              ? ALL_VERIFIED_NOUNS.length
              : ALL_VERIFIED_VERBS.length}
          </div>
        </div>
      </div>

      {/* Main Content: Either Nouns or Verbs */}
      {dictionaryPos === 'nouns' ? (
        isDrillDownOpen && selectedNoun ? (
          <div id="noun-paradigm-inspector" className="scroll-mt-20">
            {renderNounDrillDownPanel(selectedNoun, true)}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 5 cols: Filtered & Ranked Noun List */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 max-h-[420px] lg:max-h-[760px] overflow-y-auto">
              {rankedMatches.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  {language === 'uk'
                    ? 'Слів за вашим запитом не знайдено. Спробуйте змінити фільтри або ввести інше слово.'
                    : language === 'lt'
                    ? 'Žodžių nerasta. Pabandykite pakeisti filtrus.'
                    : 'No matching nouns found. Try adjusting your search or filters.'}
                </div>
              ) : (
                rankedMatches.map((match) => {
                  const {
                    noun,
                    matchType,
                    matchedForm,
                    matchedCase,
                    matchedNumber,
                  } = match;
                  const isSelected = selectedNoun?.id === noun.id;
                  const isFav = progress.favorites.includes(noun.id);
                  const stat = progress.wordStats[noun.id];

                  return (
                    <div
                      key={noun.id}
                      onClick={() => {
                        setSelectedNoun(noun);
                        if (window.innerWidth < 1024) {
                          document
                            .getElementById('noun-paradigm-inspector')
                            ?.scrollIntoView({
                              behavior: 'smooth',
                              block: 'nearest',
                            });
                        }
                      }}
                      className={`p-4 cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-amber-50/80 dark:bg-slate-800/90'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-base font-bold text-slate-900 dark:text-white truncate">
                            {searchQuery.trim() &&
                            !hasLithuanianDiacritics(searchQuery) &&
                            hasLithuanianDiacritics(noun.lemma)
                              ? renderWordWithHighlightedDiacritics(noun.lemma)
                              : noun.lemma}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => speakLithuanian(noun.lemma, e)}
                            title={
                              language === 'uk'
                                ? 'Озвучити литовською'
                                : language === 'lt'
                                ? 'Klausyti tarimo'
                                : 'Listen in Lithuanian'
                            }
                            aria-label={`Listen to ${noun.lemma}`}
                            className="p-1 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-100/80 dark:hover:bg-slate-700 transition-colors shrink-0"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs text-slate-400 font-mono">
                            → {noun.sg.gen}
                          </span>
                          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {DIFFICULTY_CEFR_LABELS[noun.difficulty]}
                          </span>
                          {matchType === 'ascii_lemma' &&
                            searchQuery.trim() && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
                                {stripLithuanianDiacritics(noun.lemma)} →{' '}
                                {noun.lemma}
                              </span>
                            )}
                          {matchType === 'inflected_form' &&
                            matchedForm &&
                            matchedCase && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300">
                                {matchedForm} (
                                {CASES_METADATA[matchedCase].shortLt}{' '}
                                {matchedNumber === 'pl' ? 'dgs.' : 'vns.'})
                              </span>
                            )}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-300 truncate mt-0.5">
                          {language === 'en'
                            ? `${noun.en} · ${noun.uk}`
                            : `${noun.uk} · ${noun.en}`}
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 flex flex-wrap items-center gap-1.5">
                          <span>{noun.declension} linksn.</span>
                          <span>·</span>
                          <span>
                            {TOPICS_METADATA[noun.topic].label[language]}
                          </span>
                          {stat?.mastered && (
                            <>
                              <span>·</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                ✓ Mastered
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedNoun(noun);
                            setIsDrillDownOpen(true);
                          }}
                          title={
                            language === 'uk'
                              ? 'Відкрити повну таблицю (7 відмінків × 2 числа)'
                              : 'Open full 7-case drill-down view'
                          }
                          className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors hidden sm:inline-flex items-center gap-1"
                        >
                          <Table2 className="w-3.5 h-3.5" />
                          <span>7 відм.</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(noun.id);
                          }}
                          aria-label="Star favorite"
                          className="p-2 text-slate-400 hover:text-amber-500 shrink-0 min-h-[40px] min-w-[40px] flex items-center justify-center"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              isFav ? 'fill-amber-400 text-amber-500' : ''
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right 7 cols: Individual Noun 7-Case × 2-Number Drill-Down Inspector */}
            <div
              id="noun-paradigm-inspector"
              className="lg:col-span-7 scroll-mt-20"
            >
              {selectedNoun && renderNounDrillDownPanel(selectedNoun, false)}
            </div>
          </div>
        )
      ) : isDrillDownOpen && selectedVerb ? (
        <div id="verb-paradigm-inspector" className="scroll-mt-20">
          {renderVerbDrillDownPanel(selectedVerb, true)}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 5 cols: Filtered & Ranked Verb List */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 max-h-[420px] lg:max-h-[760px] overflow-y-auto">
            {rankedVerbMatches.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                {language === 'uk'
                  ? 'Дієслів за вашим запитом не знайдено. Спробуйте змінити фільтри або ввести інше слово.'
                  : language === 'lt'
                  ? 'Veiksmažodžių nerasta. Pabandykite pakeisti filtrus.'
                  : 'No matching verbs found. Try adjusting your search or filters.'}
              </div>
            ) : (
              rankedVerbMatches.map((match) => {
                const { verb, matchedForm } = match;
                const cleanInf = verb.infinitive
                  .replace(/\s*\([^)]*\)\s*/g, '')
                  .trim();
                const isSelected = selectedVerb?.id === verb.id;
                const isFav = progress.favorites.includes(verb.id);
                const stat = progress.wordStats[verb.id];

                return (
                  <div
                    key={verb.id}
                    onClick={() => {
                      setSelectedVerb(verb);
                      if (window.innerWidth < 1024) {
                        document
                          .getElementById('verb-paradigm-inspector')
                          ?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'nearest',
                          });
                      }
                    }}
                    className={`p-4 cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-amber-50/80 dark:bg-slate-800/90'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-base font-bold text-slate-900 dark:text-white truncate">
                          {searchQuery.trim() &&
                          !hasLithuanianDiacritics(searchQuery) &&
                          hasLithuanianDiacritics(verb.infinitive)
                            ? renderWordWithHighlightedDiacritics(
                                verb.infinitive
                              )
                            : verb.infinitive}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => speakLithuanian(cleanInf, e)}
                          title="Озвучити дієслово литовською"
                          aria-label={`Listen to ${cleanInf}`}
                          className="p-1 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-100/80 dark:hover:bg-slate-700 transition-colors shrink-0"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs text-amber-700 dark:text-amber-400 font-mono font-semibold">
                          ({verb.present3}, {verb.past3})
                        </span>
                        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {DIFFICULTY_CEFR_LABELS[verb.difficulty]}
                        </span>
                        {matchedForm && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300">
                            {matchedForm}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300 truncate mt-0.5">
                        {language === 'en'
                          ? `${verb.en} · ${verb.uk}`
                          : `${verb.uk} · ${verb.en}`}
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 flex flex-wrap items-center gap-1.5">
                        <span>{verb.conjugation} asmenuotė</span>
                        <span>·</span>
                        <span>
                          {
                            VERB_GOVERNED_CASES_METADATA[verb.governedCase]
                              .shortBadge[language]
                          }
                        </span>
                        <span>·</span>
                        <span>
                          {TOPICS_METADATA[verb.topic].label[language]}
                        </span>
                        {stat?.mastered && (
                          <>
                            <span>·</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                              ✓ Mastered
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVerb(verb);
                          setIsDrillDownOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors hidden sm:inline-flex items-center gap-1"
                      >
                        <Table2 className="w-3.5 h-3.5" />
                        <span>Часи</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(verb.id);
                        }}
                        aria-label="Star favorite"
                        className="p-2 text-slate-400 hover:text-amber-500 shrink-0 min-h-[40px] min-w-[40px] flex items-center justify-center"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            isFav ? 'fill-amber-400 text-amber-500' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right 7 cols: Individual Verb Conjugation Inspector */}
          <div
            id="verb-paradigm-inspector"
            className="lg:col-span-7 scroll-mt-20"
          >
            {selectedVerb && renderVerbDrillDownPanel(selectedVerb, false)}
          </div>
        </div>
      )}
    </div>
  );
};

