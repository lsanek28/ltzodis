import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  Timestamp,
  getDocFromServer,
  setLogLevel,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import {
  AppLanguage,
  DeclensionType,
  GrammaticalCase,
  TopicId,
  UserProgress,
  WordLearningState,
} from './types/grammar';
import {
  createInitialProgress,
  evaluateUnlockedBadges,
} from './utils/progressStorage';
import { CASE_ORDER, TOPICS_METADATA } from './data/grammarRules';

// Silence noisy internal @firebase/firestore WebChannel / token refresh retries in console
try {
  setLogLevel('silent');
} catch {
  // Ignore if setLogLevel is unavailable in environment
}

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  };
}

export interface TokenVerificationStatus {
  ok: boolean;
  isTokenServiceDisabled: boolean;
  enableApiUrl: string | null;
}

const DEFAULT_TOKEN_SERVICE_URL = `https://console.developers.google.com/apis/api/securetoken.googleapis.com/overview?project=${
  firebaseConfig.messagingSenderId || '17079920329'
}`;

let cachedTokenServiceDisabledForUid: string | null = null;
let cachedTokenServiceEnableUrl: string | null = null;

export function isOfflineOrTokenError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: string }).code)
      : '';
  const lower = `${code} ${msg}`.toLowerCase();
  return (
    lower.includes('the client is offline') ||
    lower.includes('unavailable') ||
    lower.includes('token-service-api') ||
    lower.includes('securetoken.googleapis.com') ||
    lower.includes('fetching auth token failed') ||
    lower.includes('network-request-failed')
  );
}

export function isPermissionDeniedError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: string }).code)
      : '';
  const lower = `${code} ${msg}`.toLowerCase();
  return (
    lower.includes('permission-denied') ||
    lower.includes('missing or insufficient permissions')
  );
}

export async function verifyUserTokenForFirestore(
  user: User | null,
  forceRetry = false
): Promise<TokenVerificationStatus> {
  if (!user) {
    return {
      ok: true,
      isTokenServiceDisabled: false,
      enableApiUrl: null,
    };
  }

  if (!forceRetry && cachedTokenServiceDisabledForUid === user.uid) {
    return {
      ok: false,
      isTokenServiceDisabled: true,
      enableApiUrl: cachedTokenServiceEnableUrl || DEFAULT_TOKEN_SERVICE_URL,
    };
  }

  try {
    await user.getIdToken();
    if (cachedTokenServiceDisabledForUid === user.uid) {
      cachedTokenServiceDisabledForUid = null;
      cachedTokenServiceEnableUrl = null;
    }
    return {
      ok: true,
      isTokenServiceDisabled: false,
      enableApiUrl: null,
    };
  } catch (error) {
    const rawMsg = error instanceof Error ? error.message : String(error);
    const lower = rawMsg.toLowerCase();
    const isTokenApiDisabled =
      lower.includes('token-service-api-has-not-been-used') ||
      lower.includes('securetoken.googleapis.com');

    if (isTokenApiDisabled) {
      const urlMatch = rawMsg.match(
        /https:\/\/console\.developers\.google\.com\/apis\/api\/securetoken\.googleapis\.com\/overview\?project=[0-9a-zA-Z_-]+/
      );
      const enableUrl = urlMatch ? urlMatch[0] : DEFAULT_TOKEN_SERVICE_URL;
      cachedTokenServiceDisabledForUid = user.uid;
      cachedTokenServiceEnableUrl = enableUrl;
      return {
        ok: false,
        isTokenServiceDisabled: true,
        enableApiUrl: enableUrl,
      };
    }

    return {
      ok: false,
      isTokenServiceDisabled: false,
      enableApiUrl: null,
    };
  }
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): FirestoreErrorInfo {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData.map((provider) => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL,
        })) || [],
    },
    operationType,
    path,
  };

  if (isPermissionDeniedError(error)) {
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  }

  return errInfo;
}

