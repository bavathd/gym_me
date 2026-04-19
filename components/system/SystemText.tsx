import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  TextStyle,
  StyleProp,
  AccessibilityInfo,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  colors,
  fonts,
  fontSize,
  tracking as trackingTokens,
  textGlow,
} from '../../theme/tokens';
import { play } from '../../lib/audio';

export type TextVariant = 'display' | 'heading' | 'mono';
export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold' | 'black';
export type TextTone =
  | 'cyan100'
  | 'cyan200'
  | 'cyan300'
  | 'amber300'
  | 'red300'
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'inverse';
export type TextSize = keyof typeof fontSize;
export type TextTracking = keyof typeof trackingTokens;

export type SystemTextProps = {
  children: string;
  variant?: TextVariant;
  weight?: TextWeight;
  size?: TextSize;
  tracking?: TextTracking;
  tone?: TextTone;
  glow?: keyof typeof textGlow | 'none';
  typewriter?: boolean;
  speedMs?: number;
  haptic?: boolean;
  sound?: boolean;
  uppercase?: boolean;
  style?: StyleProp<TextStyle>;
  onDone?: () => void;
};

const toneColor: Record<TextTone, string> = {
  cyan100: colors.cyan[100],
  cyan200: colors.cyan[200],
  cyan300: colors.cyan[300],
  amber300: colors.amber[300],
  red300: colors.red[300],
  primary: colors.text.primary,
  secondary: colors.text.secondary,
  muted: colors.text.muted,
  inverse: colors.text.inverse,
};

const fontFor = (variant: TextVariant, weight: TextWeight): string => {
  if (variant === 'display') {
    return weight === 'bold' ? fonts.displayBold : fonts.display;
  }
  if (variant === 'heading') {
    if (weight === 'regular') return fonts.headingReg;
    if (weight === 'medium') return fonts.headingMed;
    if (weight === 'semibold') return fonts.headingSemi;
    return fonts.heading;
  }
  return fonts.mono;
};

const defaultGlow = (variant: TextVariant, tone: TextTone): keyof typeof textGlow | 'none' => {
  if (tone === 'amber300') return 'amber';
  if (tone === 'red300') return 'red';
  if (tone === 'muted' || tone === 'secondary' || tone === 'inverse') return 'none';
  if (variant === 'display') return 'md';
  return 'sm';
};

/**
 * SystemText. Primitive for every piece of copy in the System.
 * Supports typewriter reveal with per-character haptic + audio tick.
 */
export const SystemText: React.FC<SystemTextProps> = ({
  children,
  variant = 'mono',
  weight = 'regular',
  size = 'sm',
  tracking = 'normal',
  tone = 'primary',
  glow,
  typewriter = false,
  speedMs = 28,
  haptic = false,
  sound = false,
  uppercase = false,
  style,
  onDone,
}) => {
  const [reduceMotion, setReduceMotion] = React.useState(false);
  const [shown, setShown] = React.useState<string>(typewriter ? '' : children);
  const done = !typewriter || shown.length >= children.length;

  React.useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => mounted && setReduceMotion(!!v))
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    if (!typewriter) {
      setShown(children);
      return;
    }
    if (reduceMotion) {
      setShown(children);
      onDone?.();
      return;
    }
    let i = 0;
    setShown('');
    const id = setInterval(() => {
      i += 1;
      setShown(children.slice(0, i));
      if (haptic && i % 3 === 0) {
        Haptics.selectionAsync().catch(() => {});
      }
      if (sound && i % 2 === 0) {
        play('typeBeep');
      }
      if (i >= children.length) {
        clearInterval(id);
        onDone?.();
      }
    }, speedMs);
    return () => clearInterval(id);
  }, [children, typewriter, speedMs, haptic, sound, reduceMotion, onDone]);

  const resolvedGlow = glow ?? defaultGlow(variant, tone);
  const textShadow = resolvedGlow === 'none' ? null : textGlow[resolvedGlow];

  const textStyle: TextStyle = {
    color: toneColor[tone],
    fontFamily: fontFor(variant, weight),
    fontSize: fontSize[size],
    letterSpacing: trackingTokens[tracking],
    textTransform: uppercase || variant === 'heading' ? 'uppercase' : 'none',
    lineHeight: Math.round(fontSize[size] * 1.25),
  };

  return (
    <View style={styles.row}>
      <Text style={[textStyle, textShadow, style]}>
        {uppercase ? shown.toUpperCase() : shown}
      </Text>
      {typewriter && !done ? (
        <View
          style={[
            styles.cursor,
            {
              height: Math.round(fontSize[size] * 1.1),
              backgroundColor: colors.cyan[400],
            },
          ]}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  cursor: {
    width: 8,
    marginLeft: 2,
    shadowColor: colors.cyan[400],
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
});

export default SystemText;
