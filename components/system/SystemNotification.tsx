import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInUp,
  SlideOutUp,
} from 'react-native-reanimated';
import SystemPanel from './SystemPanel';
import SystemText from './SystemText';
import { spacing } from '../../theme/tokens';
import { play } from '../../lib/audio';

export type SystemNotificationProps = {
  title: string;
  body?: string;
  tone?: 'cyan' | 'amber' | 'red';
  visible: boolean;
  onDismiss?: () => void;
  durationMs?: number;
};

export const SystemNotification: React.FC<SystemNotificationProps> = ({
  title,
  body,
  tone = 'cyan',
  visible,
  onDismiss,
  durationMs = 3200,
}) => {
  React.useEffect(() => {
    if (!visible) return;
    play('ding');
    const t = setTimeout(() => onDismiss?.(), durationMs);
    return () => clearTimeout(t);
  }, [visible, durationMs, onDismiss]);

  if (!visible) return null;

  return (
    <Animated.View
      entering={SlideInUp.duration(240)}
      exiting={SlideOutUp.duration(200)}
      style={styles.wrap}
    >
      <Animated.View entering={FadeIn} exiting={FadeOut}>
        <SystemPanel variant={tone} pad="md">
          <SystemText variant="display" tone={tone} size="md">
            {title.toUpperCase()}
          </SystemText>
          {body ? (
            <View style={{ marginTop: spacing.xs }}>
              <SystemText variant="mono" tone="white" size="sm">
                {body}
              </SystemText>
            </View>
          ) : null}
        </SystemPanel>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: spacing.xl,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 100,
  },
});

export default SystemNotification;
