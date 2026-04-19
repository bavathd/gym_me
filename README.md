# solo-leveling-gym

A gym motivation app themed as the **System** from *Solo Leveling*. React Native +
Expo, local-first, no backend, no auth. iOS + Android via Expo managed workflow.

## Stack

- **Expo SDK 51+** / TypeScript (strict) / expo-router (file-based)
- **Zustand** + **MMKV** via `zustand/middleware` persist
- **Reanimated 3** + **@shopify/react-native-skia** for glow, scanlines, level-up, penalty
- **expo-notifications**, **expo-haptics**, **expo-av**, **expo-location**
- Fonts: **Orbitron** + **Share Tech Mono** via `@expo-google-fonts/*`

## Structure

```
solo-leveling-gym/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx                  # Quest panel (home)
│   ├── stats.tsx
│   ├── log/[exercise].tsx
│   ├── penalty.tsx
│   ├── reassessment.tsx
│   └── onboarding/{intro,accept}.tsx
├── components/
│   ├── system/                    # SystemPanel, SystemText, QuestPanel,
│   │                              # StatBar, LevelUpSequence, PenaltyOverlay,
│   │                              # SystemNotification
│   └── ui/                        # Screen, SystemButton
├── lib/                           # quest, stats, penalty, notifications, audio, store
├── theme/tokens.ts
└── assets/{sounds,fonts}/
```

## Setup

```bash
npm install              # or: yarn / pnpm install
npx expo start           # press i for iOS sim, a for Android
```

### Permissions

- **Notifications**: requested on first app launch. Used for 23:00 warning + 00:00
  quest reset notices.
- **Location (foreground only)**: requested when the run is started. Foreground
  GPS only — no background permission is declared.

### MMKV / native modules

MMKV, Skia, and Reanimated are native modules. The Expo Go app does not support
them; use `expo run:ios` / `expo run:android` or build a development client:

```bash
npx expo prebuild
npx expo run:ios
npx expo run:android
```

## Game logic (immutable spec)

**Daily Quest** (resets 00:00 local, never adapts):
- 100 push-ups, 100 sit-ups, 100 squats, 10 km run

**Stat gains on completion**
- STR +1 — push-ups ≥ target AND squats ≥ target
- VIT +1 — sit-ups ≥ target AND run ≥ target
- AGI +1 — run completed in ≤ 60 min
- SEN +1 — all four exercises in a single session (no gap > 2 h)
- INT +1 — per 7-day streak milestone

**Level** = `floor(sum / 10)`, min 1.
**Ranks**: E (default), D @ 10, C @ 25, B @ 50, A @ 100, S @ 200.
Crossing a rank gate queues a **Reassessment Quest** (2× volume, single session).

**Penalty**
- Quest incomplete by 23:59 local → at 00:00 schedule a notification
  `Daily Quest failed. Penalty Quest issued.`
- Next launch: forced 3s `PENALTY ZONE` overlay, red-tinted UI.
- Stats are frozen (no gains until cleared); –10 % of current-level EXP.
- Penalty Quest = daily + 50 % (150/150/150/15 km) on top of a fresh daily.
- Failed penalty compounds: 200/200/200/20 km, then rank demotion at level 3.
- **Rest Token**: 1 per 7 consecutive completed days, skips a day cleanly.

**Persisted state**
- quest progress (per-exercise counts, session start)
- stats, level, rank, EXP, streak, rest tokens
- penaltyState `{ active, compoundLevel, expDeducted }`
- history of completed quests with timestamps

## Assets

Sound files and fonts are not committed. Drop files into `assets/sounds/` and
follow `assets/sounds/README.md` + `assets/fonts/README.md` for names and
licence-clean download sources.

- Free sound effects: [freesound.org](https://freesound.org),
  [Pixabay](https://pixabay.com/sound-effects/),
  [Zapsplat](https://www.zapsplat.com),
  [OpenGameArt](https://opengameart.org)
- Fonts: [Orbitron](https://fonts.google.com/specimen/Orbitron),
  [Share Tech Mono](https://fonts.google.com/specimen/Share+Tech+Mono)

### Icon / splash

`app.json` references `./assets/icon.png` and `./assets/splash.png`. Add any
1024×1024 png + splash image before shipping to TestFlight / Play.

## Copy style

All System copy is **formal and detached**:

> Quest complete. You have gained 47 EXP.
> Warning: Daily Quest incomplete.

Avoid second-person encouragement ("you got this!"). The System reports — it
does not cheer.

## License

MIT — do whatever you want with the code. Sound/font files follow their own
licences (see the asset README files).
