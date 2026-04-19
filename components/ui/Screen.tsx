import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../../theme/tokens';

export type ScreenProps = {
  children: React.ReactNode;
  scroll?: boolean;
  tinted?: boolean;
};

export const Screen: React.FC<ScreenProps> = ({ children, scroll, tinted }) => {
  const Wrap = scroll ? ScrollView : View;
  return (
    <SafeAreaView
      style={[
        styles.root,
        tinted && { backgroundColor: '#0A0000' },
      ]}
    >
      <Wrap
        contentContainerStyle={scroll ? styles.scroll : undefined}
        style={!scroll ? styles.scroll : undefined}
      >
        {children}
      </Wrap>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.navy,
  },
  scroll: {
    flexGrow: 1,
    padding: spacing.lg,
    gap: spacing.lg,
  },
});

export default Screen;
