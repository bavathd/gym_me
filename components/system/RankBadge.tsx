import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import SystemText from './SystemText';
import { colors, glow, radius } from '../../theme/tokens';

export type RankBadgeProps = {
  rank: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Square rank badge (E / D / C / B / A / S). 1 px cyan stroke + outer glow +
 * Orbitron Black letter centered. Rounded corners are not allowed — see
 * design README.
 */
export const RankBadge: React.FC<RankBadgeProps> = ({
  rank,
  size = 64,
  style,
}) => (
  <View
    style={[
      styles.root,
      {
        width: size,
        height: size * 1.18,
        borderColor: colors.stroke.cyan,
      },
      glow.cyan.sm,
      style,
    ]}
  >
    <SystemText
      variant="display"
      weight="black"
      size="4xl"
      tone="cyan200"
      glow="lg"
      style={{ textAlign: 'center' }}
    >
      {rank}
    </SystemText>
  </View>
);

const styles = StyleSheet.create({
  root: {
    borderWidth: 1,
    borderRadius: radius[2],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 212, 255, 0.06)',
  },
});

export default RankBadge;
