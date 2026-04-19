import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import Screen from '../components/ui/Screen';
import SystemText from '../components/system/SystemText';
import SystemPanel from '../components/system/SystemPanel';
import QuestPanel from '../components/system/QuestPanel';
import SystemButton from '../components/ui/SystemButton';
import SystemNotification from '../components/system/SystemNotification';
import LevelUpSequence from '../components/system/LevelUpSequence';
import { spacing } from '../theme/tokens';
import { useAppStore, todayKey } from '../lib/store';
import { targetsFor, questIsComplete, isSingleSession, runDuration } from '../lib/quest';
import { computeGains, computeLevel, computeRank, checkRankUp } from '../lib/stats';
import { commitQuestCompletion } from '../lib/penalty';

export default function Home() {
  const quest = useAppStore((s) => s.quest);
  const level = useAppStore((s) => s.level);
  const rank = useAppStore((s) => s.rank);
  const exp = useAppStore((s) => s.exp);
  const streak = useAppStore((s) => s.streak);
  const restTokens = useAppStore((s) => s.restTokens);
  const penalty = useAppStore((s) => s.penalty);
  const applyCompletion = useAppStore((s) => s.applyCompletion);
  const queueReassessment = useAppStore((s) => s.queueReassessment);
  const useRestToken = useAppStore((s) => s.useRestToken);

  const targets = targetsFor(penalty.compoundLevel);
  const complete = questIsComplete(quest, targets);
  const [notification, setNotification] = React.useState<null | {
    title: string;
    body?: string;
    tone?: 'cyan' | 'amber' | 'red';
  }>(null);
  const [levelUp, setLevelUp] = React.useState<null | {
    level: number;
    rank: string;
  }>(null);

  const onComplete = React.useCallback(() => {
    const s = useAppStore.getState();
    const singleSession = isSingleSession(s.quest);
    const runDur = runDuration(s.quest);
    const previousStreak = s.streak;
    // Projected streak: +1 if continued, else 1.
    const ySet = new Date();
    ySet.setDate(ySet.getDate() - 1);
    const continued =
      s.lastCompletedDateKey === todayKey(ySet) ||
      s.lastCompletedDateKey === null;
    const newStreak = continued ? previousStreak + 1 : 1;

    const gain = computeGains({
      pushups: s.quest.pushups,
      situps: s.quest.situps,
      squats: s.quest.squats,
      runKm: s.quest.run,
      runDurationMs: runDur,
      singleSession,
      newStreak,
      previousStreak,
    });

    const prevLevel = s.level;
    applyCompletion({
      gained: gain.gained,
      expGained: gain.expGained,
      singleSession,
      streakMilestone: gain.streakMilestone,
      runUnderTarget: gain.runUnderTarget,
    });

    commitQuestCompletion({
      dateKey: s.quest.dateKey,
      completedAt: Date.now(),
      exercises: {
        pushups: s.quest.pushups,
        situps: s.quest.situps,
        squats: s.quest.squats,
        run: s.quest.run,
      },
      runDurationMs: runDur,
      singleSession,
    });

    const after = useAppStore.getState();
    const newLevel = after.level;
    const { leveledUp, rankChanged } = checkRankUp(prevLevel, newLevel);

    setNotification({
      title: 'Quest Complete',
      body: `You have gained ${gain.expGained} EXP.`,
      tone: 'cyan',
    });

    if (leveledUp) {
      setTimeout(() => {
        setLevelUp({ level: newLevel, rank: computeRank(newLevel) });
      }, 600);
    }

    if (rankChanged) {
      queueReassessment(computeRank(newLevel));
      setTimeout(() => router.push('/reassessment'), 1800);
    }
  }, [applyCompletion, queueReassessment]);

  const onUseRestToken = () => {
    const ok = useRestToken(todayKey());
    if (ok) {
      setNotification({
        title: 'Rest Token Consumed',
        body: 'Today has been marked as cleanly completed.',
        tone: 'amber',
      });
    }
  };

  return (
    <Screen scroll>
      <View style={{ gap: spacing.xs }}>
        <SystemText variant="display" tone="cyan" size="xxl">
          SYSTEM
        </SystemText>
        <SystemText variant="mono" tone="mute" size="sm">
          {`Hunter · Level ${level} · Rank ${rank} · EXP ${exp}`}
        </SystemText>
        <SystemText variant="mono" tone="mute" size="xs">
          {`Streak ${streak}d · Rest tokens ${restTokens}`}
        </SystemText>
      </View>

      <QuestPanel
        quest={quest}
        targets={targets}
        penalty={penalty.active}
        compoundLevel={penalty.compoundLevel}
      />

      <View style={{ gap: spacing.md }}>
        <SystemButton
          label={complete ? 'Complete Quest' : 'Quest Incomplete'}
          onPress={onComplete}
          disabled={!complete}
          size="lg"
        />
        <SystemButton
          label="View Stats"
          onPress={() => router.push('/stats')}
          tone="amber"
        />
        {restTokens > 0 && (
          <SystemButton
            label={`Use Rest Token (${restTokens})`}
            onPress={onUseRestToken}
            tone="amber"
            size="sm"
          />
        )}
      </View>

      <SystemPanel variant="cyan" pad="md">
        <SystemText variant="mono" tone="mute" size="xs">
          Tap an exercise bar to log reps. Run uses km.
        </SystemText>
      </SystemPanel>

      <SystemNotification
        visible={!!notification}
        title={notification?.title ?? ''}
        body={notification?.body}
        tone={notification?.tone}
        onDismiss={() => setNotification(null)}
      />

      <LevelUpSequence
        visible={!!levelUp}
        level={levelUp?.level ?? level}
        rank={levelUp?.rank}
        onDone={() => setLevelUp(null)}
      />
    </Screen>
  );
}
