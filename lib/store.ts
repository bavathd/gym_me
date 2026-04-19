import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

// --- Types -----------------------------------------------------------------

export type ExerciseId = 'pushups' | 'situps' | 'squats' | 'run';

export type Stats = {
  STR: number;
  VIT: number;
  AGI: number;
  SEN: number;
  INT: number;
};

export type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

export type QuestProgress = {
  pushups: number;
  situps: number;
  squats: number;
  run: number; // kilometres (float)
  sessionStart: number | null; // epoch ms of first rep today
  lastRepAt: number | null; // epoch ms of most recent rep
  runStartedAt: number | null; // epoch ms when run began
  runCompletedAt: number | null; // epoch ms when run finished
  dateKey: string; // YYYY-MM-DD local
};

export type PenaltyState = {
  active: boolean;
  compoundLevel: number; // 0 = none, 1 = +50%, 2 = +100%, 3 = demotion
  expDeducted: number;
};

export type HistoryEntry = {
  dateKey: string;
  completedAt: number;
  exercises: {
    pushups: number;
    situps: number;
    squats: number;
    run: number;
  };
  runDurationMs: number | null;
  singleSession: boolean;
  penalty: boolean;
  compoundLevel: number;
};

export type AppState = {
  onboarded: boolean;
  stats: Stats;
  level: number;
  rank: Rank;
  exp: number;
  streak: number;
  restTokens: number;
  lastCompletedDateKey: string | null;
  quest: QuestProgress;
  penalty: PenaltyState;
  history: HistoryEntry[];
  pendingReassessment: Rank | null;
  // actions
  setOnboarded: (v: boolean) => void;
  resetDailyQuest: (dateKey: string) => void;
  addReps: (exercise: ExerciseId, amount: number, now?: number) => void;
  startRun: (now?: number) => void;
  finishRun: (distanceKm: number, now?: number) => void;
  applyCompletion: (result: CompletionResult) => void;
  activatePenalty: (compoundLevel: number, expDeducted: number) => void;
  clearPenalty: () => void;
  useRestToken: (dateKey: string) => boolean;
  grantExp: (amount: number) => void;
  setRank: (rank: Rank) => void;
  setLevel: (level: number) => void;
  queueReassessment: (rank: Rank) => void;
  clearReassessment: () => void;
  hardReset: () => void;
};

export type CompletionResult = {
  gained: Partial<Stats>;
  expGained: number;
  singleSession: boolean;
  streakMilestone: boolean;
  runUnderTarget: boolean;
};

// --- Persistence -----------------------------------------------------------

const mmkv = new MMKV({ id: 'sl-gym' });

const mmkvStorage: StateStorage = {
  getItem: (name) => mmkv.getString(name) ?? null,
  setItem: (name, value) => mmkv.set(name, value),
  removeItem: (name) => mmkv.delete(name),
};

// --- Defaults --------------------------------------------------------------

export const DEFAULT_STATS: Stats = { STR: 0, VIT: 0, AGI: 0, SEN: 0, INT: 0 };

export const todayKey = (d: Date = new Date()): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const emptyQuest = (dateKey: string): QuestProgress => ({
  pushups: 0,
  situps: 0,
  squats: 0,
  run: 0,
  sessionStart: null,
  lastRepAt: null,
  runStartedAt: null,
  runCompletedAt: null,
  dateKey,
});

const initial: Omit<
  AppState,
  | 'setOnboarded'
  | 'resetDailyQuest'
  | 'addReps'
  | 'startRun'
  | 'finishRun'
  | 'applyCompletion'
  | 'activatePenalty'
  | 'clearPenalty'
  | 'useRestToken'
  | 'grantExp'
  | 'setRank'
  | 'setLevel'
  | 'queueReassessment'
  | 'clearReassessment'
  | 'hardReset'
> = {
  onboarded: false,
  stats: { ...DEFAULT_STATS },
  level: 1,
  rank: 'E',
  exp: 0,
  streak: 0,
  restTokens: 0,
  lastCompletedDateKey: null,
  quest: emptyQuest(todayKey()),
  penalty: { active: false, compoundLevel: 0, expDeducted: 0 },
  history: [],
  pendingReassessment: null,
};

// --- Store -----------------------------------------------------------------

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initial,

      setOnboarded: (v) => set({ onboarded: v }),

      resetDailyQuest: (dateKey) =>
        set((s) => {
          if (s.quest.dateKey === dateKey) return s;
          return { quest: emptyQuest(dateKey) };
        }),

      addReps: (exercise, amount, now = Date.now()) =>
        set((s) => {
          const q = { ...s.quest };
          if (q.sessionStart == null) q.sessionStart = now;
          q.lastRepAt = now;
          if (exercise === 'run') {
            // run is tracked in km; use finishRun for that.
            return s;
          }
          q[exercise] = Math.max(0, q[exercise] + amount);
          return { quest: q };
        }),

      startRun: (now = Date.now()) =>
        set((s) => ({
          quest: {
            ...s.quest,
            sessionStart: s.quest.sessionStart ?? now,
            runStartedAt: now,
            lastRepAt: now,
          },
        })),

      finishRun: (distanceKm, now = Date.now()) =>
        set((s) => ({
          quest: {
            ...s.quest,
            run: Math.max(s.quest.run, distanceKm),
            runCompletedAt: now,
            lastRepAt: now,
            sessionStart: s.quest.sessionStart ?? now,
          },
        })),

      applyCompletion: (result) =>
        set((s) => {
          const nextStats: Stats = { ...s.stats };
          (Object.keys(result.gained) as (keyof Stats)[]).forEach((k) => {
            nextStats[k] += result.gained[k] ?? 0;
          });
          return {
            stats: nextStats,
            exp: s.exp + result.expGained,
          };
        }),

      activatePenalty: (compoundLevel, expDeducted) =>
        set({
          penalty: { active: true, compoundLevel, expDeducted },
        }),

      clearPenalty: () =>
        set({ penalty: { active: false, compoundLevel: 0, expDeducted: 0 } }),

      useRestToken: (dateKey) => {
        const s = get();
        if (s.restTokens <= 0) return false;
        set({
          restTokens: s.restTokens - 1,
          quest: emptyQuest(dateKey),
          lastCompletedDateKey: dateKey,
        });
        return true;
      },

      grantExp: (amount) => set((s) => ({ exp: Math.max(0, s.exp + amount) })),
      setRank: (rank) => set({ rank }),
      setLevel: (level) => set({ level }),
      queueReassessment: (rank) => set({ pendingReassessment: rank }),
      clearReassessment: () => set({ pendingReassessment: null }),

      hardReset: () => set({ ...initial, onboarded: true }),
    }),
    {
      name: 'sl-gym-state-v1',
      storage: createJSONStorage(() => mmkvStorage),
      version: 1,
    },
  ),
);
