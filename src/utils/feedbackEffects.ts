// Offline Sound Effects & Tactile Haptic Feedback Engine
// 100% offline: uses Web Audio API soft acoustic synthesis + navigator.vibrate + Telegram WebApp HapticFeedback.

import { triggerTelegramHaptic } from './telegramWebApp';

let sharedAudioContext: AudioContext | null = null;
let lastFeedbackTimestamp = 0;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioContext) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (AudioCtx) {
      sharedAudioContext = new AudioCtx();
    }
  }
  if (sharedAudioContext && sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume().catch(() => {
      // Ignore autoplay restrictions before user gesture
    });
  }
  return sharedAudioContext;
}

/**
 * Plays a short, pleasant, non-intrusive synthesized chime completely offline.
 * - 'correct': Soft ascending major third chime (C5 -> E5, ~210ms, gentle volume)
 * - 'incorrect': Soft muted low-register two-tone interval (A3 -> F3, ~190ms, gentle volume)
 */
export function playAnswerSoundEffect(type: 'correct' | 'incorrect'): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (type === 'correct') {
      // Note 1: C5 (523.25 Hz)
      scheduleSoftTone(ctx, 523.25, now, 0.095, 0.11, 'sine');
      // Note 2: E5 (659.25 Hz) slightly overlapping for a warm pleasant chime
      scheduleSoftTone(ctx, 659.25, now + 0.065, 0.145, 0.12, 'sine');
    } else {
      // Note 1: A3 (220.00 Hz)
      scheduleSoftTone(ctx, 220.0, now, 0.085, 0.095, 'triangle');
      // Note 2: F3 (174.61 Hz) soft descending cue
      scheduleSoftTone(ctx, 174.61, now + 0.07, 0.125, 0.09, 'sine');
    }
  } catch {
    // Fail silently if audio hardware is unavailable
  }
}

function scheduleSoftTone(
  ctx: AudioContext,
  frequencyHz: number,
  startTime: number,
  durationSec: number,
  peakGain: number,
  waveform: OscillatorType
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = waveform;
  osc.frequency.setValueAtTime(frequencyHz, startTime);

  // Smooth attack and exponential decay so there are zero clicks or harshness
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSec);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + durationSec + 0.01);
}

/**
 * Triggers tactile vibration feedback on Android / mobile browsers and Telegram Mini App.
 */
export function triggerTactileFeedback(type: 'correct' | 'incorrect'): void {
  // 1. Preserve Telegram Mini App HapticFeedback
  triggerTelegramHaptic(type === 'correct' ? 'success' : 'error');

  // 2. Native Android / Web Vibration API (works offline)
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      if (type === 'correct') {
        navigator.vibrate(18);
      } else {
        navigator.vibrate([26, 45, 34]);
      }
    } catch {
      // Ignore if blocked by device policy
    }
  }
}

/**
 * Unified feedback dispatcher for exercise answers.
 * Respects independent soundEffectsEnabled and hapticFeedbackEnabled settings,
 * and debounces rapid multi-form checks (such as checking all 7 forms in Full Paradigm mode).
 */
export function triggerAnswerFeedback(
  isCorrect: boolean,
  soundEffectsEnabled: boolean,
  hapticFeedbackEnabled: boolean
): void {
  const nowMs = Date.now();
  if (nowMs - lastFeedbackTimestamp < 80) {
    return;
  }
  lastFeedbackTimestamp = nowMs;

  const effectType = isCorrect ? 'correct' : 'incorrect';

  if (soundEffectsEnabled) {
    playAnswerSoundEffect(effectType);
  }
  if (hapticFeedbackEnabled) {
    triggerTactileFeedback(effectType);
  }
}
