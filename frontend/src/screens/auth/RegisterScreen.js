import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { AuthContext } from '../../context/AuthContext';
import { COLORS } from '../../constants/colors';
import { errorMessage } from '../../utils/dialogs';
import { useResponsive, centered, MAX_WIDTH } from '../../utils/responsive';
import { rules, collectErrors, normalizePhone } from '../../utils/validation';

const EMPTY = { name: '', email: '', phoneNumber: '', password: '', confirmPassword: '' };

const validate = (f) =>
  collectErrors({
    name: () => rules.name(f.name, 'Full name'),
    email: () => rules.email(f.email),
    phoneNumber: () => rules.phone(f.phoneNumber),
    password: () => rules.password(f.password),
    confirmPassword: () => rules.confirmPassword(f.confirmPassword, f.password),
  });

const RegisterScreen = ({ navigation }) => {
  const { register } = useContext(AuthContext);
  const { isWide } = useResponsive();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: '' } : e));
  };

  const handleRegister = async () => {
    const e = validate(form);
    setErrors(e);
    setServerError('');
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      await register({
        name: form.name.trim().replace(/\s+/g, ' '),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phoneNumber: normalizePhone(form.phoneNumber),
      });
    } catch (err) {
      setServerError(errorMessage(err, 'Registration failed.'));
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={[styles.scroll, isWide && styles.scrollWide]} keyboardShouldPersistTaps="handled">
          <View style={[styles.column, isWide && styles.columnWide]}>
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()} hitSlop={10}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.header}>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Register as a patient to book appointments</Text>
          </View>

          <View style={[styles.form, isWide && styles.formWide]}>
            <CustomInput label="Full name" icon="person-outline" placeholder="Kamal Perera" value={form.name} onChangeText={set('name')} autoCapitalize="words" maxLength={50} error={errors.name} />
            <CustomInput label="Email" icon="mail-outline" placeholder="you@email.com" value={form.email} onChangeText={set('email')} keyboardType="email-address" error={errors.email} />
            <CustomInput label="Phone number" icon="call-outline" placeholder="0771234567" value={form.phoneNumber} onChangeText={set('phoneNumber')} keyboardType="phone-pad" maxLength={16} error={errors.phoneNumber} />
            <CustomInput label="Password" icon="lock-closed-outline" placeholder="At least 6 characters, letters and numbers" value={form.password} onChangeText={set('password')} secureTextEntry error={errors.password} />
            <CustomInput label="Confirm password" icon="lock-closed-outline" placeholder="Re-enter password" value={form.confirmPassword} onChangeText={set('confirmPassword')} secureTextEntry error={errors.confirmPassword} />

            {!!serverError && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={COLORS.error} />
                <Text style={styles.errorText}>{serverError}</Text>
              </View>
            )}

            <CustomButton title="Create Account" onPress={handleRegister} loading={loading} style={styles.submit} />
            <TouchableOpacity style={styles.switch} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.switchText}>
                Already registered? <Text style={styles.link}>Log in</Text>
              </Text>
            </TouchableOpacity>
          </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.primary },
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },
  scrollWide: { justifyContent: 'center', paddingVertical: 32 },
  column: { flexGrow: 1 },
  columnWide: { ...centered(MAX_WIDTH.auth), flexGrow: 0 },
  formWide: { flexGrow: 0, borderRadius: 28 },
  back: { padding: 16 },
  header: { paddingHorizontal: 24, paddingBottom: 24 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.white },
  subtitle: { fontSize: 14, color: COLORS.onPrimaryMuted, marginTop: 4 },
  form: {
    flexGrow: 1,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.errorBg,
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
  },
  errorText: { color: COLORS.error, marginLeft: 8, flex: 1, fontSize: 13 },
  submit: { marginTop: 16 },
  switch: { alignItems: 'center', marginTop: 14, marginBottom: 12 },
  switchText: { color: COLORS.textLight, fontSize: 14 },
  link: { color: COLORS.primary, fontWeight: '700' },
});

export default RegisterScreen;
