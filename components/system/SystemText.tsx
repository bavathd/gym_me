import React from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, fontSize, type as fonts } from '../../theme/tokens';
import { play } from '../../lib/audio';

type Variant = 'display' | 'displayRegular' | 'mono';
type Tone = 'cyan' | 'amber' | 'red' | 'white' | 'mute';

export type SystemTextProps = {
  children: string;
  variant?: Variant;
  tone?: Tone;
  size?: keyof typeof fontSize;
  typewriter?: boolean;
  speedMs?: number;
  haptic?: boolean;
  sound?: boolean;
  style?: StyleProp<TextStyle>;
  onDone?: () => void;
};

const toneColor = (t: Tone): string => {
  if (t === 'amber') return colors.amber;
  if (t === 'red') return colors.red;
  if (t === 'white') return colors.white;
  if (t === 'mute') return colors.mute;
  return colors.cyan;
};

export const SystemText: React.FC<SystemTextProps> = ({
  children,
  variant = 'mono',
  tone = 'cyan',
  size = 'md',
  typewriter = false,
  speedMs = 22,
  haptic = false,
  sound = false,
  style,
  onDone,
}) => {
  const [shown, setShown] = React.useState(typewriter ? '' : children);

  React.useEffect(() => {
    if (!typewriter) {
      setShown(children);
      return;
    }
    let i = 0;
    setShown('');
    const id = setInterval(() => {
      i += 1;
      setShown(children.slice(0, i));
      if (haptic && i % 2 === 0) {
        Haptics.selectionAsync().catch(() => {});
      }
      if (sound && i % 3 === 0) {
        play('tapBlip');
      }
      if (i >= children.length) {
        clearInterval(id);
        onDone?.();
      }
    }, speedMs);
    return () => clearInterval(id);
  }, [children, typewriter, speedMs, haptic, sound, onDone]);

  return (
    <Text
      style={[
        {
          color: toneColor(tone),
          fontFamily: fonts[variant],
          fontSize: fontSize[size],
          letterSpacing: variant === 'display' ? 2 : 1,
          textShadowColor: toneColor(tone),
          textShadowRadius: 6,
          textShadowOffset: { width: 0, height: 0 },
        },
        style,
      ]}
    >
      {shown}
    </Text>
  );
};

export default SystemText;