// Validate connection to Firestore on startup once auth state is ready
async function testConnection() {
  try {
    if (typeof auth.authStateReady === 'function') {
      await auth.authStateReady();
    }
    if (auth.currentUser) {
      const tokenCheck = await verifyUserTokenForFirestore(auth.currentUser);
      if (!tokenCheck.ok) {
        // Skip server probe when cached auth token cannot be refreshed (e.g., Token Service API disabled)
        return;
      }
    }
    await getDocFromServer(doc(db, 'users', '__connection_probe__'));
  } catch (error) {
    if (!firebaseConfig.projectId || !firebaseConfig.apiKey) {
      console.error('Please check your Firebase configuration.');
    } else if (isPermissionDeniedError(error)) {
      // Expected if security rules reject anonymous probe; connection itself is healthy
    }
  }
}
void testConnection();

// ============================================================================
// Authentication Actions (Google, Apple, Email/Password)
// ============================================================================

export async function signInWithGoogleAccount(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function signInWithAppleAccount(): Promise<User> {
  const provider = new OAuthProvider('apple.com');
  provider.addScope('email');
  provider.addScope('name');
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function registerWithEmailPassword(
  email: string,
  password: string,
  displayName?: string
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email.trim(),
    password
  );
  if (displayName && displayName.trim().length > 0) {
    await updateProfile(credential.user, {
      displayName: displayName.trim().slice(0, 120),
    });
  }
  return credential.user;
}

export async function signInWithEmailPassword(
  email: string,
  password: string
): Promise<User> {
  const credential = await signInWithEmailAndPassword(
    auth,
    email.trim(),
    password
  );
  return credential.user;
}

export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

export async function signOutAccount(): Promise<void> {
  await signOut(auth);
}

export { onAuthStateChanged };
export type { User };

export function formatAuthError(
  error: unknown,
  lang: AppLanguage,
  attemptedProvider?: 'google' | 'apple' | 'email'
): { message: string; isProviderDisabledError: boolean } {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: string }).code)
      : '';
  const rawMessage = error instanceof Error ? error.message : String(error);

  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return {
      isProviderDisabledError: false,
      message:
        lang === 'uk'
          ? 'Вікно входу було закрито до завершення авторизації.'
          : lang === 'lt'
          ? 'Prisijungimo langas buvo uždarytas.'
          : 'Sign-in popup was closed before completing authentication.',
    };
  }

  if (code === 'auth/operation-not-allowed') {
    const providerLabel =
      attemptedProvider === 'apple'
        ? 'Apple'
        : attemptedProvider === 'email'
        ? 'Email/Password'
        : 'цього провайдера';
    return {
      isProviderDisabledError: true,
      message:
        lang === 'uk'
          ? `Вхід через ${providerLabel} ще не увімкнено у консолі Firebase (Authentication → Sign-in method). Ви можете увійти через Google зараз або активувати ${providerLabel} у Firebase Console.`
          : lang === 'lt'
          ? `Prisijungimas per ${providerLabel} dar neįjungtas „Firebase Console“ (Authentication → Sign-in method). Šiuo metu galite prisijungti per „Google“ arba įjungti ${providerLabel}.`
          : `Sign-in with ${providerLabel} is not yet enabled in the Firebase Console (Authentication → Sign-in method). You can sign in with Google right away or enable ${providerLabel} in Firebase Console.`,
    };
  }

  if (
    code === 'auth/invalid-credential' ||
    code === 'auth/wrong-password' ||
    code === 'auth/user-not-found'
  ) {
    return {
      isProviderDisabledError: false,
      message:
        lang === 'uk'
          ? 'Невірна електронна пошта або пароль. Перевірте введені дані.'
          : lang === 'lt'
          ? 'Neteisingas el. paštas arba slaptažodis.'
          : 'Invalid email or password. Please check your credentials.',
    };
  }

  if (code === 'auth/email-already-in-use') {
    return {
      isProviderDisabledError: false,
      message:
        lang === 'uk'
          ? 'Ця електронна пошта вже зареєстрована. Перейдіть на вкладку «Вхід».'
          : lang === 'lt'
          ? 'Šis el. paštas jau užregistruotas. Pereikite į prisijungimo kortelę.'
          : 'This email is already registered. Please switch to the Sign In tab.',
    };
  }

  if (code === 'auth/weak-password') {
    return {
      isProviderDisabledError: false,
      message:
        lang === 'uk'
          ? 'Пароль занадто простий (мінімум 6 символів).'
          : lang === 'lt'
          ? 'Slaptažodis per silpnas (bent 6 simboliai).'
          : 'Password is too weak (minimum 6 characters required).',
    };
  }

  if (code === 'auth/invalid-email') {
    return {
      isProviderDisabledError: false,
      message:
        lang === 'uk'
          ? 'Введіть коректну адресу електронної пошти.'
          : lang === 'lt'
          ? 'Įveskite teisingą el. pašto adresą.'
          : 'Please enter a valid email address.',
    };
  }

  if (code === 'auth/popup-blocked') {
    return {
      isProviderDisabledError: false,
      message:
        lang === 'uk'
          ? 'Браузер заблокував спливаюче вікно входу. Дозвольте спливаючі вікна для цього сайту.'
          : lang === 'lt'
          ? 'Naršyklė užblokavo prisijungimo langą. Leiskite iškylančiuosius langus.'
          : 'Browser blocked the sign-in popup window. Please allow popups for this site.',
    };
  }

  if (
    rawMessage.toLowerCase().includes('token-service-api-has-not-been-used') ||
    rawMessage.toLowerCase().includes('securetoken.googleapis.com')
  ) {
    return {
      isProviderDisabledError: false,
      message:
        lang === 'uk'
          ? 'У проєкті Google Cloud ще не активовано Token Service API (securetoken.googleapis.com). Прогрес надійно зберігається локально у браузері.'
          : lang === 'lt'
          ? '„Google Cloud“ projekte dar neįjungta „Token Service API“ (securetoken.googleapis.com). Pažanga saugoma lokaliai.'
          : 'Token Service API (securetoken.googleapis.com) is not yet enabled in the Google Cloud project. Progress is safely stored locally.',
    };
  }

  return {
    isProviderDisabledError: false,
    message: rawMessage || 'Authentication error',
  };
}

