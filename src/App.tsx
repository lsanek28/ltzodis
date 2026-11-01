/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Bell,
  BellRing,
  BookOpen,
  BarChart3,
  CheckCircle2,
  Cloud,
  GraduationCap,
  Home,
  Layers,
  Moon,
  Play,
  RefreshCw,
  Settings,
  Sun,
  Table2,
  User as UserIcon,
  Vibrate,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { HomeDashboard } from './components/HomeDashboard';
import {
  CASES_METADATA,
  CASE_ORDER,
  DECLENSION_PDF_TABLE,
  DIFFICULTY_METADATA,
  TOPICS_METADATA,
  TRAINING_MODES_METADATA,
} from './data/grammarRules';
import { UI_TEXT } from './i18n/translations';
import {
  AppLanguage,
  DeclensionType,
  DifficultyLevel,
  GrammaticalCase,
  GrammaticalNumber,
  NounEntry,
  TopicId,
  TrainingMode,
  UserProgress,
  VerbEntry,
} from './types/grammar';
import {
  createInitialProgress,
  getTodayDateString,
  loadUserProgress,
  recordExerciseOutcome,
  recordVerbExerciseOutcome,
  resolveEffectiveDifficulty,
  saveUserProgress,
} from './utils/progressStorage';
import { ExerciseWorkspace } from './components/ExerciseWorkspace';
import { VerbConjugationWorkspace } from './components/VerbConjugationWorkspace';
import { VocabularyFlashcards } from './components/VocabularyFlashcards';
import { DictionaryCatalog } from './components/DictionaryCatalog';
import { GrammarReferenceView } from './components/GrammarReferenceView';
import { StatisticsAndTestsView } from './components/StatisticsAndTestsView';
import { AndroidProjectExportView } from './components/AndroidProjectExportView';
import { AccountAuthModal } from './components/AccountAuthModal';
import {
  auth,
  mergeUserProgress,
  onAuthStateChanged,
  saveProgressToFirestore,
  subscribeToCloudProgress,
  syncUserProgressWithCloud,
  User,
} from './firebase';
import { initTelegramMiniApp } from './utils/telegramWebApp';
import {
  playAnswerSoundEffect,
  triggerAnswerFeedback,
  triggerTactileFeedback,
} from './utils/feedbackEffects';
import {
  dispatchPracticeNotification,
  getCurrentTimeHHMM,
  getNotificationPermissionStatus,
  NotificationPermissionStatus,
  ReminderPayload,
  requestWebNotificationPermission,
} from './utils/reminderNotifications';

type ActiveTab =
  | 'home'
  | 'practice'
  | 'dictionary'
  | 'reference'
  | 'stats'
  | 'android';

type PracticeCategory = 'declension' | 'verbs' | 'flashcards';

