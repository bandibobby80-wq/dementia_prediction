// src/theme/colors.js
// ─────────────────────────────────────────────────────────
// Design system — mirrors the web app's dark-teal palette
// ─────────────────────────────────────────────────────────

export const COLORS = {
  // Background layers
  bg:         '#0f172a',   // deepest background
  bgCard:     '#1e293b',   // card surface
  bgInput:    '#0f1f35',   // input field
  bgGlass:    'rgba(30, 41, 59, 0.8)',

  // Brand / accent
  teal:       '#2dd4bf',
  tealDark:   '#0d9488',
  tealLight:  '#5eead4',

  // Text
  white:      '#ffffff',
  textPrimary:'#f1f5f9',
  textMuted:  '#94a3b8',
  textDim:    '#475569',

  // Status
  danger:     '#ef4444',
  dangerDim:  'rgba(239,68,68,0.15)',
  success:    '#22c55e',
  successDim: 'rgba(34,197,94,0.15)',
  warning:    '#f59e0b',
  warningDim: 'rgba(245,158,11,0.15)',
  info:       '#38bdf8',

  // Borders
  border:     'rgba(255,255,255,0.08)',
  borderTeal: 'rgba(45,212,191,0.3)',

  // Gradients (used as array in LinearGradient)
  gradientBg:    ['#0f172a', '#1a2540'],
  gradientTeal:  ['#0d9488', '#2dd4bf'],
  gradientDanger:['#b91c1c', '#ef4444'],
};

export const FONTS = {
  regular: 'System',
  size: {
    xs:   11,
    sm:   13,
    md:   15,
    lg:   17,
    xl:   20,
    xxl:  24,
    xxxl: 32,
  },
  weight: {
    normal:    '400',
    medium:    '500',
    semibold:  '600',
    bold:      '700',
    extrabold: '800',
  },
};

export const RADIUS = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  full: 9999,
};

export const SHADOW = {
  teal: {
    shadowColor: '#2dd4bf',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
};
