import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import SystemText from './SystemText';
import SystemButton from './Button';
import { colors, spacing, motion } from '../../theme/tokens';
import { play } from '../../lib/audio';

export type PenaltyOverlayProps = {
  visible: boolean;
  holdSeconds?: number;
  penaltyQuest: { label: string; target: string }[];
  frozenStats: string;
  onAccept: () => void;
};

export const PenaltyOverlay: React.FC<PenaltyOverlayProps> = ({
  visible,
  holdSeconds = 3,
  penaltyQuest,
  frozenStats,
  onAccept,
}) => {
  const [hold, setHold] = React.useState(holdSeconds);
  const pulse = useSharedValue(0.6);

  React.useEffect(() => {
    if (!visible) return;
    setHold(holdSeconds);
    play('penaltyAlarm');
    // Two error haptics 500 ms apart, as per sound_map.md.
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
      () => {},
    );
    const t2 = setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
        () => {},
      );
    }, 500);
    pulse.value = withRepeat(
      withTiming(1, {
        duration: 700,
        easing: Easing.bezier(0.2, 0.8, 0.2, 1),
      }),
      -1,
      true,
    );
    return () => clearTimeout(t2);
  }, [visible, holdSeconds, pulse]);

  React.useEffect(() => {
    if (!visible) return;
    if (hold <= 0) return;
    const id = setTimeout(() => setHold((h) => h - 1), 1000);
    return () => clearTimeout(id);
  }, [hold, visible]);

  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(motion.duration.md)}
      exiting={FadeOut.duration(motion.duration.sm)}
      style={styles.root}
    >
      <LinearGradient
        colors={['rgba(255,42,60,0.4)', 'rgba(30,0,4,0.98)', '#000000']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0.3 }}
        end={{ x: 0.5, y: 1 }}
      />
      <Animated.View style={[StyleSheet.absoluteFill, styles.pulseRing, pulseStyle]} pointerEvents="none" />

      <SystemText
        variant="display"
        weight="black"
        size="3xl"
        tracking="widest"
        tone="red300"
        glow="red"
        uppercase
        style={{ textAlign: 'center' }}
      >
        PENALTY ZONE
      </SystemText>

      <View style={{ height: spacing[4] }} />
      <SystemText
        variant="heading"
        weight="bold"
        size="2xs"
        tracking="widest"
        tone="red300"
        glow="red"
        uppercase
      >
        YOU HAVE ENTERED
      </SystemText>

      <View style={styles.card}>
        <CornerRed placement="tl" />
        <CornerRed placement="br" />

        <SystemText
          variant="heading"
          weight="semibold"
          size="3xs"
          tracking="widest"
          tone="red300"
          uppercase
        >
          STATS · FROZEN
        </SystemText>
        <View style={{ height: spacing[3] }} />
        <View style={styles.frozenRow}>
          <SystemText variant="mono" size="xs" tone="red300" glow="red">
            {frozenStats}
          </SystemText>
          <SystemText variant="mono" size="xs" tone="red300" glow="red">
            ⊘
          </SystemText>
        </View>

        <View style={styles.divider} />

        <SystemText
          variant="heading"
          weight="semibold"
          size="3xs"
          tracking="widest"
          tone="red300"
          uppercase
        >
          PENALTY QUEST
        </SystemText>
        <View style={{ height: spacing[3] }} />
        {penaltyQuest.map((q, i) => (
          <View key={i} style={{ flexDirection: 'row' }}>
            <SystemText variant="mono" size="xs" tone="red300">
              {`> ${q.label} · ${q.target}`}
            </SystemText>
          </View>
        ))}
      </View>

      <View style={{ height: spacing[8] }} />
      <SystemButton
        tone="danger"
        size="lg"
        disabled={hold > 0}
        onPress={onAccept}
      >
        {hold > 0 ? `HOLD · ${hold}` : 'ACCEPT PENALTY'}
      </SystemButton>
    </Animated.View>
  );
};

const CornerRed: React.FC<{ placement: 'tl' | 'br' }> = ({ placement }) => {
  const thickness = 1.5;
  const size = 10;
  const pos =
    placement === 'tl' ? { top: -2, left: -2 } : { bottom: -2, right: -2 };
  return (
    <View style={[styles.redCornerWrap, pos, { width: size, height: size }]}>
      <View
        style={[
          styles.redStroke,
          placement === 'tl'
            ? { top: 0, left: 0, width: size, height: thickness }
            : { bottom: 0, right: 0, width: size, height: thickness },
        ]}
      />
      <View
        style={[
          styles.redStroke,
          placement === 'tl'
            ? { top: 0, left: 0, width: thickness, height: size }
            : { bottom: 0, right: 0, width: thickness, height: size },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: spacing[8],
    backgroundColor: '#000',
  },
  pulseRing: {
    backgroundColor: 'transparent',
    shadowColor: colors.red[500],
    shadowOpacity: 0.5,
    shadowRadius: 60,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  card: {
    position: 'relative',
    marginTop: spacing[7],
    width: '100%',
    maxWidth: 320,
    borderWidth: 1,
    borderColor: colors.stroke.red,
    backgroundColor: 'rgba(30,0,6,0.6)',
    padding: spacing[4],
    shadowColor: colors.red[500],
    shadowOpacity: 0.4,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  frozenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    opacity: 0.75,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,42,60,0.25)',
    marginVertical: spacing[4],
  },
  redCornerWrap: {
    position: 'absolute',
  },
  redStroke: {
    position: 'absolute',
    backgroundColor: colors.red[500],
    shadowColor: colors.red[500],
    shadowOpacity: 0.8,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
});

export default PenaltyOverlay;
