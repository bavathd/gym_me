import React from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  Orbitron_400Regular,
  Orbitron_700Bold,
} from '@expo-google-fonts/orbitron';
import { ShareTechMono_400Regular } from '@expo-google-fonts/share-tech-mono';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAppStore, todayKey } from '../lib/store';
import { evaluateYesterday } from '../lib/penalty';
import { scheduleDailyNotifications } from '../lib/notifications';
import { primeAudio } from '../lib/audio';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Orbitron_400Regular,
    Orbitron_700Bold,
    ShareTechMono_400Regular,
  });

  const onboarded = useAppStore((s) => s.onboarded);
  const penaltyActive = useAppStore((s) => s.penalty.active);
  const resetDailyQuest = useAppStore((s) => s.resetDailyQuest);
  const segments = useSegments();

  React.useEffect(() => {
    primeAudio();
    evaluateYesterday();
    resetDailyQuest(todayKey());
    scheduleDailyNotifications().catch(() => {});
  }, [resetDailyQuest]);

  React.useEffect(() => {
    if (!fontsLoaded) return;
    SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  React.useEffect(() => {
    if (!fontsLoaded) return;
    const first = segments[0];
    if (!onboarded && first !== 'onboarding') {
      router.replace('/onboarding/intro');
    } else if (onboarded && penaltyActive && first !== 'penalty') {
      router.replace('/penalty');
    }
  }, [fontsLoaded, onboarded, penaltyActive, segments]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0A1628' },
            animation: 'fade',
          }}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
