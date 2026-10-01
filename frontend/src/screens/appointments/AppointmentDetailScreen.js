import React, { useCallback, useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import DoctorAvatar from '../../components/DoctorAvatar';
import StatusBadge from '../../components/StatusBadge';
import InfoRow from '../../components/InfoRow';
import CustomButton from '../../components/CustomButton';
import EmptyState from '../../components/EmptyState';
import { AuthContext } from '../../context/AuthContext';
import {
  getAppointmentById,
  cancelAppointment,
  updateAppointmentStatus,
  deleteAppointment,
} from '../../services/appointmentService';
import { COLORS, STATUS_COLORS, SHADOW } from '../../constants/colors';
import { STATUS_ACTIONS, formatDate, formatFee, formatTime, todayString } from '../../constants/clinic';
import { confirmAction, errorMessage, showMessage } from '../../utils/dialogs';
import { centered, MAX_WIDTH } from '../../utils/responsive';

const STATUS_NOTES = {
  Pending: 'Waiting for the clinic to confirm this appointment.',
  Confirmed: 'Confirmed by the clinic. Please arrive 10 minutes early.',
  Completed: 'This visit has been completed.',
  Cancelled: 'This appointment was cancelled. The time slot is free for others.',
};

const ADMIN_ACTIONS = {
  Confirmed: { title: 'Confirm Appointment', icon: 'checkmark-circle-outline', variant: 'primary' },
  Completed: { title: 'Mark as Completed', icon: 'checkmark-done-outline', variant: 'success' },
  Cancelled: { title: 'Cancel Appointment', icon: 'close-circle-outline', variant: 'dangerOutline' },
};

const AppointmentDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      setAppointment(await getAppointmentById(id));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const run = async (key, fn, successTitle) => {
    setBusy(key);
    try {
      const updated = await fn();
      if (updated) setAppointment(updated);
      if (successTitle) showMessage(successTitle);
    } catch (err) {
      showMessage('Action failed', errorMessage(err));
    } finally {
      setBusy('');
    }
  };

  const handlePatientCancel = () =>
    confirmAction({
      title: 'Cancel appointment?',
      message: `${formatDate(appointment.appointmentDate)} at ${formatTime(appointment.appointmentTime)} will be released.`,
      confirmText: 'Yes, cancel',
      destructive: true,
      onConfirm: () => run('cancel', () => cancelAppointment(appointment._id), 'Appointment cancelled'),
    });

  const handleStatus = (status) => {
    const doIt = () => run(status, () => updateAppointmentStatus(appointment._id, status), `Status changed to ${status}`);
    if (status === 'Cancelled') {
      confirmAction({
        title: 'Cancel appointment?',
        message: 'The patient will see this appointment as cancelled.',
        confirmText: 'Yes, cancel',
        destructive: true,
        onConfirm: doIt,
      });
    } else {
      doIt();
    }
  };

  const handleDelete = () =>
    confirmAction({
      title: 'Delete record?',
      message: 'This permanently removes the appointment record.',
      confirmText: 'Delete',
      destructive: true,
      onConfirm: async () => {
        setBusy('delete');
        try {
          await deleteAppointment(appointment._id);
          navigation.goBack();
        } catch (err) {
          setBusy('');
          showMessage('Delete failed', errorMessage(err));
        }
      },
    });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!appointment) {
    return (
      <View style={styles.center}>
        <EmptyState icon="alert-circle-outline" title="Appointment not available" message={error}>
          <CustomButton title="Go back" compact onPress={() => navigation.goBack()} style={styles.mt} />
        </EmptyState>
      </View>
    );
  }

  const { status } = appointment;
  const doctor = appointment.doctorId;
  const patient = appointment.userId;
  const notPast = appointment.appointmentDate >= todayString();
  const canPatientCancel = ['Pending', 'Confirmed'].includes(status) && notPast;
  const canReschedule = status === 'Pending' && notPast && !!doctor;
  const statusColor = STATUS_COLORS[status];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[styles.banner, { backgroundColor: statusColor.bg }]}>
        <StatusBadge status={status} style={styles.bannerBadge} />
        <Text style={[styles.bannerText, { color: statusColor.text }]}>{STATUS_NOTES[status]}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.doctorRow}>
          <DoctorAvatar doctor={doctor} size={56} />
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{doctor?.doctorName || 'Doctor removed'}</Text>
            <Text style={styles.doctorSpec}>{doctor?.specialization || '—'}</Text>
          </View>
        </View>
        <InfoRow icon="calendar-outline" label="Date" value={formatDate(appointment.appointmentDate)} />
        <InfoRow icon="time-outline" label="Time" value={formatTime(appointment.appointmentTime)} />
        <InfoRow icon="cash-outline" label="Consultation fee" value={doctor ? formatFee(doctor.consultationFee) : '—'} />
        <InfoRow icon="call-outline" label="Doctor contact" value={doctor?.contactNumber} />
        <InfoRow icon="document-text-outline" label="Reason for visit" value={appointment.reason} last />
      </View>

      {isAdmin && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Patient</Text>
          <InfoRow icon="person-outline" label="Name" value={patient?.name} />
          <InfoRow icon="call-outline" label="Phone" value={patient?.phoneNumber} />
          <InfoRow icon="mail-outline" label="Email" value={patient?.email} last />
        </View>
      )}

      <Text style={styles.meta}>
        Reference {appointment._id.slice(-6).toUpperCase()}, booked on {formatDate(appointment.createdAt.slice(0, 10))}
      </Text>

      {isAdmin ? (
        <View style={styles.actions}>
          {STATUS_ACTIONS[status].map((next) => {
            const a = ADMIN_ACTIONS[next];
            return (
              <CustomButton
                key={next}
                title={a.title}
                icon={a.icon}
                variant={a.variant}
                loading={busy === next}
                disabled={!!busy}
                onPress={() => handleStatus(next)}
              />
            );
          })}
          <CustomButton title="Delete Record" icon="trash-outline" variant="dangerOutline" loading={busy === 'delete'} disabled={!!busy} onPress={handleDelete} />
        </View>
      ) : (
        <View style={styles.actions}>
          {canReschedule && (
            <CustomButton
              title="Reschedule"
              icon="swap-horizontal-outline"
              variant="outline"
              disabled={!!busy}
              onPress={() => navigation.navigate('RescheduleAppointment', { doctorId: doctor._id, appointment })}
            />
          )}
          {canPatientCancel && (
            <CustomButton title="Cancel Appointment" icon="close-circle-outline" variant="dangerOutline" loading={busy === 'cancel'} disabled={!!busy} onPress={handlePatientCancel} />
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { ...centered(MAX_WIDTH.content), padding: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  mt: { marginTop: 14 },
  banner: { borderRadius: 16, padding: 14 },
  bannerBadge: { backgroundColor: 'rgba(255,255,255,0.7)' },
  bannerText: { marginTop: 8, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 14,
    ...SHADOW,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  doctorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  doctorInfo: { marginLeft: 12, flex: 1 },
  doctorName: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  doctorSpec: { fontSize: 13, color: COLORS.primary, marginTop: 2 },
  meta: { fontSize: 13, color: COLORS.textLight, textAlign: 'center', marginTop: 14 },
  actions: { marginTop: 10 },
});

export default AppointmentDetailScreen;
