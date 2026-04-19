import React from 'react';
import { Pressable, StyleSheet, ViewStyle, StyleProp, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import SystemText from '../system/SystemText';
import { colors, spacing, radius } from '../../theme/tokens';
import { play } from '../../lib/audio';

export type SystemButtonProps = {
  label: string;
  onPress: () => void;
  tone?: 'cyan' | 'amber' | 'red';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

const toneColor = (t: NonNullable<SystemButtonProps['tone']>) =>
  t === 'amber' ? colors.amber : t === 'red' ? colors.red : colors.cyan;

export const SystemButton: React.FC<SystemButtonProps> = ({
  label,
  onPress,
  tone = 'cyan',
  size = 'md',
  disabled,
  style,
}) => {
  const color = toneColor(tone);
  const padding =
    size === 'lg' ? spacing.lg : size === 'sm' ? spacing.sm : spacing.md;

  return (
    <Pressable
      onPress={() => {
        if (disabled) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        play('tapBlip');
        onPress();
      }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          borderColor: color,
          paddingVertical: padding,
          paddingHorizontal: padding * 1.5,
          opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      <View
        style={[StyleSheet.absoluteFill, styles.glow, { shadowColor: color }]}
      />
      <SystemText
        variant="display"
        tone={tone}
        size={size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'md'}
      >
        {label.toUpperCase()}
      </SystemText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.navyPanel,
    borderWidth: 1,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    shadowOpacity: 0.8,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
});

export default SystemButton;
