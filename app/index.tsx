import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import Screen from '../components/ui/Screen';
import SystemText from '../components/system/SystemText';
import Panel from '../components/system/Panel';
import SystemButton from '../components/system/Button';
import Toast from '../components/system/Toast';
import LevelUpSequence from '../components/system/LevelUpSequence';
import QuestRow from '../components/system/QuestRow';
import ScreenTitle from '../components/system/ScreenTitle';
import WarnLine from '../components/system/WarnLine';
import { colors, spacing } from '../theme/tokens';
import { useAppStore, todayKey } from '../lib/store';
import type { ExerciseId } from '../lib/store';
import {
  targetsFor,
  questIsComplete,
  isSingleSession,
  runDuration,
  nextMidnight,
} from '../lib/quest';
import { computeRank, checkRankUp, computeGains } from '../lib/stats';
import { commitQuestCompletion } from '../lib/penalty';
import type { TabId } from '../components/system/TabBar';

const QUEST_LABELS: Record<ExerciseId, string> = {
  pushups: 'PUSH-UPS',
  situps: 'SIT-UPS',
  squats: 'SQUATS',
  run: 'RUN',
};

const formatHMS = (ms: number): string => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(s / 3600)).padStart(2, '0');
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const sec = String(s % 60).padStart(2, '0');
  return `${h}:${m}:${sec}`;
};

export default function Home() {
  const quest = useAppStore((s) => s.quest);
  const penalty = useAppStore((s) => s.penalty);
  const restTokens = useAppStore((s) => s.restTokens);
  const level = useAppStore((s) => s.level);
  const applyCompletion = useAppStore((s) => s.applyCompletion);
  const queueReassessment = useAppStore((s) => s.queueReassessment);
  const useRestToken = useAppStore((s) => s.useRestToken);

  const targets = targetsFor(penalty.compoundLevel);
  const complete = questIsComplete(quest, targets);

  const [toast, setToast] = React.useState<null | {
    title: string;
    body?: string;
    kind?: 'cyan' | 'amber' | 'red';
  }>(null);
  const [levelUp, setLevelUp] = React.useState<null | {
    from: number;
    to: number;
    stats: { key: string; delta: string }[];
  }>(null);

  const [remaining, setRemaining] = React.useState(
    nextMidnight().getTime() - Date.now(),
  );
  React.useEffect(() => {
    const id = setInterval(
      () => setRemaining(nextMidnight().getTime() - Date.now()),
      1000,
    );
    return () => clearInterval(id);
  }, []);

  const onTabChange = (id: TabId) => {
    if (id === 'stats') router.push('/stats');
    else if (id === 'train') router.push({ pathname: '/log/[exercise]', params: { exercise: 'pushups' } });
    else if (id === 'self') router.push('/stats');
  };

  const onOpen = (e: ExerciseId) => {
    router.push({ pathname: '/log/[exercise]', params: { exercise: e } });
  };

  const onComplete = React.useCallback(() => {
    const s = useAppStore.getState();
    const singleSession = isSingleSession(s.quest);
    const runDur = runDuration(s.quest);
    const previousStreak = s.streak;
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

    setToast({
      title: 'QUEST · CLEARED',
      body: `+${gain.expGained} EXP · STATS UPDATED`,
      kind: 'cyan',
    });

    if (leveledUp) {
      const statKeys: Array<'STR' | 'VIT' | 'AGI' | 'SEN' | 'INT'> = [
        'STR',
        'VIT',
        'AGI',
        'SEN',
        'INT',
      ];
      const statList = statKeys.map((k) => ({
        key: k,
        delta: `+${gain.gained[k] ?? 0}`,
      }));
      setTimeout(
        () => setLevelUp({ from: prevLevel, to: newLevel, stats: statList }),
        600,
      );
    }
    if (rankChanged) {
      queueReassessment(computeRank(newLevel));
      setTimeout(() => router.push('/reassessment'), 1800);
    }
  }, [applyCompletion, queueReassessment]);

  const onUseRestToken = () => {
    if (useRestToken(todayKey())) {
      setToast({
        title: 'REST TOKEN · CONSUMED',
        body: 'TODAY MARKED CLEAN',
        kind: 'amber',
      });
    }
  };

  return (
    <Screen scroll showTabBar activeTab="home" onTabChange={onTabChange}>
      <ScreenTitle over="― DAILY QUEST · ISSUED ―" title="TRAIN TO BECOME STRONG" />

      <Panel title="OBJECTIVES" tone="cyan">
        <QuestRow
          label={QUEST_LABELS.pushups}
          value={quest.pushups}
          target={targets.pushups}
          onPress={() => onOpen('pushups')}
        />
        <QuestRow
          label={QUEST_LABELS.situps}
          value={quest.situps}
          target={targets.situps}
          onPress={() => onOpen('situps')}
        />
        <QuestRow
          label={QUEST_LABELS.squats}
          value={quest.squats}
          target={targets.squats}
          onPress={() => onOpen('squats')}
        />
        <QuestRow
          label={QUEST_LABELS.run}
          value={quest.run}
          target={targets.run}
          unit="KM"
          decimal
          onPress={() => onOpen('run')}
        />
      </Panel>

      <WarnLine>{`FAILURE BEFORE 00:00 ISSUES A PENALTY · COMPOUND LEVEL ${penalty.compoundLevel}`}</WarnLine>

      <View style={{ height: spacing[4] }} />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingVertical: spacing[3],
          borderTopWidth: 1,
          borderTopColor: colors.stroke.cyanFaint,
        }}
      >
        <SystemText
          variant="heading"
          weight="semibold"
          size="3xs"
          tracking="widest"
          tone="secondary"
          uppercase
        >
          TIME · REMAINING
        </SystemText>
        <SystemText variant="mono" size="sm" tone="cyan200" glow="sm">
          {`[ ${formatHMS(remaining)} ]`}
        </SystemText>
      </View>

      <View style={{ height: spacing[4] }} />
      <View style={{ gap: spacing[4] }}>
        <SystemButton
          size="lg"
          disabled={!complete}
          onPress={onComplete}
        >
          {complete ? 'COMMIT QUEST' : 'QUEST · INCOMPLETE'}
        </SystemButton>
        {restTokens > 0 ? (
          <SystemButton size="sm" tone="amber" ghost onPress={onUseRestToken}>
            {`USE REST TOKEN · ${restTokens}`}
          </SystemButton>
        ) : null}
      </View>

      <Toast
        visible={!!toast}
        title={toast?.title ?? ''}
        body={toast?.body}
        kind={toast?.kind}
        onDismiss={() => setToast(null)}
      />

      <LevelUpSequence
        visible={!!levelUp}
        fromLevel={levelUp?.from ?? level}
        toLevel={levelUp?.to ?? level}
        stats={levelUp?.stats ?? []}
        onDismiss={() => setLevelUp(null)}
      />
    </Screen>
  );
}
