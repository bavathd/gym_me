import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import SystemText from './SystemText';
import { colors, spacing, motion } from '../../theme/tokens';

export type StatBarProps = {
  name: string;
  value: number;
  max?: number;
  delta?: number;
};

/**
 * Horizontal attribute bar (STR/VIT/AGI/SEN/INT).
 * Layout: label · filled bar with tick marks · padded value · delta.
 */
export const StatBar: React.FC<StatBarProps> = ({
  name,
  value,
  max = 40,
  delta,
}) => {
  const pct = Math.max(0, Math.min(1, max === 0 ? 0 : value / max));
  const w = useSharedValue(pct);
  React.useEffect(() => {
    w.value = withTiming(pct, {
      duration: motion.duration.lg,
      easing: Easing.bezier(0.2, 0.8, 0.2, 1),
    });
  }, [pct, w]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${w.value * 100}%`,
  }));

  return (
    <View style={styles.row}>
      <View style={styles.k}>
        <SystemText
          variant="heading"
          weight="bold"
          size="xs"
          tracking="wider"
          tone="cyan300"
        >
          {name}
        </SystemText>
      </View>

      <View style={styles.track}>
        <Animated.View style={[styles.fill, fillStyle]} />
        <Ticks />
      </View>

      <View style={styles.v}>
        <SystemText variant="mono" size="sm" tone="primary" glow="sm">
          {String(value).padStart(2, '0')}
        </SystemText>
      </View>

      <View style={styles.d}>
        {delta ? (
          <SystemText variant="mono" size="2xs" tone="cyan300">
            {`▲ ${delta}`}
          </SystemText>
        ) : null}
      </View>
    </View>
  );
};

// Tick marks inside the bar: a row of vertical 1 px lines every 10 px.
const Ticks: React.FC = () => {
  const SEG = 14;
  // Render up to 30 ticks; hidden overflow is fine.
  return (
    <View style={styles.ticks} pointerEvents="none">
      {Array.from({ length: 30 }).map((_, i) => (
        <View
          key={i}
          style={[styles.tick, { left: i * SEG }]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    marginBottom: spacing[4],
  },
  k: {
    width: 40,
  },
  track: {
    flex: 1,
    height: 12,
    backgroundColor: 'rgba(0,212,255,0.08)',
    borderWidth: 1,
    borderColor: colors.stroke.cyanSoft,
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    top: 1,
    bottom: 1,
    left: 1,
    backgroundColor: colors.cyan[500],
    shadowColor: colors.cyan[500],
    shadowOpacity: 0.75,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  ticks: {
    ...StyleSheet.absoluteFillObject,
  },
  tick: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(0,212,255,0.25)',
  },
  v: {
    width: 32,
    alignItems: 'flex-end',
  },
  d: {
    width: 36,
    alignItems: 'flex-end',
  },
});

export default StatBar;
