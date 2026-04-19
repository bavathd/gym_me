import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import Screen from '../components/ui/Screen';
import SystemPanel from '../components/system/SystemPanel';
import SystemText from '../components/system/SystemText';
import SystemButton from '../components/ui/SystemButton';
import { useAppStore } from '../lib/store';
import { DAILY_TARGETS } from '../lib/quest';
import { spacing } from '../theme/tokens';

export default function Reassessment() {
  const pending = useAppStore((s) => s.pendingReassessment);
  const clearReassessment = useAppStore((s) => s.clearReassessment);

  if (!pending) {
    return (
      <Screen>
        <SystemText variant="display" tone="cyan" size="lg">
          NO REASSESSMENT PENDING
        </SystemText>
        <SystemButton label="Return" onPress={() => router.back()} />
      </Screen>
    );
  }

  const targets = {
    pushups: DAILY_TARGETS.pushups * 2,
    situps: DAILY_TARGETS.situps * 2,
    squats: DAILY_TARGETS.squats * 2,
    run: DAILY_TARGETS.run * 2,
  };

  return (
    <Screen scroll>
      <SystemText variant="display" tone="amber" size="xxl">
        REASSESSMENT
      </SystemText>
      <SystemText variant="mono" tone="amber" size="sm">
        {`A new rank has been detected: Rank ${pending}. Prove it in a single session.`}
      </SystemText>

      <SystemPanel variant="amber">
        <SystemText variant="display" tone="amber" size="md">
          RANK-UP QUEST
        </SystemText>
        <View style={{ gap: spacing.xs, marginTop: spacing.sm }}>
          <SystemText variant="mono" tone="white" size="sm">
            {`Push-ups: ${targets.pushups}`}
          </SystemText>
          <SystemText variant="mono" tone="white" size="sm">
            {`Sit-ups: ${targets.situps}`}
          </SystemText>
          <SystemText variant="mono" tone="white" size="sm">
            {`Squats: ${targets.squats}`}
          </SystemText>
          <SystemText variant="mono" tone="white" size="sm">
            {`Run: ${targets.run} km`}
          </SystemText>
          <SystemText variant="mono" tone="mute" size="xs">
            Complete without breaks greater than 2 hours.
          </SystemText>
        </View>
      </SystemPanel>

      <SystemButton
        label="Accept Challenge"
        tone="amber"
        onPress={() => {
          clearReassessment();
          router.replace('/');
        }}
      />
      <SystemButton
        label="Defer"
        tone="cyan"
        size="sm"
        onPress={() => router.back()}
      />
    </Screen>
  );
}
