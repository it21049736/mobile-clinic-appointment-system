import React, { useLayoutEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import DoctorAvatar from '../../components/DoctorAvatar';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { createDoctor, updateDoctor } from '../../services/doctorService';
import { COLORS } from '../../constants/colors';
import { SPECIALIZATIONS, WEEKDAYS_MON_FIRST } from '../../constants/clinic';
import { errorMessage, showMessage } from '../../utils/dialogs';
import { pickImage } from '../../utils/pickImage';
import { rules, collectErrors, normalizePhone } from '../../utils/validation';
import { centered, MAX_WIDTH } from '../../utils/responsive';

const validate = (f) =>
  collectErrors({
    doctorName: () => rules.name(f.doctorName, 'Doctor name'),
    specialization: () => rules.specialization(f.specialization),
    contactNumber: () => rules.phone(f.contactNumber, 'Contact number'),
    consultationFee: () => rules.fee(f.consultationFee),
    availableDay: () => rules.days(f.availableDay),
  });

const DoctorFormScreen = ({ route, navigation }) => {
  const existing = route.params?.doctor;
  const isEdit = !!existing;

  const [form, setForm] = useState({
    doctorName: existing?.doctorName || '',
    specialization: existing?.specialization || '',
    contactNumber: existing?.contactNumber || '',
    consultationFee: existing ? String(existing.consultationFee) : '',
    availableDay: existing?.availableDay || [],
  });
  const [image, setImage] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: isEdit ? 'Edit Doctor' : 'Add Doctor' });
  }, [navigation, isEdit]);

  const clearError = (key) => setErrors((e) => (e[key] ? { ...e, [key]: '' } : e));

  const set = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }));
    clearError(key);
  };

  const toggleDay = (day) => {
    setForm((f) => ({
      ...f,
      availableDay: f.availableDay.includes(day) ? f.availableDay.filter((d) => d !== day) : [...f.availableDay, day],
    }));
    clearError('availableDay');
  };

  const handlePick = async () => {
    const picked = await pickImage();
    if (picked) {
      setImage(picked);
      setRemoveImage(false);
    }
  };

  const hasStoredImage = isEdit && existing.profileImage && !removeImage;

  const handleSave = async () => {
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length) return;

    const payload = {
      ...form,
      doctorName: form.doctorName.trim().replace(/\s+/g, ' '),
      specialization: form.specialization.trim().replace(/\s+/g, ' '),
      contactNumber: normalizePhone(form.contactNumber),
      consultationFee: Number(form.consultationFee),
    };

    setSaving(true);
    try {
      if (isEdit) {
        await updateDoctor(existing._id, payload, image, removeImage);
        showMessage('Saved', 'Doctor details were updated.');
      } else {
        await createDoctor(payload, image);
        showMessage('Doctor added', `${payload.doctorName} is now listed for patients.`);
      }
      navigation.goBack();
    } catch (err) {
      setSaving(false);
      showMessage('Could not save doctor', errorMessage(err));
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.photoBlock}>
          <DoctorAvatar
            doctor={removeImage ? { doctorName: form.doctorName } : { ...existing, doctorName: form.doctorName }}
            uri={image?.uri}
            size={104}
          />
          <View style={styles.photoButtons}>
            <CustomButton title={image || hasStoredImage ? 'Change Photo' : 'Upload Photo'} icon="image-outline" variant="outline" compact onPress={handlePick} />
            {(image || hasStoredImage) && (
              <CustomButton
                title="Remove"
                variant="dangerOutline"
                compact
                style={styles.removeBtn}
                onPress={() => {
                  setImage(null);
                  if (isEdit && existing.profileImage) setRemoveImage(true);
                }}
              />
            )}
          </View>
          <Text style={styles.hint}>JPG or PNG, up to 5MB</Text>
        </View>

        <CustomInput label="Doctor name" icon="person-outline" placeholder="Dr. Nimal Silva" value={form.doctorName} onChangeText={set('doctorName')} autoCapitalize="words" maxLength={50} error={errors.doctorName} />

        <CustomInput label="Specialization" icon="medkit-outline" placeholder="e.g. General Physician" value={form.specialization} onChangeText={set('specialization')} autoCapitalize="words" maxLength={50} error={errors.specialization} />
        <View style={styles.suggestions}>
          {SPECIALIZATIONS.map((s) => (
            <TouchableOpacity key={s} style={[styles.suggestion, form.specialization === s && styles.suggestionOn]} onPress={() => set('specialization')(s)}>
              <Text style={[styles.suggestionText, form.specialization === s && styles.suggestionTextOn]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <CustomInput label="Contact number" icon="call-outline" placeholder="0712345678" value={form.contactNumber} onChangeText={set('contactNumber')} keyboardType="phone-pad" maxLength={16} error={errors.contactNumber} />
        <CustomInput label="Consultation fee (Rs.)" icon="cash-outline" placeholder="2500" value={form.consultationFee} onChangeText={(v) => set('consultationFee')(v.replace(/[^0-9.]/g, ''))} keyboardType="decimal-pad" maxLength={9} error={errors.consultationFee} />

        <Text style={styles.label}>Available days</Text>
        <View style={styles.days}>
          {WEEKDAYS_MON_FIRST.map((day) => {
            const on = form.availableDay.includes(day);
            return (
              <TouchableOpacity key={day} style={[styles.day, on && styles.dayOn]} onPress={() => toggleDay(day)} activeOpacity={0.8}>
                <Text style={[styles.dayText, on && styles.dayTextOn]}>{day.slice(0, 3)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {!!errors.availableDay && <Text style={styles.error}>{errors.availableDay}</Text>}

        <CustomButton title={isEdit ? 'Save Changes' : 'Add Doctor'} icon="checkmark" onPress={handleSave} loading={saving} style={styles.save} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { ...centered(MAX_WIDTH.content), padding: 16, paddingBottom: 40 },
  photoBlock: { alignItems: 'center', marginBottom: 8 },
  photoButtons: { flexDirection: 'row', marginTop: 12 },
  removeBtn: { marginLeft: 8 },
  hint: { fontSize: 13, color: COLORS.textLight, marginTop: 6 },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 },
  suggestion: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingHorizontal: 12,
    minHeight: 40,
    justifyContent: 'center',
    marginRight: 6,
    marginBottom: 6,
  },
  suggestionOn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  suggestionText: { fontSize: 13, color: COLORS.text },
  suggestionTextOn: { color: COLORS.white, fontWeight: '700' },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginTop: 10, marginBottom: 8 },
  days: { flexDirection: 'row', justifyContent: 'space-between' },
  day: {
    flex: 1,
    marginHorizontal: 2,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  dayOn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dayText: { fontSize: 13, fontWeight: '700', color: COLORS.textLight },
  dayTextOn: { color: COLORS.white },
  error: { color: COLORS.error, fontSize: 13, marginTop: 6 },
  save: { marginTop: 24 },
});

export default DoctorFormScreen;
