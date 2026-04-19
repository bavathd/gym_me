import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import SystemText from './SystemText';
import { colors, glow, spacing, motion } from '../../theme/tokens';
import { play } from '../../lib/audio';

export type SystemButtonTone = 'cyan' | 'amber' | 'danger';
export type SystemButtonSize = 'sm' | 'md' | 'lg';

export type SystemButtonProps = {
  children: string;
  onPress: () => void;
  tone?: SystemButtonTone;
  size?: SystemButtonSize;
  block?: boolean;
  ghost?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  haptic?: Haptics.ImpactFeedbackStyle;
};

const borderFor: Record<SystemButtonTone, string> = {
  cyan: colors.stroke.cyan,
  amber: colors.stroke.amber,
  danger: colors.stroke.red,
};

const bracketFor: Record<SystemButtonTone, string> = {
  cyan: colors.cyan[400],
  amber: colors.amber[500],
  danger: colors.red[500],
};

const textToneFor: Record<SystemButtonTone, 'cyan200' | 'amber300' | 'red300'> = {
  cyan: 'cyan200',
  amber: 'amber300',
  danger: 'red300',
};

const shadowFor: Record<SystemButtonTone, ViewStyle> = {
  cyan: glow.cyan.sm,
  amber: glow.amber.sm,
  danger: glow.red.sm,
};

export const SystemButton: React.FC<SystemButtonProps> = ({
  children,
  onPress,
  tone = 'cyan',
  size = 'md',
  block,
  ghost,
  disabled,
  style,
  haptic = Haptics.ImpactFeedbackStyle.Light,
}) => {
  const scale = useSharedValue(1);
  const press = () => {
    scale.value = withSequence(
      withTiming(0.98, { duration: motion.duration.xs }),
      withTiming(1, { duration: motion.duration.sm }),
    );
  };
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const padV = size === 'lg' ? spacing[5] : size === 'sm' ? spacing[3] : spacing[4];
  const padH = size === 'lg' ? spacing[8] : size === 'sm' ? spacing[5] : spacing[7];
  const fontSize = size === 'lg' ? 'md' : size === 'sm' ? 'xs' : 'sm';
  const track = size === 'lg' ? 'brutal' : 'widest';

  return (
    <Animated.View style={[block && styles.block, style, animStyle]}>
      <Pressable
        onPress={() => {
          if (disabled) return;
          Haptics.impactAsync(haptic).catch(() => {});
          play('tapBlip');
          press();
          onPress();
        }}
        disabled={disabled}
        style={({ pressed }) => [
          styles.base,
          {
            borderColor: borderFor[tone],
            paddingVertical: padV,
            paddingHorizontal: padH,
            opacity: disabled ? 0.35 : 1,
            backgroundColor: pressed ? 'rgba(0,212,255,0.12)' : 'transparent',
          },
          !ghost && !disabled && shadowFor[tone],
          block && styles.block,
        ]}
      >
        <Corner placement="tl" color={bracketFor[tone]} />
        <Corner placement="br" color={bracketFor[tone]} />

        <SystemText
          variant="heading"
          weight="bold"
          size={fontSize}
          tracking={track}
          tone={disabled ? 'muted' : textToneFor[tone]}
          glow={disabled ? 'none' : undefined}
          uppercase
        >
          {`[ ${children} ]`}
        </SystemText>
      </Pressable>
    </Animated.View>
  );
};

const Corner: React.FC<{ placement: 'tl' | 'br'; color: string }> = ({
  placement,
  color,
}) => {
  const thickness = 1.5;
  const size = 8;
  const pos: ViewStyle =
    placement === 'tl'
      ? { top: -2, left: -2 }
      : { bottom: -2, right: -2 };
  return (
    <View style={[styles.corner, pos, { width: size, height: size }]}>
      <View
        style={[
          styles.cornerStroke,
          placement === 'tl' ? { top: 0, left: 0, width: size, height: thickness } : { bottom: 0, right: 0, width: size, height: thickness },
          { backgroundColor: color },
        ]}
      />
      <View
        style={[
          styles.cornerStroke,
          placement === 'tl' ? { top: 0, left: 0, width: thickness, height: size } : { bottom: 0, right: 0, width: thickness, height: size },
          { backgroundColor: color },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  block: {
    width: '100%',
  },
  base: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  corner: {
    position: 'absolute',
  },
  cornerStroke: {
    position: 'absolute',
  },
});

export default SystemButton;
