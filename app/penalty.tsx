import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import Screen from '../components/ui/Screen';
import SystemPanel from '../components/system/SystemPanel';
import SystemText from '../components/system/SystemText';
import SystemButton from '../components/ui/SystemButton';
import PenaltyOverlay from '../components/system/PenaltyOverlay';
import { useAppStore } from '../lib/store';
import { targetsFor } from '../lib/quest';
import { spacing } from '../theme/tokens';

export default function PenaltyScreen() {
  const penalty = useAppStore((s) => s.penalty);
  const [showOverlay, setShowOverlay] = React.useState(true);

  const targets = targetsFor(penalty.compoundLevel);

  return (
    <Screen tinted scroll>
      <SystemText variant="display" tone="red" size="xxl">
        PENALTY ZONE
      </SystemText>
      <SystemText variant="mono" tone="red" size="sm">
        Daily Quest failed. Stats are frozen until the Penalty Quest is cleared.
      </SystemText>

      <SystemPanel variant="red">
        <SystemText variant="display" tone="red" size="md">
          {`COMPOUND LEVEL ${penalty.compoundLevel}`}
        </SystemText>
        <View style={{ gap: spacing.xs, marginTop: spacing.sm }}>
          <SystemText variant="mono" tone="white" size="sm">
            {`EXP deducted: ${penalty.expDeducted}`}
          </SystemText>
          <SystemText variant="mono" tone="white" size="sm">
            {`Required: ${targets.pushups}/${targets.situps}/${targets.squats}/${targets.run}km`}
          </SystemText>
          {penalty.compoundLevel >= 2 && (
            <SystemText variant="mono" tone="red" size="sm">
              WARNING: Next failure will result in rank demotion.
            </SystemText>
          )}
        </View>
      </SystemPanel>

      <SystemPanel variant="red" pad="md">
        <SystemText variant="mono" tone="red" size="xs">
          Rule: Penalty Quest must be cleared within a single day. Completing
          it restores normal progression.
        </SystemText>
      </SystemPanel>

      <SystemButton
        label="Enter Quest"
        tone="red"
        onPress={() => router.replace('/')}
      />

      <PenaltyOverlay
        visible={showOverlay}
        holdMs={3000}
        onDone={() => setShowOverlay(false)}
      />
    </Screen>
  );
}
