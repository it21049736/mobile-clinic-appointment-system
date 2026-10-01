import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { COLORS } from '../constants/colors';

export const stackScreenOptions = {
  headerStyle: { backgroundColor: COLORS.primary },
  headerTintColor: COLORS.white,
  headerTitleStyle: { fontWeight: '700' },
  headerBackTitleVisible: false,
  contentStyle: { backgroundColor: COLORS.background },
};

const TAB_BAR_MAX_WIDTH = 640;

// screenWidth keeps the tabs grouped in the middle on wide (web) screens.
export const tabScreenOptions = (icons, screenWidth = 0) => ({ route }) => ({
  headerShown: false,
  tabBarActiveTintColor: COLORS.primary,
  tabBarInactiveTintColor: COLORS.textLight,
  tabBarStyle: {
    height: 64,
    paddingBottom: 8,
    paddingTop: 6,
    borderTopColor: COLORS.border,
    paddingHorizontal: Math.max(0, (screenWidth - TAB_BAR_MAX_WIDTH) / 2),
  },
  tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
  tabBarIcon: ({ color, size, focused }) => {
    const [on, off] = icons[route.name];
    return <Ionicons name={focused ? on : off} size={size} color={color} />;
  },
});
