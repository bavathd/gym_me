import type { Rank, Stats } from './store';

export const STAT_KEYS = ['STR', 'VIT', 'AGI', 'SEN', 'INT'] as const;

export const RANK_GATES: Array<{ rank: Rank; min: number }> = [
  { rank: 'S', min: 200 },
  { rank: 'A', min: 100 },
  { rank: 'B', min: 50 },
  { rank: 'C', min: 25 },
  { rank: 'D', min: 10 },
  { rank: 'E', min: 0 },
];

export const RUN_TARGET_MINUTES = 60;
export const NO_GAP_MS = 2 * 60 * 60 * 1000; // 2h

export const statSum = (s: Stats): number =>
  s.STR + s.VIT + s.AGI + s.SEN + s.INT;

export const computeLevel = (s: Stats): number =>
  Math.max(1, Math.floor(statSum(s) / 10));

export const computeRank = (level: number): Rank => {
  for (const gate of RANK_GATES) {
    if (level >= gate.min) return gate.rank;
  }
  return 'E';
};

export const expForLevel = (level: number): number => 50 + level * 25;

export type GainInput = {
  pushups: number;
  situps: number;
  squats: number;
  runKm: number;
  runDurationMs: number | null;
  singleSession: boolean;
  newStreak: number;
  previousStreak: number;
};

export type Gain = {
  gained: Partial<Stats>;
  expGained: number;
  runUnderTarget: boolean;
  streakMilestone: boolean;
};

export const computeGains = (i: GainInput): Gain => {
  const gained: Partial<Stats> = {};
  if (i.pushups >= 100 && i.squats >= 100) gained.STR = 1;
  if (i.situps >= 100 && i.runKm >= 10) gained.VIT = 1;

  const runUnderTarget =
    i.runKm >= 10 &&
    i.runDurationMs != null &&
    i.runDurationMs <= RUN_TARGET_MINUTES * 60 * 1000;
  if (runUnderTarget) gained.AGI = 1;

  if (i.singleSession) gained.SEN = 1;

  const crossed =
    i.newStreak > 0 &&
    Math.floor(i.newStreak / 7) > Math.floor(i.previousStreak / 7);
  if (crossed) gained.INT = 1;

  const statCount = Object.values(gained).reduce(
    (acc, v) => acc + (v ?? 0),
    0,
  );
  const expGained = 25 + statCount * 15 + (runUnderTarget ? 10 : 0);

  return {
    gained,
    expGained,
    runUnderTarget,
    streakMilestone: crossed,
  };
};

export const checkRankUp = (prevLevel: number, newLevel: number) => {
  const prevRank = computeRank(prevLevel);
  const newRank = computeRank(newLevel);
  return {
    leveledUp: newLevel > prevLevel,
    rankChanged: prevRank !== newRank,
    prevRank,
    newRank,
  };
};
