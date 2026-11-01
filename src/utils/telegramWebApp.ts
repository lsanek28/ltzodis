// Lightweight integration with Telegram Mini Apps (Telegram WebApp SDK)
// Safe in standard browsers: only activates when opened inside Telegram WebView.

interface TelegramHapticFeedback {
  impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
  notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
  selectionChanged: () => void;
}

interface TelegramWebAppInstance {
  initData?: string;
  colorScheme?: 'light' | 'dark';
  platform?: string;
  isExpanded?: boolean;
  ready: () => void;
  expand: () => void;
  HapticFeedback?: TelegramHapticFeedback;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebAppInstance;
    };
  }
}

export function initTelegramMiniApp(): {
  isTelegram: boolean;
  colorScheme?: 'light' | 'dark';
} {
  if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
    return { isTelegram: false };
  }
  const tg = window.Telegram.WebApp;
  try {
    tg.ready();
    tg.expand();
  } catch {
    // Ignore errors in non-Telegram environments
  }
  const isTelegram = Boolean(tg.initData && tg.initData.length > 0);
  return {
    isTelegram,
    colorScheme: tg.colorScheme,
  };
}

export function triggerTelegramHaptic(type: 'success' | 'error' | 'tap'): void {
  if (typeof window === 'undefined' || !window.Telegram?.WebApp?.HapticFeedback) {
    return;
  }
  try {
    const haptic = window.Telegram.WebApp.HapticFeedback;
    if (type === 'tap') {
      haptic.impactOccurred('light');
    } else {
      haptic.notificationOccurred(type);
    }
  } catch {
    // Ignore
  }
}
