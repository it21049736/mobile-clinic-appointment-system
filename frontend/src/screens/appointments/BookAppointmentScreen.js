import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DoctorAvatar from '../../components/DoctorAvatar';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import EmptyState from '../../components/EmptyState';
import { getDoctorById } from '../../services/doctorService';
import { bookAppointment, getBookedSlots, updateAppointment } from '../../services/appointmentService';
import { COLORS, SHADOW } from '../../constants/colors';
import { formatDate, formatFee, formatTime, shortDayLabel, upcomingDates } from '../../constants/clinic';
import { errorMessage, showMessage } from '../../utils/dialogs';
import { rules, LIMITS } from '../../utils/validation';
import { useResponsive, centered, MAX_WIDTH } from '../../utils/responsive';

// Book mode: params { doctorId }. Reschedule mode: params { doctorId, appointment }.
const BookAppointmentScreen = ({ route, navigation }) => {
  const { doctorId, appointment } = route.params;
  const isReschedule = !!appointment;
  const { isWide } = useResponsive();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [slotInfo, setSlotInfo] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedTime, setSelectedTime] = useState(appointment?.appointmentTime || null);
  const [reason, setReason] = useState(appointment?.reason || '');
  const [formError, setFormError] = useState('');
  const [reasonError, setReasonError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: isReschedule ? 'Reschedule' : 'Book Appointment' });
  }, [navigation, isReschedule]);

  const dates = useMemo(() => (doctor ? upcomingDates(doctor.availableDay, 14) : []), [doctor]);

  useEffect(() => {
    (async () => {
      try {
        const d = await getDoctorById(doctorId);
        setDoctor(d);
        const options = upcomingDates(d.availableDay, 14);
        const initial = appointment && options.includes(appointment.appointmentDate) ? appointment.appointmentDate : options[0];
        setSelectedDate(initial || null);
      } catch (err) {
        setLoadError(errorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [doctorId, appointment]);

  const loadSlots = useCallback(async () => {
    if (!selectedDate) return;
    setSlotsLoading(true);
    try {
      setSlotInfo(await getBookedSlots(doctorId, selectedDate, appointment?._id));
    } catch (err) {
      setSlotInfo(null);
      setFormError(errorMessage(err));
    } finally {
      setSlotsLoading(false);
    }
  }, [doctorId, selectedDate, appointment]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  const isUnavailable = (slot) =>
    !slotInfo || slotInfo.bookedSlots.includes(slot) || slotInfo.pastSlots.includes(slot);

  // Drop a selection that became unavailable after switching date or reloading slots.
  useEffect(() => {
    if (slotInfo && selectedTime && isUnavailable(selectedTime)) setSelectedTime(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotInfo]);

  const freeCount = slotInfo ? slotInfo.slots.filter((s) => !isUnavailable(s)).length : 0;

  const handleSubmit = async () => {
    if (!selectedDate) return setFormError('Please select a date.');
    if (!selectedTime) return setFormError('Please select an available time slot.');
    const reasonProblem = rules.reason(reason);
    setReasonError(reasonProblem);
    if (reasonProblem) return setFormError('');
    setFormError('');
    setSubmitting(true);

    const payload = {
      doctorId,
      appointmentDate: selectedDate,
      appointmentTime: selectedTime,
      reason: reason.trim(),
    };

    try {
      if (isReschedule) {
        await updateAppointment(appointment._id, payload);
        showMessage('Appointment updated', `New time: ${formatDate(selectedDate)} at ${formatTime(selectedTime)}.`);
        navigation.goBack();
      } else {
        const created = await bookAppointment(payload);
        showMessage(
          'Appointment booked',
          `${doctor.doctorName}, ${formatDate(selectedDate)} at ${formatTime(selectedTime)}.\nThe clinic will confirm it soon.`
        );
        navigation.popToTop();
        navigation.navigate('AppointmentsTab', {
          screen: 'AppointmentDetail',
          params: { id: created._id },
          initial: false,
        });
      }
    } catch (err) {
      setSubmitting(false);
      if (err.status === 409) {
        showMessage('Time slot unavailable', err.message);
        setSelectedTime(null);
        loadSlots();
      } else {
        setFormError(errorMessage(err));
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!doctor) {
    return (
      <View style={styles.center}>
        <EmptyState icon="alert-circle-outline" title="Doctor not available" message={loadError} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.doctorCard}>
          <DoctorAvatar doctor={doctor} size={52} />
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{doctor.doctorName}</Text>
            <Text style={styles.doctorSpec}>{doctor.specialization}</Text>
          </View>
          <Text style={styles.fee}>{formatFee(doctor.consultationFee)}</Text>
        </View>

        <Text style={styles.section}>1. Select a date</Text>
        {dates.length === 0 ? (
          <Text style={styles.muted}>This doctor has no upcoming clinic days.</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRow}>
            {dates.map((d) => {
              const { day, date, month } = shortDayLabel(d);
              const on = d === selectedDate;
              return (
                <TouchableOpacity key={d} style={[styles.dateChip, on && styles.dateChipOn]} onPress={() => setSelectedDate(d)} activeOpacity={0.85}>
                  <Text style={[styles.dateDay, on && styles.onText]}>{day}</Text>
                  <Text style={[styles.dateNum, on && styles.onText]}>{date}</Text>
                  <Text style={[styles.dateMonth, on && styles.onText]}>{month}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        <View style={styles.sectionRow}>
          <Text style={styles.section}>2. Select a time</Text>
          {slotInfo && !slotsLoading && <Text style={styles.muted}>{freeCount} free</Text>}
        </View>
        {slotsLoading ? (
          <ActivityIndicator color={COLORS.primary} style={styles.slotLoader} />
        ) : slotInfo ? (
          <>
            <View style={styles.slotGrid}>
              {slotInfo.slots.map((slot) => {
                const booked = slotInfo.bookedSlots.includes(slot);
                const disabled = isUnavailable(slot);
                const on = slot === selectedTime;
                return (
                  <TouchableOpacity
                    key={slot}
                    disabled={disabled}
                    onPress={() => setSelectedTime(slot)}
                    style={[styles.slot, isWide && styles.slotWide, on && styles.slotOn, disabled && styles.slotOff]}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.slotText, on && styles.onText, disabled && styles.slotOffText]}>{formatTime(slot)}</Text>
                    {booked && <Text style={styles.bookedTag}>Booked</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.legend}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]} />
              <Text style={styles.legendText}>Available</Text>
              <View style={[styles.legendDot, { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]} />
              <Text style={styles.legendText}>Selected</Text>
              <View style={[styles.legendDot, { backgroundColor: COLORS.muted, borderColor: COLORS.muted }]} />
              <Text style={styles.legendText}>Booked / passed</Text>
            </View>
          </>
        ) : (
          <Text style={styles.muted}>Select a date to see time slots.</Text>
        )}

        <Text style={styles.section}>3. Reason for visit</Text>
        <CustomInput
          placeholder="e.g. Fever and headache for 3 days"
          value={reason}
          onChangeText={(v) => {
            setReason(v);
            if (reasonError) setReasonError('');
          }}
          multiline
          numberOfLines={4}
          maxLength={LIMITS.reasonMax}
          autoCapitalize="sentences"
          error={reasonError}
        />
        <Text style={styles.counter}>
          {reason.trim().length}/{LIMITS.reasonMax}
        </Text>

        {selectedDate && selectedTime && (
          <View style={styles.summary}>
            <Ionicons name="calendar" size={18} color={COLORS.primaryDark} />
            <Text style={styles.summaryText}>
              {formatDate(selectedDate)} at {formatTime(selectedTime)}
            </Text>
          </View>
        )}

        {!!formError && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color={COLORS.error} />
            <Text style={styles.errorText}>{formError}</Text>
          </View>
        )}

        <CustomButton
          title={isReschedule ? 'Save New Time' : 'Confirm Booking'}
          icon="checkmark-circle-outline"
          onPress={handleSubmit}
          loading={submitting}
          disabled={!dates.length}
          style={styles.submit}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { ...centered(MAX_WIDTH.content), padding: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    ...SHADOW,
  },
  doctorInfo: { flex: 1, marginLeft: 12 },
  doctorName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  doctorSpec: { fontSize: 13, color: COLORS.primary, marginTop: 2 },
  fee: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  section: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginTop: 22, marginBottom: 10 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  muted: { fontSize: 13, color: COLORS.textLight, marginBottom: 10 },
  counter: { fontSize: 13, color: COLORS.textLight, textAlign: 'right', marginTop: -2 },
  dateRow: { paddingRight: 8 },
  dateChip: {
    width: 64,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    marginRight: 8,
  },
  dateChipOn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dateDay: { fontSize: 13, color: COLORS.textLight, fontWeight: '600' },
  dateNum: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginVertical: 2 },
  dateMonth: { fontSize: 13, color: COLORS.textLight },
  onText: { color: COLORS.white },
  slotLoader: { marginVertical: 20 },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  slot: {
    width: '25%',
    minWidth: 76,
    flexGrow: 1,
    maxWidth: '31%',
    margin: 4,
    minHeight: 52,
    paddingVertical: 6,
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  slotWide: { width: '18%', maxWidth: '18.6%' },
  slotOn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  slotOff: { backgroundColor: COLORS.muted, borderColor: COLORS.muted },
  slotText: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  slotOffText: { color: COLORS.textDisabled, textDecorationLine: 'line-through' },
  bookedTag: { fontSize: 12, color: COLORS.error, marginTop: 2, fontWeight: '600' },
  legend: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 10 },
  legendDot: { width: 12, height: 12, borderRadius: 3, borderWidth: 1, marginRight: 4 },
  legendText: { fontSize: 13, color: COLORS.textLight, marginRight: 12 },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  summaryText: { marginLeft: 8, color: COLORS.primaryDark, fontWeight: '700', fontSize: 14 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.errorBg,
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  errorText: { color: COLORS.error, marginLeft: 8, flex: 1, fontSize: 13 },
  submit: { marginTop: 16 },
});

export default BookAppointmentScreen;
