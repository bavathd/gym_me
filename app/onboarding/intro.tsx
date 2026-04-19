import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import Screen from '../../components/ui/Screen';
import SystemPanel from '../../components/system/SystemPanel';
import SystemText from '../../components/system/SystemText';
import SystemButton from '../../components/ui/SystemButton';
import { spacing } from '../../theme/tokens';

export default function IntroScreen() {
  const [step, setStep] = React.useState(0);

  const lines = [
    'You have been selected by the System.',
    'Your training is no longer optional.',
    'Daily Quests will be issued at 00:00.',
    'Failure will result in a Penalty.',
  ];

  const next = () => {
    if (step < lines.length - 1) setStep(step + 1);
    else router.push('/onboarding/accept');
  };

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', gap: spacing.lg }}>
        <SystemText variant="display" tone="cyan" size="display">
          SYSTEM
        </SystemText>
        <SystemPanel variant="cyan">
          <SystemText
            key={step}
            variant="mono"
            tone="white"
            size="lg"
            typewriter
            haptic
            sound
          >
            {lines[step] ?? ''}
          </SystemText>
        </SystemPanel>
        <SystemButton
          label={step < lines.length - 1 ? 'Continue' : 'Proceed'}
          onPress={next}
          size="lg"
        />
      </View>
    </Screen>
  );
}
