import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StatusBadge from './StatusBadge';
import { COLORS, RADIUS, SHADOW, TYPE } from '../constants/colors';
import { formatDate, formatTime, shortDayLabel } from '../constants/clinic';

// Doctor may be null if it was deleted after the appointment finished.
const AppointmentCard = ({ appointment, onPress, showPatient = false }) => {
  const doctor = appointment.doctorId;
  const patient = appointment.userId;
  const { day, date, month } = shortDayLabel(appointment.appointmentDate);
  const inactive = ['Cancelled', 'Completed'].includes(appointment.status);
  const time = formatTime(appointment.appointmentTime);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${appointment.status} appointment with ${doctor?.doctorName || 'a removed doctor'}, ${formatDate(appointment.appointmentDate)} at ${time}`}
    >
      <View style={[styles.dateBlock, inactive && styles.dateBlockInactive]}>
        <Text style={[styles.dateMonth, inactive && styles.dateTextInactive]}>{month}</Text>
        <Text style={[styles.dateNum, inactive && styles.dateTextInactive]}>{date}</Text>
        <Text style={[styles.dateDay, inactive && styles.dateTextInactive]}>{day}</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.time}>{time}</Text>
          <StatusBadge status={appointment.status} />
        </View>
        <Text style={styles.name} numberOfLines={1}>{doctor?.doctorName || 'Doctor removed'}</Text>
        <Text style={styles.spec} numberOfLines={1}>{doctor?.specialization || 'Specialization not available'}</Text>

        {showPatient && (
          <View style={styles.patientRow}>
            <Ionicons name="person-circle-outline" size={18} color={COLORS.textLight} />
            <Text style={styles.patient} numberOfLines={1}>{patient?.name || 'Unknown patient'}</Text>
            {!!patient?.phoneNumber && <Text style={styles.phone}>{patient.phoneNumber}</Text>}
          </View>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: 14,
    marginBottom: 12,
    ...SHADOW,
  },
  pressed: { backgroundColor: COLORS.muted },
  dateBlock: {
    width: 62,
    borderRadius: RADIUS.control,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginRight: 14,
  },
  dateBlockInactive: { backgroundColor: COLORS.muted },
  dateMonth: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  dateNum: { fontSize: 24, lineHeight: 28, fontWeight: '800', color: COLORS.primaryDark },
  dateDay: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  dateTextInactive: { color: COLORS.textLight },
  body: { flex: 1, justifyContent: 'center' },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  time: { ...TYPE.heading, color: COLORS.text },
  name: { ...TYPE.bodyStrong, color: COLORS.text, marginTop: 4 },
  spec: { ...TYPE.small, color: COLORS.textLight },
  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  patient: { ...TYPE.label, color: COLORS.text, marginLeft: 6, flexShrink: 1 },
  phone: { ...TYPE.small, color: COLORS.textLight, marginLeft: 10 },
});

export default AppointmentCard;
