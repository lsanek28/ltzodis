import React, { useMemo, useRef, useState } from 'react';
import {
  Award,
  Calendar,
  CheckCircle2,
  Compass,
  Crown,
  Download,
  Flame,
  Lock,
  Play,
  RotateCcw,
  ShieldCheck,
  Sun,
  Target,
  Trophy,
  Upload,
  XCircle,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ALL_VERIFIED_NOUNS } from '../data/nounsDatabase';
import { ALL_VERIFIED_VERBS } from '../data/verbsDatabase';
import {
  CASES_METADATA,
  CASE_ORDER,
  DECLENSION_PDF_TABLE,
} from '../data/grammarRules';
import { UI_TEXT } from '../i18n/translations';
import {
  AppLanguage,
  BadgeId,
  DeclensionType,
  UserProgress,
} from '../types/grammar';
import { runAllGrammarAndEvaluationTests } from '../utils/grammarTests';
import { BADGES_CATALOG } from '../utils/progressStorage';

const BADGE_ICONS: Record<BadgeId, React.ComponentType<{ className?: string }>> = {
  first_steps: Award,
  early_bird: Sun,
  streak_10: Flame,
  consistency_king: Crown,
  daily_champion: Target,
  declension_explorer: Compass,
  case_conqueror: ShieldCheck,
  lexicon_master: Trophy,
};

interface StatisticsAndTestsViewProps {
  language: AppLanguage;
  progress: UserProgress;
  onImportProgress: (imported: UserProgress) => void;
  onResetProgress: () => void;
  onPracticeNoun: (wordId: string) => void;
}

