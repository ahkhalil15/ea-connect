/**
 * EA Connect Theme Constants
 * Dark mode aesthetic with EA primary blue branding
 */

export const colors = {
  // Backgrounds
  backgroundPrimary: '#0A0A0F', // Deep, rich black — aligned with PRD spec
  backgroundSecondary: '#141414',
  backgroundCard: '#1a1a1a', // Dark grey for cards
  backgroundCardPressed: '#252525',
  
  // EA Branding
  eaPrimaryBlue: '#0074e4', // EA primary blue
  eaPrimaryBlueLight: '#3399ff',
  eaPrimaryBlueDark: '#0056b3',
  eaGlow: 'rgba(0, 116, 228, 0.6)', // Glow effect color
  
  // Text
  textPrimary: '#ffffff',
  textSecondary: '#a0a0a0',
  textMuted: '#666666',
  
  // Status indicators
  statusOnline: '#4ade80',
  statusAway: '#fbbf24',
  statusInGame: '#a855f7',
  statusOffline: '#6b7280',
  
  // Accents
  accentSuccess: '#22c55e',
  accentWarning: '#f59e0b',
  accentError: '#ef4444',
  
  // Borders
  borderSubtle: '#2a2a2a',
  borderMedium: '#3a3a3a',

  // Showdown design tokens (aligned with PRD visual spec)
  showdownBlue: '#0076FF',
  showdownBlueDim: 'rgba(0, 118, 255, 0.4)',
  showdownBlueGlow: 'rgba(0, 118, 255, 0.2)',
  showdownGold: '#FFB800',
  showdownGoldDim: 'rgba(255, 184, 0, 0.15)',
  showdownGoldGlow: 'rgba(255, 184, 0, 0.3)',
  showdownGreen: '#00E676',
  showdownRed: '#FF3B5C',
  showdownSurface: '#111118',
  showdownSurfaceElevated: '#1A1A24',
  showdownTextPrimary: '#E8E8F0',
  showdownTextDim: '#8888A0',
  showdownTextDimmer: '#55556A',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  pill: 50,
};

export const typography = {
  fontSizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 22,
    heading: 26,
  },
  fontWeights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const shadows = {
  cardShadow: {
    shadowColor: colors.eaPrimaryBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  glowShadow: {
    shadowColor: colors.eaPrimaryBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
  },
};
