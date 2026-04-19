import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Screen from '../components/ui/Screen';
import Panel from '../components/system/Panel';
import SystemText from '../components/system/SystemText';
import StatBar from '../components/system/StatBar';
import RankBadge from '../components/system/RankBadge';
import ScreenTitle from '../components/system/ScreenTitle';
import { useAppStore } from '../lib/store';
import { STAT_KEYS, expForLevel } from '../lib/stats';
import { colors, spacing } from '../theme/tokens';
import type { TabId } from '../components/system/TabBar';

export default function StatsScreen() {
  const stats = useAppStore((s) => s.stats);
  const level = useAppStore((s) => s.level);
  const rank = useAppStore((s) => s.rank);
  const exp = useAppStore((s) => s.exp);
  const streak = useAppStore((s) => s.streak);
  const history = useAppStore((s) => s.history);

  const expCap = expForLevel(level);
  const expPct = Math.max(0, Math.min(1, expCap === 0 ? 0 : exp / expCap));

  const onTabChange = (id: TabId) => {
    if (id === 'home') router.push('/');
    else if (id === 'train')
      router.push({ pathname: '/log/[exercise]', params: { exercise: 'pushups' } });
  };

  return (
    <Screen scroll showTabBar activeTab="stats" onTabChange={onTabChange}>
      <ScreenTitle over="― PROFILE · STATUS ―" title="PLAYER · HUNTER" />

      <View style={styles.header}>
        <RankBadge rank={rank} size={72} />
        <View style={styles.headerRight}>
          <SystemText
            variant="heading"
            weight="semibold"
            size="3xs"
            tracking="widest"
            tone="secondary"
            uppercase
          >
            LEVEL
          </SystemText>
          <SystemText
            variant="display"
            weight="black"
            size="3xl"
            tone="cyan200"
            glow="lg"
          >
            {String(level).padStart(2, '0')}
          </SystemText>
          <View style={{ height: spacing[2] }} />
          <View style={styles.expTrack}>
            <View
              style={[
                styles.expFill,
                { width: `${Math.round(expPct * 100)}%` },
              ]}
            />
          </View>
          <View style={{ height: spacing[2] }} />
          <SystemText variant="mono" size="2xs" tone="secondary">
            {`[ ${exp} / ${expCap} EXP ]`}
          </SystemText>
        </View>
      </View>

      <View style={{ height: spacing[5] }} />
      <Panel title="ATTRIBUTES" tone="cyan">
        {STAT_KEYS.map((k) => (
          <StatBar key={k} name={k} value={stats[k]} max={40} />
        ))}
      </Panel>

      <View style={{ height: spacing[5] }} />
      <View style={styles.tileRow}>
        <Tile label="STREAK" value={`${streak} D`} />
        <Tile label="QUESTS · CLEARED" value={`${history.length}`} />
      </View>
    </Screen>
  );
}

const Tile: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.tile}>
    <SystemText
      variant="heading"
      weight="semibold"
      size="3xs"
      tracking="widest"
      tone="secondary"
      uppercase
    >
      {label}
    </SystemText>
    <View style={{ height: spacing[2] }} />
    <SystemText variant="mono" size="2xl" tone="cyan200" glow="md">
      {value}
    </SystemText>
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[5],
  },
  headerRight: {
    flex: 1,
  },
  expTrack: {
    height: 6,
    backgroundColor: 'rgba(0,212,255,0.08)',
    borderWidth: 1,
    borderColor: colors.stroke.cyanFaint,
    overflow: 'hidden',
  },
  expFill: {
    height: '100%',
    backgroundColor: colors.cyan[500],
    shadowColor: colors.cyan[500],
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  tileRow: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  tile: {
    flex: 1,
    padding: spacing[5],
    borderWidth: 1,
    borderColor: colors.stroke.cyanSoft,
    backgroundColor: 'rgba(10,22,40,0.55)',
  },
});