export default function App() {
  const [progress, setProgress] = useState<UserProgress>(() =>
    loadUserProgress()
  );
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [practiceCategory, setPracticeCategory] =
    useState<PracticeCategory>('declension');
  const [trainingMode, setTrainingMode] = useState<TrainingMode>('random');
  const [selectedCase, setSelectedCase] = useState<GrammaticalCase>('gen');
  const [selectedDeclension, setSelectedDeclension] =
    useState<DeclensionType>(1);
  const [selectedNumber, setSelectedNumber] = useState<
    GrammaticalNumber | 'both'
  >('sg');
  const [selectedTopic, setSelectedTopic] = useState<TopicId>('city');
  const [forcedNounId, setForcedNounId] = useState<string | undefined>(
    undefined
  );
  const [forcedVerbId, setForcedVerbId] = useState<string | undefined>(
    undefined
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [syncStatus, setSyncStatus] = useState<
    'idle' | 'syncing' | 'synced' | 'error'
  >('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [tokenServiceEnableUrl, setTokenServiceEnableUrl] = useState<
    string | null
  >(null);
  const progressRef = useRef<UserProgress>(progress);
  progressRef.current = progress;

  const [notificationPerm, setNotificationPerm] =
    useState<NotificationPermissionStatus>(() =>
      getNotificationPermissionStatus()
    );
  const [activeReminderToast, setActiveReminderToast] =
    useState<ReminderPayload | null>(null);
  const [isMobileInputFocused, setIsMobileInputFocused] = useState(false);
  const [visualViewportHeight, setVisualViewportHeight] = useState<
    number | null
  >(null);

  const language = progress.language;
  const t = UI_TEXT[language];
  const effectiveDifficulty = resolveEffectiveDifficulty(progress);
  const isMobilePracticeSingleCard =
    activeTab === 'practice' &&
    (practiceCategory === 'flashcards' ||
      practiceCategory === 'verbs' ||
      trainingMode !== 'full_paradigm');
  const isMobileKeyboardOpen =
    isMobileInputFocused || visualViewportHeight !== null;

  useEffect(() => {
    const tgInfo = initTelegramMiniApp();
    if (tgInfo.isTelegram && tgInfo.colorScheme === 'dark' && !progress.darkMode) {
      setProgress((prev) => ({ ...prev, darkMode: true }));
    }
  }, []);

  useEffect(() => {
    const updateViewport = () => {
      if (typeof window === 'undefined') return;
      if (window.innerWidth >= 768) {
        setVisualViewportHeight(null);
        setIsMobileInputFocused(false);
        return;
      }
      const vv = window.visualViewport;
      if (vv) {
        const heightDiff = window.innerHeight - vv.height;
        if (heightDiff > 100) {
          setVisualViewportHeight(Math.round(vv.height));
        } else {
          setVisualViewportHeight(null);
        }
      }
      const activeEl = document.activeElement;
      const inputActive =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement;
      setIsMobileInputFocused(inputActive);
    };

    const keepHeaderVisibleOnMobilePractice = () => {
      if (
        typeof window !== 'undefined' &&
        window.innerWidth < 768 &&
        activeTab === 'practice' &&
        trainingMode !== 'full_paradigm' &&
        window.scrollY > 0 &&
        document.documentElement.scrollHeight <= window.innerHeight + 40
      ) {
        window.scrollTo(0, 0);
      }
    };

    const handleFocusIn = (e: FocusEvent) => {
      if (window.innerWidth >= 768) return;
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        setIsMobileInputFocused(true);
        updateViewport();
        if (activeTab === 'practice' && trainingMode !== 'full_paradigm') {
          window.scrollTo(0, 0);
          setTimeout(keepHeaderVisibleOnMobilePractice, 40);
          setTimeout(keepHeaderVisibleOnMobilePractice, 150);
          setTimeout(keepHeaderVisibleOnMobilePractice, 320);
        }
      }
    };

    const handleFocusOut = () => {
      setTimeout(() => {
        if (typeof document === 'undefined') return;
        const activeEl = document.activeElement;
        const stillFocused =
          activeEl instanceof HTMLInputElement ||
          activeEl instanceof HTMLTextAreaElement;
        if (!stillFocused) {
          setIsMobileInputFocused(false);
          updateViewport();
        }
      }, 60);
    };

    const handleViewportResizeOrScroll = () => {
      updateViewport();
      keepHeaderVisibleOnMobilePractice();
    };

    updateViewport();
    const vv = window.visualViewport;
    vv?.addEventListener('resize', handleViewportResizeOrScroll);
    vv?.addEventListener('scroll', handleViewportResizeOrScroll);
    window.addEventListener('resize', updateViewport);
    window.addEventListener('scroll', keepHeaderVisibleOnMobilePractice, {
      passive: true,
    });
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      vv?.removeEventListener('resize', handleViewportResizeOrScroll);
      vv?.removeEventListener('scroll', handleViewportResizeOrScroll);
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('scroll', keepHeaderVisibleOnMobilePractice);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, [activeTab, trainingMode]);

  useEffect(() => {
    const root = document.documentElement;
    if (progress.darkMode) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    root.lang = progress.language;
  }, [progress.darkMode, progress.language]);

  const pushProgressToCloud = async (
    nextProgress: UserProgress,
    userOverride?: User | null,
    forceRetry = false
  ) => {
    const activeUser = userOverride !== undefined ? userOverride : currentUser;
    if (!activeUser) return;
    setSyncStatus('syncing');
    try {
      const res = await saveProgressToFirestore(
        activeUser,
        nextProgress,
        forceRetry
      );
      setLastSyncedAt(res.updatedAtIso);
      setTokenServiceEnableUrl(res.enableApiUrl);
      setSyncStatus(res.syncedWithCloud ? 'synced' : 'error');
    } catch {
      setSyncStatus('error');
    }
  };

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      setCurrentUser(user);
      if (!user) {
        setSyncStatus('idle');
        setTokenServiceEnableUrl(null);
        return;
      }

      setSyncStatus('syncing');
      try {
        const syncRes = await syncUserProgressWithCloud(
          user,
          progressRef.current
        );
        setProgress(syncRes.progress);
        saveUserProgress(syncRes.progress);
        setLastSyncedAt(syncRes.updatedAtIso);
        setTokenServiceEnableUrl(syncRes.enableApiUrl);
        setSyncStatus(syncRes.syncedWithCloud ? 'synced' : 'error');

        if (syncRes.syncedWithCloud) {
          unsubscribeSnapshot = subscribeToCloudProgress(
            user,
            (cloudProg, updatedAtIso) => {
              setProgress((prev) => {
                const combined = mergeUserProgress(prev, cloudProg);
                saveUserProgress(combined);
                return combined;
              });
              setLastSyncedAt(updatedAtIso);
              setSyncStatus('synced');
            }
          );
        }
      } catch {
        setSyncStatus('error');
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

  const updateProgress = (updater: (prev: UserProgress) => UserProgress) => {
    setProgress((prev) => {
      const next = updater(prev);
      saveUserProgress(next);
      if (currentUser) {
        void pushProgressToCloud(next, currentUser);
      }
      return next;
    });
  };

  // Background scheduler checking every 15 seconds if the daily reminder time has arrived
  useEffect(() => {
    if (!progress.reminderEnabled) return;

    const checkReminder = () => {
      const today = getTodayDateString();
      if (progress.lastReminderSentDate === today) return;

      const currentHHMM = getCurrentTimeHHMM();
      if (currentHHMM === progress.reminderTime) {
        const completedToday = progress.dailyActivity[today]?.completed ?? 0;
        const { payload } = dispatchPracticeNotification(
          progress.language,
          completedToday,
          progress.dailyGoal,
          () => setActiveTab('practice')
        );
        setActiveReminderToast(payload);
        updateProgress((prev) => ({
          ...prev,
          lastReminderSentDate: today,
        }));
      }
    };

    checkReminder();
    const timerId = window.setInterval(checkReminder, 15000);
    return () => window.clearInterval(timerId);
  }, [
    progress.reminderEnabled,
    progress.reminderTime,
    progress.lastReminderSentDate,
    progress.language,
    progress.dailyGoal,
    progress.dailyActivity,
  ]);

  const handleToggleReminder = async () => {
    const nextEnabled = !progress.reminderEnabled;
    if (nextEnabled && notificationPerm === 'default') {
      const perm = await requestWebNotificationPermission();
      setNotificationPerm(perm);
    }
    updateProgress((prev) => ({
      ...prev,
      reminderEnabled: nextEnabled,
    }));
  };

  const handleChangeReminderTime = (newTime: string) => {
    updateProgress((prev) => ({
      ...prev,
      reminderTime: newTime,
      // Reset lastReminderSentDate if user picks a new time today so it can trigger at the new time
      lastReminderSentDate: undefined,
    }));
  };

  const handleRequestPermissionExplicit = async () => {
    const perm = await requestWebNotificationPermission();
    setNotificationPerm(perm);
  };

  const handleSendTestNotification = async () => {
    if (notificationPerm === 'default') {
      const perm = await requestWebNotificationPermission();
      setNotificationPerm(perm);
    }
    const today = getTodayDateString();
    const completedToday = progress.dailyActivity[today]?.completed ?? 0;
    const { payload } = dispatchPracticeNotification(
      progress.language,
      completedToday,
      progress.dailyGoal,
      () => setActiveTab('practice')
    );
    setActiveReminderToast(payload);
  };

  const handleSetLanguage = (lang: AppLanguage) => {
    updateProgress((prev) => ({ ...prev, language: lang }));
  };

  const handleToggleDarkMode = () => {
    updateProgress((prev) => ({ ...prev, darkMode: !prev.darkMode }));
  };

  const handleSelectDifficulty = (diff: DifficultyLevel | 'auto') => {
    updateProgress((prev) => ({ ...prev, selectedDifficulty: diff }));
  };

  const handleSetDailyGoal = (goal: number) => {
    updateProgress((prev) => ({ ...prev, dailyGoal: goal }));
  };

  const handleToggleFavorite = (wordId: string) => {
    updateProgress((prev) => {
      const exists = prev.favorites.includes(wordId);
      const favorites = exists
        ? prev.favorites.filter((id) => id !== wordId)
        : [...prev.favorites, wordId];
      return { ...prev, favorites };
    });
  };

  const handleToggleSoundEffects = () => {
    const next = !progress.soundEffectsEnabled;
    if (next) {
      playAnswerSoundEffect('correct');
    }
    updateProgress((prev) => ({
      ...prev,
      soundEffectsEnabled: next,
    }));
  };

  const handleToggleHapticFeedback = () => {
    const next = !progress.hapticFeedbackEnabled;
    if (next) {
      triggerTactileFeedback('correct');
    }
    updateProgress((prev) => ({
      ...prev,
      hapticFeedbackEnabled: next,
    }));
  };

  const handleRecordOutcome = (
    noun: NounEntry,
    targetCase: GrammaticalCase,
    targetNumber: GrammaticalNumber,
    userAnswer: string,
    correctAnswer: string,
    isCorrect: boolean
  ) => {
    triggerAnswerFeedback(
      isCorrect,
      progress.soundEffectsEnabled,
      progress.hapticFeedbackEnabled
    );
    setProgress((prev) => {
      const next = recordExerciseOutcome(
        prev,
        noun,
        targetCase,
        targetNumber,
        userAnswer,
        correctAnswer,
        isCorrect
      );
      if (currentUser) {
        void pushProgressToCloud(next, currentUser);
      }
      return next;
    });
  };

  const handleRecordVerbOutcome = (verb: VerbEntry, isCorrect: boolean) => {
    triggerAnswerFeedback(
      isCorrect,
      progress.soundEffectsEnabled,
      progress.hapticFeedbackEnabled
    );
    setProgress((prev) => {
      const next = recordVerbExerciseOutcome(prev, verb, isCorrect);
      if (currentUser) {
        void pushProgressToCloud(next, currentUser);
      }
      return next;
    });
  };

  const handlePracticeSpecificNoun = (wordId: string) => {
    if (wordId.startsWith('vb_')) {
      setForcedVerbId(wordId);
      setPracticeCategory('verbs');
      setActiveTab('practice');
      return;
    }
    setForcedNounId(wordId);
    setPracticeCategory('declension');
    setActiveTab('practice');
  };

  const handlePracticeSpecificVerb = (verbId: string) => {
    setForcedVerbId(verbId);
    setPracticeCategory('verbs');
    setActiveTab('practice');
  };

  const todayStr = getTodayDateString();
  const todayCompleted = progress.dailyActivity[todayStr]?.completed ?? 0;
  const dailyGoalPct = Math.min(
    100,
    Math.round((todayCompleted / progress.dailyGoal) * 100)
  );
  const masteredCount = Object.values(progress.wordStats).filter(
    (w) => w.mastered
  ).length;
  const overallAccuracy =
    progress.totalExercisesCompleted > 0
      ? Math.round(
          (progress.totalCorrectAnswers / progress.totalExercisesCompleted) *
            100
        )
      : 0;

  return (
    <div
      className={`flex flex-col bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 md:min-h-dvh md:pb-10 ${
        isMobilePracticeSingleCard ? 'pb-0' : 'min-h-dvh pb-16'
      }`}
    >
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-8 px-2.5 sm:px-6 lg:px-8 h-10 sm:h-16">
          {/* Zone 1: Single text element wordmark */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onPointerDown={(e) => e.preventDefault()}
            onClick={() => setActiveTab('home')}
            className="text-sm sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 font-display truncate"
          >
            Lietuvių žodžių galūnės
          </button>

          {/* Zone 2: 5 concise single-line navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <button
              type="button"
              onClick={() => setActiveTab('practice')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeTab === 'practice'
                  ? 'text-slate-900 dark:text-white underline decoration-amber-500 decoration-2 underline-offset-8 font-semibold'
                  : ''
              }`}
            >
              {t.nav.practice}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('dictionary')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeTab === 'dictionary'
                  ? 'text-slate-900 dark:text-white underline decoration-amber-500 decoration-2 underline-offset-8 font-semibold'
                  : ''
              }`}
            >
              {t.nav.dictionary}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reference')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeTab === 'reference'
                  ? 'text-slate-900 dark:text-white underline decoration-amber-500 decoration-2 underline-offset-8 font-semibold'
                  : ''
              }`}
            >
              {t.nav.reference}
            </button>
            <button
              type="button"
              onClick={() => setSettingsOpen((v) => !v)}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
                settingsOpen
                  ? 'text-slate-900 dark:text-white underline decoration-amber-500 decoration-2 underline-offset-8 font-semibold'
                  : ''
              }`}
            >
              {t.nav.settings}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('android')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeTab === 'android'
                  ? 'text-slate-900 dark:text-white underline decoration-amber-500 decoration-2 underline-offset-8 font-semibold'
                  : ''
              }`}
            >
              {t.nav.androidCode}
            </button>
          </nav>

          {/* Zone 3: 1 primary CTA action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => setActiveTab('practice')}
              className="px-3 sm:px-4 py-1 sm:py-2 text-[11px] sm:text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[30px] sm:min-h-[38px]"
            >
              {t.ctaStartPractice}
            </button>
          </div>
        </div>
      </header>

      {/* Workspace Utility Strip Below Header (Single-line on mobile so it never wastes vertical space) */}
      <div className="shrink-0 bg-slate-100/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-1 sm:py-2 flex items-center justify-between gap-2 text-[11px] sm:text-xs overflow-x-auto">
          <div className="flex items-center gap-1.5 sm:gap-2 text-slate-600 dark:text-slate-400 whitespace-nowrap min-w-0">
            <span className="hidden sm:inline">{t.dailyGoalTitle}:</span>
            <span className="font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
              {todayCompleted}/{progress.dailyGoal} ({dailyGoalPct}%)
            </span>
            <span aria-hidden="true" className="hidden sm:inline">
              ·
            </span>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => setSettingsOpen(true)}
              className="hidden sm:inline text-slate-700 dark:text-slate-300 hover:underline font-medium truncate"
            >
              {practiceCategory === 'flashcards'
                ? language === 'uk'
                  ? '3. Картки (1500 слів)'
                  : language === 'lt'
                  ? '3. Kortelės (1500 žodžių)'
                  : '3. Flashcards (1500 words)'
                : practiceCategory === 'verbs'
                ? language === 'uk'
                  ? '2. Дієслова (500 дієслів)'
                  : language === 'lt'
                  ? '2. Veiksmažodžiai (500)'
                  : '2. Verbs (500 verbs)'
                : `${TRAINING_MODES_METADATA[trainingMode].title[language]} · ${DIFFICULTY_METADATA[effectiveDifficulty].title[language]}`}
            </button>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Instant Language Selector (UK default, LT, EN) */}
            <div
              role="group"
              aria-label="Language selector"
              className="flex items-center gap-0.5 p-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            >
              {(
                [
                  { code: 'uk', label: 'УКР' },
                  { code: 'lt', label: 'LT' },
                  { code: 'en', label: 'EN' },
                ] as const
              ).map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onPointerDown={(e) => e.preventDefault()}
                  onClick={() => handleSetLanguage(item.code)}
                  className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[11px] sm:text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    language === item.code
                      ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onPointerDown={(e) => e.preventDefault()}
              onClick={handleToggleDarkMode}
              title={t.settings.themeLabel}
              className="p-1 sm:p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
            >
              {progress.darkMode ? (
                <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </button>

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => {
                setSettingsOpen(false);
                setActiveTab('stats');
              }}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border text-[11px] sm:text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'stats' && !settingsOpen
                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-amber-500 dark:text-slate-950 dark:border-amber-500'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{t.nav.stats}</span>
            </button>

            {/* Account & Cloud Sync Trigger Button */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => setAuthModalOpen(true)}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                currentUser
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100/80'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              {currentUser ? (
                <>
                  {syncStatus === 'syncing' ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600 dark:text-amber-400" />
                  ) : (
                    <Cloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  )}
                  <span className="max-w-[96px] sm:max-w-[140px] truncate">
                    {currentUser.displayName ||
                      currentUser.email?.split('@')[0] ||
                      (language === 'uk'
                        ? 'Мій акаунт'
                        : language === 'lt'
                        ? 'Paskyra'
                        : 'Account')}
                  </span>
                </>
              ) : (
                <>
                  <UserIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>
                    {language === 'uk'
                      ? 'Увійти'
                      : language === 'lt'
                      ? 'Prisijungti'
                      : 'Sign In'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Unified Settings Modal / Drawer (Language, Theme, Daily Goal, Difficulty Level & Training Mode) */}
      {settingsOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSettingsOpen(false)}
        >
          <div
            className="w-full max-w-4xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t.settings.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-white min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Row 0: Cloud Account & Sync Banner inside Settings */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Cloud className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>
                        {currentUser
                          ? currentUser.displayName || currentUser.email
                          : language === 'uk'
                          ? 'Хмарна синхронізація акаунта (Google / Apple / Пошта)'
                          : language === 'lt'
                          ? 'Paskyros sinchronizavimas (Google / Apple / El. paštas)'
                          : 'Cloud Account Sync (Google / Apple / Email)'}
                      </span>
                      {currentUser && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {currentUser
                        ? language === 'uk'
                          ? 'Увесь ваш прогрес автоматично зберігається за вашим акаунтом у хмарі.'
                          : language === 'lt'
                          ? 'Visa jūsų pažanga automatiškai saugoma debesyje.'
                          : 'All your learning progress is automatically saved to your cloud account.'
                        : language === 'uk'
                        ? 'Увійдіть, щоб не втратити вивчені слова та статистику при зміні пристрою.'
                        : language === 'lt'
                        ? 'Prisijunkite, kad neprarastumėte pažangos kituose įrenginiuose.'
                        : 'Sign in to back up and sync your learned words and stats across devices.'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSettingsOpen(false);
                    setAuthModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 text-xs font-semibold hover:opacity-90 transition-opacity shrink-0"
                >
                  {currentUser
                    ? language === 'uk'
                      ? 'Керувати акаунтом'
                      : language === 'lt'
                      ? 'Valdyti paskyrą'
                      : 'Manage Account'
                    : language === 'uk'
                    ? 'Увійти / Реєстрація'
                    : language === 'lt'
                    ? 'Prisijungti'
                    : 'Sign In / Register'}
                </button>
              </div>

              {/* Row 1: Language, Daily Goal, Theme */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                    {t.settings.languageLabel}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(
                      [
                        { code: 'uk', name: 'Українська' },
                        { code: 'lt', name: 'Lietuvių' },
                        { code: 'en', name: 'English' },
                      ] as const
                    ).map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => handleSetLanguage(l.code)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors min-h-[38px] ${
                          language === l.code
                            ? 'bg-slate-900 text-white border-slate-900 dark:bg-amber-500 dark:text-slate-950 dark:border-amber-500 font-semibold'
                            : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {l.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                    {t.settings.dailyGoalLabel}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[10, 20, 50].map((goal) => (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => handleSetDailyGoal(goal)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold border tabular-nums transition-colors min-h-[38px] ${
                          progress.dailyGoal === goal
                            ? 'bg-slate-900 text-white border-slate-900 dark:bg-amber-500 dark:text-slate-950 dark:border-amber-500'
                            : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {goal} {t.settings.exercisesPerDay}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                    {t.settings.themeLabel}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateProgress((prev) => ({ ...prev, darkMode: false }))
                      }
                      className={`px-3.5 py-2 rounded-xl text-xs font-medium border min-h-[38px] ${
                        !progress.darkMode
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {t.settings.lightTheme}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateProgress((prev) => ({ ...prev, darkMode: true }))
                      }
                      className={`px-3.5 py-2 rounded-xl text-xs font-medium border min-h-[38px] ${
                        progress.darkMode
                          ? 'bg-amber-500 text-slate-950 border-amber-500 font-semibold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {t.settings.darkTheme}
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 1.25: Sound Effects & Tactile Vibration Settings (Independent Offline Controls) */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {t.settings.feedbackSectionTitle}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Sound Effects Toggle Card */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        {progress.soundEffectsEnabled ? (
                          <Volume2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        ) : (
                          <VolumeX className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {t.settings.soundEffectsLabel}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                            {t.settings.soundEffectsDesc}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={progress.soundEffectsEnabled}
                        onClick={handleToggleSoundEffects}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors shrink-0 min-h-[34px] ${
                          progress.soundEffectsEnabled
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {progress.soundEffectsEnabled
                          ? `✓ ${t.settings.enabledStatus}`
                          : t.settings.disabledStatus}
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                      <button
                        type="button"
                        onClick={() => playAnswerSoundEffect('correct')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-[11px] font-medium hover:bg-emerald-100 transition-colors"
                      >
                        ♪ {t.settings.testCorrectSoundBtn}
                      </button>
                      <button
                        type="button"
                        onClick={() => playAnswerSoundEffect('incorrect')}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 text-[11px] font-medium hover:bg-rose-100 transition-colors"
                      >
                        ♪ {t.settings.testIncorrectSoundBtn}
                      </button>
                    </div>
                  </div>

                  {/* Tactile Vibration Toggle Card */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <Vibrate
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            progress.hapticFeedbackEnabled
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-slate-400'
                          }`}
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {t.settings.hapticFeedbackLabel}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                            {t.settings.hapticFeedbackDesc}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={progress.hapticFeedbackEnabled}
                        onClick={handleToggleHapticFeedback}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors shrink-0 min-h-[34px] ${
                          progress.hapticFeedbackEnabled
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {progress.hapticFeedbackEnabled
                          ? `✓ ${t.settings.enabledStatus}`
                          : t.settings.disabledStatus}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 1.5: Daily Practice Push Reminder (Web Notifications API) */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {progress.reminderEnabled ? (
                      <BellRing className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    ) : (
                      <Bell className="w-4 h-4 text-slate-400" />
                    )}
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {t.settings.reminderTitle}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleReminder}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors min-h-[36px] ${
                      progress.reminderEnabled
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {progress.reminderEnabled ? '✓ ' : ''}
                    {t.settings.reminderEnableLabel}
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <label
                      htmlFor="reminder-time-input"
                      className="text-xs font-medium text-slate-600 dark:text-slate-300"
                    >
                      {t.settings.reminderTimeLabel}:
                    </label>
                    <input
                      id="reminder-time-input"
                      type="time"
                      value={progress.reminderTime}
                      onChange={(e) => handleChangeReminderTime(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono font-semibold text-slate-900 dark:text-white"
                    />
                    <div className="flex items-center gap-1">
                      {['09:00', '14:00', '19:00', '21:00'].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handleChangeReminderTime(preset)}
                          className={`px-2 py-1 rounded-md text-[11px] font-mono transition-colors ${
                            progress.reminderTime === preset
                              ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-semibold'
                              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {notificationPerm === 'default' && (
                      <button
                        type="button"
                        onClick={handleRequestPermissionExplicit}
                        className="px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-xs font-semibold hover:bg-amber-200 transition-colors"
                      >
                        {t.settings.reminderPermissionRequest}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleSendTestNotification}
                      className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      {t.settings.reminderTestBtn}
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {notificationPerm === 'granted'
                    ? `✓ ${t.settings.reminderPermissionGranted}`
                    : notificationPerm === 'denied'
                    ? t.settings.reminderPermissionDenied
                    : notificationPerm === 'unsupported'
                    ? t.settings.reminderPermissionUnsupported
                    : t.settings.reminderPermissionRequest}
                </div>
              </div>

              {/* Row 2: Difficulty Level Selection (Auto + Levels 1–4) */}
              <div className="space-y-3 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {t.selectDifficultyTitle}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectDifficulty('auto')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      progress.selectedDifficulty === 'auto'
                        ? 'bg-slate-900 text-white border-slate-900 dark:bg-amber-500 dark:text-slate-950 dark:border-amber-500'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {t.autoDifficultyLabel} (→ L{effectiveDifficulty})
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {([1, 2, 3, 4] as DifficultyLevel[]).map((lvl) => {
                    const isSelected = progress.selectedDifficulty === lvl;
                    const meta = DIFFICULTY_METADATA[lvl];
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => handleSelectDifficulty(lvl)}
                        className={`p-3.5 rounded-xl border text-left transition-colors ${
                          isSelected
                            ? 'border-slate-900 bg-slate-900 text-white dark:border-amber-500 dark:bg-amber-500 dark:text-slate-950'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="text-xs font-bold">
                          {meta.title[language]}
                        </div>
                        <div
                          className={`text-[11px] mt-1 leading-snug ${
                            isSelected
                              ? 'text-slate-200 dark:text-slate-900'
                              : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {meta.subtitle[language]}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 3: Training Mode Selection (All 9 Modes + Contextual Sub-Filters) */}
              <div className="space-y-4">
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {t.selectModeTitle}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {(Object.keys(TRAINING_MODES_METADATA) as TrainingMode[]).map(
                    (mKey, idx) => {
                      const active = trainingMode === mKey;
                      const m = TRAINING_MODES_METADATA[mKey];
                      return (
                        <button
                          key={mKey}
                          type="button"
                          onClick={() => setTrainingMode(mKey)}
                          className={`p-3.5 rounded-xl border text-left transition-colors ${
                            active
                              ? 'border-slate-900 bg-slate-900 text-white dark:border-amber-500 dark:bg-amber-500 dark:text-slate-950'
                              : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="text-xs font-bold flex items-center justify-between">
                            <span>
                              0{idx + 1}. {m.title[language]}
                            </span>
                            {mKey === 'mistakes' &&
                              progress.recentMistakes.length > 0 && (
                                <span className="font-mono text-[11px] opacity-80">
                                  ({progress.recentMistakes.length})
                                </span>
                              )}
                          </div>
                          <div
                            className={`text-[11px] mt-1 leading-snug ${
                              active
                                ? 'text-slate-200 dark:text-slate-900'
                                : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {m.description[language]}
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>

                {/* Sub-filter inside Settings when a specific mode is chosen */}
                {trainingMode === 'by_case' && (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {t.filterByCase}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {CASE_ORDER.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setSelectedCase(c)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[36px] ${
                            selectedCase === c
                              ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-semibold'
                              : 'bg-white text-slate-700 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {CASES_METADATA[c].nameLt} (
                          {CASES_METADATA[c].questionLt})
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {trainingMode === 'by_declension' && (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {t.filterByDeclension}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {([1, 2, 3, 4, 5] as DeclensionType[]).map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setSelectedDeclension(d)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[36px] ${
                            selectedDeclension === d
                              ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-semibold'
                              : 'bg-white text-slate-700 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {d} linksniuotė (
                          {DECLENSION_PDF_TABLE[d - 1].examplesLt[0]})
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {trainingMode === 'by_number' && (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {t.filterByNumber}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(['sg', 'pl', 'both'] as const).map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setSelectedNumber(num)}
                          className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[36px] ${
                            selectedNumber === num
                              ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-semibold'
                              : 'bg-white text-slate-700 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {num === 'sg'
                            ? t.singularLabel
                            : num === 'pl'
                            ? t.pluralLabel
                            : t.bothNumbersLabel}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {trainingMode === 'by_topic' && (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {t.filterByTopic}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(Object.keys(TOPICS_METADATA) as TopicId[]).map(
                        (top) => (
                          <button
                            key={top}
                            type="button"
                            onClick={() => setSelectedTopic(top)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[34px] ${
                              selectedTopic === top
                                ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-semibold'
                                : 'bg-white text-slate-700 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {TOPICS_METADATA[top].label[language]}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setSettingsOpen(false);
                  setActiveTab('practice');
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-semibold text-xs hover:opacity-90 transition-opacity flex items-center gap-2 min-h-[40px]"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{t.ctaStartPractice}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Router */}
      <main className={isMobilePracticeSingleCard ? 'md:flex-1' : 'flex-1'}>
        {activeTab === 'home' && (
          <HomeDashboard
            language={language}
            progress={progress}
            effectiveDifficulty={effectiveDifficulty}
            trainingMode={trainingMode}
            todayCompleted={todayCompleted}
            masteredCount={masteredCount}
            overallAccuracy={overallAccuracy}
            onStartDeclension={(modeOverride) => {
              if (modeOverride) {
                setTrainingMode(modeOverride);
              }
              setPracticeCategory('declension');
              setActiveTab('practice');
            }}
            onStartCasePractice={(grammaticalCase) => {
              setSelectedCase(grammaticalCase);
              setTrainingMode('by_case');
              setPracticeCategory('declension');
              setActiveTab('practice');
            }}
            onStartDeclensionTypePractice={(declension) => {
              setSelectedDeclension(declension);
              setTrainingMode('by_declension');
              setPracticeCategory('declension');
              setActiveTab('practice');
            }}
            onStartVerbs={() => {
              setPracticeCategory('verbs');
              setActiveTab('practice');
            }}
            onStartFlashcards={() => {
              setPracticeCategory('flashcards');
              setActiveTab('practice');
            }}
            onOpenDictionary={() => setActiveTab('dictionary')}
            onOpenReference={() => setActiveTab('reference')}
            onOpenStats={() => setActiveTab('stats')}
            onOpenSettings={() => setSettingsOpen(true)}
            onToggleFavorite={handleToggleFavorite}
            onPracticeSpecificNoun={handlePracticeSpecificNoun}
            onPracticeSpecificVerb={handlePracticeSpecificVerb}
          />
        )}

        {activeTab === 'practice' && (
          <div>
            {/* Three-Type Training Mode Switcher in Тренування */}
            <div className="max-w-3xl mx-auto px-2.5 sm:px-6 pt-2 sm:pt-5">
              <div
                role="tablist"
                aria-label={
                  language === 'uk'
                    ? 'Типи тренування'
                    : language === 'lt'
                    ? 'Treniruotės tipai'
                    : 'Training Types'
                }
                className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-slate-200/75 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={practiceCategory === 'declension'}
                  onClick={() => setPracticeCategory('declension')}
                  className={`py-2.5 px-2 sm:px-3.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[42px] ${
                    practiceCategory === 'declension'
                      ? 'bg-slate-900 text-white shadow-xs dark:bg-amber-500 dark:text-slate-950'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span className="truncate">
                    {language === 'uk'
                      ? '1. Іменники (Відмінки)'
                      : language === 'lt'
                      ? '1. Daiktavardžiai'
                      : '1. Noun Declension'}
                  </span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={practiceCategory === 'verbs'}
                  onClick={() => setPracticeCategory('verbs')}
                  className={`py-2.5 px-2 sm:px-3.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[42px] ${
                    practiceCategory === 'verbs'
                      ? 'bg-slate-900 text-white shadow-xs dark:bg-amber-500 dark:text-slate-950'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span className="truncate">
                    {language === 'uk'
                      ? '2. Дієслова (Часи)'
                      : language === 'lt'
                      ? '2. Veiksmažodžiai'
                      : '2. Verb Conjugation'}
                  </span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={practiceCategory === 'flashcards'}
                  onClick={() => setPracticeCategory('flashcards')}
                  className={`py-2.5 px-2 sm:px-3.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[42px] ${
                    practiceCategory === 'flashcards'
                      ? 'bg-slate-900 text-white shadow-xs dark:bg-amber-500 dark:text-slate-950'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span className="truncate">
                    {language === 'uk'
                      ? '3. Картки'
                      : language === 'lt'
                      ? '3. Kortelės'
                      : '3. Flashcards'}
                  </span>
                </button>
              </div>
            </div>

            {practiceCategory === 'declension' ? (
              <ExerciseWorkspace
                language={language}
                progress={progress}
                mode={trainingMode}
                selectedCase={selectedCase}
                selectedDeclension={selectedDeclension}
                selectedNumber={selectedNumber}
                selectedTopic={selectedTopic}
                onOpenSettings={() => setSettingsOpen(true)}
                onRecordOutcome={handleRecordOutcome}
                onToggleFavorite={handleToggleFavorite}
                forcedNounId={forcedNounId}
                onClearForcedNoun={() => setForcedNounId(undefined)}
                onInputFocusChange={setIsMobileInputFocused}
              />
            ) : practiceCategory === 'verbs' ? (
              <VerbConjugationWorkspace
                language={language}
                progress={progress}
                onRecordVerbOutcome={handleRecordVerbOutcome}
                onToggleFavorite={handleToggleFavorite}
                forcedVerbId={forcedVerbId}
                onClearForcedVerb={() => setForcedVerbId(undefined)}
                onInputFocusChange={setIsMobileInputFocused}
              />
            ) : (
              <VocabularyFlashcards
                language={language}
                progress={progress}
                onRecordOutcome={handleRecordOutcome}
                onRecordVerbOutcome={handleRecordVerbOutcome}
                onToggleFavorite={handleToggleFavorite}
                onSwitchToDeclensionForNoun={(wordId) => {
                  if (wordId.startsWith('vb_')) {
                    setForcedVerbId(wordId);
                    setPracticeCategory('verbs');
                    return;
                  }
                  setForcedNounId(wordId);
                  setPracticeCategory('declension');
                }}
                onOpenSettings={() => setSettingsOpen(true)}
                forcedNounId={forcedNounId}
                onClearForcedNoun={() => setForcedNounId(undefined)}
                onInputFocusChange={setIsMobileInputFocused}
              />
            )}
          </div>
        )}

        {activeTab === 'dictionary' && (
          <DictionaryCatalog
            language={language}
            progress={progress}
            onToggleFavorite={handleToggleFavorite}
            onPracticeNoun={handlePracticeSpecificNoun}
            onPracticeVerb={handlePracticeSpecificVerb}
          />
        )}

        {activeTab === 'reference' && (
          <GrammarReferenceView language={language} />
        )}

        {activeTab === 'stats' && (
          <StatisticsAndTestsView
            language={language}
            progress={progress}
            onImportProgress={(imp) => {
              setProgress(imp);
              saveUserProgress(imp);
              if (currentUser) {
                void pushProgressToCloud(imp, currentUser);
              }
            }}
            onResetProgress={() => {
              const fresh = createInitialProgress();
              fresh.language = progress.language;
              fresh.darkMode = progress.darkMode;
              setProgress(fresh);
              saveUserProgress(fresh);
              if (currentUser) {
                void pushProgressToCloud(fresh, currentUser);
              }
            }}
            onPracticeNoun={handlePracticeSpecificNoun}
          />
        )}

        {activeTab === 'android' && (
          <AndroidProjectExportView language={language} />
        )}
      </main>

      {/* Account Authentication & Cloud Sync Modal */}
      <AccountAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        language={language}
        currentUser={currentUser}
        progress={progress}
        syncStatus={syncStatus}
        lastSyncedAt={lastSyncedAt}
        tokenServiceEnableUrl={tokenServiceEnableUrl}
        onForceSync={async () => {
          await pushProgressToCloud(progressRef.current, currentUser, true);
        }}
      />

      {/* Floating In-App Push Notification Toast Banner (mirrors OS Web Notification) */}
      {activeReminderToast && (
        <div
          role="alert"
          className="fixed bottom-20 md:bottom-6 right-4 left-4 sm:left-auto sm:w-96 z-50 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white border border-slate-700 shadow-2xl p-4 flex flex-col gap-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Bell className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-white">
                  {activeReminderToast.title}
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {activeReminderToast.body}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveReminderToast(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveReminderToast(null);
                setSettingsOpen(false);
                setActiveTab('practice');
              }}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-semibold text-xs hover:bg-amber-400 transition-colors flex items-center gap-1.5 min-h-[32px]"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{t.ctaStartPractice}</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (docks directly under the exercise card in practice mode so there is zero empty gap above the keyboard) */}
      <nav
        className={`md:hidden z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 grid grid-cols-5 items-center ${
          isMobilePracticeSingleCard
            ? 'sticky bottom-0 left-0 right-0 mt-1.5 h-12 shrink-0'
            : 'fixed bottom-0 left-0 right-0 h-14'
        }`}
      >
        <button
          type="button"
          onClick={() => {
            setSettingsOpen(false);
            setActiveTab('home');
          }}
          className={`flex flex-col items-center justify-center min-h-[42px] ${
            activeTab === 'home' && !settingsOpen
              ? 'text-slate-900 dark:text-amber-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Home className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-[10px] mt-0.5 truncate max-w-[64px]">
            {t.nav.home}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSettingsOpen(false);
            setActiveTab('practice');
          }}
          className={`flex flex-col items-center justify-center min-h-[42px] ${
            activeTab === 'practice' && !settingsOpen
              ? 'text-slate-900 dark:text-amber-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-[10px] mt-0.5 truncate max-w-[64px]">
            {t.nav.practice}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSettingsOpen(false);
            setActiveTab('dictionary');
          }}
          className={`flex flex-col items-center justify-center min-h-[42px] ${
            activeTab === 'dictionary' && !settingsOpen
              ? 'text-slate-900 dark:text-amber-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-[10px] mt-0.5 truncate max-w-[64px]">
            {t.nav.dictionary}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSettingsOpen(false);
            setActiveTab('reference');
          }}
          className={`flex flex-col items-center justify-center min-h-[42px] ${
            activeTab === 'reference' && !settingsOpen
              ? 'text-slate-900 dark:text-amber-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Table2 className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-[10px] mt-0.5 truncate max-w-[64px]">
            {t.nav.reference}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSettingsOpen((v) => !v)}
          className={`flex flex-col items-center justify-center min-h-[42px] ${
            settingsOpen
              ? 'text-slate-900 dark:text-amber-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-[10px] mt-0.5 truncate max-w-[64px]">
            {t.nav.settings}
          </span>
        </button>
      </nav>
    </div>
  );
}
