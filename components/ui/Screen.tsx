import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import SystemStatusBar from '../system/StatusBar';
import SysHeader from '../system/SysHeader';
import TabBar, { TabId } from '../system/TabBar';
import { BackgroundGlow, ScanlineOverlay } from '../system/ScanlineOverlay';
import { colors, spacing } from '../../theme/tokens';
import { useAppStore } from '../../lib/store';

export type ScreenProps = {
  children: React.ReactNode;
  scroll?: boolean;
  tinted?: boolean;
  hideStatusBar?: boolean;
  hideSysHeader?: boolean;
  showTabBar?: boolean;
  activeTab?: TabId;
  onTabChange?: (id: TabId) => void;
  contentPad?: boolean;
};

/**
 * Base screen frame. Void background + scanline overlay + StatusBar +
 * SysHeader + optional TabBar. Individual screens supply content inside.
 */
export const Screen: React.FC<ScreenProps> = ({
  children,
  scroll,
  tinted,
  hideStatusBar,
  hideSysHeader,
  showTabBar,
  activeTab = 'home',
  onTabChange,
  contentPad = true,
}) => {
  const insets = useSafeAreaInsets();
  const level = useAppStore((s) => s.level);
  const rank = useAppStore((s) => s.rank);

  const Wrap: React.ComponentType<any> = scroll ? ScrollView : View;
  const wrapStyle = scroll
    ? { contentContainerStyle: [styles.scroll, contentPad && styles.scrollPad] }
    : { style: [styles.contentFlex, contentPad && styles.scrollPad] };

  return (
    <View style={[styles.root, tinted && styles.rootTinted]}>
      <BackgroundGlow />
      <ScanlineOverlay />
      <SafeAreaView style={StyleSheet.absoluteFill} edges={['top', 'left', 'right']}>
        {!hideStatusBar && <SystemStatusBar />}
        {!hideSysHeader && <SysHeader level={level} rank={rank} />}
        <Wrap {...wrapStyle}>{children}</Wrap>
        {showTabBar && onTabChange && (
          <View style={{ paddingBottom: Math.max(insets.bottom, 0) }}>
            <TabBar active={activeTab} onChange={onTabChange} />
          </View>
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg.void,
  },
  rootTinted: {
    backgroundColor: '#0A0000',
  },
  scroll: {
    flexGrow: 1,
  },
  scrollPad: {
    padding: spacing[6],
    gap: spacing[4],
  },
  contentFlex: {
    flex: 1,
  },
});

export default Screen;
