import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import SystemText from './SystemText';
import { colors, spacing, motion } from '../../theme/tokens';

export type QuestRowProps = {
  label: string;
  value: number;
  target: number;
  unit?: string;
  decimal?: boolean;
  onPress?: () => void;
};

const format = (n: number, decimal?: boolean): string =>
  decimal ? n.toFixed(1) : String(Math.floor(n)).padStart(3, '0');

export const QuestRow: React.FC<QuestRowProps> = ({
  label,
  value,
  target,
  unit,
  decimal,
  onPress,
}) => {
  const pct = Math.max(0, Math.min(1, target === 0 ? 0 : value / target));
  const done = value >= target;

  const fill = useSharedValue(pct);
  React.useEffect(() => {
    fill.value = withTiming(pct, {
      duration: motion.duration.lg,
      easing: Easing.bezier(
        motion.easing[0],
        motion.easing[1],
        motion.easing[2],
        motion.easing[3],
      ),
    });
  }, [pct, fill]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fill.value * 100}%`,
  }));

  return (
    <Pressable
      onPress={() => {
        if (!onPress) return;
        Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      style={({ pressed }) => [
        styles.root,
        done && styles.rootDone,
        pressed && styles.rootPressed,
      ]}
    >
      <View style={[styles.check, done && styles.checkDone]}>
        {done ? (
          <SystemText variant="mono" size="xs" tone="cyan300" glow="sm">
            ✓
          </SystemText>
        ) : null}
      </View>

      <View style={styles.col}>
        <View style={styles.row}>
          <SystemText
            variant="heading"
            weight="bold"
            size="sm"
            tracking="wider"
            tone="cyan200"
            style={{ flex: 1 }}
          >
            {label.toUpperCase()}
          </SystemText>
          <SystemText variant="mono" size="xs" tone="primary" glow="sm">
            {`[ ${format(value, decimal)} / ${format(target, decimal)}${unit ? ' ' + unit : ''} ]`}
          </SystemText>
        </View>

        <View style={styles.barTrack}>
          <Animated.View style={[styles.barFill, fillStyle]} />
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    backgroundColor: 'rgba(10,22,40,0.55)',
    borderWidth: 1,
    borderColor: colors.stroke.cyanSoft,
    marginBottom: spacing[3],
  },
  rootDone: {
    borderColor: colors.stroke.cyan,
    shadowColor: colors.cyan[500],
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  rootPressed: {
    borderColor: colors.stroke.cyan,
    transform: [{ scale: 0.99 }],
  },
  check: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderColor: colors.cyan[400],
    marginRight: spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: {
    borderColor: colors.cyan[300],
    shadowColor: colors.cyan[400],
    shadowOpacity: 0.8,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  col: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  barTrack: {
    height: 4,
    backgroundColor: 'rgba(0,212,255,0.12)',
    borderWidth: 1,
    borderColor: colors.stroke.cyanFaint,
    marginTop: spacing[3],
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.cyan[500],
    shadowColor: colors.cyan[500],
    shadowOpacity: 0.75,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
});

export default QuestRow;
