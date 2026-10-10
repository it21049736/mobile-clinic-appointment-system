import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet } from 'react-native';
import { DefaultTheme } from '@react-navigation/native';
import { GlassSurface } from '../components/Glass';
import { COLORS } from '../constants/colors';

// Screens are transparent so the gradient backdrop shows through every glass surface.
export const navigationTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: 'transparent', card: 'transparent', border: 'transparent' },
};

export const stackScreenOptions = {
  headerStyle: { backgroundColor: 'rgba(255, 255, 255, 0.55)' },
  headerShadowVisible: false,
  headerTintColor: COLORS.text,
  headerTitleStyle: { fontWeight: '700', color: COLORS.text },
  headerBackTitleVisible: false,
  contentStyle: { backgroundColor: 'transparent' },
};

const TAB_BAR_MAX_WIDTH = 520;
const TAB_RADIUS = 28;

const TabBarGlass = () => <GlassSurface style={StyleSheet.absoluteFill} radius={TAB_RADIUS} intensity={60} />;

// A floating glass pill; screenWidth keeps it centred and narrow on wide (web) screens.
export const tabScreenOptions = (icons, screenWidth = 0) => {
  const side = Math.max(16, (screenWidth - TAB_BAR_MAX_WIDTH) / 2);
  return ({ route }) => ({
    headerShown: false,
    tabBarActiveTintColor: COLORS.primary,
    tabBarInactiveTintColor: COLORS.textLight,
    tabBarBackground: TabBarGlass,
    tabBarStyle: {
      position: 'absolute',
      left: side,
      right: side,
      bottom: 16,
      height: 68,
      paddingTop: 8,
      paddingBottom: 10,
      borderRadius: TAB_RADIUS,
      borderTopWidth: 0,
      backgroundColor: 'transparent',
      elevation: 0,
    },
    tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
    tabBarIcon: ({ color, size, focused }) => {
      const [on, off] = icons[route.name];
      return <Ionicons name={focused ? on : off} size={size} color={color} />;
    },
  });
};
