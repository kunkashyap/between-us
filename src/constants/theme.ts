export const Colors = {
  // Editorial Dark Theme
  background: '#0C0C0E',
  backgroundSecondary: '#141417',
  surface: '#18181C',
  surfaceElevated: '#212126',
  surfaceHighlight: '#2A2A31',

  // Typography
  text: '#F5F2EC', // Warm off-white
  textSecondary: '#98979E', // Muted warm grey
  textMuted: '#68676E', // Deeper muted
  textTertiary: '#4E4D54',

  // Lines & Dividers
  border: '#24242B',
  borderSubtle: '#1B1B20',
  borderStrong: '#363640',

  // Restrained warm bronze accent
  accent: '#C79A72',
  accentSubtle: 'rgba(199, 154, 114, 0.15)',
  accentMuted: '#8E6E52',

  // Semantic
  danger: '#BD5353',
  dangerSubtle: 'rgba(189, 83, 83, 0.15)',
  success: '#5B9372',
  successSubtle: 'rgba(91, 147, 114, 0.15)',
  warning: '#D19C4A',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.75)',
  overlayStrong: 'rgba(0, 0, 0, 0.9)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  gutter: 20,
};

export const Typography = {
  // Editorial font scale
  hero: {
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: 0.5,
    fontFamily: 'serif',
  },
  titleLarge: {
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 0.3,
    fontFamily: 'serif',
  },
  titleMedium: {
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  headline: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 15,
    lineHeight: 23,
    letterSpacing: 0.1,
  },
  bodySecondary: {
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  overline: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
  timestamp: {
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
};

export const Radii = {
  none: 0,
  subtle: 4,
  sm: 6,
  md: 8,
  lg: 12,
  full: 9999,
};
