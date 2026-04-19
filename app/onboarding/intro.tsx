import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import Screen from '../../components/ui/Screen';
import Panel from '../../components/system/Panel';
import SystemText from '../../components/system/SystemText';
import SystemButton from '../../components/system/Button';
import ScreenTitle from '../../components/system/ScreenTitle';
import { spacing } from '../../theme/tokens';

export default function IntroScreen() {
  const [stage1Done, setStage1Done] = React.useState(false);
  const [stage2Done, setStage2Done] = React.useState(false);

  return (
    <Screen hideSysHeader>
      <View style={{ flex: 1, justifyContent: 'center', gap: spacing[6] }}>
        <ScreenTitle over="― SYSTEM · TRANSMISSION ―" title="TERMS OF SERVICE" />

        <Panel title="TERMS" tone="cyan">
          <View style={{ gap: spacing[4] }}>
            <SystemText
              variant="mono"
              size="md"
              tone="primary"
              typewriter
              haptic
              sound
              speedMs={32}
              onDone={() => setStage1Done(true)}
            >
              {'> YOU HAVE BEEN SELECTED AS A PLAYER.'}
            </SystemText>
            {stage1Done ? (
              <SystemText
                variant="mono"
                size="md"
                tone="primary"
                typewriter
                haptic
                sound
                speedMs={32}
                onDone={() => setStage2Done(true)}
              >
                {"> DO YOU ACCEPT THE SYSTEM'S TERMS?"}
              </SystemText>
            ) : null}
          </View>
        </Panel>

        <View style={{ gap: spacing[4] }}>
          <SystemButton
            size="lg"
            disabled={!stage2Done}
            onPress={() => router.push('/onboarding/accept')}
          >
            I ACCEPT
          </SystemButton>
          <SystemButton
            size="sm"
            ghost
            tone="danger"
            onPress={() => {
              setStage1Done(false);
              setStage2Done(false);
            }}
          >
            DECLINE
          </SystemButton>
        </View>
      </View>
    </Screen>
  );
}
