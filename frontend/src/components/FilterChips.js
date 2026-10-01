import React from 'react';
import { ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants/colors';

// Single-select horizontal chips. `options` are strings or { label, value }.
const FilterChips = ({ options, value, onChange, style }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    style={style}
    contentContainerStyle={styles.row}
    accessibilityRole="tablist"
  >
    {options.map((opt) => {
      const { label, value: v } = typeof opt === 'string' ? { label: opt, value: opt } : opt;
      const active = v === value;
      return (
        <Pressable
          key={String(v)}
          style={({ pressed }) => [styles.chip, active && styles.active, pressed && !active && styles.pressed]}
          onPress={() => onChange(v)}
          accessibilityRole="tab"
          accessibilityState={{ selected: active }}
        >
          {active && <Ionicons name="checkmark" size={16} color={COLORS.white} style={styles.check} />}
          <Text style={[styles.text, active && styles.activeText]}>{label}</Text>
        </Pressable>
      );
    })}
  </ScrollView>
);

const styles = StyleSheet.create({
  row: { paddingVertical: 4, paddingRight: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40,
    paddingHorizontal: 16,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  pressed: { backgroundColor: COLORS.muted },
  active: { backgroundColor: COLORS.primary, borderColor: COLORS.primary, paddingLeft: 12 },
  check: { marginRight: 4 },
  text: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  activeText: { color: COLORS.white },
});

export default FilterChips;
