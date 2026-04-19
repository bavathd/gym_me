import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, glow, radius, spacing } from '../../theme/tokens';
import SystemTextRaw from './SystemText';

export type PanelTone = 'cyan' | 'amber' | 'red';

export type PanelProps = {
  children: React.ReactNode;
  title?: string;
  tone?: PanelTone;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  pad?: keyof typeof spacing;
};

const borderForTone: Record<PanelTone, string> = {
  cyan: colors.stroke.cyan,
  amber: colors.stroke.amber,
  red: colors.stroke.red,
};

const bracketForTone: Record<PanelTone, string> = {
  cyan: colors.cyan[400],
  amber: colors.amber[500],
  red: colors.red[500],
};

const titleToneColor: Record<PanelTone, string> = {
  cyan: colors.cyan[200],
  amber: colors.amber[300],
  red: colors.red[300],
};

const shadowForTone: Record<PanelTone, ViewStyle> = {
  cyan: glow.cyan.sm,
  amber: glow.amber.sm,
  red: glow.red.sm,
};

/**
 * System Panel. Bracket L corners + 1 px stroke + outer glow + inner top glow +
 * translucent fill. This is the single card primitive for the whole app.
 */
export const Panel: React.FC<PanelProps> = ({
  children,
  title,
  tone = 'cyan',
  style,
  contentStyle,
  pad = 5,
}) => {
  const borderColor = borderForTone[tone];
  const bracketColor = bracketForTone[tone];
  const shadow = shadowForTone[tone];

  return (
    <View style={[styles.root, { borderColor }, shadow, style]}>
      {/* Inner top glow — simulated as a thin cyan strip at the top */}
      <View
        pointerEvents="none"
        style={[
          styles.innerGlow,
          { backgroundColor: tone === 'cyan' ? 'rgba(0,212,255,0.18)' : tone === 'amber' ? 'rgba(255,184,74,0.18)' : 'rgba(255,42,60,0.22)' },
        ]}
      />

      {/* Bracket corners */}
      <CornerBracket color={bracketColor} placement="tl" />
      <CornerBracket color={bracketColor} placement="tr" />
      <CornerBracket color={bracketColor} placement="bl" />
      <CornerBracket color={bracketColor} placement="br" />

      <View style={[{ padding: spacing[pad] }, contentStyle]}>
        {title ? <PanelTitle text={title} tone={tone} /> : null}
        {children}
      </View>
    </View>
  );
};

const PanelTitle: React.FC<{ text: string; tone: PanelTone }> = ({ text, tone }) => (
  <View style={styles.titleRow}>
    <View style={[styles.titleDash, { backgroundColor: colors.stroke.cyanSoft }]} />
    <SystemTextRaw
      variant="heading"
      weight="bold"
      size="xs"
      tracking="widest"
      tone={tone === 'cyan' ? 'cyan200' : tone === 'amber' ? 'amber300' : 'red300'}
      style={{ marginHorizontal: spacing[3] }}
    >
      {text.toUpperCase()}
    </SystemTextRaw>
    <View style={[styles.titleDash, { backgroundColor: colors.stroke.cyanSoft }]} />
  </View>
);

type Placement = 'tl' | 'tr' | 'bl' | 'br';

const CornerBracket: React.FC<{ color: string; placement: Placement; size?: number }> = ({
  color,
  placement,
  size = 10,
}) => {
  const thickness = 1.5;
  const extend = -2; // nudge outside the border like the CSS version
  const base: ViewStyle = {
    position: 'absolute',
    width: size,
    height: size,
  };
  const horiz: ViewStyle = { position: 'absolute', height: thickness, backgroundColor: color };
  const vert: ViewStyle = { position: 'absolute', width: thickness, backgroundColor: color };

  let pos: ViewStyle = {};
  let hStyle: ViewStyle = {};
  let vStyle: ViewStyle = {};
  if (placement === 'tl') {
    pos = { top: extend, left: extend };
    hStyle = { top: 0, left: 0, width: size };
    vStyle = { top: 0, left: 0, height: size };
  } else if (placement === 'tr') {
    pos = { top: extend, right: extend };
    hStyle = { top: 0, right: 0, width: size };
    vStyle = { top: 0, right: 0, height: size };
  } else if (placement === 'bl') {
    pos = { bottom: extend, left: extend };
    hStyle = { bottom: 0, left: 0, width: size };
    vStyle = { bottom: 0, left: 0, height: size };
  } else {
    pos = { bottom: extend, right: extend };
    hStyle = { bottom: 0, right: 0, width: size };
    vStyle = { bottom: 0, right: 0, height: size };
  }

  return (
    <View style={[base, pos]} pointerEvents="none">
      <View style={[horiz, hStyle, glowForColor(color)]} />
      <View style={[vert, vStyle, glowForColor(color)]} />
    </View>
  );
};

const glowForColor = (c: string) => ({
  shadowColor: c,
  shadowOpacity: 0.8,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: 0 },
  elevation: 2,
});

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.bg.panel,
    borderWidth: 1,
    borderRadius: radius[2],
  },
  innerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
    paddingBottom: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.stroke.cyanFaint,
  },
  titleDash: {
    width: 16,
    height: 1,
  },
});

export default Panel;
