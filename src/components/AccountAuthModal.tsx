import React, { useState } from 'react';
import {
  CheckCircle2,
  Cloud,
  CloudUpload,
  ExternalLink,
  KeyRound,
  Loader2,
  LogIn,
  LogOut,
  Mail,
  RefreshCw,
  ShieldCheck,
  User as UserIcon,
  UserPlus,
  X,
  AlertCircle,
} from 'lucide-react';
import {
  User,
  formatAuthError,
  registerWithEmailPassword,
  sendPasswordReset,
  signInWithAppleAccount,
  signInWithEmailPassword,
  signInWithGoogleAccount,
  signOutAccount,
} from '../firebase';
import { AppLanguage, UserProgress } from '../types/grammar';

interface AccountAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: AppLanguage;
  currentUser: User | null;
  progress: UserProgress;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  lastSyncedAt: string | null;
  tokenServiceEnableUrl?: string | null;
  onForceSync: () => Promise<void>;
}

const AUTH_COPY: Record<
  AppLanguage,
  {
    modalTitle: string;
    modalSubtitle: string;
    tabLogin: string;
    tabRegister: string;
    tabReset: string;
    continueWithGoogle: string;
    continueWithApple: string;
    orEmailDivider: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    loginSubmitBtn: string;
    registerSubmitBtn: string;
    resetSubmitBtn: string;
    forgotPasswordLink: string;
    backToLoginLink: string;
    resetEmailSentBanner: string;
    signedInTitle: string;
    cloudSyncActive: string;
    cloudSyncing: string;
    cloudSyncError: string;
    lastSyncedLabel: string;
    syncNowBtn: string;
    signOutBtn: string;
    syncedStatsTitle: string;
    exercisesLabel: string;
    masteredWordsLabel: string;
    streakLabel: string;
    badgesLabel: string;
    cloudBenefitNote: string;
    providerConsoleHintTitle: string;
    providerConsoleHintSteps: string;
    openFirebaseConsole: string;
  }
