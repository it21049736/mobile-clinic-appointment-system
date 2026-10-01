import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, TYPE } from '../constants/colors';

const CustomInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  multiline = false,
  numberOfLines = 1,
  maxLength,
  icon,
  error,
  hint,
  style,
}) => {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secureTextEntry);

  return (
    <View style={[styles.wrapper, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.field,
          multiline && styles.multilineField,
          focused && styles.focused,
          !!error && styles.errorBorder,
        ]}
      >
        {icon && <Ionicons name={icon} size={20} color={focused ? COLORS.primary : COLORS.textLight} style={styles.icon} />}
        <TextInput
          style={[styles.input, multiline && styles.multiline]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textDisabled}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          accessibilityLabel={label || placeholder}
          aria-invalid={!!error}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {secureTextEntry && (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
          >
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={22} color={COLORS.textLight} />
          </Pressable>
        )}
      </View>
      {error ? (
        <View style={styles.messageRow} accessibilityLiveRegion="polite">
          <Ionicons name="alert-circle" size={15} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        !!hint && <Text style={styles.hint}>{hint}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginVertical: 8 },
  label: { ...TYPE.label, color: COLORS.text, marginBottom: 6 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.control,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
  },
  multilineField: { alignItems: 'flex-start', paddingTop: 6 },
  focused: { borderColor: COLORS.primary, borderWidth: 2, paddingHorizontal: 13.5 },
  errorBorder: { borderColor: COLORS.error },
  icon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 13, fontSize: 16, color: COLORS.text, outlineStyle: 'none' },
  multiline: { textAlignVertical: 'top', minHeight: 96 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 6 },
  errorText: { ...TYPE.caption, color: COLORS.error, marginLeft: 6, flex: 1 },
  hint: { ...TYPE.caption, color: COLORS.textLight, marginTop: 6 },
});

export default CustomInput;
