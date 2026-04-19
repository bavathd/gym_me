import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import Screen from '../../components/ui/Screen';
import Panel from '../../components/system/Panel';
import SystemText from '../../components/system/SystemText';
import SystemButton from '../../components/system/Button';
import Ring from '../../components/system/Ring';
import ScreenTitle from '../../components/system/ScreenTitle';
import { useAppStore } from '../../lib/store';
import { targetsFor } from '../../lib/quest';
import { colors, spacing } from '../../theme/tokens';
import { play } from '../../lib/audio';
import type { ExerciseId } from '../../lib/store';

const VALID: ExerciseId[] = ['pushups', 'situps', 'squats', 'run'];
const LABELS: Record<ExerciseId, string> = {
  pushups: 'PUSH-UPS',
  situps: 'SIT-UPS',
  squats: 'SQUATS',
  run: 'RUN',
};
const OVERS: Record<ExerciseId, string> = {
  pushups: '― LOG · STRENGTH ―',
  situps: '― LOG · CORE ―',
  squats: '― LOG · POWER ―',
  run: '― RUN · ENDURANCE ―',
};

export default function LogScreen() {
  const params = useLocalSearchParams<{ exercise?: string }>();
  const id = (params.exercise ?? '') as ExerciseId;
  const valid = (VALID as string[]).includes(id);

  if (!valid) {
    return (
      <Screen>
        <SystemText variant="display" weight="bold" size="xl" tone="red300" glow="red" uppercase>
          UNKNOWN EXERCISE
        </SystemText>
        <View style={{ height: spacing[5] }} />
        <SystemButton onPress={() => router.back()}>RETURN</SystemButton>
      </Screen>
    );
  }

  if (id === 'run') return <RunScreen />;
  return <RepScreen id={id} />;
}

// ---------- Reps (pushups / situps / squats) ---------------------------------

const RepScreen: React.FC<{ id: ExerciseId }> = ({ id }) => {
  const quest = useAppStore((s) => s.quest);
  const penalty = useAppStore((s) => s.penalty);
  const addReps = useAppStore((s) => s.addReps);
  const targets = targetsFor(penalty.compoundLevel);
  const value = quest[id];
  const target = targets[id];

  const bigTap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    play('tapBlip');
    addReps(id, 1);
  };
  const plusTen = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    play('tapBlip10');
    addReps(id, 10);
  };
  const undo = () => {
    Haptics.selectionAsync().catch(() => {});
    addReps(id, -1);
  };

  return (
    <Screen scroll>
      <ScreenTitle over={OVERS[id]} title={LABELS[id]} />

      <View style={{ alignItems: 'center', marginVertical: spacing[5] }}>
        <Ring value={value} max={target} label={LABELS[id]} />
      </View>

      <Pressable
        onPress={bigTap}
        style={({ pressed }) => [
          styles.bigTap,
          pressed && { backgroundColor: 'rgba(0,212,255,0.15)' },
        ]}
      >
        <SystemText
          variant="display"
          weight="black"
          size="3xl"
          tone="cyan200"
          glow="lg"
        >
          {`+1`}
        </SystemText>
        <View style={{ height: spacing[2] }} />
        <SystemText
          variant="heading"
          weight="semibold"
          size="2xs"
          tracking="widest"
          tone="secondary"
          uppercase
        >
          TAP TO LOG
        </SystemText>
      </Pressable>

      <View style={{ height: spacing[5] }} />
      <View style={{ flexDirection: 'row', gap: spacing[4] }}>
        <View style={{ flex: 1 }}>
          <SystemButton block size="md" onPress={plusTen}>
            +10
          </SystemButton>
        </View>
        <View style={{ flex: 1 }}>
          <SystemButton block size="md" tone="amber" ghost onPress={undo}>
            UNDO
          </SystemButton>
        </View>
      </View>

      <View style={{ height: spacing[5] }} />
      <SystemButton size="lg" onPress={() => router.back()}>
        DONE
      </SystemButton>
    </Screen>
  );
};

