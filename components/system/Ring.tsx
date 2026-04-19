import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import SystemText from './SystemText';
import { colors, spacing } from '../../theme/tokens';

export type RingProps = {
  value: number;
  max: number;
  label: string;
  size?: number;
};

/**
 * Circular progress ring. Used on the exercise-log screen. 220 × 220 default,
 * big mono number centered inside, label below.
 */
export const Ring: React.FC<RingProps> = ({
  value,
  max,
  label,
  size = 220,
}) => {
  const R = (size - 20) / 2;
  const C = 2 * Math.PI * R;
  const pct = Math.max(0, Math.min(1, max === 0 ? 0 : value / max));
  const offset = C * (1 - pct);

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <LinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={colors.cyan[200]} />
            <Stop offset="100%" stopColor={colors.cyan[500]} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={R}
          fill="none"
          stroke="rgba(0,212,255,0.15)"
          strokeWidth={2}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={R}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={4}
          strokeDasharray={`${C} ${C}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={styles.center}>
        <SystemText
          variant="mono"
          size="5xl"
          tone="cyan200"
          glow="lg"
          style={{ lineHeight: 72 }}
        >
          {String(Math.floor(value))}
        </SystemText>
        <View style={{ height: spacing[1] }} />
        <SystemText
          variant="heading"
          weight="semibold"
          size="2xs"
          tracking="widest"
          tone="secondary"
          uppercase
        >
          {`/ ${max} · ${label}`}
        </SystemText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
    transform: [{ rotate: '-90deg' }],
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Ring;
