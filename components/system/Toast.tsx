import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  SlideInUp,
  SlideOutUp,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import SystemText from './SystemText';
import { colors, spacing } from '../../theme/tokens';
import { play } from '../../lib/audio';

export type ToastKind = 'cyan' | 'red' | 'amber';

export type ToastProps = {
  visible: boolean;
  title: string;
  body?: string;
  kind?: ToastKind;
  durationMs?: number;
  onDismiss?: () => void;
};

/**
 * Top-docked system notification (called "Toast" in the design).
 * Matches the .toast card in kit.css: 1 px stroke + outer glow + single
 * left-side glowing dot + uppercase title + mono body.
 */
export const Toast: React.FC<ToastProps> = ({
  visible,
  title,
  body,
  kind = 'cyan',
  durationMs = 3200,
  onDismiss,
}) => {
  React.useEffect(() => {
    if (!visible) return;
    play(kind === 'red' ? 'errorDeny' : 'transmission');
    const t = setTimeout(() => onDismiss?.(), durationMs);
    return () => clearTimeout(t);
  }, [visible, durationMs, onDismiss, kind]);

  if (!visible) return null;

  const borderColor =
    kind === 'red'
      ? colors.stroke.red
      : kind === 'amber'
        ? colors.stroke.amber
        : colors.stroke.cyan;
  const dotColor =
    kind === 'red'
      ? colors.red[500]
      : kind === 'amber'
        ? colors.amber[500]
        : colors.cyan[500];
  const titleTone: 'cyan200' | 'amber300' | 'red300' =
    kind === 'red' ? 'red300' : kind === 'amber' ? 'amber300' : 'cyan200';

  return (
    <Animated.View
      entering={SlideInUp.duration(240)}
      exiting={SlideOutUp.duration(200)}
      style={styles.wrap}
    >
      <Animated.View entering={FadeIn} exiting={FadeOut}>
        <View style={[styles.card, { borderColor }]}>
          <View
            style={[
              styles.dot,
              {
                backgroundColor: dotColor,
                shadowColor: dotColor,
              },
            ]}
          />
          <View style={styles.col}>
            <SystemText
              variant="heading"
              weight="bold"
              size="xs"
              tracking="wider"
              tone={titleTone}
              uppercase
            >
              {title}
            </SystemText>
            {body ? (
              <View style={{ marginTop: 2 }}>
                <SystemText
                  variant="mono"
                  size="2xs"
                  tone="secondary"
                  glow="none"
                >
                  {body}
                </SystemText>
              </View>
            ) : null}
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: spacing[9],
    left: spacing[6],
    right: spacing[6],
    zIndex: 200,
  },
  card: {
    flexDirection: 'row',
    gap: spacing[3],
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.bg.toast,
    borderWidth: 1,
    shadowOpacity: 0.65,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    shadowColor: colors.cyan[500],
    elevation: 10,
  },
  dot: {
    width: 8,
    height: 8,
    shadowOpacity: 0.9,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  col: {
    flex: 1,
  },
});

export default Toast;
