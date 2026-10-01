import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AppointmentCard from '../../components/AppointmentCard';
import CustomButton from '../../components/CustomButton';
import EmptyState from '../../components/EmptyState';
import { getAppointments, updateAppointmentStatus } from '../../services/appointmentService';
import { getDoctors } from '../../services/doctorService';
import { getPatients } from '../../services/authService';
import { COLORS, SHADOW } from '../../constants/colors';
import { formatDate, todayString } from '../../constants/clinic';
import { errorMessage, showMessage } from '../../utils/dialogs';
import { useResponsive, centered, gridCell, gridRow, MAX_WIDTH } from '../../utils/responsive';

const byDateAsc = (a, b) =>
  a.appointmentDate.localeCompare(b.appointmentDate) || a.appointmentTime.localeCompare(b.appointmentTime);

const StatTile = ({ icon, label, value, color, onPress, wide }) => (
  <TouchableOpacity style={[styles.tile, wide && styles.tileWide]} onPress={onPress} activeOpacity={onPress ? 0.85 : 1} disabled={!onPress}>
    <View style={[styles.tileIcon, { backgroundColor: `${color}1A` }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <Text style={styles.tileValue}>{value}</Text>
    <Text style={styles.tileLabel}>{label}</Text>
  </TouchableOpacity>
);

const AdminDashboardScreen = ({ navigation }) => {
  const [data, setData] = useState({ appointments: [], doctors: [], patients: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const { isWide, columns } = useResponsive();

  const load = useCallback(async () => {
    try {
      setError('');
      const [appointments, doctors, patients] = await Promise.all([getAppointments(), getDoctors(), getPatients()]);
      setData({ appointments, doctors, patients });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const quickStatus = async (appointment, status) => {
    setBusyId(`${appointment._id}:${status}`);
    try {
      const updated = await updateAppointmentStatus(appointment._id, status);
      setData((d) => ({
        ...d,
        appointments: d.appointments.map((a) => (a._id === updated._id ? updated : a)),
      }));
    } catch (err) {
      showMessage('Action failed', errorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const { appointments, doctors, patients } = data;
  const today = todayString();
  const count = (s) => appointments.filter((a) => a.status === s).length;
  const pending = appointments.filter((a) => a.status === 'Pending').sort(byDateAsc);
  const todays = appointments
    .filter((a) => a.appointmentDate === today && ['Pending', 'Confirmed', 'Completed'].includes(a.status))
    .sort(byDateAsc);

  const goAppointments = () => navigation.navigate('AppointmentsTab', { screen: 'AppointmentList' });
  const goDoctors = () => navigation.navigate('DoctorsTab', { screen: 'DoctorList' });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            colors={[COLORS.primary]}
          />
        }
      >
        <View style={styles.header}>
          <View style={[styles.page, isWide && styles.headerInnerWide]}>
            <Text style={styles.kicker}>Admin Dashboard</Text>
            <Text style={styles.title}>Clinic overview</Text>
            <Text style={styles.date}>{formatDate(today)}</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
        ) : error ? (
          <EmptyState icon="cloud-offline-outline" title="Couldn't load dashboard" message={error}>
            <CustomButton title="Try again" compact onPress={load} style={styles.mt} />
          </EmptyState>
        ) : (
          <View style={[styles.body, styles.page]}>
            <View style={styles.grid}>
              <StatTile icon="medkit-outline" label="Doctors" value={doctors.length} color={COLORS.primary} onPress={goDoctors} wide={isWide} />
              <StatTile icon="people-outline" label="Patients" value={patients.length} color={COLORS.info} wide={isWide} />
              <StatTile icon="calendar-outline" label="Appointments" value={appointments.length} color={COLORS.accent} onPress={goAppointments} wide={isWide} />
              <StatTile icon="hourglass-outline" label="Pending" value={count('Pending')} color={COLORS.warning} onPress={goAppointments} wide={isWide} />
              <StatTile icon="checkmark-circle-outline" label="Confirmed" value={count('Confirmed')} color={COLORS.info} onPress={goAppointments} wide={isWide} />
              <StatTile icon="checkmark-done-outline" label="Completed" value={count('Completed')} color={COLORS.success} onPress={goAppointments} wide={isWide} />
            </View>

            <Text style={styles.section}>Pending requests ({pending.length})</Text>
            {pending.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No appointments waiting for confirmation.</Text>
              </View>
            ) : (
              <View style={gridRow(columns)}>
              {pending.slice(0, columns > 1 ? columns * 2 : 5).map((a) => (
                <View key={a._id} style={gridCell(columns)}>
                  <AppointmentCard appointment={a} showPatient onPress={() => navigation.navigate('AppointmentDetail', { id: a._id })} />
                  <View style={styles.quickRow}>
                    <CustomButton
                      title="Confirm"
                      icon="checkmark"
                      compact
                      style={styles.quickBtn}
                      loading={busyId === `${a._id}:Confirmed`}
                      disabled={!!busyId}
                      onPress={() => quickStatus(a, 'Confirmed')}
                    />
                    <CustomButton
                      title="Cancel"
                      icon="close"
                      variant="dangerOutline"
                      compact
                      style={styles.quickBtn}
                      loading={busyId === `${a._id}:Cancelled`}
                      disabled={!!busyId}
                      onPress={() => quickStatus(a, 'Cancelled')}
                    />
                  </View>
                </View>
              ))}
              </View>
            )}

            <Text style={styles.section}>Today's appointments ({todays.length})</Text>
            {todays.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No appointments scheduled for today.</Text>
              </View>
            ) : (
              <View style={gridRow(columns)}>
                {todays.map((a) => (
                  <View key={a._id} style={gridCell(columns)}>
                    <AppointmentCard appointment={a} showPatient onPress={() => navigation.navigate('AppointmentDetail', { id: a._id })} />
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.primary },
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 24 },
  header: { backgroundColor: COLORS.primary, padding: 20, paddingBottom: 28 },
  kicker: { color: COLORS.onPrimaryMuted, fontSize: 13, fontWeight: '600' },
  title: { color: COLORS.white, fontSize: 24, fontWeight: '800', marginTop: 2 },
  date: { color: COLORS.onPrimaryMuted, fontSize: 13, marginTop: 4 },
  loader: { marginTop: 40 },
  mt: { marginTop: 14 },
  page: centered(MAX_WIDTH.page),
  headerInnerWide: { paddingHorizontal: 16 },
  body: { padding: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5 },
  tile: {
    width: '31%',
    flexGrow: 1,
    margin: 5,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 12,
    ...SHADOW,
  },
  tileWide: { width: '15%' },
  tileIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tileValue: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginTop: 8 },
  tileLabel: { fontSize: 13, color: COLORS.textLight, marginTop: 2 },
  section: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginTop: 22, marginBottom: 10 },
  emptyCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, ...SHADOW },
  emptyText: { color: COLORS.textLight, fontSize: 13, textAlign: 'center' },
  quickRow: { flexDirection: 'row', marginTop: -4, marginBottom: 14 },
  quickBtn: { flex: 1, marginHorizontal: 4 },
});

export default AdminDashboardScreen;
