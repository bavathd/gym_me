/**
 * Design tokens for the SYSTEM UI. Mirrors project/tokens.json from the
 * Claude Design handoff bundle. Single source of truth — do not inline colors
 * or sizes elsewhere.
 */

export const colors = {
  bg: {
    void: '#050B14',
    deep: '#0A1628',
    panel: 'rgba(10, 22, 40, 0.72)',
    panelSolid: '#0F1E33',
    toast: 'rgba(10, 22, 40, 0.88)',
  },
  cyan: {
    100: '#E6FAFF',
    200: '#B8EFFF',
    300: '#7AE2FF',
    400: '#3DD4FF',
    500: '#00D4FF',
    600: '#00A8D1',
    700: '#0080A3',
    800: '#005C75',
    900: '#003A4D',
  },
  amber: {
    300: '#FFD88A',
    500: '#FFB84A',
    600: '#D98F1E',
    700: '#8A5500',
  },
  red: {
    300: '#FFB0B0',
    500: '#FF2A3C',
    600: '#D4001A',
    700: '#8A0010',
    900: '#2E0006',
  },
  text: {
    primary: '#E6F4FF',
    secondary: '#8FB8D1',
    muted: '#4A6680',
    inverse: '#050B14',
  },
  stroke: {
    cyanStrong: 'rgba(0, 212, 255, 1)',
    cyan: 'rgba(0, 212, 255, 0.7)',
    cyanSoft: 'rgba(0, 212, 255, 0.35)',
    cyanFaint: 'rgba(0, 212, 255, 0.15)',
    amber: 'rgba(255, 184, 74, 0.8)',
    red: 'rgba(255, 42, 60, 0.85)',
  },
} as const;

// Pre-baked box-shadow params for React Native. iOS honours shadow*,
// Android falls back to elevation. Multi-layer glows are approximated by
// the strongest stop.
export const glow = {
  cyan: {
    sm: {
      shadowColor: colors.cyan[500],
      shadowOpacity: 0.6,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 0 },
      elevation: 4,
    },
    md: {
      shadowColor: colors.cyan[500],
      shadowOpacity: 0.7,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 0 },
      elevation: 8,
    },
    lg: {
      shadowColor: colors.cyan[500],
      shadowOpacity: 0.75,
      shadowRadius: 22,
      shadowOffset: { width: 0, height: 0 },
      elevation: 12,
    },
  },
  amber: {
    sm: {
      shadowColor: colors.amber[500],
      shadowOpacity: 0.55,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 0 },
      elevation: 4,
    },
    md: {
      shadowColor: colors.amber[500],
      shadowOpacity: 0.7,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 0 },
      elevation: 8,
    },
  },
  red: {
    sm: {
      shadowColor: colors.red[500],
      shadowOpacity: 0.6,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 0 },
      elevation: 6,
    },
    md: {
      shadowColor: colors.red[500],
      shadowOpacity: 0.75,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 0 },
      elevation: 10,
    },
    lg: {
      shadowColor: colors.red[500],
      shadowOpacity: 0.85,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 0 },
      elevation: 14,
    },
  },
} as const;

// Text glow via textShadow*.
export const textGlow = {
  sm: {
    textShadowColor: 'rgba(0, 212, 255, 0.35)',
    textShadowRadius: 4,
    textShadowOffset: { width: 0, height: 0 },
  },
  md: {
    textShadowColor: 'rgba(0, 212, 255, 0.55)',
    textShadowRadius: 8,
    textShadowOffset: { width: 0, height: 0 },
  },
  lg: {
    textShadowColor: 'rgba(0, 212, 255, 0.75)',
    textShadowRadius: 12,
    textShadowOffset: { width: 0, height: 0 },
  },
  amber: {
    textShadowColor: 'rgba(255, 184, 74, 0.55)',
    textShadowRadius: 8,
    textShadowOffset: { width: 0, height: 0 },
  },
  red: {
    textShadowColor: 'rgba(255, 42, 60, 0.7)',
    textShadowRadius: 8,
    textShadowOffset: { width: 0, height: 0 },
  },
} as const;

// Typography
export const fonts = {
  display: 'Orbitron_900Black',
  displayBold: 'Orbitron_700Bold',
  heading: 'Rajdhani_700Bold',
  headingSemi: 'Rajdhani_600SemiBold',
  headingMed: 'Rajdhani_500Medium',
  headingReg: 'Rajdhani_400Regular',
  mono: 'ShareTechMono_400Regular',
} as const;

export const fontSize = {
  '3xs': 10,
  '2xs': 11,
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  '2xl': 28,
  '3xl': 36,
  '4xl': 48,
  '5xl': 64,
  '6xl': 84,
} as const;

// Letter-spacing in RN is a numeric px value. These are the computed
// equivalents of the ems in tokens.json for 12px base text. Headings typically
// render at 12-14px so these values map well.
export const tracking = {
  tight: 0,
  normal: 0.3,
  wide: 1.0,
  wider: 1.6,
  widest: 2.8,
  brutal: 4.2,
} as const;

// Spacing — strict 4-px grid matching tokens.json.
export const spacing = {
  0: 0,
  1: 2,
  2: 4,
  3: 8,
  4: 12,
  5: 16,
  6: 20,
  7: 24,
  8: 32,
  9: 40,
  10: 48,
  12: 64,
} as const;

export const radius = {
  0: 0,
  1: 1,
  2: 2,
} as const;

export const motion = {
  easing: [0.2, 0.8, 0.2, 1] as const,
  duration: {
    xs: 90,
    sm: 160,
    md: 280,
    lg: 480,
    xl: 800,
  },
} as const;

export const tokens = {
  colors,
  glow,
  textGlow,
  fonts,
  fontSize,
  tracking,
  spacing,
  radius,
  motion,
};

export default tokens;
