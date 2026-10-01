import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { AuthContext } from '../../context/AuthContext';
import { COLORS } from '../../constants/colors';
import { APP_NAME } from '../../constants/config';
import { errorMessage } from '../../utils/dialogs';
import { useResponsive, centered, MAX_WIDTH } from '../../utils/responsive';
import { rules, collectErrors } from '../../utils/validation';

const LoginScreen = ({ navigation }) => {
  const { login } = useContext(AuthContext);
  const { isWide } = useResponsive();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const e = collectErrors({
      email: () => rules.email(email),
      password: () => rules.loginPassword(password),
    });
    setFieldErrors(e);
    setError('');
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err) {
      setError(errorMessage(err, 'Invalid email or password.'));
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
            <Ionicons name="medkit" size={36} color={COLORS.white} />
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Log in to {APP_NAME}</Text>
          </View>

          <View style={[styles.form, isWide && styles.formWide]}>
            <CustomInput
              label="Email"
              icon="mail-outline"
              placeholder="you@email.com"
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                setFieldErrors((e) => ({ ...e, email: '' }));
              }}
              keyboardType="email-address"
              maxLength={100}
              error={fieldErrors.email}
            />
            <CustomInput
              label="Password"
              icon="lock-closed-outline"
              placeholder="Your password"
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                setFieldErrors((e) => ({ ...e, password: '' }));
              }}
              secureTextEntry
              error={fieldErrors.password}
            />

            {!!error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <CustomButton title="Log In" onPress={handleLogin} loading={loading} style={styles.submit} />

            <TouchableOpacity style={styles.switch} onPress={() => navigation.navigate('Register')}>
              <Text style={styles.switchText}>
                New patient? <Text style={styles.link}>Create an account</Text>
              </Text>
            </TouchableOpacity>
            <Text style={styles.note}>Clinic staff log in here with the admin account.</Text>
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
  header: { alignItems: 'center', paddingBottom: 28, paddingHorizontal: 24 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.white, marginTop: 10 },
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
  switch: { alignItems: 'center', marginTop: 14 },
  switchText: { color: COLORS.textLight, fontSize: 14 },
  link: { color: COLORS.primary, fontWeight: '700' },
  note: { textAlign: 'center', color: COLORS.textLight, fontSize: 13, marginTop: 18 },
});

export default LoginScreen;
