import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import Screen from '../../components/ui/Screen';
import Panel from '../../components/system/Panel';
import SystemText from '../../components/system/SystemText';
import SystemButton from '../../components/system/Button';
import ScreenTitle from '../../components/system/ScreenTitle';
import { useAppStore } from '../../lib/store';
import { DAILY_TARGETS } from '../../lib/quest';
import { colors, spacing } from '../../theme/tokens';

export default function AcceptScreen() {
  const setOnboarded = useAppStore((s) => s.setOnboarded);

  const accept = () => {
    setOnboarded(true);
    router.replace('/');
  };

  const kv: Array<[string, string]> = [
    ['PUSH-UPS', `${DAILY_TARGETS.pushups}`],
    ['SIT-UPS', `${DAILY_TARGETS.situps}`],
    ['SQUATS', `${DAILY_TARGETS.squats}`],
    ['RUN', `${DAILY_TARGETS.run} KM`],
    ['RESETS', '00:00 LOCAL'],
    ['ON FAIL', 'PENALTY'],
  ];

  return (
    <Screen hideSysHeader scroll>
      <ScreenTitle over="― DAILY QUEST · CONTRACT ―" title="ACCEPT TERMS" />

      <Panel title="QUEST · DAILY" tone="cyan">
        <View style={{ gap: spacing[3] }}>
          {kv.map(([k, v]) => (
            <View
              key={k}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: spacing[2],
                borderBottomWidth: 1,
                borderBottomColor: colors.stroke.cyanFaint,
              }}
            >
              <SystemText
                variant="heading"
                weight="semibold"
                size="xs"
                tracking="widest"
                tone="secondary"
                uppercase
              >
                {k}
              </SystemText>
              <SystemText variant="mono" size="sm" tone="cyan200" glow="sm">
                {`[ ${v} ]`}
              </SystemText>
            </View>
          ))}
        </View>
      </Panel>

      <View style={{ height: spacing[5] }} />
      <Panel tone="cyan" pad={4}>
        <SystemText variant="mono" size="2xs" tone="secondary">
          {'> THE QUEST DOES NOT SCALE. NO SHORTCUTS. COMPLETION GRANTS STAT GAINS AND EXP. FAILURE ISSUES A PENALTY QUEST AT NEXT DAWN.'}
        </SystemText>
      </Panel>

      <View style={{ height: spacing[6] }} />
      <View style={{ gap: spacing[4] }}>
        <SystemButton size="lg" onPress={accept}>
          ACCEPT
        </SystemButton>
        <SystemButton size="sm" ghost tone="danger" onPress={() => router.back()}>
          DECLINE
        </SystemButton>
      </View>
    </Screen>
  );
}
