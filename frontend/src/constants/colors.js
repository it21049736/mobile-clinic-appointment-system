import { Platform } from 'react-native';

// Clinical blue palette. Text colours meet WCAG AA (4.5:1) on white and on `background`.
export const COLORS = {
  primary: '#0B5FC1',
  primaryDark: '#08468F',
  primaryLight: '#E6EFFB',
  onPrimaryMuted: '#D3E3F8',
  accent: '#7A4DD8',
  background: '#F2F5F9',
  surface: '#FFFFFF',
  muted: '#EDF1F6',
  text: '#16202E',
  textLight: '#4F5B6B',
  textDisabled: '#7C8796',
  border: '#D5DCE5',
  inputBorder: '#8B97A7',
  success: '#127A4A',
  error: '#C42B2B',
  errorBg: '#FDECEC',
  warning: '#9A5800',
  info: '#0B5FC1',
  white: '#FFFFFF',
};

// Status is always shown as icon + word + colour, never colour alone.
export const STATUS_COLORS = {
  Pending: { bg: '#FFF3D6', text: '#7A4600', icon: 'time-outline' },
  Confirmed: { bg: '#E3EDFB', text: '#0A4A97', icon: 'checkmark-circle-outline' },
  Completed: { bg: '#E0F3E8', text: '#0F5E39', icon: 'checkmark-done-outline' },
  Cancelled: { bg: '#FCE6E6', text: '#9C1F1F', icon: 'close-circle-outline' },
};

// Type scale (system fonts: SF Pro on iOS, Roboto on Android).
export const TYPE = {
  display: { fontSize: 28, lineHeight: 34, fontWeight: '800' },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700' },
  heading: { fontSize: 18, lineHeight: 24, fontWeight: '700' },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '400' },
  bodyStrong: { fontSize: 16, lineHeight: 22, fontWeight: '600' },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  small: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
};

// Radii follow hierarchy: controls < cards < sheets; pills for chips/badges.
export const RADIUS = { control: 10, card: 14, sheet: 24, pill: 999 };

export const SHADOW = Platform.select({
  web: { boxShadow: '0 1px 2px rgba(16, 32, 56, 0.06), 0 2px 8px rgba(16, 32, 56, 0.06)' },
  default: {
    shadowColor: '#102038',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});

// Minimum touch target (Apple HIG 44pt, Material 48dp).
export const TOUCH = 48;
