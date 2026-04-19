import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import {
  Canvas,
  Rect,
  Group,
  RoundedRect,
  Blur,
} from '@shopify/react-native-skia';
import { colors, radius, spacing } from '../../theme/tokens';

type Variant = 'cyan' | 'amber' | 'red';

export type SystemPanelProps = {
  children: React.ReactNode;
  variant?: Variant;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  scanlines?: boolean;
  pad?: keyof typeof spacing;
};

const colorFor = (v: Variant): string => {
  if (v === 'amber') return colors.amber;
  if (v === 'red') return colors.red;
  return colors.cyan;
};

/**
 * Base panel. Skia draws the glowing border + optional scanlines behind the
 * content. Children sit on top in a normal RN view.
 */
export const SystemPanel: React.FC<SystemPanelProps> = ({
  children,
  variant = 'cyan',
  style,
  contentStyle,
  scanlines = true,
  pad = 'lg',
}) => {
  const [size, setSize] = React.useState({ w: 0, h: 0 });
  const stroke = colorFor(variant);

  return (
    <View
      style={[styles.root, style]}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setSize({ w: width, h: height });
      }}
    >
      {size.w > 0 && size.h > 0 && (
        <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
          {/* Panel fill */}
          <RoundedRect
            x={1}
            y={1}
            width={size.w - 2}
            height={size.h - 2}
            r={radius.md}
            color={colors.navyPanel}
          />

          {scanlines && (
            <Group opacity={0.55}>
              {Array.from({ length: Math.floor(size.h / 3) }).map((_, i) => (
                <Rect
                  key={i}
                  x={0}
                  y={i * 3}
                  width={size.w}
                  height={1}
                  color={colors.scanline}
                />
              ))}
            </Group>
          )}

          {/* Glow aura */}
          <Group opacity={0.6}>
            <RoundedRect
              x={-2}
              y={-2}
              width={size.w + 4}
              height={size.h + 4}
              r={radius.md + 2}
              color={stroke}
              style="stroke"
              strokeWidth={2}
            />
            <Blur blur={6} />
          </Group>

          {/* Crisp border */}
          <RoundedRect
            x={1}
            y={1}
            width={size.w - 2}
            height={size.h - 2}
            r={radius.md}
            color={stroke}
            style="stroke"
            strokeWidth={1.2}
          />

          {/* Corner tick marks */}
          {[
            { x: 0, y: 0 },
            { x: size.w - 14, y: 0 },
            { x: 0, y: size.h - 14 },
            { x: size.w - 14, y: size.h - 14 },
          ].map((p, i) => (
            <Rect
              key={i}
              x={p.x}
              y={p.y}
              width={14}
              height={2}
              color={stroke}
            />
          ))}
        </Canvas>
      )}
      <View style={[{ padding: spacing[pad] }, contentStyle]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.navyPanel,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
});

export default SystemPanel;