// ============================================================================
// Progress Merging & Cloud Persistence (/users/{userId})
// ============================================================================

export function mergeUserProgress(
  local: UserProgress,
  cloud: UserProgress
): UserProgress {
  const base = createInitialProgress();

  // Merge wordStats
  const allWordIds = new Set([
    ...Object.keys(local.wordStats ?? {}),
    ...Object.keys(cloud.wordStats ?? {}),
  ]);
  const mergedWordStats: Record<string, WordLearningState> = {};

  for (const wordId of allWordIds) {
    const lw = local.wordStats?.[wordId];
    const cw = cloud.wordStats?.[wordId];
    if (lw && !cw) {
      mergedWordStats[wordId] = lw;
    } else if (!lw && cw) {
      mergedWordStats[wordId] = cw;
    } else if (lw && cw) {
      const sessions = Array.from(
        new Set([...(lw.sessionsPracticed ?? []), ...(cw.sessionsPracticed ?? [])])
      ).sort();
      const correctCount = Math.max(lw.correctCount ?? 0, cw.correctCount ?? 0);
      const incorrectCount = Math.max(
        lw.incorrectCount ?? 0,
        cw.incorrectCount ?? 0
      );
      const consecutiveCorrect = Math.max(
        lw.consecutiveCorrect ?? 0,
        cw.consecutiveCorrect ?? 0
      );
      const lastPracticedAt =
        (lw.lastPracticedAt ?? '') > (cw.lastPracticedAt ?? '')
          ? lw.lastPracticedAt
          : cw.lastPracticedAt;
      const mastered =
        Boolean(lw.mastered) ||
        Boolean(cw.mastered) ||
        (correctCount >= 4 && sessions.length >= 2 && consecutiveCorrect >= 2) ||
        consecutiveCorrect >= 5;

      mergedWordStats[wordId] = {
        wordId,
        correctCount,
        incorrectCount,
        consecutiveCorrect,
        sessionsPracticed: sessions,
        lastPracticedAt,
        mastered,
      };
    }
  }

  // Merge caseStats
  const mergedCaseStats = { ...base.caseStats };
  for (const c of CASE_ORDER) {
    const lc = local.caseStats?.[c] ?? { correct: 0, total: 0 };
    const cc = cloud.caseStats?.[c] ?? { correct: 0, total: 0 };
    mergedCaseStats[c] = {
      correct: Math.max(lc.correct, cc.correct),
      total: Math.max(lc.total, cc.total),
    };
  }

  // Merge declensionStats
  const mergedDeclStats = { ...base.declensionStats };
  for (const d of [1, 2, 3, 4, 5] as DeclensionType[]) {
    const ld = local.declensionStats?.[d] ?? { correct: 0, total: 0 };
    const cd = cloud.declensionStats?.[d] ?? { correct: 0, total: 0 };
    mergedDeclStats[d] = {
      correct: Math.max(ld.correct, cd.correct),
      total: Math.max(ld.total, cd.total),
    };
  }

  // Merge topicStats
  const mergedTopicStats = { ...base.topicStats };
  for (const t of Object.keys(TOPICS_METADATA) as TopicId[]) {
    const lt = local.topicStats?.[t] ?? { correct: 0, total: 0 };
    const ct = cloud.topicStats?.[t] ?? { correct: 0, total: 0 };
    mergedTopicStats[t] = {
      correct: Math.max(lt.correct, ct.correct),
      total: Math.max(lt.total, ct.total),
    };
  }

  // Merge dailyActivity
  const allDates = new Set([
    ...Object.keys(local.dailyActivity ?? {}),
    ...Object.keys(cloud.dailyActivity ?? {}),
  ]);
  const mergedDailyActivity: Record<string, { completed: number; correct: number }> = {};
  for (const dateKey of allDates) {
    const ld = local.dailyActivity?.[dateKey] ?? { completed: 0, correct: 0 };
    const cd = cloud.dailyActivity?.[dateKey] ?? { completed: 0, total: 0, correct: 0 };
    mergedDailyActivity[dateKey] = {
      completed: Math.max(ld.completed, cd.completed),
      correct: Math.max(ld.correct, cd.correct),
    };
  }

  // Merge recentMistakes (deduplicated by id, newest first)
  const mistakesMap = new Map<string, UserProgress['recentMistakes'][number]>();
  for (const m of [...(local.recentMistakes ?? []), ...(cloud.recentMistakes ?? [])]) {
    if (m && m.id) {
      mistakesMap.set(m.id, m);
    }
  }
  const mergedMistakes = Array.from(mistakesMap.values())
    .sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''))
    .slice(0, 60);

  // Merge favorites & badges
  const mergedFavorites = Array.from(
    new Set([...(local.favorites ?? []), ...(cloud.favorites ?? [])])
  );

  const totalExercisesCompleted = Math.max(
    local.totalExercisesCompleted ?? 0,
    cloud.totalExercisesCompleted ?? 0
  );
  const totalCorrectAnswers = Math.max(
    local.totalCorrectAnswers ?? 0,
    cloud.totalCorrectAnswers ?? 0
  );
  const bestStreak = Math.max(local.bestStreak ?? 0, cloud.bestStreak ?? 0);
  const currentStreak =
    (local.totalExercisesCompleted ?? 0) >= (cloud.totalExercisesCompleted ?? 0)
      ? local.currentStreak ?? 0
      : cloud.currentStreak ?? 0;

  // Prefer settings from whichever profile has more activity, keeping current UI language
  const primary =
    (cloud.totalExercisesCompleted ?? 0) > (local.totalExercisesCompleted ?? 0)
      ? cloud
      : local;

  const merged: UserProgress = {
    ...base,
    ...primary,
    language: local.language ?? cloud.language ?? 'uk',
    darkMode: local.darkMode ?? cloud.darkMode ?? false,
    totalExercisesCompleted,
    totalCorrectAnswers,
    currentStreak,
    bestStreak,
    favorites: mergedFavorites,
    wordStats: mergedWordStats,
    caseStats: mergedCaseStats,
    declensionStats: mergedDeclStats,
    topicStats: mergedTopicStats,
    dailyActivity: mergedDailyActivity,
    recentMistakes: mergedMistakes,
    unlockedBadges: Array.from(
      new Set([...(local.unlockedBadges ?? []), ...(cloud.unlockedBadges ?? [])])
    ),
  };

  merged.unlockedBadges = evaluateUnlockedBadges(merged);
  return merged;
}

