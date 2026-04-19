import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import SystemText from './SystemText';
import { colors, spacing } from '../../theme/tokens';

export type SysHeaderProps = {
  level: number;
  rank: string;
  online?: boolean;
};

/**
 * LVL / RANK / ONLINE strip that sits directly below the status bar — the
 * persistent HUD frame. 44 px tall per spec.
 */
export const SysHeader: React.FC<SysHeaderProps> = ({
  level,
  rank,
  online = true,
}) => {
  const pulse = useSharedValue(0.6);
  React.useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
  }, [pulse]);

  const dotStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <View style={styles.root}>
      <View style={styles.group}>
        <SystemText
          variant="heading"
          weight="bold"
          size="2xs"
          tracking="widest"
          tone="secondary"
          glow="none"
        >
          LVL
        </SystemText>
        <SystemText
          variant="heading"
          weight="bold"
          size="2xs"
          tracking="widest"
          tone="cyan200"
        >
          {String(level).padStart(2, '0')}
        </SystemText>
      </View>
      <View style={styles.group}>
        <SystemText
          variant="heading"
          weight="bold"
          size="2xs"
          tracking="widest"
          tone="secondary"
          glow="none"
        >
          RANK
        </SystemText>
        <SystemText
          variant="heading"
          weight="bold"
          size="2xs"
          tracking="widest"
          tone="cyan200"
        >
          {`[ ${rank} ]`}
        </SystemText>
      </View>
      <View style={styles.group}>
        <Animated.View style={[styles.pulse, dotStyle]} />
        <SystemText
          variant="heading"
          weight="bold"
          size="2xs"
          tracking="widest"
          tone="cyan300"
          uppercase
        >
          {online ? 'ONLINE' : 'OFFLINE'}
        </SystemText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[6],
    borderBottomWidth: 1,
    borderBottomColor: colors.stroke.cyanFaint,
    backgroundColor: 'rgba(0, 212, 255, 0.03)',
  },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  pulse: {
    width: 8,
    height: 8,
    backgroundColor: colors.cyan[400],
    shadowColor: colors.cyan[400],
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
});

export default SysHeader;
