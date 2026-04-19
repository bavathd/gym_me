import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import Screen from '../components/ui/Screen';
import Panel from '../components/system/Panel';
import SystemText from '../components/system/SystemText';
import SystemButton from '../components/system/Button';
import ScreenTitle from '../components/system/ScreenTitle';
import { useAppStore } from '../lib/store';
import { DAILY_TARGETS } from '../lib/quest';
import { colors, spacing } from '../theme/tokens';

const SESSION_WINDOW_MS = 2 * 60 * 60 * 1000; // 02:00:00

export default function Reassessment() {
  const pending = useAppStore((s) => s.pendingReassessment);
  const clearReassessment = useAppStore((s) => s.clearReassessment);
  const [remaining, setRemaining] = React.useState(SESSION_WINDOW_MS);
  const [started, setStarted] = React.useState(false);

  React.useEffect(() => {
    if (!started) return;
    const id = setInterval(
      () => setRemaining((r) => Math.max(0, r - 1000)),
      1000,
    );
    return () => clearInterval(id);
  }, [started]);

  if (!pending) {
    return (
      <Screen>
        <ScreenTitle over="― TRIAL · CLEAR ―" title="NO REASSESSMENT" />
        <SystemButton onPress={() => router.back()}>RETURN</SystemButton>
      </Screen>
    );
  }

  const targets = {
    pushups: DAILY_TARGETS.pushups * 2,
    situps: DAILY_TARGETS.situps * 2,
    squats: DAILY_TARGETS.squats * 2,
    run: DAILY_TARGETS.run * 2,
  };

  const fmt = (ms: number): string => {
    const s = Math.floor(ms / 1000);
    const h = String(Math.floor(s / 3600)).padStart(2, '0');
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  const kvs: Array<[string, string]> = [
    ['PUSH-UPS', String(targets.pushups)],
    ['SIT-UPS', String(targets.situps)],
    ['SQUATS', String(targets.squats)],
    ['RUN', `${targets.run} KM`],
    ['RULE', 'SINGLE SESSION · NO > 2 H GAP'],
  ];

  return (
    <Screen scroll hideSysHeader>
      <ScreenTitle
        over="― SPECIAL QUEST · ISSUED ―"
        title={`RANK-UP · ${pending}`}
        tone="amber"
      />

      <Panel title="TRIAL" tone="amber">
        <SystemText variant="mono" size="xs" tone="amber300" glow="amber">
          {`> PROOF OF RANK ${pending} REQUIRED.`}
        </SystemText>
        <View style={{ height: spacing[4] }} />
        {kvs.map(([k, v]) => (
          <View
            key={k}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingVertical: spacing[2],
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(255,184,74,0.18)',
            }}
          >
            <SystemText
              variant="heading"
              weight="semibold"
              size="xs"
              tracking="widest"
              tone="amber300"
              uppercase
            >
              {k}
            </SystemText>
            <SystemText variant="mono" size="sm" tone="amber300" glow="amber">
              {`[ ${v} ]`}
            </SystemText>
          </View>
        ))}
      </Panel>

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
          SESSION · WINDOW
        </SystemText>
        <SystemText variant="mono" size="sm" tone="amber300" glow="amber">
          {`[ ${fmt(remaining)} ]`}
        </SystemText>
      </View>

      <View style={{ height: spacing[6] }} />
      <View style={{ gap: spacing[4] }}>
        <SystemButton
          size="lg"
          tone="amber"
          onPress={() => {
            setStarted(true);
            clearReassessment();
            router.replace('/');
          }}
        >
          BEGIN
        </SystemButton>
        <SystemButton size="sm" ghost onPress={() => router.back()}>
          LATER
        </SystemButton>
      </View>
    </Screen>
  );
}