export interface CloudProgressResult {
  progress: UserProgress;
  updatedAtIso: string;
  syncedWithCloud: boolean;
  isTokenServiceDisabled: boolean;
  enableApiUrl: string | null;
}

export interface SaveProgressResult {
  updatedAtIso: string;
  syncedWithCloud: boolean;
  isTokenServiceDisabled: boolean;
  enableApiUrl: string | null;
}

export async function syncUserProgressWithCloud(
  user: User,
  localProgress: UserProgress,
  forceRetry = false
): Promise<CloudProgressResult> {
  const tokenCheck = await verifyUserTokenForFirestore(user, forceRetry);
  if (!tokenCheck.ok) {
    return {
      progress: localProgress,
      updatedAtIso: new Date().toISOString(),
      syncedWithCloud: false,
      isTokenServiceDisabled: tokenCheck.isTokenServiceDisabled,
      enableApiUrl: tokenCheck.enableApiUrl,
    };
  }

  const userDocRef = doc(db, 'users', user.uid);
  const path = `users/${user.uid}`;

  let existingSnap;
  try {
    existingSnap = await getDoc(userDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return {
      progress: localProgress,
      updatedAtIso: new Date().toISOString(),
      syncedWithCloud: false,
      isTokenServiceDisabled: false,
      enableApiUrl: null,
    };
  }

  const nowTs = Timestamp.now();
  const primaryProvider = user.providerData[0]?.providerId || 'password';

  if (existingSnap.exists()) {
    const data = existingSnap.data();
    let cloudProgress = createInitialProgress();
    if (typeof data.progressJson === 'string') {
      try {
        const parsed = JSON.parse(data.progressJson) as Partial<UserProgress>;
        cloudProgress = {
          ...cloudProgress,
          ...parsed,
        };
      } catch {
        // Fallback if malformed JSON
      }
    }

    const merged = mergeUserProgress(localProgress, cloudProgress);
    const masteredWordsCount = Object.values(merged.wordStats).filter(
      (w) => w.mastered
    ).length;

    const createdAtTs =
      data.createdAt instanceof Timestamp ? data.createdAt : nowTs;

    const payload: Record<string, unknown> = {
      uid: user.uid,
      progressJson: JSON.stringify(merged),
      totalExercisesCompleted: Math.max(
        0,
        Math.floor(merged.totalExercisesCompleted)
      ),
      totalCorrectAnswers: Math.max(0, Math.floor(merged.totalCorrectAnswers)),
      currentStreak: Math.max(0, Math.floor(merged.currentStreak)),
      bestStreak: Math.max(0, Math.floor(merged.bestStreak)),
      masteredWordsCount: Math.max(0, Math.floor(masteredWordsCount)),
      createdAt: createdAtTs,
      updatedAt: nowTs,
      providerId: primaryProvider.slice(0, 100),
    };
    if (user.email) payload.email = user.email.slice(0, 320);
    if (user.displayName) payload.displayName = user.displayName.slice(0, 200);
    if (user.photoURL) payload.photoURL = user.photoURL.slice(0, 2048);

    try {
      await setDoc(userDocRef, payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      return {
        progress: merged,
        updatedAtIso: nowTs.toDate().toISOString(),
        syncedWithCloud: false,
        isTokenServiceDisabled: false,
        enableApiUrl: null,
      };
    }

    return {
      progress: merged,
      updatedAtIso: nowTs.toDate().toISOString(),
      syncedWithCloud: true,
      isTokenServiceDisabled: false,
      enableApiUrl: null,
    };
  } else {
    // First-time cloud document creation for this user
    const masteredWordsCount = Object.values(localProgress.wordStats).filter(
      (w) => w.mastered
    ).length;

    const payload: Record<string, unknown> = {
      uid: user.uid,
      progressJson: JSON.stringify(localProgress),
      totalExercisesCompleted: Math.max(
        0,
        Math.floor(localProgress.totalExercisesCompleted)
      ),
      totalCorrectAnswers: Math.max(
        0,
        Math.floor(localProgress.totalCorrectAnswers)
      ),
      currentStreak: Math.max(0, Math.floor(localProgress.currentStreak)),
      bestStreak: Math.max(0, Math.floor(localProgress.bestStreak)),
      masteredWordsCount: Math.max(0, Math.floor(masteredWordsCount)),
      createdAt: nowTs,
      updatedAt: nowTs,
      providerId: primaryProvider.slice(0, 100),
    };
    if (user.email) payload.email = user.email.slice(0, 320);
    if (user.displayName) payload.displayName = user.displayName.slice(0, 200);
    if (user.photoURL) payload.photoURL = user.photoURL.slice(0, 2048);

    try {
      await setDoc(userDocRef, payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      return {
        progress: localProgress,
        updatedAtIso: nowTs.toDate().toISOString(),
        syncedWithCloud: false,
        isTokenServiceDisabled: false,
        enableApiUrl: null,
      };
    }

    return {
      progress: localProgress,
      updatedAtIso: nowTs.toDate().toISOString(),
      syncedWithCloud: true,
      isTokenServiceDisabled: false,
      enableApiUrl: null,
    };
  }
}

export async function saveProgressToFirestore(
  user: User,
  progress: UserProgress,
  forceRetry = false
): Promise<SaveProgressResult> {
  const tokenCheck = await verifyUserTokenForFirestore(user, forceRetry);
  if (!tokenCheck.ok) {
    return {
      updatedAtIso: new Date().toISOString(),
      syncedWithCloud: false,
      isTokenServiceDisabled: tokenCheck.isTokenServiceDisabled,
      enableApiUrl: tokenCheck.enableApiUrl,
    };
  }

  const userDocRef = doc(db, 'users', user.uid);
  const path = `users/${user.uid}`;

  let createdAtTs = Timestamp.now();
  try {
    const snap = await getDoc(userDocRef);
    if (snap.exists() && snap.data().createdAt instanceof Timestamp) {
      createdAtTs = snap.data().createdAt;
    }
  } catch {
    // Use now if not readable yet
  }

  const nowTs = Timestamp.now();
  const masteredWordsCount = Object.values(progress.wordStats).filter(
    (w) => w.mastered
  ).length;
  const primaryProvider = user.providerData[0]?.providerId || 'password';

  const payload: Record<string, unknown> = {
    uid: user.uid,
    progressJson: JSON.stringify(progress),
    totalExercisesCompleted: Math.max(
      0,
      Math.floor(progress.totalExercisesCompleted)
    ),
    totalCorrectAnswers: Math.max(0, Math.floor(progress.totalCorrectAnswers)),
    currentStreak: Math.max(0, Math.floor(progress.currentStreak)),
    bestStreak: Math.max(0, Math.floor(progress.bestStreak)),
    masteredWordsCount: Math.max(0, Math.floor(masteredWordsCount)),
    createdAt: createdAtTs,
    updatedAt: nowTs,
    providerId: primaryProvider.slice(0, 100),
  };
  if (user.email) payload.email = user.email.slice(0, 320);
  if (user.displayName) payload.displayName = user.displayName.slice(0, 200);
  if (user.photoURL) payload.photoURL = user.photoURL.slice(0, 2048);

  try {
    await setDoc(userDocRef, payload);
    return {
      updatedAtIso: nowTs.toDate().toISOString(),
      syncedWithCloud: true,
      isTokenServiceDisabled: false,
      enableApiUrl: null,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return {
      updatedAtIso: nowTs.toDate().toISOString(),
      syncedWithCloud: false,
      isTokenServiceDisabled: false,
      enableApiUrl: null,
    };
  }
}

export function subscribeToCloudProgress(
  user: User,
  onRemoteUpdate: (cloudProgress: UserProgress, updatedAtIso: string) => void
): () => void {
  let activeUnsubscribe: (() => void) | null = null;
  let cancelled = false;

  void verifyUserTokenForFirestore(user).then((tokenCheck) => {
    if (cancelled || !tokenCheck.ok) {
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const path = `users/${user.uid}`;

    activeUnsubscribe = onSnapshot(
      userDocRef,
      (snap) => {
        if (!snap.exists()) return;
        if (snap.metadata.hasPendingWrites) return;
        const data = snap.data();
        if (typeof data.progressJson === 'string') {
          try {
            const parsed = JSON.parse(data.progressJson) as UserProgress;
            const updatedAtIso =
              data.updatedAt instanceof Timestamp
                ? data.updatedAt.toDate().toISOString()
                : new Date().toISOString();
            onRemoteUpdate(parsed, updatedAtIso);
          } catch {
            // Ignore malformed JSON
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  });

  return () => {
    cancelled = true;
    if (activeUnsubscribe) {
      activeUnsubscribe();
      activeUnsubscribe = null;
    }
  };
}

