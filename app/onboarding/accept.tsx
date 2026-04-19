import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import Screen from '../../components/ui/Screen';
import SystemPanel from '../../components/system/SystemPanel';
import SystemText from '../../components/system/SystemText';
import SystemButton from '../../components/ui/SystemButton';
import { useAppStore } from '../../lib/store';
import { spacing } from '../../theme/tokens';

export default function AcceptScreen() {
  const setOnboarded = useAppStore((s) => s.setOnboarded);

  const accept = () => {
    setOnboarded(true);
    router.replace('/');
  };

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', gap: spacing.lg }}>
        <SystemText variant="display" tone="amber" size="xxl">
          NOTICE
        </SystemText>
        <SystemPanel variant="amber">
          <SystemText variant="mono" tone="white" size="md">
            {[
              'Daily Quest (resets 00:00 local):',
              '  · 100 push-ups',
              '  · 100 sit-ups',
              '  · 100 squats',
              '  · 10 km run',
              '',
              'Completion grants stat gains and EXP.',
              'Failure triggers a Penalty Quest the next day.',
              'The quest does not scale. No shortcuts.',
            ].join('\n')}
          </SystemText>
        </SystemPanel>
        <SystemButton label="Accept" onPress={accept} size="lg" />
        <SystemButton
          label="Decline"
          tone="red"
          size="sm"
          onPress={() => router.back()}
        />
      </View>
    </Screen>
  );
}
