import { Platform } from 'react-native';

// Clinical blue on frosted glass. Text colours meet WCAG AA (4.5:1) on the glass surfaces.
export const COLORS = {
  primary: '#0B5FC1',
  primaryDark: '#08468F',
  primaryLight: 'rgba(11, 95, 193, 0.12)',
  onPrimaryMuted: '#D3E3F8',
  accent: '#7A4DD8',
  background: 'transparent',
  canvas: '#E6EEFB',
  surface: 'rgba(255, 255, 255, 0.62)',
  surfaceSolid: '#FFFFFF',
  muted: 'rgba(214, 224, 240, 0.6)',
  text: '#16202E',
  textLight: '#45526A',
  textDisabled: '#6F7B8F',
  border: 'rgba(22, 32, 46, 0.10)',
  inputBorder: 'rgba(22, 32, 46, 0.28)',
  success: '#127A4A',
  error: '#C42B2B',
  errorBg: 'rgba(252, 230, 230, 0.85)',
  warning: '#9A5800',
  info: '#0B5FC1',
  white: '#FFFFFF',
};

// Status is always shown as icon + word + colour, never colour alone.
export const STATUS_COLORS = {
  Pending: { bg: 'rgba(255, 236, 196, 0.9)', text: '#7A4600', icon: 'time-outline' },
  Confirmed: { bg: 'rgba(214, 229, 250, 0.9)', text: '#0A4A97', icon: 'checkmark-circle-outline' },
  Completed: { bg: 'rgba(210, 238, 222, 0.9)', text: '#0F5E39', icon: 'checkmark-done-outline' },
  Cancelled: { bg: 'rgba(250, 220, 220, 0.9)', text: '#9C1F1F', icon: 'close-circle-outline' },
};

// Type scale (system fonts: SF Pro on iOS, Roboto on Android).
export const TYPE = {
  display: { fontSize: 30, lineHeight: 36, fontWeight: '800', letterSpacing: -0.4 },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700', letterSpacing: -0.2 },
  heading: { fontSize: 18, lineHeight: 24, fontWeight: '700' },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '400' },
  bodyStrong: { fontSize: 16, lineHeight: 22, fontWeight: '600' },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  small: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
};

// Liquid-glass shapes are rounder; hierarchy is kept: controls < cards < sheets.
export const RADIUS = { control: 14, card: 22, sheet: 30, pill: 999 };

// Glass edge: a bright hairline plus a soft, wide shadow. On the web the browser blurs what is
// behind the card. Android elevation is off because it draws a dark shape through translucency.
export const SHADOW = {
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.8)',
  ...Platform.select({
    web: {
      boxShadow: '0 8px 32px rgba(31, 56, 110, 0.10)',
      backdropFilter: 'blur(18px) saturate(160%)',
      WebkitBackdropFilter: 'blur(18px) saturate(160%)',
    },
    default: {
      shadowColor: '#1F386E',
      shadowOpacity: 0.1,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 0,
    },
  }),
};

export const GLASS = {
  fill: 'rgba(255, 255, 255, 0.45)',
  border: 'rgba(255, 255, 255, 0.8)',
  sheen: ['rgba(255, 255, 255, 0.55)', 'rgba(255, 255, 255, 0)'],
};

export const GRADIENT = {
  base: ['#DCE8FB', '#EAE4FB', '#DFF3EF'],
  blobs: ['rgba(11, 95, 193, 0.22)', 'rgba(122, 77, 216, 0.16)', 'rgba(18, 160, 140, 0.16)'],
};

// Space kept free at the bottom of scrolling screens for the floating tab bar.
export const TAB_BAR_SPACE = 110;

// Minimum touch target (Apple HIG 44pt, Material 48dp).
export const TOUCH = 48;
