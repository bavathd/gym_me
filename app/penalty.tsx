import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import Screen from '../components/ui/Screen';
import Panel from '../components/system/Panel';
import SystemText from '../components/system/SystemText';
import SystemButton from '../components/system/Button';
import PenaltyOverlay from '../components/system/PenaltyOverlay';
import ScreenTitle from '../components/system/ScreenTitle';
import { useAppStore } from '../lib/store';
import { targetsFor } from '../lib/quest';
import { spacing } from '../theme/tokens';

export default function PenaltyScreen() {
  const penalty = useAppStore((s) => s.penalty);
  const [showOverlay, setShowOverlay] = React.useState(true);

  const targets = targetsFor(penalty.compoundLevel);

  const quest = [
    { label: 'PUSH-UPS', target: String(targets.pushups) },
    { label: 'SIT-UPS', target: String(targets.situps) },
    { label: 'SQUATS', target: String(targets.squats) },
    { label: 'RUN', target: `${targets.run} KM` },
  ];

  return (
    <Screen tinted scroll hideSysHeader>
      <ScreenTitle over="― PENALTY · ACTIVE ―" title="COMPOUND ZONE" tone="red" />

      <Panel tone="red" title={`COMPOUND LEVEL · ${penalty.compoundLevel}`}>
        <View style={{ gap: spacing[3] }}>
          <Row k="EXP · DEDUCTED" v={`${penalty.expDeducted}`} />
          <Row
            k="REQUIRED"
            v={`${targets.pushups}/${targets.situps}/${targets.squats} · ${targets.run} KM`}
          />
          {penalty.compoundLevel >= 2 ? (
            <SystemText variant="mono" size="xs" tone="red300" glow="red">
              {'> NEXT FAILURE WILL TRIGGER RANK DEMOTION.'}
            </SystemText>
          ) : null}
        </View>
      </Panel>

      <View style={{ height: spacing[4] }} />
      <Panel tone="red" pad={4}>
        <SystemText variant="mono" size="2xs" tone="red300">
          {'> PENALTY QUEST MUST BE CLEARED WITHIN A SINGLE DAY. STATS ARE FROZEN UNTIL COMPLETION.'}
        </SystemText>
      </Panel>

      <View style={{ height: spacing[6] }} />
      <SystemButton size="lg" tone="danger" onPress={() => router.replace('/')}>
        ENTER QUEST
      </SystemButton>

      <PenaltyOverlay
        visible={showOverlay}
        holdSeconds={3}
        penaltyQuest={quest}
        frozenStats="STR · VIT · AGI · SEN · INT"
        onAccept={() => setShowOverlay(false)}
      />
    </Screen>
  );
}

const Row: React.FC<{ k: string; v: string }> = ({ k, v }) => (
  <View
    style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: spacing[2],
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,42,60,0.25)',
    }}
  >
    <SystemText
      variant="heading"
      weight="semibold"
      size="xs"
      tracking="widest"
      tone="red300"
      uppercase
    >
      {k}
    </SystemText>
    <SystemText variant="mono" size="sm" tone="red300" glow="red">
      {`[ ${v} ]`}
    </SystemText>
  </View>
);