const styles = StyleSheet.create({
  bigTap: {
    marginTop: spacing[4],
    paddingVertical: spacing[9],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.stroke.cyan,
    shadowColor: colors.cyan[500],
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
});

// ---------- Run --------------------------------------------------------------

const RunScreen: React.FC = () => {
  const quest = useAppStore((s) => s.quest);
  const penalty = useAppStore((s) => s.penalty);
  const startRun = useAppStore((s) => s.startRun);
  const finishRun = useAppStore((s) => s.finishRun);
  const targets = targetsFor(penalty.compoundLevel);

  const [tracking, setTracking] = React.useState(false);
  const [sessionKm, setSessionKm] = React.useState(0);
  const [startedAt, setStartedAt] = React.useState<number | null>(null);
  const [now, setNow] = React.useState(Date.now());
  const watchRef = React.useRef<Location.LocationSubscription | null>(null);
  const lastCoord = React.useRef<{ lat: number; lon: number } | null>(null);

  React.useEffect(() => {
    if (!tracking) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [tracking]);

  React.useEffect(() => {
    return () => {
      watchRef.current?.remove();
    };
  }, []);

  const elapsedMs = startedAt ? now - startedAt : 0;
  const paceMinPerKm =
    sessionKm > 0 ? elapsedMs / 60000 / sessionKm : 0;
  const kmh = sessionKm > 0 && elapsedMs > 0 ? (sessionKm / elapsedMs) * 3600000 : 0;

  const fmtPace = (p: number): string => {
    if (!isFinite(p) || p <= 0) return '--:--';
    const m = Math.floor(p);
    const s = Math.round((p - m) * 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };
  const fmtTime = (ms: number): string => {
    const s = Math.floor(ms / 1000);
    const m = String(Math.floor(s / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${m}:${sec}`;
  };

  const begin = async () => {
    const perm = await Location.requestForegroundPermissionsAsync();
    if (perm.status !== 'granted') return;
    setTracking(true);
    setSessionKm(0);
    const t = Date.now();
    setStartedAt(t);
    startRun(t);
    lastCoord.current = null;
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
          setSessionKm((prev) => prev + d);
        }
        lastCoord.current = { lat: latitude, lon: longitude };
      },
    );
  };

  const stop = () => {
    watchRef.current?.remove();
    watchRef.current = null;
    setTracking(false);
    finishRun(Math.max(quest.run, quest.run + sessionKm));
  };

  const manual = (km: number) => {
    finishRun(Math.max(quest.run, quest.run + km));
  };

  const kvs: Array<[string, string]> = [
    ['DISTANCE', `${sessionKm.toFixed(2)} KM`],
    ['TIME', fmtTime(elapsedMs)],
    ['PACE', `${fmtPace(paceMinPerKm)} /KM`],
    ['SPEED', `${kmh.toFixed(1)} KM/H`],
    ['TARGET', `${targets.run.toFixed(1)} KM`],
    ['TOTAL', `${quest.run.toFixed(2)} KM`],
  ];

  return (
    <Screen scroll>
      <ScreenTitle over="― RUN · ENDURANCE ―" title="TRACK RUN" />

      {/* Faux map */}
      <Panel tone="cyan" pad={0}>
        <View style={runStyles.map}>
          {Array.from({ length: 8 }).map((_, i) => (
            <View key={`r${i}`} style={[runStyles.gridRow, { top: i * 28 }]} />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <View key={`c${i}`} style={[runStyles.gridCol, { left: i * 40 }]} />
          ))}
          <View style={runStyles.routeDot} />
          <SystemText
            variant="heading"
            weight="semibold"
            size="3xs"
            tracking="widest"
            tone="secondary"
            uppercase
            style={{ position: 'absolute', top: spacing[3], left: spacing[3] }}
          >
            GPS · ACTIVE
          </SystemText>
        </View>
      </Panel>

      <View style={{ height: spacing[4] }} />
      <Panel title="TELEMETRY" tone="cyan">
        {kvs.map(([k, v]) => (
          <View
            key={k}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingVertical: spacing[2],
              borderBottomWidth: 1,
              borderBottomColor: colors.stroke.cyanFaint,
            }}
          >
            <SystemText
              variant="heading"
              weight="semibold"
              size="xs"
              tracking="widest"
              tone="secondary"
              uppercase
            >
              {k}
            </SystemText>
            <SystemText variant="mono" size="sm" tone="cyan200" glow="sm">
              {`[ ${v} ]`}
            </SystemText>
          </View>
        ))}
      </Panel>

      <View style={{ height: spacing[5] }} />
      {tracking ? (
        <SystemButton size="lg" tone="amber" onPress={stop}>
          PAUSE · COMMIT
        </SystemButton>
      ) : (
        <SystemButton size="lg" onPress={begin}>
          BEGIN RUN
        </SystemButton>
      )}

      <View style={{ height: spacing[5] }} />
      <Panel title="MANUAL · TREADMILL" tone="amber">
        <View style={{ flexDirection: 'row', gap: spacing[3] }}>
          <View style={{ flex: 1 }}>
            <SystemButton block size="sm" tone="amber" onPress={() => manual(0.5)}>
              +0.5 KM
            </SystemButton>
          </View>
          <View style={{ flex: 1 }}>
            <SystemButton block size="sm" tone="amber" onPress={() => manual(1)}>
              +1 KM
            </SystemButton>
          </View>
          <View style={{ flex: 1 }}>
            <SystemButton block size="sm" tone="amber" onPress={() => manual(5)}>
              +5 KM
            </SystemButton>
          </View>
        </View>
      </Panel>

      <View style={{ height: spacing[5] }} />
      <SystemButton size="md" ghost onPress={() => router.back()}>
        RETURN
      </SystemButton>
    </Screen>
  );
};

const runStyles = StyleSheet.create({
  map: {
    height: 224,
    backgroundColor: 'rgba(0,212,255,0.04)',
    borderBottomWidth: 1,
    borderBottomColor: colors.stroke.cyanFaint,
    position: 'relative',
    overflow: 'hidden',
  },
  gridRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0,212,255,0.08)',
  },
  gridCol: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(0,212,255,0.08)',
  },
  routeDot: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 12,
    height: 12,
    marginLeft: -6,
    marginTop: -6,
    backgroundColor: colors.cyan[500],
    shadowColor: colors.cyan[500],
    shadowOpacity: 0.9,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
});

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
