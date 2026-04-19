import React from 'react';
import { View, StyleSheet } from 'react-native';
import SystemText from './SystemText';
import { colors, spacing } from '../../theme/tokens';

export type WarnLineProps = {
  children: string;
};

/**
 * Amber warning strip. Used on the home screen below the quest panel.
 */
export const WarnLine: React.FC<WarnLineProps> = ({ children }) => (
  <View style={styles.root}>
    <SystemText variant="mono" size="2xs" tone="amber300" glow="amber">
      {`⚠  ${children}`}
    </SystemText>
  </View>
);

const styles = StyleSheet.create({
  root: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderWidth: 1,
    borderColor: colors.stroke.amber,
    shadowColor: colors.amber[500],
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
    marginTop: spacing[5],
  },
});

export default WarnLine;
