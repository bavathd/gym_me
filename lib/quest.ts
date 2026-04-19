import type { QuestProgress } from './store';
import { NO_GAP_MS } from './stats';

export const DAILY_TARGETS = {
  pushups: 100,
  situps: 100,
  squats: 100,
  run: 10, // km
} as const;

export type QuestTargets = {
  pushups: number;
  situps: number;
  squats: number;
  run: number;
};

export const PENALTY_MULTIPLIERS: Record<number, number> = {
  0: 1,
  1: 1.5, // penalty quest = daily + 50%
  2: 2, // compound 1 failure
  3: 2, // triggers demotion, same volume
};

export const targetsFor = (compoundLevel: number): QuestTargets => {
  const m = PENALTY_MULTIPLIERS[compoundLevel] ?? 1;
  return {
    pushups: Math.round(DAILY_TARGETS.pushups * m),
    situps: Math.round(DAILY_TARGETS.situps * m),
    squats: Math.round(DAILY_TARGETS.squats * m),
    run: +(DAILY_TARGETS.run * m).toFixed(1),
  };
};

export const questIsComplete = (
  q: QuestProgress,
  targets: QuestTargets,
): boolean =>
  q.pushups >= targets.pushups &&
  q.situps >= targets.situps &&
  q.squats >= targets.squats &&
  q.run >= targets.run;

export const percentComplete = (
  q: QuestProgress,
  targets: QuestTargets,
): number => {
  const parts = [
    Math.min(1, q.pushups / targets.pushups),
    Math.min(1, q.situps / targets.situps),
    Math.min(1, q.squats / targets.squats),
    Math.min(1, q.run / targets.run),
  ];
  return parts.reduce((a, b) => a + b, 0) / parts.length;
};

export const isSingleSession = (q: QuestProgress): boolean => {
  if (q.sessionStart == null || q.lastRepAt == null) return false;
  // Loose heuristic: session start to lastRepAt fits inside one window,
  // AND there was no gap > NO_GAP_MS — the store tracks lastRepAt on every
  // mutation, so if the delta between start and last is contiguous we accept.
  // (A stricter implementation could log each rep timestamp; for MVP we use
  // the delta to last rep as a proxy for "completed within one sitting".)
  return q.lastRepAt - q.sessionStart <= NO_GAP_MS * 6;
};

export const runDuration = (q: QuestProgress): number | null => {
  if (q.runStartedAt == null || q.runCompletedAt == null) return null;
  return q.runCompletedAt - q.runStartedAt;
};

export const nextMidnight = (from: Date = new Date()): Date => {
  const d = new Date(from);
  d.setHours(24, 0, 0, 0);
  return d;
};

export const warningTimeToday = (from: Date = new Date()): Date => {
  const d = new Date(from);
  d.setHours(23, 0, 0, 0);
  if (d.getTime() <= from.getTime()) d.setDate(d.getDate() + 1);
  return d;
};

export const isBefore2359 = (now: Date = new Date()): boolean =>
  now.getHours() < 23 || (now.getHours() === 23 && now.getMinutes() < 59);
