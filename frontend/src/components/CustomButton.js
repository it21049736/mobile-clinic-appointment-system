import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, TOUCH } from '../constants/colors';

const VARIANTS = {
  primary: { bg: COLORS.primary, pressed: COLORS.primaryDark, border: COLORS.primary, text: COLORS.white },
  outline: { bg: COLORS.surface, pressed: COLORS.primaryLight, border: COLORS.primary, text: COLORS.primary },
  danger: { bg: COLORS.error, pressed: '#A32222', border: COLORS.error, text: COLORS.white },
  dangerOutline: { bg: COLORS.surface, pressed: COLORS.errorBg, border: COLORS.error, text: COLORS.error },
  success: { bg: COLORS.success, pressed: '#0D5E39', border: COLORS.success, text: COLORS.white },
  light: { bg: COLORS.white, pressed: COLORS.primaryLight, border: COLORS.white, text: COLORS.primary },
};

const CustomButton = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  icon,
  compact = false,
  style,
  accessibilityLabel,
}) => {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={({ pressed, focused }) => [
        styles.button,
        compact && styles.compact,
        { backgroundColor: pressed ? v.pressed : v.bg, borderColor: v.border },
        focused && styles.focused,
        inactive && styles.inactive,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text} />
      ) : (
        <View style={styles.row}>
          {icon && <Ionicons name={icon} size={compact ? 18 : 20} color={v.text} style={styles.icon} />}
          <Text style={[styles.text, compact && styles.compactText, { color: v.text }]} numberOfLines={1}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: RADIUS.control,
    borderWidth: 1.5,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
  },
  compact: {
    minHeight: TOUCH - 4,
    paddingHorizontal: 14,
    marginVertical: 0,
  },
  focused: Platform.select({
    web: { outlineStyle: 'solid', outlineWidth: 3, outlineColor: COLORS.primaryLight, outlineOffset: 2 },
    default: {},
  }),
  inactive: { opacity: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginRight: 8 },
  text: { fontSize: 16, fontWeight: '600' },
  compactText: { fontSize: 15 },
});

export default CustomButton;
