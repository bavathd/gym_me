import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import {
  Canvas,
  Circle,
  Group,
  Blur,
  RadialGradient,
  vec,
  Rect,
} from '@shopify/react-native-skia';
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import SystemText from './SystemText';
import { colors, spacing, timing } from '../../theme/tokens';
import { play } from '../../lib/audio';

export type LevelUpSequenceProps = {
  visible: boolean;
  level: number;
  rank?: string;
  onDone?: () => void;
};

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export const LevelUpSequence: React.FC<LevelUpSequenceProps> = ({
  visible,
  level,
  rank,
  onDone,
}) => {
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (!visible) return;
    play('levelUp');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {},
    );
    opacity.value = withTiming(1, { duration: timing.base });
    scale.value = withSequence(
      withTiming(1.1, { duration: timing.slow }),
      withTiming(1, { duration: timing.base }),
    );
    const t = setTimeout(() => onDone?.(), timing.dramatic + 1200);
    return () => clearTimeout(t);
  }, [visible, onDone, opacity, scale]);

  const textStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(160)}
      exiting={FadeOut.duration(200)}
      style={styles.root}
      pointerEvents="none"
    >
      <Canvas style={StyleSheet.absoluteFill}>
        <Rect x={0} y={0} width={SCREEN_W} height={SCREEN_H} color="#050B14" />
        <Group>
          <Circle
            cx={SCREEN_W / 2}
            cy={SCREEN_H / 2}
            r={Math.max(SCREEN_W, SCREEN_H) * 0.6}
          >
            <RadialGradient
              c={vec(SCREEN_W / 2, SCREEN_H / 2)}
              r={Math.max(SCREEN_W, SCREEN_H) * 0.6}
              colors={['#00D4FF', '#0A1628', '#050B14']}
            />
          </Circle>
          <Blur blur={30} />
        </Group>
      </Canvas>

      <Animated.View style={[styles.content, textStyle]}>
        <SystemText variant="display" tone="cyan" size="display">
          LEVEL UP
        </SystemText>
        <View style={{ height: spacing.md }} />
        <SystemText variant="mono" tone="white" size="xl">
          {`Level ${level}${rank ? ` · Rank ${rank}` : ''}`}
        </SystemText>
        <View style={{ height: spacing.sm }} />
        <SystemText
          variant="mono"
          tone="mute"
          size="md"
          typewriter
          haptic
          sound
          speedMs={28}
        >
          {'You have grown stronger. Continue the quest.'}
        </SystemText>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.navyDeep,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  content: {
    alignItems: 'center',
  },
});

export default LevelUpSequence;
