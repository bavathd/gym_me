import { Audio } from 'expo-av';

export type SoundId =
  | 'questIssue'
  | 'tapBlip'
  | 'tapBlip10'
  | 'typeBeep'
  | 'completeChime'
  | 'levelUpSwell'
  | 'rankUpFanfare'
  | 'penaltyAlarm'
  | 'penaltyAmbience'
  | 'transmission'
  | 'errorDeny';

const SOURCES: Record<SoundId, number | null> = {
  // Drop matching files into assets/sounds/ and uncomment.
  questIssue: null,
  tapBlip: null,
  tapBlip10: null,
  typeBeep: null,
  completeChime: null,
  levelUpSwell: null,
  rankUpFanfare: null,
  penaltyAlarm: null,
  penaltyAmbience: null,
  transmission: null,
  errorDeny: null,
};

// Lazy-loaded sound objects. We keep one instance per id and replay it.
const cache: Partial<Record<SoundId, Audio.Sound>> = {};

const loadIfNeeded = async (id: SoundId): Promise<Audio.Sound | null> => {
  if (cache[id]) return cache[id]!;
  const src = SOURCES[id];
  if (!src) return null;
  try {
    const { sound } = await Audio.Sound.createAsync(src, {
      shouldPlay: false,
      volume: 0.7,
    });
    cache[id] = sound;
    return sound;
  } catch {
    return null;
  }
};

export const primeAudio = async () => {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
  } catch {
    /* noop */
  }
};

export const play = async (id: SoundId) => {
  const sound = await loadIfNeeded(id);
  if (!sound) return;
  try {
    await sound.setPositionAsync(0);
    await sound.playAsync();
  } catch {
    /* noop */
  }
};

export const unloadAll = async () => {
  await Promise.all(
    Object.values(cache).map((s) => s?.unloadAsync().catch(() => {})),
  );
};
