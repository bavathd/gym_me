/**
 * Design tokens for the "System" UI.
 * Single source of truth for color, typography, spacing, and glow.
 */

export const colors = {
  // Core System palette
  cyan: '#00D4FF',
  cyanDim: '#0088AA',
  navy: '#0A1628',
  navyDeep: '#050B14',
  navyPanel: '#0E1F38',
  amber: '#FFB800',
  red: '#FF2E2E',
  redDim: '#7A0000',
  white: '#E6F4FF',
  mute: '#6A8AB0',
  border: '#1C3457',
  scanline: 'rgba(0, 212, 255, 0.06)',
  penaltyTint: 'rgba(255, 46, 46, 0.18)',
} as const;

export type ColorKey = keyof typeof colors;

export const type = {
  display: 'Orbitron_700Bold',
  displayRegular: 'Orbitron_400Regular',
  mono: 'ShareTechMono_400Regular',
} as const;

export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 28,
  display: 40,
  hero: 56,
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  none: 0,
  sm: 2,
  md: 4,
  lg: 8,
} as const;

export const glow = {
  cyan: {
    shadowColor: colors.cyan,
    shadowOpacity: 0.9,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  amber: {
    shadowColor: colors.amber,
    shadowOpacity: 0.9,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  red: {
    shadowColor: colors.red,
    shadowOpacity: 0.95,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
} as const;

export const timing = {
  fast: 120,
  base: 220,
  slow: 400,
  dramatic: 900,
} as const;

export const tokens = {
  colors,
  type,
  fontSize,
  spacing,
  radius,
  glow,
  timing,
};

export default tokens;
