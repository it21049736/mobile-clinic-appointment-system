import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

const InfoRow = ({ icon, label, value, last = false }) => (
  <View style={[styles.row, !last && styles.border]}>
    <View style={styles.iconBox}>
      <Ionicons name={icon} size={18} color={COLORS.primary} />
    </View>
    <View style={styles.body}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || '—'}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  border: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  body: { flex: 1 },
  label: { fontSize: 12, color: COLORS.textLight },
  value: { fontSize: 15, color: COLORS.text, fontWeight: '600', marginTop: 2 },
});

export default InfoRow;
