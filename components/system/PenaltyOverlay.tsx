import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  Canvas,
  Rect,
  LinearGradient,
  vec,
  Blur,
  Group,
} from '@shopify/react-native-skia';
import SystemText from './SystemText';
import { colors, spacing, timing } from '../../theme/tokens';
import { play } from '../../lib/audio';

const { width: W, height: H } = Dimensions.get('window');

export type PenaltyOverlayProps = {
  visible: boolean;
  holdMs?: number;
  onDone?: () => void;
};

export const PenaltyOverlay: React.FC<PenaltyOverlayProps> = ({
  visible,
  holdMs = 3000,
  onDone,
}) => {
  const pulse = useSharedValue(0.6);

  React.useEffect(() => {
    if (!visible) return;
    play('penalty');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
      () => {},
    );
    pulse.value = withRepeat(withTiming(1, { duration: timing.slow }), -1, true);
    const t = setTimeout(() => onDone?.(), holdMs);
    return () => clearTimeout(t);
  }, [visible, holdMs, onDone, pulse]);

  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(180)}
      exiting={FadeOut.duration(240)}
      style={styles.root}
      pointerEvents="none"
    >
      <Canvas style={StyleSheet.absoluteFill}>
        <Rect x={0} y={0} width={W} height={H}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(W, H)}
            colors={['#2A0505', '#0A0000']}
          />
        </Rect>
        <Group opacity={0.6}>
          <Rect x={0} y={0} width={W} height={H} color={colors.penaltyTint} />
          <Blur blur={10} />
        </Group>
      </Canvas>

      <Animated.View style={[styles.center, pulseStyle]}>
        <SystemText variant="display" tone="red" size="hero">
          PENALTY ZONE
        </SystemText>
      </Animated.View>

      <View style={styles.caption}>
        <SystemText variant="mono" tone="red" size="md">
          Daily Quest failed. A penalty has been issued.
        </SystemText>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 900,
  },
  center: {
    alignItems: 'center',
  },
  caption: {
    position: 'absolute',
    bottom: spacing.xxxl,
    alignItems: 'center',
  },
});

export default PenaltyOverlay;
