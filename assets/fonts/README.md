# Fonts

The app loads **Orbitron** (display) and **Share Tech Mono** (mono) via
`@expo-google-fonts/*`, so no files need to live in this folder by default.

If you want to ship the fonts locally instead:

1. Download from [Google Fonts](https://fonts.google.com):
   - [Orbitron](https://fonts.google.com/specimen/Orbitron) (Regular + Bold)
   - [Share Tech Mono](https://fonts.google.com/specimen/Share+Tech+Mono)
2. Drop the `.ttf` files here.
3. Replace the `useFonts` call in `app/_layout.tsx` with the local mapping.
