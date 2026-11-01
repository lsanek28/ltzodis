import { AppLanguage } from '../types/grammar';
import { triggerTelegramHaptic } from './telegramWebApp';

export type NotificationPermissionStatus =
  | 'granted'
  | 'denied'
  | 'default'
  | 'unsupported';

export function getNotificationPermissionStatus(): NotificationPermissionStatus {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return window.Notification.permission;
}

export async function requestWebNotificationPermission(): Promise<NotificationPermissionStatus> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const result = await window.Notification.requestPermission();
    return result;
  } catch {
    return window.Notification.permission;
  }
}

export function getCurrentTimeHHMM(): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export interface ReminderPayload {
  title: string;
  body: string;
}

export function buildReminderMessage(
  language: AppLanguage,
  todayCompleted: number,
  dailyGoal: number
): ReminderPayload {
  const remaining = Math.max(0, dailyGoal - todayCompleted);

  if (language === 'lt') {
    return {
      title: 'Lietuvių žodžių galūnės — laikas treniruotei!',
      body:
        remaining > 0
          ? `Šiandien atlikote ${todayCompleted} iš ${dailyGoal} pratimų. Liko dar ${remaining} pratimų iki dienos tikslo!`
          : `Puiku! Šiandien jau įvykdėte dienos tikslą (${todayCompleted}/${dailyGoal}). Galite pakartoti sunkesnius žodžius!`,
    };
  }

  if (language === 'en') {
    return {
      title: 'Lietuvių žodžių galūnės — Time to practice!',
      body:
        remaining > 0
          ? `You have completed ${todayCompleted} of ${dailyGoal} exercises today. Just ${remaining} more to reach your daily goal!`
          : `Great job! You already reached your daily goal (${todayCompleted}/${dailyGoal}). Ready for a quick review?`,
    };
  }

  return {
    title: 'Lietuvių žodžių galūnės — час тренування!',
    body:
      remaining > 0
        ? `Сьогодні виконано ${todayCompleted} із ${dailyGoal} вправ. Залишилося ще ${remaining} до щоденної цілі!`
        : `Чудово! Ви вже виконали щоденну ціль (${todayCompleted}/${dailyGoal}). Час закріпити складні слова!`,
  };
}

/**
 * Dispatches a native browser Push/Web Notification if permission is granted,
 * and returns the payload so the app can also display an in-app toast banner.
 */
export function dispatchPracticeNotification(
  language: AppLanguage,
  todayCompleted: number,
  dailyGoal: number,
  onClickCallback?: () => void
): { sentViaWebApi: boolean; payload: ReminderPayload } {
  const payload = buildReminderMessage(language, todayCompleted, dailyGoal);
  triggerTelegramHaptic('tap');

  if (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    window.Notification.permission === 'granted'
  ) {
    try {
      const notification = new window.Notification(payload.title, {
        body: payload.body,
        tag: 'lietuviu-galunes-daily-reminder',
      });
      notification.onclick = () => {
        window.focus();
        if (onClickCallback) onClickCallback();
        notification.close();
      };
      return { sentViaWebApi: true, payload };
    } catch {
      return { sentViaWebApi: false, payload };
    }
  }

  return { sentViaWebApi: false, payload };
}
