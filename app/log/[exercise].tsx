import React from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import Screen from '../../components/ui/Screen';
import SystemPanel from '../../components/system/SystemPanel';
import SystemText from '../../components/system/SystemText';
import SystemButton from '../../components/ui/SystemButton';
import StatBar from '../../components/system/StatBar';
import { useAppStore } from '../../lib/store';
import { targetsFor } from '../../lib/quest';
import { spacing } from '../../theme/tokens';
import type { ExerciseId } from '../../lib/store';

const VALID: ExerciseId[] = ['pushups', 'situps', 'squats', 'run'];
const LABELS: Record<ExerciseId, string> = {
  pushups: 'PUSH-UPS',
  situps: 'SIT-UPS',
  squats: 'SQUATS',
  run: 'RUN',
};

export default function LogScreen() {
  const params = useLocalSearchParams<{ exercise?: string }>();
  const id = (params.exercise ?? '') as ExerciseId;
  const valid = (VALID as string[]).includes(id);

  const quest = useAppStore((s) => s.quest);
  const penalty = useAppStore((s) => s.penalty);
  const addReps = useAppStore((s) => s.addReps);
  const startRun = useAppStore((s) => s.startRun);
  const finishRun = useAppStore((s) => s.finishRun);

  const targets = targetsFor(penalty.compoundLevel);
  const isRun = id === 'run';

  const [runTracking, setRunTracking] = React.useState(false);
  const [runDistance, setRunDistance] = React.useState(0);
  const watchRef = React.useRef<Location.LocationSubscription | null>(null);
  const lastCoord = React.useRef<{ lat: number; lon: number } | null>(null);

  React.useEffect(() => {
    return () => {
      watchRef.current?.remove();
    };
  }, []);

  if (!valid) {
    return (
      <Screen>
        <SystemText variant="display" tone="red" size="lg">
          UNKNOWN EXERCISE
        </SystemText>
        <SystemButton label="Return" onPress={() => router.back()} />
      </Screen>
    );
  }

  const beginRun = async () => {
    const perm = await Location.requestForegroundPermissionsAsync();
    if (perm.status !== 'granted') return;
    setRunTracking(true);
    startRun();
    lastCoord.current = null;
    setRunDistance(0);
    watchRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        distanceInterval: 10,
        timeInterval: 3000,
      },
      (loc) => {
        const { latitude, longitude } = loc.coords;
        if (lastCoord.current) {
          const d = haversineKm(
            lastCoord.current.lat,
            lastCoord.current.lon,
            latitude,
            longitude,
          );
          setRunDistance((prev) => prev + d);
        }
        lastCoord.current = { lat: latitude, lon: longitude };
      },
    );
  };

  const stopRun = () => {
    watchRef.current?.remove();
    watchRef.current = null;
    setRunTracking(false);
    finishRun(Math.max(quest.run, runDistance));
  };

  const manualAddKm = (amount: number) => {
    finishRun(Math.max(quest.run, quest.run + amount));
  };

  return (
    <Screen scroll>
      <SystemText variant="display" tone="cyan" size="xxl">
        LOG · {LABELS[id]}
      </SystemText>

      <SystemPanel variant="cyan">
        <StatBar
          label={LABELS[id]}
          value={quest[id]}
          target={targets[id]}
          unit={isRun ? ' km' : ''}
        />
      </SystemPanel>

      {isRun ? (
        <View style={{ gap: spacing.md }}>
          <SystemPanel variant="cyan" pad="md">
            <SystemText variant="mono" tone="white" size="sm">
              {runTracking
                ? `Tracking · ${runDistance.toFixed(2)} km (session)`
                : 'GPS foreground tracking. Keep the app open while running.'}
            </SystemText>
          </SystemPanel>

          {runTracking ? (
            <SystemButton label="Stop Run" onPress={stopRun} tone="amber" />
          ) : (
            <SystemButton label="Start Run" onPress={beginRun} />
          )}

          <SystemPanel variant="amber" pad="md">
            <SystemText variant="mono" tone="amber" size="xs">
              Manual entry (for indoor / treadmill):
            </SystemText>
            <View
              style={{
                flexDirection: 'row',
                gap: spacing.sm,
                marginTop: spacing.sm,
              }}
            >
              <SystemButton
                label="+0.5 km"
                tone="amber"
                size="sm"
                onPress={() => manualAddKm(0.5)}
              />
              <SystemButton
                label="+1 km"
                tone="amber"
                size="sm"
                onPress={() => manualAddKm(1)}
              />
              <SystemButton
                label="+5 km"
                tone="amber"
                size="sm"
                onPress={() => manualAddKm(5)}
              />
            </View>
          </SystemPanel>
        </View>
      ) : (
        <View style={{ gap: spacing.md }}>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <SystemButton label="+1" onPress={() => addReps(id, 1)} size="lg" />
            <SystemButton
              label="+10"
              onPress={() => addReps(id, 10)}
              size="lg"
              tone="amber"
            />
          </View>
          <SystemButton
            label="-1 (undo)"
            onPress={() => addReps(id, -1)}
            size="sm"
            tone="amber"
          />
        </View>
      )}

      <SystemButton label="Return" onPress={() => router.back()} />
    </Screen>
  );
}

const haversineKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};
