import React from 'react';
import { View, StyleSheet } from 'react-native';
import SystemText from './SystemText';
import { colors, spacing } from '../../theme/tokens';

export type SystemStatusBarProps = {
  label?: string;
};

/**
 * Top iOS-style strip: time on the left, SYSTEM indicator on the right.
 * The actual OS status bar is hidden — this is the in-HUD replacement.
 */
export const SystemStatusBar: React.FC<SystemStatusBarProps> = ({
  label = 'SYSTEM',
}) => {
  const [time, setTime] = React.useState(() => formatTime(new Date()));

  React.useEffect(() => {
    const id = setInterval(() => setTime(formatTime(new Date())), 15_000);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={styles.root}>
      <SystemText variant="mono" size="sm" tone="primary" glow="none">
        {time}
      </SystemText>
      <View style={styles.right}>
        <View style={styles.dot} />
        <SystemText
          variant="heading"
          weight="semibold"
          size="2xs"
          tracking="widest"
          tone="cyan300"
          uppercase
        >
          {label}
        </SystemText>
      </View>
    </View>
  );
};

const formatTime = (d: Date) =>
  `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;

const styles = StyleSheet.create({
  root: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[7],
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.cyan[400],
    shadowColor: colors.cyan[400],
    shadowOpacity: 0.8,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
});

export default SystemStatusBar;
