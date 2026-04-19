import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import SystemText from './SystemText';
import { colors, spacing } from '../../theme/tokens';

export type TabId = 'home' | 'train' | 'stats' | 'self';

export type TabBarProps = {
  active: TabId;
  onChange: (id: TabId) => void;
};

type TabDef = {
  id: TabId;
  label: string;
  path: string;
};

const TABS: TabDef[] = [
  {
    id: 'home',
    label: 'QUEST',
    path: 'M12 2 L3 6 v6 c0 5 4 9 9 10 c5 -1 9 -5 9 -10 V6 Z',
  },
  {
    id: 'train',
    label: 'TRAIN',
    path: 'M14 5 l2 -2 l4 4 l-2 2 M8 11 l5 5 M3 21 l5 -5 M13 7 l4 4',
  },
  {
    id: 'stats',
    label: 'STATS',
    path: 'M3 21 V9 M3 21 H21 M9 21 V5 M15 21 V13 M21 21 V7',
  },
  {
    id: 'self',
    label: 'PLAYER',
    path: 'M12 12 a4 4 0 1 0 0 -8 a4 4 0 0 0 0 8 Z M4 21 c0 -5 4 -7 8 -7 s8 2 8 7',
  },
];

export const TabBar: React.FC<TabBarProps> = ({ active, onChange }) => (
  <View style={styles.root}>
    <LinearGradient
      colors={['rgba(5,11,20,0.55)', 'rgba(5,11,20,0.95)']}
      style={StyleSheet.absoluteFill}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    />
    {TABS.map((t) => {
      const isActive = t.id === active;
      const color = isActive ? colors.cyan[300] : colors.text.muted;
      return (
        <Pressable
          key={t.id}
          style={styles.tab}
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            onChange(t.id);
          }}
        >
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d={t.path}
              stroke={color}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <SystemText
            variant="heading"
            weight="semibold"
            size="3xs"
            tracking="widest"
            tone={isActive ? 'cyan300' : 'muted'}
            glow={isActive ? 'sm' : 'none'}
            uppercase
          >
            {t.label}
          </SystemText>
        </Pressable>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  root: {
    height: 72,
    paddingTop: spacing[3],
    paddingBottom: spacing[6],
    paddingHorizontal: spacing[6],
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    borderTopWidth: 1,
    borderTopColor: colors.stroke.cyanFaint,
  },
  tab: {
    minWidth: 64,
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[3],
  },
});

export default TabBar;
