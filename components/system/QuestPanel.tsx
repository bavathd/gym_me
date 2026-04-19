import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import SystemPanel from './SystemPanel';
import SystemText from './SystemText';
import StatBar from './StatBar';
import { spacing } from '../../theme/tokens';
import type { QuestProgress } from '../../lib/store';
import type { QuestTargets } from '../../lib/quest';

export type QuestPanelProps = {
  quest: QuestProgress;
  targets: QuestTargets;
  penalty: boolean;
  compoundLevel: number;
};

const QUEST_TITLE = 'DAILY QUEST: TRAIN YOUR BODY';

const exerciseMeta: Array<{
  id: 'pushups' | 'situps' | 'squats' | 'run';
  label: string;
  unit?: string;
}> = [
  { id: 'pushups', label: 'PUSH-UPS' },
  { id: 'situps', label: 'SIT-UPS' },
  { id: 'squats', label: 'SQUATS' },
  { id: 'run', label: 'RUN', unit: ' km' },
];

export const QuestPanel: React.FC<QuestPanelProps> = ({
  quest,
  targets,
  penalty,
  compoundLevel,
}) => {
  const variant = penalty ? 'red' : 'cyan';
  const header = penalty
    ? `PENALTY QUEST · COMPOUND ${compoundLevel}`
    : QUEST_TITLE;

  return (
    <SystemPanel variant={variant} pad="lg">
      <SystemText variant="display" tone={penalty ? 'red' : 'cyan'} size="lg">
        {header}
      </SystemText>
      <View style={styles.subtitleRow}>
        <SystemText variant="mono" tone="mute" size="sm">
          {penalty
            ? 'Clear immediately. Failure will compound.'
            : 'Goal: grow stronger.'}
        </SystemText>
      </View>

      <View style={styles.bars}>
        {exerciseMeta.map((m) => (
          <Pressable
            key={m.id}
            onPress={() =>
              router.push({
                pathname: '/log/[exercise]',
                params: { exercise: m.id },
              })
            }
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          >
            <StatBar
              label={m.label}
              value={quest[m.id]}
              target={targets[m.id]}
              unit={m.unit}
              tone={penalty ? 'red' : 'cyan'}
            />
          </Pressable>
        ))}
      </View>

      <View style={styles.footer}>
        <SystemText variant="mono" tone="mute" size="xs">
          CAUTION: Failing to complete the Daily Quest will trigger a penalty.
        </SystemText>
      </View>
    </SystemPanel>
  );
};

const styles = StyleSheet.create({
  subtitleRow: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  bars: {
    gap: spacing.md,
  },
  footer: {
    marginTop: spacing.lg,
  },
});

export default QuestPanel;
