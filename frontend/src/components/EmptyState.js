import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

const EmptyState = ({ icon = 'file-tray-outline', title, message, children }) => (
  <View style={styles.wrap}>
    <View style={styles.iconCircle}>
      <Ionicons name={icon} size={34} color={COLORS.primary} />
    </View>
    <Text style={styles.title}>{title}</Text>
    {!!message && <Text style={styles.message}>{message}</Text>}
    {children}
  </View>
);

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24 },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: { fontSize: 16, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  message: { fontSize: 13, color: COLORS.textLight, textAlign: 'center', marginTop: 6, lineHeight: 19 },
});

export default EmptyState;