> = {
  uk: {
    modalTitle: 'Акаунт та хмарне збереження прогресу',
    modalSubtitle:
      'Увійдіть через Google, Apple або електронну пошту, щоб автоматично зберігати та синхронізувати весь прогрес між пристроями.',
    tabLogin: 'Вхід за поштою',
    tabRegister: 'Реєстрація',
    tabReset: 'Скидання пароля',
    continueWithGoogle: 'Продовжити через Google',
    continueWithApple: 'Продовжити через Apple',
    orEmailDivider: 'або за електронною поштою',
    nameLabel: "Ваше ім'я (необов'язково)",
    namePlaceholder: 'Олександр',
    emailLabel: 'Електронна пошта (Email)',
    emailPlaceholder: 'name@example.com',
    passwordLabel: 'Пароль (мін. 6 символів)',
    passwordPlaceholder: '••••••••',
    loginSubmitBtn: 'Увійти в акаунт',
    registerSubmitBtn: 'Створити акаунт і зберегти прогрес',
    resetSubmitBtn: 'Надіслати лист для скидання пароля',
    forgotPasswordLink: 'Забули пароль?',
    backToLoginLink: 'Повернутися до входу',
    resetEmailSentBanner:
      'Лист для відновлення пароля надіслано на вашу пошту. Перевірте вхідні повідомлення.',
    signedInTitle: 'Ви авторизовані',
    cloudSyncActive: 'Прогрес синхронізовано з хмарою',
    cloudSyncing: 'Синхронізація з хмарою...',
    cloudSyncError: 'Помилка синхронізації (збережено локально)',
    lastSyncedLabel: 'Останнє збереження:',
    syncNowBtn: 'Синхронізувати зараз',
    signOutBtn: 'Вийти з акаунта',
    syncedStatsTitle: 'Дані, що зберігаються за вашим акаунтом:',
    exercisesLabel: 'Виконано вправ',
    masteredWordsLabel: 'Вивчено слів',
    streakLabel: 'Найкраща серія',
    badgesLabel: 'Відкрито нагород',
    cloudBenefitNote:
      'Усі вивчені слова, статистика за відмінками, щоденна активність, обрані слова та налаштування автоматично прив’язуються до вашого профілю.',
    providerConsoleHintTitle: 'Як увімкнути Email/Password або Apple у Firebase Console:',
    providerConsoleHintSteps:
      'Вхід через Google працює одразу автоматично. Щоб додатково дозволити вхід за паролем або Apple ID, відкрийте Firebase Console → Authentication → Sign-in method та увімкніть провайдер «Email/Password» або «Apple».',
    openFirebaseConsole: 'Відкрити Firebase Console (Sign-in method)',
  },
  lt: {
    modalTitle: 'Paskyra ir debesies sinchronizavimas',
    modalSubtitle:
      'Prisijunkite per „Google“, „Apple“ arba el. paštą, kad visa mokymosi pažanga būtų saugoma debesyje.',
    tabLogin: 'Prisijungti',
    tabRegister: 'Registracija',
    tabReset: 'Slaptažodžio atkūrimas',
    continueWithGoogle: 'Tęsti su „Google“',
    continueWithApple: 'Tęsti su „Apple“',
    orEmailDivider: 'arba el. paštu',
    nameLabel: 'Jūsų vardas (neprivaloma)',
    namePlaceholder: 'Jonas',
    emailLabel: 'El. paštas',
    emailPlaceholder: 'name@example.com',
    passwordLabel: 'Slaptažodis (bent 6 simboliai)',
    passwordPlaceholder: '••••••••',
    loginSubmitBtn: 'Prisijungti',
    registerSubmitBtn: 'Sukurti paskyrą ir išsaugoti pažangą',
    resetSubmitBtn: 'Siųsti slaptažodžio atkūrimo laišką',
    forgotPasswordLink: 'Pamiršote slaptažodį?',
    backToLoginLink: 'Grįžti į prisijungimą',
    resetEmailSentBanner:
      'Slaptažodžio atkūrimo nuoroda išsiųsta į jūsų el. paštą.',
    signedInTitle: 'Esate prisijungę',
    cloudSyncActive: 'Pažanga sinchronizuota debesyje',
    cloudSyncing: 'Sinchronizuojama...',
    cloudSyncError: 'Sinchronizavimo klaida (išsaugota lokaliai)',
    lastSyncedLabel: 'Paskutinis išsaugojimas:',
    syncNowBtn: 'Sinchronizuoti dabar',
    signOutBtn: 'Atsijungti',
    syncedStatsTitle: 'Jūsų paskyroje saugomi duomenys:',
    exercisesLabel: 'Atlikta pratimų',
    masteredWordsLabel: 'Išmokta žodžių',
    streakLabel: 'Geriausia serija',
    badgesLabel: 'Atrakinti ženkleliai',
    cloudBenefitNote:
      'Visi išmokti žodžiai, linksnių statistika, savaitės aktyvumas ir nustatymai automatiškai saugomi jūsų paskyroje.',
    providerConsoleHintTitle: 'Kaip įjungti „Email/Password“ arba „Apple“:',
    providerConsoleHintSteps:
      'Prisijungimas per „Google“ veikia iš karto. Norėdami įjungti el. pašto arba „Apple“ prisijungimą, atidarykite „Firebase Console → Authentication → Sign-in method“.',
    openFirebaseConsole: 'Atidaryti Firebase Console',
  },
  en: {
    modalTitle: 'Account & Cloud Progress Sync',
    modalSubtitle:
      'Sign in with Google, Apple, or Email to automatically back up and sync all your learning progress across devices.',
    tabLogin: 'Sign In',
    tabRegister: 'Create Account',
    tabReset: 'Reset Password',
    continueWithGoogle: 'Continue with Google',
    continueWithApple: 'Continue with Apple',
    orEmailDivider: 'or with email & password',
    nameLabel: 'Your Name (optional)',
    namePlaceholder: 'Alex',
    emailLabel: 'Email Address',
    emailPlaceholder: 'name@example.com',
    passwordLabel: 'Password (min. 6 characters)',
    passwordPlaceholder: '••••••••',
    loginSubmitBtn: 'Sign In',
    registerSubmitBtn: 'Create Account & Save Progress',
    resetSubmitBtn: 'Send Password Reset Email',
    forgotPasswordLink: 'Forgot password?',
    backToLoginLink: 'Back to Sign In',
    resetEmailSentBanner:
      'Password reset email sent! Please check your inbox.',
    signedInTitle: 'Signed In Account',
    cloudSyncActive: 'Progress synced to cloud',
    cloudSyncing: 'Syncing with cloud...',
    cloudSyncError: 'Sync error (saved locally)',
    lastSyncedLabel: 'Last saved:',
    syncNowBtn: 'Sync Now',
    signOutBtn: 'Sign Out',
    syncedStatsTitle: 'Progress saved under your account:',
    exercisesLabel: 'Exercises Done',
    masteredWordsLabel: 'Words Mastered',
    streakLabel: 'Best Streak',
    badgesLabel: 'Badges Unlocked',
    cloudBenefitNote:
      'All mastered words, case accuracy stats, daily streaks, favorites, and settings are automatically saved to your cloud profile.',
    providerConsoleHintTitle: 'How to enable Email/Password or Apple in Firebase Console:',
    providerConsoleHintSteps:
      'Google Sign-In works immediately out of the box. To also allow Email/Password or Apple Sign-In, open Firebase Console → Authentication → Sign-in method and enable the provider.',
    openFirebaseConsole: 'Open Firebase Console (Sign-in method)',
  },
};

