import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DoctorAvatar from './DoctorAvatar';
import { COLORS, RADIUS, SHADOW, TYPE } from '../constants/colors';
import { WEEKDAYS_MON_FIRST, formatFee, shortDayLabel, todayString, upcomingDates } from '../constants/clinic';

export const daysLabel = (days = []) =>
  WEEKDAYS_MON_FIRST.filter((d) => days.includes(d))
    .map((d) => d.slice(0, 3))
    .join(', ');

const nextAvailableLabel = (days) => {
  const next = upcomingDates(days, 1)[0];
  if (!next) return 'No upcoming clinic days';
  if (next === todayString()) return 'Available today';
  const { day, date, month } = shortDayLabel(next);
  return `Next available ${day} ${date} ${month}`;
};

const DoctorCard = ({ doctor, onPress, right }) => {
  const nextLabel = nextAvailableLabel(doctor.availableDay);
  const today = nextLabel === 'Available today';

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${doctor.doctorName}, ${doctor.specialization}, ${formatFee(doctor.consultationFee)}. ${nextLabel}`}
    >
      <DoctorAvatar doctor={doctor} size={64} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{doctor.doctorName}</Text>
        <Text style={styles.spec} numberOfLines={1}>{doctor.specialization}</Text>
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={15} color={COLORS.textLight} />
          <Text style={styles.meta} numberOfLines={1}>{daysLabel(doctor.availableDay)}</Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.fee}>{formatFee(doctor.consultationFee)}</Text>
          <View style={[styles.nextPill, today && styles.nextPillToday]}>
            <Text style={[styles.nextText, today && styles.nextTextToday]} numberOfLines={1}>{nextLabel}</Text>
          </View>
        </View>
      </View>
      {right || <Ionicons name="chevron-forward" size={22} color={COLORS.textLight} />}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: 14,
    marginBottom: 12,
    ...SHADOW,
  },
  pressed: { backgroundColor: COLORS.muted },
  info: { flex: 1, marginLeft: 14, marginRight: 6 },
  name: { ...TYPE.heading, fontSize: 17, color: COLORS.text },
  spec: { ...TYPE.label, color: COLORS.primary },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  meta: { ...TYPE.small, color: COLORS.textLight, marginLeft: 6, flex: 1 },
  footer: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 8 },
  fee: { ...TYPE.bodyStrong, color: COLORS.text, marginRight: 10 },
  nextPill: { backgroundColor: COLORS.muted, borderRadius: RADIUS.pill, paddingHorizontal: 10, paddingVertical: 3 },
  nextPillToday: { backgroundColor: '#E0F3E8' },
  nextText: { fontSize: 12, fontWeight: '600', color: COLORS.textLight },
  nextTextToday: { color: COLORS.success },
});

export default DoctorCard;
