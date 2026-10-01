import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import InfoRow from '../../components/InfoRow';
import CustomButton from '../../components/CustomButton';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, SHADOW } from '../../constants/colors';
import { APP_NAME, APP_VERSION } from '../../constants/config';
import { confirmLogout } from '../../utils/dialogs';
import { centered, MAX_WIDTH } from '../../utils/responsive';

const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  const links = isAdmin
    ? [
        { icon: 'grid-outline', label: 'Dashboard', go: () => navigation.navigate('DashboardTab') },
        { icon: 'medkit-outline', label: 'Manage doctors', go: () => navigation.navigate('DoctorsTab', { screen: 'DoctorList' }) },
        { icon: 'calendar-outline', label: 'All appointments', go: () => navigation.navigate('AppointmentsTab', { screen: 'AppointmentList' }) },
      ]
    : [
        { icon: 'search-outline', label: 'Find a doctor', go: () => navigation.navigate('DoctorsTab', { screen: 'DoctorList' }) },
        { icon: 'calendar-outline', label: 'My appointments', go: () => navigation.navigate('AppointmentsTab', { screen: 'AppointmentList' }) },
      ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(user?.name)}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <View style={styles.rolePill}>
          <Text style={styles.roleText}>{isAdmin ? 'Administrator' : 'Patient'}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <InfoRow icon="mail-outline" label="Email" value={user?.email} />
        <InfoRow icon="call-outline" label="Phone number" value={user?.phoneNumber} last />
      </View>

      <View style={styles.card}>
        {links.map((l, i) => (
          <TouchableOpacity key={l.label} style={[styles.link, i < links.length - 1 && styles.linkBorder]} onPress={l.go}>
            <Ionicons name={l.icon} size={20} color={COLORS.primary} />
            <Text style={styles.linkText}>{l.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
          </TouchableOpacity>
        ))}
      </View>

      <CustomButton title="Logout" icon="log-out-outline" variant="dangerOutline" onPress={() => confirmLogout(logout)} style={styles.logout} />
      <Text style={styles.footer}>{APP_NAME} v{APP_VERSION}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { ...centered(MAX_WIDTH.content), padding: 16, paddingBottom: 32 },
  hero: { alignItems: 'center', paddingVertical: 16 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: COLORS.white, fontSize: 32, fontWeight: '800' },
  name: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginTop: 12 },
  rolePill: { backgroundColor: COLORS.primaryLight, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginTop: 6 },
  roleText: { color: COLORS.primaryDark, fontWeight: '700', fontSize: 13 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginTop: 14,
    ...SHADOW,
  },
  link: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  linkBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  linkText: { flex: 1, marginLeft: 12, fontSize: 15, color: COLORS.text, fontWeight: '600' },
  logout: { marginTop: 22 },
  footer: { textAlign: 'center', color: COLORS.textLight, fontSize: 13, marginTop: 12 },
});

export default ProfileScreen;
