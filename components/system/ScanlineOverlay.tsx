import React from 'react';
import { View, StyleSheet, Dimensions, AccessibilityInfo } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors } from '../../theme/tokens';

/**
 * Full-viewport scanline texture at ~4% opacity, drifting 3 px/6 s. Pauses
 * under prefers-reduced-motion.
 */
export const ScanlineOverlay: React.FC = () => {
  const { width, height } = Dimensions.get('window');
  const [reduceMotion, setReduceMotion] = React.useState(false);
  const shift = useSharedValue(0);

  React.useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => mounted && setReduceMotion(!!v))
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    if (reduceMotion) return;
    shift.value = withRepeat(
      withTiming(3, { duration: 6000, easing: Easing.linear }),
      -1,
      false,
    );
  }, [reduceMotion, shift]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: shift.value }],
  }));

  // Render every 3 px, 1 px tall. Clamp rows to screen height / 3 + 4 to cover
  // the 3 px drift.
  const rows = Math.ceil(height / 3) + 4;

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, style, { width }]}
    >
      {Array.from({ length: rows }).map((_, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            top: i * 3,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: 'rgba(0, 212, 255, 0.04)',
          }}
        />
      ))}
    </Animated.View>
  );
};

export const BackgroundGlow: React.FC = () => (
  <View pointerEvents="none" style={StyleSheet.absoluteFill}>
    {/* Radial ambient glow simulated with a centered faint disk at the top */}
    <View
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: colors.bg.void },
      ]}
    />
    <View style={styles.topGlow} />
    <View style={styles.bottomGlow} />
  </View>
);

const styles = StyleSheet.create({
  topGlow: {
    position: 'absolute',
    top: -160,
    left: '15%',
    right: '15%',
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
    opacity: 0.8,
  },
  bottomGlow: {
    position: 'absolute',
    bottom: -200,
    left: '25%',
    right: '25%',
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(0, 212, 255, 0.05)',
  },
});

export default ScanlineOverlay;
