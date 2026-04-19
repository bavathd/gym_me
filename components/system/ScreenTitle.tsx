import React from 'react';
import { View, StyleSheet } from 'react-native';
import SystemText from './SystemText';
import { spacing } from '../../theme/tokens';

export type ScreenTitleProps = {
  over?: string;
  title: string;
  tone?: 'cyan' | 'amber' | 'red';
};

/**
 * Two-line screen header. Small `over` kicker + big heading-cased title,
 * tracked wide.
 */
export const ScreenTitle: React.FC<ScreenTitleProps> = ({
  over,
  title,
  tone = 'cyan',
}) => {
  const titleTone: 'cyan200' | 'amber300' | 'red300' =
    tone === 'amber' ? 'amber300' : tone === 'red' ? 'red300' : 'cyan200';
  return (
    <View style={styles.root}>
      {over ? (
        <SystemText
          variant="heading"
          weight="semibold"
          size="3xs"
          tracking="widest"
          tone="secondary"
          glow="none"
          uppercase
        >
          {over}
        </SystemText>
      ) : null}
      <View style={{ height: spacing[1] }} />
      <SystemText
        variant="heading"
        weight="bold"
        size="2xl"
        tracking="wider"
        tone={titleTone}
        glow={tone === 'red' ? 'red' : tone === 'amber' ? 'amber' : 'md'}
        uppercase
      >
        {title}
      </SystemText>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    marginBottom: spacing[5],
  },
});

export default ScreenTitle;