export const StatisticsAndTestsView: React.FC<StatisticsAndTestsViewProps> = ({
  language,
  progress,
  onImportProgress,
  onResetProgress,
  onPracticeNoun,
}) => {
  const t = UI_TEXT[language];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [testRunNonce, setTestRunNonce] = useState(0);

  const testSuite = useMemo(
    () => runAllGrammarAndEvaluationTests(),
    [testRunNonce]
  );

  const masteredCount = useMemo(
    () => Object.values(progress.wordStats).filter((w) => w.mastered).length,
    [progress.wordStats]
  );

  const totalVocabularySize =
    ALL_VERIFIED_NOUNS.length + ALL_VERIFIED_VERBS.length;
  const unlearnedCount = Math.max(0, totalVocabularySize - masteredCount);
  const overallAccuracy =
    progress.totalExercisesCompleted > 0
      ? Math.round(
          (progress.totalCorrectAnswers / progress.totalExercisesCompleted) * 100
        )
      : 0;

  const hardestWords = useMemo(() => {
    return Object.values(progress.wordStats)
      .filter((w) => w.incorrectCount > 0)
      .sort((a, b) => b.incorrectCount - a.incorrectCount)
      .slice(0, 8)
      .map((stat) => {
        const noun = ALL_VERIFIED_NOUNS.find((n) => n.id === stat.wordId);
        const verb = ALL_VERIFIED_VERBS.find((v) => v.id === stat.wordId);
        return {
          stat,
          lemma: noun?.lemma ?? verb?.infinitive ?? '',
          uk: noun?.uk ?? verb?.uk ?? '',
          en: noun?.en ?? verb?.en ?? '',
          isVerb: Boolean(verb),
        };
      })
      .filter((item) => Boolean(item.lemma));
  }, [progress.wordStats]);

  const weeklyData = useMemo(() => {
    const data = [];
    const now = new Date();

    const dayShorts: Record<AppLanguage, string[]> = {
      uk: ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
      lt: ['Sk', 'Pr', 'An', 'Tr', 'Kt', 'Pn', 'Št'],
      en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    };

    const fullDays: Record<AppLanguage, string[]> = {
      uk: [
        'Неділя',
        'Понеділок',
        'Вівторок',
        'Середа',
        'Четвер',
        'Пʼятниця',
        'Субота',
      ],
      lt: [
        'Sekmadienis',
        'Pirmadienis',
        'Antradienis',
        'Trečiadienis',
        'Ketvirtadienis',
        'Penktadienis',
        'Šeštadienis',
      ],
      en: [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ],
    };

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayOfWeek = d.getDay();
      const shortDay = dayShorts[language][dayOfWeek];
      const fullDay = fullDays[language][dayOfWeek];
      const shortDate = `${d.getDate()}.${String(d.getMonth() + 1).padStart(
        2,
        '0'
      )}`;
      const isToday = i === 0;

      const activity = progress.dailyActivity[dateStr] || {
        completed: 0,
        correct: 0,
      };
      const completed = activity.completed;
      const correct = activity.correct;
      const incorrect = Math.max(0, completed - correct);
      const accuracy =
        completed > 0 ? Math.round((correct / completed) * 100) : 0;
      const goal = progress.dailyGoal;
      const goalReached = completed >= goal;

      data.push({
        dateStr,
        shortDay,
        fullDay,
        shortDate,
        label: isToday
          ? language === 'uk'
            ? 'Сьогодні'
            : language === 'lt'
            ? 'Šiandien'
            : 'Today'
          : shortDay,
        fullDateLabel: `${fullDay}, ${shortDate}`,
        completed,
        correct,
        incorrect,
        accuracy,
        goal,
        goalReached,
        isToday,
      });
    }

    return data;
  }, [progress.dailyActivity, progress.dailyGoal, language]);

  const weeklySummary = useMemo(() => {
    const totalCompleted = weeklyData.reduce(
      (sum, d) => sum + d.completed,
      0
    );
    const totalCorrect = weeklyData.reduce((sum, d) => sum + d.correct, 0);
    const activeDays = weeklyData.filter((d) => d.completed > 0).length;
    const goalsMet = weeklyData.filter((d) => d.goalReached).length;
    const avgPerDay = Math.round(totalCompleted / 7);
    const accuracy =
      totalCompleted > 0
        ? Math.round((totalCorrect / totalCompleted) * 100)
        : 0;

    return {
      totalCompleted,
      totalCorrect,
      activeDays,
      goalsMet,
      avgPerDay,
      accuracy,
    };
  }, [weeklyData]);

  const handleExportProgress = () => {
    const blob = new Blob([JSON.stringify(progress, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lietuviu_galunes_backup_${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as UserProgress;
        if (parsed && typeof parsed.totalExercisesCompleted === 'number') {
          onImportProgress(parsed);
        }
      } catch {
        // Ignore invalid JSON
      }
    };
    reader.readAsText(file);
  };

  const CustomWeeklyTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: (typeof weeklyData)[number] }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[170px]">
          <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-1">
            <span>{data.fullDateLabel}</span>
            {data.isToday && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold">
                {language === 'uk'
                  ? 'Сьогодні'
                  : language === 'lt'
                  ? 'Šiandien'
                  : 'Today'}
              </span>
            )}
          </div>
          <div className="text-slate-600 dark:text-slate-300 flex items-center justify-between gap-3">
            <span>{t.stats.totalExercises}:</span>
            <span className="font-bold font-mono text-slate-900 dark:text-white">
              {data.completed}
            </span>
          </div>
          <div className="text-emerald-600 dark:text-emerald-400 flex items-center justify-between gap-3">
            <span>{t.stats.weeklyCorrectLabel}:</span>
            <span className="font-bold font-mono">
              {data.correct} ({data.accuracy}%)
            </span>
          </div>
          {data.incorrect > 0 && (
            <div className="text-rose-600 dark:text-rose-400 flex items-center justify-between gap-3">
              <span>{t.stats.weeklyIncorrectLabel}:</span>
              <span className="font-bold font-mono">{data.incorrect}</span>
            </div>
          )}
          <div className="pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px] flex items-center justify-between">
            <span className="text-slate-500">
              {t.stats.weeklyGoalLine}: {data.goal}
            </span>
            <span
              className={
                data.goalReached
                  ? 'text-emerald-600 font-semibold'
                  : 'text-slate-400'
              }
            >
              {data.goalReached ? '✓ Met' : `${data.completed}/${data.goal}`}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header & Backup Controls */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {t.stats.title}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            {t.stats.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportProgress}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-1.5 min-h-[40px]"
          >
            <Download className="w-4 h-4" />
            <span>{t.stats.exportProgressBtn}</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleImportFile}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-1.5 min-h-[40px]"
          >
            <Upload className="w-4 h-4" />
            <span>{t.stats.importProgressBtn}</span>
          </button>

          <button
            type="button"
            onClick={onResetProgress}
            className="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-800 text-xs font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center gap-1.5 min-h-[40px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.stats.resetProgressBtn}</span>
          </button>
        </div>
      </div>

      {/* Top 6 KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {t.stats.learnedWords}
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
            {masteredCount}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {t.stats.unlearnedWords}
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
            {unlearnedCount}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {t.stats.totalExercises}
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
            {progress.totalExercisesCompleted}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {t.stats.overallAccuracy}
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400 mt-1">
            {overallAccuracy}%
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {t.stats.currentStreak}
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
            {progress.currentStreak}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {t.stats.bestStreak}
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
            {progress.bestStreak}
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        * {t.stats.masteryRuleNote}
      </p>

      {/* Weekly Activity Bar Chart with Recharts */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 sm:space-y-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {t.stats.weeklyActivityTitle}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              {t.stats.weeklyActivitySubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400">
                {t.stats.weeklyTotalLabel}:
              </span>
              <span className="font-bold font-mono text-slate-900 dark:text-white text-sm">
                {weeklySummary.totalCompleted}
              </span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400">
                {t.stats.weeklyActiveDays}:
              </span>
              <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                {weeklySummary.activeDays} / 7
              </span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400">
                {t.stats.weeklyAvgLabel}:
              </span>
              <span className="font-bold font-mono text-amber-600 dark:text-amber-400 text-sm">
                {weeklySummary.avgPerDay}
              </span>
            </div>
          </div>
        </div>

        {/* Recharts Bar Chart */}
        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weeklyData}
              margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
                className="dark:opacity-20"
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomWeeklyTooltip />} />
              <ReferenceLine
                y={progress.dailyGoal}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{
                  value: `${t.stats.weeklyGoalLine}: ${progress.dailyGoal}`,
                  position: 'top',
                  fill: '#d97706',
                  fontSize: 10.5,
                  fontWeight: 600,
                }}
              />
              <Bar
                dataKey="correct"
                name={t.stats.weeklyCorrectLabel}
                stackId="daily"
                fill="#10b981"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="incorrect"
                name={t.stats.weeklyIncorrectLabel}
                stackId="daily"
                fill="#f43f5e"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend & Consistency Summary */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-4 text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500 shrink-0" />
              <span>{t.stats.weeklyCorrectLabel}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-500 shrink-0" />
              <span>{t.stats.weeklyIncorrectLabel}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 border-b-2 border-dashed border-amber-500 shrink-0" />
              <span>
                {t.stats.weeklyGoalLine} ({progress.dailyGoal})
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            🎯 {weeklySummary.goalsMet}{' '}
            {language === 'uk'
              ? 'з 7 днів із виконаною щоденною ціллю'
              : language === 'lt'
              ? 'iš 7 d. pasiektas dienos tikslas'
              : 'of 7 days daily goal reached'}
          </div>
        </div>
      </div>

      {/* Achievement Badges Grid (Streaks, Early Bird, Consistency King & Learning Milestones) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {t.stats.badgesTitle}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.stats.badgesSubtitle}
            </p>
          </div>
          <div className="text-xs font-mono font-bold tabular-nums text-amber-700 dark:text-amber-400">
            {(progress.unlockedBadges ?? []).length} / {BADGES_CATALOG.length}{' '}
            {t.stats.badgeUnlockedLabel}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {BADGES_CATALOG.map((badge) => {
            const isUnlocked = (progress.unlockedBadges ?? []).includes(
              badge.id
            );
            const IconComponent = BADGE_ICONS[badge.id];
            const progressText = badge.getProgressText(progress);

            return (
              <div
                key={badge.id}
                className={`p-4 rounded-xl border transition-colors flex flex-col justify-between gap-3 ${
                  isUnlocked
                    ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700/70'
                    : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 opacity-75'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isUnlocked
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <span
                      className={`text-[11px] font-semibold flex items-center gap-1 ${
                        isUnlocked
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {isUnlocked ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>{t.stats.badgeUnlockedLabel}</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3 shrink-0" />
                          <span>{t.stats.badgeLockedLabel}</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {badge.title[language]}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {badge.description[language]}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                  <span>Progress</span>
                  <span
                    className={
                      isUnlocked
                        ? 'font-bold text-amber-800 dark:text-amber-300'
                        : 'font-semibold text-slate-700 dark:text-slate-300'
                    }
                  >
                    {progressText}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Breakdown by Case (Left) and by Declension Type (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {t.stats.byCaseTitle}
          </h2>
          <div className="space-y-3">
            {CASE_ORDER.map((c) => {
              const stat = progress.caseStats[c] ?? { correct: 0, total: 0 };
              const pct =
                stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
              return (
                <div key={c} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {CASES_METADATA[c].name[language]} ({CASES_METADATA[c].questionLt})
                    </span>
                    <span className="font-mono tabular-nums text-slate-600 dark:text-slate-400">
                      {stat.correct} / {stat.total} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-slate-900 dark:bg-amber-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {t.stats.byDeclensionTitle}
          </h2>
          <div className="space-y-3">
            {([1, 2, 3, 4, 5] as DeclensionType[]).map((d) => {
              const stat = progress.declensionStats[d] ?? { correct: 0, total: 0 };
              const pct =
                stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
              const col = DECLENSION_PDF_TABLE[d - 1];
              return (
                <div key={d} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {col.title[language]} · {col.examplesLt.slice(0, 2).join(', ')}
                    </span>
                    <span className="font-mono tabular-nums text-slate-600 dark:text-slate-400">
                      {stat.correct} / {stat.total} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 dark:bg-emerald-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hardest Words & Recent Mistake Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {t.stats.hardestWordsTitle}
          </h2>
          {hardestWords.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.stats.noMistakesYet}
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {hardestWords.map(({ stat, lemma, uk, en }) => (
                <div
                  key={stat.wordId}
                  className="py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {lemma}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 ml-2">
                      ({language === 'en' ? en : uk})
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-rose-600 dark:text-rose-400 tabular-nums">
                      ✕ {stat.incorrectCount} · ✓ {stat.correctCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => onPracticeNoun(stat.wordId)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200"
                    >
                      <Play className="w-3 h-3 inline mr-1" />
                      Practice
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {t.stats.recentMistakesTitle}
          </h2>
          {progress.recentMistakes.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.stats.noMistakesYet}
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto">
              {progress.recentMistakes.slice(0, 12).map((m) => (
                <div
                  key={m.id}
                  className="py-2.5 flex items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {m.lemma}
                    </span>
                    <span className="text-slate-500 mx-1.5">·</span>
                    <span className="text-slate-600 dark:text-slate-400">
                      {m.targetNumber === 'sg' ? 'Vns.' : 'Dgs.'}{' '}
                      {CASES_METADATA[m.targetCase].shortLt}
                    </span>
                  </div>
                  <div className="font-mono tabular-nums">
                    <span className="text-rose-600 line-through mr-2">
                      {m.userAnswer}
                    </span>
                    <span className="text-emerald-600 font-semibold">
                      → {m.correctAnswer}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Automated Grammar & Evaluation Quality Verification Suite */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {t.stats.automatedTestsTitle}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
              Passed: {testSuite.passedCount} / {testSuite.totalCount}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setTestRunNonce((n) => n + 1)}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 text-xs font-semibold hover:opacity-90 transition-opacity min-h-[38px]"
          >
            {t.stats.runTestsBtn}
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {testSuite.results.map((res) => (
            <div
              key={res.id}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm"
            >
              <div className="flex items-start gap-2.5">
                {res.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {res.title[language]}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    {res.details}
                  </div>
                </div>
              </div>
              <span className="font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400 shrink-0">
                {res.passed ? 'PASS' : 'FAIL'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