export const AccountAuthModal: React.FC<AccountAuthModalProps> = ({
  isOpen,
  onClose,
  language,
  currentUser,
  progress,
  syncStatus,
  lastSyncedAt,
  tokenServiceEnableUrl,
  onForceSync,
}) => {
  const [authTab, setAuthTab] = useState<'login' | 'register' | 'reset'>('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingProvider, setLoadingProvider] = useState<
    'google' | 'apple' | 'email' | 'logout' | null
  >(null);
  const [errorState, setErrorState] = useState<{
    message: string;
    isProviderDisabledError: boolean;
  } | null>(null);
  const [resetSent, setResetSent] = useState(false);

  if (!isOpen) return null;

  const copy = AUTH_COPY[language];
  const masteredCount = Object.values(progress.wordStats).filter(
    (w) => w.mastered
  ).length;

  const handleGoogleSignIn = async () => {
    setErrorState(null);
    setLoadingProvider('google');
    try {
      await signInWithGoogleAccount();
    } catch (err) {
      setErrorState(formatAuthError(err, language, 'google'));
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleAppleSignIn = async () => {
    setErrorState(null);
    setLoadingProvider('apple');
    try {
      await signInWithAppleAccount();
    } catch (err) {
      setErrorState(formatAuthError(err, language, 'apple'));
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorState(null);
    setResetSent(false);
    setLoadingProvider('email');

    try {
      if (authTab === 'login') {
        await signInWithEmailPassword(email, password);
      } else if (authTab === 'register') {
        await registerWithEmailPassword(email, password, displayName);
      } else if (authTab === 'reset') {
        await sendPasswordReset(email);
        setResetSent(true);
      }
    } catch (err) {
      setErrorState(formatAuthError(err, language, 'email'));
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleSignOut = async () => {
    setErrorState(null);
    setLoadingProvider('logout');
    try {
      await signOutAccount();
    } catch (err) {
      setErrorState(formatAuthError(err, language));
    } finally {
      setLoadingProvider(null);
    }
  };

  const providerBadge = currentUser?.providerData?.[0]?.providerId;
  const providerLabel =
    providerBadge === 'google.com'
      ? 'Google'
      : providerBadge === 'apple.com'
      ? 'Apple'
      : 'Email';

  const formattedSyncTime = lastSyncedAt
    ? new Date(lastSyncedAt).toLocaleTimeString(
        language === 'uk' ? 'uk-UA' : language === 'lt' ? 'lt-LT' : 'en-US',
        { hour: '2-digit', minute: '2-digit', second: '2-digit' }
      )
    : '—';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {copy.modalTitle}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          {currentUser ? (
            /* ================= AUTHENTICATED VIEW ================= */
            <div className="space-y-5">
              {/* User Profile Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User'}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full object-cover border border-slate-300 dark:border-slate-600 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 font-bold text-base flex items-center justify-center shrink-0">
                      {(
                        currentUser.displayName ||
                        currentUser.email ||
                        'U'
                      )
                        .slice(0, 1)
                        .toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {currentUser.displayName ||
                          currentUser.email?.split('@')[0] ||
                          copy.signedInTitle}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 shrink-0">
                        {providerLabel}
                      </span>
                    </div>
                    {currentUser.email && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {currentUser.email}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Cloud Sync Status Strip */}
              <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-300">
                    {syncStatus === 'syncing' ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-600 dark:text-amber-400" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    )}
                    <span>
                      {syncStatus === 'syncing'
                        ? copy.cloudSyncing
                        : syncStatus === 'error'
                        ? copy.cloudSyncError
                        : copy.cloudSyncActive}
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400/90">
                    {copy.lastSyncedLabel}{' '}
                    <span className="font-mono font-semibold">
                      {formattedSyncTime}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => void onForceSync()}
                  disabled={syncStatus === 'syncing'}
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/60 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CloudUpload className="w-3.5 h-3.5" />
                  <span>{copy.syncNowBtn}</span>
                </button>
              </div>

              {tokenServiceEnableUrl && (
                <div className="p-3.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 space-y-2 text-xs text-amber-900 dark:text-amber-200">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>
                      {language === 'uk'
                        ? 'Прогрес збережено локально (потрібно увімкнути Token Service API для хмари)'
                        : language === 'lt'
                        ? 'Pažanga išsaugota lokaliai (reikia įjungti Token Service API)'
                        : 'Progress saved locally (enable Token Service API for cloud sync)'}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    {language === 'uk'
                      ? 'У вашому проєкті Google Cloud (17079920329) зараз вимкнено Token Service API (securetoken.googleapis.com). Усі ваші результати автоматично зберігаються локально у браузері. Щоб увімкнути хмарну синхронізацію Firestore, активуйте API за посиланням нижче та натисніть «Синхронізувати зараз»:'
                      : language === 'lt'
                      ? 'Jūsų „Google Cloud“ projekte (17079920329) išjungta „Token Service API“ (securetoken.googleapis.com). Visa pažanga saugoma lokaliai. Norėdami įjungti debesies sinchronizavimą, įjunkite API žemiau:'
                      : 'Token Service API (securetoken.googleapis.com) is currently disabled in your Google Cloud project (17079920329). All progress is automatically saved locally. Enable the API below and click Sync Now to activate cloud sync:'}
                  </p>
                  <a
                    href={tokenServiceEnableUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold underline text-amber-800 dark:text-amber-300"
                  >
                    <span>
                      {language === 'uk'
                        ? 'Увімкнути Token Service API у Google Cloud Console'
                        : language === 'lt'
                        ? 'Įjungti Token Service API „Google Cloud Console“'
                        : 'Enable Token Service API in Google Cloud Console'}
                    </span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* Account Progress KPI Summary */}
              <div className="space-y-2.5">
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {copy.syncedStatsTitle}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {copy.exercisesLabel}
                    </div>
                    <div className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-0.5">
                      {progress.totalExercisesCompleted}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {copy.masteredWordsLabel}
                    </div>
                    <div className="text-lg font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {masteredCount}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {copy.streakLabel}
                    </div>
                    <div className="text-lg font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400 mt-0.5">
                      {progress.bestStreak}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {copy.badgesLabel}
                    </div>
                    <div className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-0.5">
                      {progress.unlockedBadges?.length ?? 0} / 8
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>{copy.cloudBenefitNote}</span>
              </div>

              {/* Sign Out Button */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={loadingProvider === 'logout'}
                  className="px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/70 bg-rose-50/70 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950/70 text-xs font-semibold transition-colors flex items-center gap-2"
                >
                  {loadingProvider === 'logout' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}
                  <span>{copy.signOutBtn}</span>
                </button>
              </div>
            </div>
          ) : (
            /* ================= GUEST / SIGN-IN VIEW ================= */
            <div className="space-y-5">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {copy.modalSubtitle}
              </p>

              {/* Social OAuth Buttons: Google & Apple */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loadingProvider !== null}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2.5 min-h-[46px] shadow-2xs disabled:opacity-60"
                >
                  {loadingProvider === 'google' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  )}
                  <span>{copy.continueWithGoogle}</span>
                </button>

                <button
                  type="button"
                  onClick={handleAppleSignIn}
                  disabled={loadingProvider !== null}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2.5 min-h-[46px] shadow-2xs disabled:opacity-60"
                >
                  {loadingProvider === 'apple' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <svg
                      className="w-4 h-4 shrink-0 fill-current"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                    </svg>
                  )}
                  <span>{copy.continueWithApple}</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
                <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 whitespace-nowrap">
                  {copy.orEmailDivider}
                </span>
                <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
              </div>

              {/* Mode Switcher: Sign In vs Register */}
              {authTab !== 'reset' && (
                <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab('login');
                      setErrorState(null);
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                      authTab === 'login'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>{copy.tabLogin}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab('register');
                      setErrorState(null);
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                      authTab === 'register'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{copy.tabRegister}</span>
                  </button>
                </div>
              )}

              {/* Email / Password Form */}
              <form onSubmit={handleEmailSubmit} className="space-y-3.5">
                {authTab === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {copy.nameLabel}
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder={copy.namePlaceholder}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {copy.emailLabel}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={copy.emailPlaceholder}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {authTab !== 'reset' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {copy.passwordLabel}
                      </label>
                      {authTab === 'login' && (
                        <button
                          type="button"
                          onClick={() => {
                            setAuthTab('reset');
                            setErrorState(null);
                            setResetSent(false);
                          }}
                          className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:underline"
                        >
                          {copy.forgotPasswordLink}
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={copy.passwordPlaceholder}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                )}

                {resetSent && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                    ✓ {copy.resetEmailSentBanner}
                  </div>
                )}

                {errorState && (
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/70 space-y-2">
                    <div className="flex items-start gap-2 text-xs text-rose-800 dark:text-rose-300 font-medium leading-relaxed">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                      <span>{errorState.message}</span>
                    </div>

                    {errorState.isProviderDisabledError && (
                      <div className="pt-2 border-t border-rose-200/70 dark:border-rose-800/60 text-[11px] text-rose-900 dark:text-rose-200 space-y-1.5">
                        <div className="font-bold">
                          {copy.providerConsoleHintTitle}
                        </div>
                        <p className="leading-relaxed opacity-90">
                          {copy.providerConsoleHintSteps}
                        </p>
                        <a
                          href="https://console.firebase.google.com/project/enhanced-tenure-k5v9p/authentication/providers"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-semibold underline text-rose-700 dark:text-amber-300"
                        >
                          <span>{copy.openFirebaseConsole}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loadingProvider !== null}
                  className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 min-h-[44px] disabled:opacity-60"
                >
                  {loadingProvider === 'email' && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  <span>
                    {authTab === 'login'
                      ? copy.loginSubmitBtn
                      : authTab === 'register'
                      ? copy.registerSubmitBtn
                      : copy.resetSubmitBtn}
                  </span>
                </button>

                {authTab === 'reset' && (
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthTab('login');
                        setErrorState(null);
                      }}
                      className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:underline"
                    >
                      ← {copy.backToLoginLink}
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
