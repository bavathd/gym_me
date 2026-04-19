import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import SystemText from './SystemText';
import { colors, spacing, timing } from '../../theme/tokens';

export type StatBarProps = {
  label: string;
  value: number;
  target: number;
  unit?: string;
  tone?: 'cyan' | 'amber' | 'red';
};

export const StatBar: React.FC<StatBarProps> = ({
  label,
  value,
  target,
  unit,
  tone = 'cyan',
}) => {
  const pct = Math.max(0, Math.min(1, target === 0 ? 0 : value / target));
  const progress = useSharedValue(pct);

  React.useEffect(() => {
    progress.value = withTiming(pct, { duration: timing.slow });
  }, [pct, progress]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const color =
    tone === 'amber' ? colors.amber : tone === 'red' ? colors.red : colors.cyan;

  return (
    <View style={styles.root}>
      <View style={styles.headerRow}>
        <SystemText variant="mono" tone={tone} size="sm">
          {label}
        </SystemText>
        <SystemText variant="mono" tone="white" size="sm">
          {`${formatNum(value)}${unit ?? ''} / ${formatNum(target)}${unit ?? ''}`}
        </SystemText>
      </View>
      <View style={[styles.track, { borderColor: color }]}>
        <Animated.View
          style={[styles.fill, { backgroundColor: color }, barStyle]}
        />
      </View>
    </View>
  );
};

const formatNum = (n: number): string =>
  Number.isInteger(n) ? String(n) : n.toFixed(1);

const styles = StyleSheet.create({
  root: {
    gap: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  track: {
    height: 10,
    borderWidth: 1,
    backgroundColor: colors.navyDeep,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    opacity: 0.9,
  },
});

export default StatBar;
