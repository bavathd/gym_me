import { Audio } from 'expo-av';

export type SoundId =
  | 'ding'
  | 'tapBlip'
  | 'completion'
  | 'levelUp'
  | 'penalty';

const SOURCES: Record<SoundId, number | null> = {
  // Wired in via require(...) — drop matching filenames into assets/sounds/
  // and uncomment. See README for free sources.
  ding: null,
  tapBlip: null,
  completion: null,
  levelUp: null,
  penalty: null,
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
