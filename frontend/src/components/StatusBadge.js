import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, STATUS_COLORS } from '../constants/colors';

const StatusBadge = ({ status, style }) => {
  const c = STATUS_COLORS[status] || { bg: COLORS.muted, text: COLORS.textLight, icon: 'ellipse-outline' };
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }, style]} accessibilityLabel={`Status: ${status}`}>
      <Ionicons name={c.icon} size={15} color={c.text} />
      <Text style={[styles.text, { color: c.text }]}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
    paddingRight: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 13, fontWeight: '700', marginLeft: 4 },
});

export default StatusBadge;
