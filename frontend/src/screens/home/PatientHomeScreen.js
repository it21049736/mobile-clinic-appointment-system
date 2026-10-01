import React, { useCallback, useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AppointmentCard from '../../components/AppointmentCard';
import DoctorAvatar from '../../components/DoctorAvatar';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import CustomButton from '../../components/CustomButton';
import { AuthContext } from '../../context/AuthContext';
import { getAppointments } from '../../services/appointmentService';
import { getDoctors } from '../../services/doctorService';
import { COLORS, RADIUS, SHADOW, TYPE } from '../../constants/colors';
import { formatDate, formatTime, isUpcoming, todayString } from '../../constants/clinic';
import { errorMessage } from '../../utils/dialogs';
import { useResponsive, centered, gridCell, gridRow, MAX_WIDTH } from '../../utils/responsive';

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const byDateAsc = (a, b) =>
  a.appointmentDate.localeCompare(b.appointmentDate) || a.appointmentTime.localeCompare(b.appointmentTime);

const NextAppointment = ({ appointment, onPress }) => {
  const doctor = appointment.doctorId;
  const isToday = appointment.appointmentDate === todayString();
  return (
    <Pressable
      style={({ pressed }) => [styles.next, pressed && styles.nextPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Your next appointment: ${formatDate(appointment.appointmentDate)} at ${formatTime(appointment.appointmentTime)} with ${doctor?.doctorName}. ${appointment.status}`}
    >
      <View style={styles.nextTop}>
        <Text style={styles.nextLabel}>{isToday ? 'Your appointment today' : 'Your next appointment'}</Text>
        <StatusBadge status={appointment.status} />
      </View>
      <Text style={styles.nextTime}>{formatTime(appointment.appointmentTime)}</Text>
      <Text style={styles.nextDate}>{formatDate(appointment.appointmentDate)}</Text>
      <View style={styles.nextDoctor}>
        <DoctorAvatar doctor={doctor} size={44} />
        <View style={styles.nextDoctorInfo}>
          <Text style={styles.nextDoctorName} numberOfLines={1}>{doctor?.doctorName || 'Doctor removed'}</Text>
          <Text style={styles.nextDoctorSpec} numberOfLines={1}>{doctor?.specialization}</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color={COLORS.primary} />
      </View>
    </Pressable>
  );
};

const PatientHomeScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const { columns, isWide } = useResponsive();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const [appts, docs] = await Promise.all([getAppointments(), getDoctors()]);
      setAppointments(appts);
      setDoctors(docs);
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

  const upcoming = appointments.filter(isUpcoming).sort(byDateAsc);
  const [next, ...later] = upcoming;

  const goToDoctors = () => navigation.navigate('DoctorsTab', { screen: 'DoctorList' });
  const openAppointment = (id) => navigation.navigate('AppointmentDetail', { id });

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
            <Text style={styles.hello}>{greeting()},</Text>
            <Text style={styles.name}>{user?.name}</Text>
          </View>
        </View>

        <View style={[styles.body, styles.page]}>
          {loading ? (
            <ActivityIndicator color={COLORS.primary} size="large" style={styles.loader} />
          ) : error ? (
            <EmptyState icon="cloud-offline-outline" title="Your appointments didn't load" message={error}>
              <CustomButton title="Try again" compact onPress={load} style={styles.mt} />
            </EmptyState>
          ) : (
            <>
              <View style={[styles.topRow, isWide && styles.topRowWide]}>
                {next && (
                  <View style={isWide ? styles.half : null}>
                    <NextAppointment appointment={next} onPress={() => openAppointment(next._id)} />
                  </View>
                )}
                <View style={isWide && next ? styles.half : null}>
                  <Pressable
                    style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
                    onPress={goToDoctors}
                    accessibilityRole="button"
                  >
                    <View style={styles.ctaIcon}>
                      <Ionicons name="calendar-number-outline" size={26} color={COLORS.white} />
                    </View>
                    <View style={styles.ctaBody}>
                      <Text style={styles.ctaTitle}>Book an appointment</Text>
                      <Text style={styles.ctaText}>Choose a doctor, a day they visit, and a free time</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={22} color={COLORS.primary} />
                  </Pressable>
                </View>
              </View>

              <View style={styles.sectionRow}>
                <Text style={styles.section}>Upcoming appointments</Text>
                <Pressable
                  onPress={() => navigation.navigate('AppointmentsTab', { screen: 'AppointmentList' })}
                  hitSlop={12}
                  accessibilityRole="link"
                >
                  <Text style={styles.link}>See all</Text>
                </Pressable>
              </View>
              {later.length ? (
                <View style={gridRow(columns)}>
                  {later.slice(0, columns > 1 ? columns * 2 : 3).map((a) => (
                    <View key={a._id} style={gridCell(columns)}>
                      <AppointmentCard appointment={a} onPress={() => openAppointment(a._id)} />
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyText}>
                  {next ? 'No other upcoming appointments.' : 'You have no upcoming appointments.'}
                </Text>
              )}

              <View style={styles.sectionRow}>
                <Text style={styles.section}>Our doctors</Text>
                <Pressable onPress={goToDoctors} hitSlop={12} accessibilityRole="link">
                  <Text style={styles.link}>See all</Text>
                </Pressable>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.docRow}>
                {doctors.slice(0, 8).map((d) => (
                  <Pressable
                    key={d._id}
                    style={({ pressed }) => [styles.docTile, pressed && styles.ctaPressed]}
                    onPress={() => navigation.navigate('DoctorsTab', { screen: 'DoctorDetail', params: { doctorId: d._id }, initial: false })}
                    accessibilityRole="button"
                    accessibilityLabel={`${d.doctorName}, ${d.specialization}`}
                  >
                    <DoctorAvatar doctor={d} size={60} />
                    <Text style={styles.docName} numberOfLines={1}>{d.doctorName}</Text>
                    <Text style={styles.docSpec} numberOfLines={1}>{d.specialization}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.primary },
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 32 },
  page: centered(MAX_WIDTH.page),
  headerInnerWide: { paddingHorizontal: 16 },
  header: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 56 },
  hello: { ...TYPE.body, color: COLORS.onPrimaryMuted },
  name: { ...TYPE.display, color: COLORS.white, marginTop: 2 },
  body: { paddingHorizontal: 16, marginTop: -40 },
  loader: { marginTop: 60 },
  mt: { marginTop: 14 },
  topRow: {},
  topRowWide: { flexDirection: 'row', marginHorizontal: -6 },
  half: { flex: 1, paddingHorizontal: 6 },
  next: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: 18,
    borderLeftWidth: 5,
    borderLeftColor: COLORS.primary,
    marginBottom: 12,
    ...SHADOW,
  },
  nextPressed: { backgroundColor: COLORS.muted },
  nextTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nextLabel: { ...TYPE.label, color: COLORS.textLight },
  nextTime: { fontSize: 34, lineHeight: 40, fontWeight: '800', color: COLORS.text, marginTop: 10 },
  nextDate: { ...TYPE.bodyStrong, color: COLORS.primaryDark },
  nextDoctor: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  nextDoctorInfo: { flex: 1, marginLeft: 12 },
  nextDoctorName: { ...TYPE.bodyStrong, color: COLORS.text },
  nextDoctorSpec: { ...TYPE.small, color: COLORS.textLight },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: 16,
    minHeight: 76,
    marginBottom: 12,
    ...SHADOW,
  },
  ctaPressed: { backgroundColor: COLORS.muted },
  ctaIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  ctaBody: { flex: 1 },
  ctaTitle: { ...TYPE.heading, color: COLORS.text },
  ctaText: { ...TYPE.small, color: COLORS.textLight, marginTop: 2 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 12 },
  section: { ...TYPE.heading, color: COLORS.text },
  link: { ...TYPE.label, color: COLORS.primary },
  emptyText: { ...TYPE.small, color: COLORS.textLight },
  docRow: { paddingBottom: 8, paddingRight: 4 },
  docTile: {
    width: 132,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginRight: 12,
    alignItems: 'center',
    ...SHADOW,
  },
  docName: { ...TYPE.label, color: COLORS.text, marginTop: 10 },
  docSpec: { ...TYPE.caption, color: COLORS.textLight, marginTop: 2 },
});

export default PatientHomeScreen;
