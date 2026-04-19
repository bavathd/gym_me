import { useAppStore, todayKey } from './store';
import type { HistoryEntry, Rank } from './store';
import { questIsComplete, targetsFor } from './quest';
import { computeLevel, computeRank, expForLevel } from './stats';

/**
 * Evaluate the previous day's quest. Called at app foreground or on the
 * 00:00 tick. If the quest was incomplete, activate penalty and compound
 * if this is a repeat offence.
 */
export const evaluateYesterday = (now: Date = new Date()) => {
  const s = useAppStore.getState();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yKey = todayKey(yesterday);

  // Only evaluate the quest that was scheduled for yesterday.
  if (s.quest.dateKey !== yKey) return;

  const targets = targetsFor(s.penalty.compoundLevel);
  const completed = questIsComplete(s.quest, targets);

  if (completed) return;

  const nextCompound = Math.min(3, s.penalty.compoundLevel + 1);

  // EXP deduction: 10% of exp needed for current level.
  const expBudget = expForLevel(s.level);
  const deduct = Math.round(expBudget * 0.1);
  const newExp = Math.max(0, s.exp - deduct);
  useAppStore.setState({ exp: newExp });

  // Rank demotion at compound level 3.
  if (nextCompound >= 3) {
    const demotedLevel = Math.max(1, s.level - 5);
    const demotedRank: Rank = computeRank(demotedLevel);
    useAppStore.setState({ level: demotedLevel, rank: demotedRank });
  }

  s.activatePenalty(nextCompound, deduct);
};

/**
 * Clearing path: run at quest completion. If the completed quest was a
 * penalty-level quest (compoundLevel >= 1), the penalty state resets.
 */
export const tryClearPenalty = () => {
  const s = useAppStore.getState();
  if (!s.penalty.active) return;
  const targets = targetsFor(s.penalty.compoundLevel);
  if (questIsComplete(s.quest, targets)) {
    s.clearPenalty();
  }
};

/**
 * Called when the user completes a quest. Appends history, bumps level/rank,
 * manages streak + rest tokens.
 */
export const commitQuestCompletion = (
  entry: Omit<HistoryEntry, 'compoundLevel' | 'penalty'>,
) => {
  const s = useAppStore.getState();
  const wasPenalty = s.penalty.active;
  const compoundLevel = s.penalty.compoundLevel;

  const fullEntry: HistoryEntry = {
    ...entry,
    penalty: wasPenalty,
    compoundLevel,
  };

  // Streak: +1 if yesterday was completed (or first completion).
  const yesterdayKey = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return todayKey(d);
  })();
  const continued =
    s.lastCompletedDateKey === yesterdayKey || s.lastCompletedDateKey === null;
  const newStreak = continued ? s.streak + 1 : 1;

  // Rest tokens: grant one per 7 consecutive completed days.
  const crossedSeven =
    newStreak > 0 && Math.floor(newStreak / 7) > Math.floor(s.streak / 7);
  const newRestTokens = s.restTokens + (crossedSeven ? 1 : 0);

  useAppStore.setState({
    history: [...s.history, fullEntry],
    streak: newStreak,
    restTokens: newRestTokens,
    lastCompletedDateKey: entry.dateKey,
  });

  if (wasPenalty) s.clearPenalty();

  // Recompute level/rank from stats (applied elsewhere via applyCompletion).
  const level = computeLevel(useAppStore.getState().stats);
  const rank = computeRank(level);
  useAppStore.setState({ level, rank });
};
