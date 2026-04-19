import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import Screen from '../components/ui/Screen';
import SystemPanel from '../components/system/SystemPanel';
import SystemText from '../components/system/SystemText';
import SystemButton from '../components/ui/SystemButton';
import { useAppStore } from '../lib/store';
import { STAT_KEYS, statSum, expForLevel } from '../lib/stats';
import { spacing } from '../theme/tokens';

const STAT_LABELS: Record<(typeof STAT_KEYS)[number], string> = {
  STR: 'Strength',
  VIT: 'Vitality',
  AGI: 'Agility',
  SEN: 'Sense',
  INT: 'Intellect',
};

export default function StatsScreen() {
  const stats = useAppStore((s) => s.stats);
  const level = useAppStore((s) => s.level);
  const rank = useAppStore((s) => s.rank);
  const exp = useAppStore((s) => s.exp);
  const streak = useAppStore((s) => s.streak);
  const restTokens = useAppStore((s) => s.restTokens);
  const history = useAppStore((s) => s.history);

  const totalStatPoints = statSum(stats);
  const expCap = expForLevel(level);

  return (
    <Screen scroll>
      <SystemText variant="display" tone="cyan" size="xxl">
        STATUS
      </SystemText>

      <SystemPanel variant="cyan">
        <SystemText variant="display" tone="cyan" size="md">
          HUNTER
        </SystemText>
        <View style={{ gap: spacing.xs, marginTop: spacing.sm }}>
          <SystemText variant="mono" tone="white" size="sm">
            {`Level ${level}`}
          </SystemText>
          <SystemText variant="mono" tone="white" size="sm">
            {`Rank ${rank}`}
          </SystemText>
          <SystemText variant="mono" tone="white" size="sm">
            {`EXP ${exp} / ${expCap}`}
          </SystemText>
          <SystemText variant="mono" tone="mute" size="xs">
            {`Total stat points ${totalStatPoints}`}
          </SystemText>
        </View>
      </SystemPanel>

      <SystemPanel variant="amber">
        <SystemText variant="display" tone="amber" size="md">
          ATTRIBUTES
        </SystemText>
        <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
          {STAT_KEYS.map((k) => (
            <View
              key={k}
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
              <SystemText variant="mono" tone="white" size="sm">
                {`${k} · ${STAT_LABELS[k]}`}
              </SystemText>
              <SystemText variant="mono" tone="amber" size="sm">
                {String(stats[k])}
              </SystemText>
            </View>
          ))}
        </View>
      </SystemPanel>

      <SystemPanel variant="cyan">
        <SystemText variant="display" tone="cyan" size="md">
          RECORDS
        </SystemText>
        <View style={{ gap: spacing.xs, marginTop: spacing.sm }}>
          <SystemText variant="mono" tone="white" size="sm">
            {`Streak: ${streak} day${streak === 1 ? '' : 's'}`}
          </SystemText>
          <SystemText variant="mono" tone="white" size="sm">
            {`Rest tokens: ${restTokens}`}
          </SystemText>
          <SystemText variant="mono" tone="white" size="sm">
            {`Quests cleared: ${history.length}`}
          </SystemText>
        </View>
      </SystemPanel>

      <SystemButton label="Return" onPress={() => router.back()} />
    </Screen>
  );
}
