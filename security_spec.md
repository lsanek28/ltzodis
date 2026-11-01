# Security Specification

## 1. Authentication & Authorization Model
- **Authentication Providers**: Google Sign-In (`GoogleAuthProvider`), Apple Sign-In (`OAuthProvider('apple.com')`), and Email/Password (`EmailAuthProvider`).
- **Ownership**: Strictly private per-user data stored at `/users/{userId}`.
- **Read/Write Access**: Only an authenticated user whose `request.auth.uid == userId` can read (`get`), create, update, or delete their own document at `/users/{userId}`. Collection listing (`list`) is denied to prevent user enumeration.

## 2. Data Validation & Integrity
- **Allowed Fields**: `['uid', 'email', 'displayName', 'photoURL', 'providerId', 'progressJson', 'totalExercisesCompleted', 'totalCorrectAnswers', 'currentStreak', 'bestStreak', 'masteredWordsCount', 'createdAt', 'updatedAt']`.
- **Immutable Fields**: `uid` must equal `userId` on create and remain unchanged on update; `createdAt` must remain unchanged on update.
- **Type & Bounds Validation**:
  - `progressJson`: string, non-empty, max 800,000 characters.
  - `totalExercisesCompleted`, `totalCorrectAnswers`, `currentStreak`, `bestStreak`, `masteredWordsCount`: non-negative integers (`>= 0` and `<= 10000000`).
  - Optional profile strings (`email`, `displayName`, `photoURL`, `providerId`): strings with bounded length.
