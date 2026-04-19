import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import SystemText from './SystemText';
import SystemButton from './Button';
import { colors, motion, spacing } from '../../theme/tokens';
import { play } from '../../lib/audio';

const { width: W, height: H } = Dimensions.get('window');

export type LevelUpStat = { key: string; delta: string };

export type LevelUpSequenceProps = {
  visible: boolean;
  fromLevel: number;
  toLevel: number;
  stats?: LevelUpStat[];
  onDismiss: () => void;
};

export const LevelUpSequence: React.FC<LevelUpSequenceProps> = ({
  visible,
  fromLevel,
  toLevel,
  stats = [],
  onDismiss,
}) => {
  const [step, setStep] = React.useState(0);
  const burstOpacity = useSharedValue(0);
  const burstScale = useSharedValue(0.7);
  const burstBlur = useSharedValue(20);

  React.useEffect(() => {
    if (!visible) return;
    setStep(0);
    play('levelUpSwell');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});

    burstOpacity.value = withTiming(1, { duration: motion.duration.md });
    burstScale.value = withSequence(
      withTiming(1.04, {
        duration: motion.duration.md,
        easing: Easing.bezier(0.2, 0.8, 0.2, 1),
      }),
      withTiming(1, { duration: motion.duration.sm }),
    );
    burstBlur.value = withTiming(0, { duration: motion.duration.md });

    const t1 = setTimeout(() => setStep(1), 500);
    const t2 = setTimeout(() => setStep(2), 1400);
    const t3 = setTimeout(() => setStep(3), 2400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [visible, burstBlur, burstOpacity, burstScale]);

  const burstStyle = useAnimatedStyle(() => ({
    opacity: burstOpacity.value,
    transform: [{ scale: burstScale.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(motion.duration.md)}
      exiting={FadeOut.duration(motion.duration.sm)}
      style={styles.root}
    >
      <LinearGradient
        colors={['rgba(0,212,255,0.35)', 'rgba(5,11,20,0.96)', '#000000']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0.3 }}
        end={{ x: 0.5, y: 1 }}
      />

      <Animated.View style={[styles.burst, burstStyle]}>
        <SystemText
          variant="display"
          weight="black"
          size="5xl"
          tracking="widest"
          tone="cyan100"
          glow="lg"
          style={{ textAlign: 'center' }}
        >
          LEVEL UP
        </SystemText>
      </Animated.View>

      {step >= 1 && (
        <Animated.View entering={FadeIn} style={styles.levelRow}>
          <SystemText
            variant="heading"
            weight="bold"
            size="sm"
            tracking="widest"
            tone="cyan300"
          >
            {`${String(fromLevel).padStart(2, '0')}  →  `}
          </SystemText>
          <SystemText
            variant="heading"
            weight="bold"
            size="sm"
            tracking="widest"
            tone="cyan100"
            glow="md"
          >
            {String(toLevel).padStart(2, '0')}
          </SystemText>
        </Animated.View>
      )}

      {step >= 2 && (
        <Animated.View entering={FadeIn} style={styles.statsBox}>
          <SystemText
            variant="heading"
            weight="semibold"
            size="2xs"
            tracking="widest"
            tone="secondary"
            glow="none"
            uppercase
            style={{ textAlign: 'center' }}
          >
            ― ATTRIBUTES AWARDED ―
          </SystemText>
          <View style={{ height: spacing[4] }} />
          {stats.map((s, i) => (
            <StatRow key={s.key} statKey={s.key} delta={s.delta} index={i} />
          ))}
        </Animated.View>
      )}

      {step >= 3 && (
        <Animated.View entering={FadeIn} style={styles.continue}>
          <SystemButton onPress={onDismiss} size="lg">
            CONTINUE
          </SystemButton>
        </Animated.View>
      )}
    </Animated.View>
  );
};

const StatRow: React.FC<{ statKey: string; delta: string; index: number }> = ({
  statKey,
  delta,
  index,
}) => {
  const opacity = useSharedValue(0);
  const translate = useSharedValue(-8);
  React.useEffect(() => {
    opacity.value = withDelay(
      index * 120,
      withTiming(1, {
        duration: motion.duration.md,
        easing: Easing.bezier(0.2, 0.8, 0.2, 1),
      }),
    );
    translate.value = withDelay(
      index * 120,
      withTiming(0, { duration: motion.duration.md }),
    );
    if (index === 0) Haptics.selectionAsync().catch(() => {});
  }, [index, opacity, translate]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translate.value }],
  }));

  const zero = delta === '+0' || delta === '0';

  return (
    <Animated.View style={[styles.statRow, animStyle]}>
      <SystemText
        variant="mono"
        size="md"
        tone="cyan300"
        tracking="wider"
      >
        {statKey}
      </SystemText>
      <SystemText
        variant="mono"
        size="md"
        tone={zero ? 'muted' : 'cyan200'}
        glow={zero ? 'none' : 'sm'}
      >
        {`▲ ${delta}`}
      </SystemText>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: spacing[9],
    backgroundColor: '#000',
  },
  burst: {
    alignItems: 'center',
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[3],
  },
  statsBox: {
    marginTop: spacing[9],
    width: '100%',
    maxWidth: 280,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.stroke.cyanFaint,
  },
  continue: {
    marginTop: spacing[8],
  },
});

export default LevelUpSequence;
