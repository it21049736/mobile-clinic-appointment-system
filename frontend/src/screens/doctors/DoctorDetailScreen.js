import React, { useCallback, useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import DoctorAvatar from '../../components/DoctorAvatar';
import InfoRow from '../../components/InfoRow';
import CustomButton from '../../components/CustomButton';
import EmptyState from '../../components/EmptyState';
import { AuthContext } from '../../context/AuthContext';
import { getDoctorById, deleteDoctor, uploadDoctorImage } from '../../services/doctorService';
import { COLORS, SHADOW } from '../../constants/colors';
import { WEEKDAYS_MON_FIRST, formatDate, formatFee, upcomingDates } from '../../constants/clinic';
import { confirmAction, errorMessage, showMessage } from '../../utils/dialogs';
import { pickImage } from '../../utils/pickImage';
import { centered, MAX_WIDTH } from '../../utils/responsive';

const DoctorDetailScreen = ({ route, navigation }) => {
  const { doctorId } = route.params;
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      setDoctor(await getDoctorById(doctorId));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleChangePhoto = async () => {
    const image = await pickImage();
    if (!image) return;
    setBusy('photo');
    try {
      setDoctor(await uploadDoctorImage(doctor._id, image));
      showMessage('Photo updated', 'The profile image was uploaded.');
    } catch (err) {
      showMessage('Upload failed', errorMessage(err));
    } finally {
      setBusy('');
    }
  };

  const handleDelete = () =>
    confirmAction({
      title: 'Delete doctor?',
      message: `${doctor.doctorName} will be removed from the clinic. This cannot be undone.`,
      confirmText: 'Delete',
      destructive: true,
      onConfirm: async () => {
        setBusy('delete');
        try {
          await deleteDoctor(doctor._id);
          navigation.goBack();
        } catch (err) {
          setBusy('');
          showMessage('Cannot delete doctor', errorMessage(err));
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

  if (!doctor) {
    return (
      <View style={styles.center}>
        <EmptyState icon="alert-circle-outline" title="Doctor not available" message={error}>
          <CustomButton title="Go back" compact onPress={() => navigation.goBack()} style={styles.retry} />
        </EmptyState>
      </View>
    );
  }

  const nextDate = upcomingDates(doctor.availableDay, 1)[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <DoctorAvatar doctor={doctor} size={110} />
        <Text style={styles.name}>{doctor.doctorName}</Text>
        <Text style={styles.spec}>{doctor.specialization}</Text>
        <View style={styles.feePill}>
          <Text style={styles.feeText}>Consultation {formatFee(doctor.consultationFee)}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Availability</Text>
        <View style={styles.days}>
          {WEEKDAYS_MON_FIRST.map((day) => {
            const on = doctor.availableDay.includes(day);
            return (
              <View key={day} style={[styles.day, on && styles.dayOn]}>
                <Text style={[styles.dayText, on && styles.dayTextOn]}>{day.slice(0, 3)}</Text>
              </View>
            );
          })}
        </View>
        <Text style={styles.hint}>Appointments run from 9:00 AM to 5:00 PM in 30-minute slots.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Details</Text>
        <InfoRow icon="medkit-outline" label="Specialization" value={doctor.specialization} />
        <InfoRow icon="call-outline" label="Contact number" value={doctor.contactNumber} />
        <InfoRow icon="cash-outline" label="Consultation fee" value={formatFee(doctor.consultationFee)} />
        <InfoRow icon="calendar-outline" label="Next available day" value={nextDate ? formatDate(nextDate) : 'Not scheduled'} last />
      </View>

      {isAdmin ? (
        <View>
          <CustomButton title="Edit Doctor" icon="create-outline" onPress={() => navigation.navigate('DoctorForm', { doctor })} />
          <CustomButton title="Change Photo" icon="image-outline" variant="outline" loading={busy === 'photo'} disabled={!!busy} onPress={handleChangePhoto} />
          <CustomButton title="Delete Doctor" icon="trash-outline" variant="dangerOutline" loading={busy === 'delete'} disabled={!!busy} onPress={handleDelete} />
        </View>
      ) : (
        <CustomButton
          title="Book Appointment"
          icon="calendar"
          onPress={() => navigation.navigate('BookAppointment', { doctorId: doctor._id })}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { ...centered(MAX_WIDTH.content), padding: 16, paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  retry: { marginTop: 14 },
  hero: { alignItems: 'center', paddingVertical: 12 },
  name: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginTop: 14, textAlign: 'center' },
  spec: { fontSize: 15, color: COLORS.primary, fontWeight: '600', marginTop: 4 },
  feePill: { backgroundColor: COLORS.primaryLight, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginTop: 12 },
  feeText: { color: COLORS.primaryDark, fontWeight: '700', fontSize: 13 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 14,
    ...SHADOW,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 10 },
  days: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { flex: 1, marginHorizontal: 2, paddingVertical: 8, borderRadius: 10, backgroundColor: COLORS.muted, alignItems: 'center' },
  dayOn: { backgroundColor: COLORS.primary },
  dayText: { fontSize: 13, fontWeight: '700', color: COLORS.textDisabled },
  dayTextOn: { color: COLORS.white },
  hint: { fontSize: 13, color: COLORS.textLight, marginTop: 10 },
});

export default DoctorDetailScreen;
