import { Platform } from 'react-native';
import api from './api';

// `image` is an expo-image-picker asset ({ uri, mimeType, fileName }).
const appendImage = async (form, image) => {
  const type = image.mimeType || 'image/jpeg';
  const ext = type.split('/')[1] === 'png' ? 'png' : 'jpg';
  const name = image.fileName || `doctor-${Date.now()}.${ext}`;
  if (Platform.OS === 'web') {
    const blob = await (await fetch(image.uri)).blob();
    form.append('profileImage', blob, name);
  } else {
    form.append('profileImage', { uri: image.uri, name, type });
  }
};

const buildDoctorForm = async (doctor, image, removeImage) => {
  const form = new FormData();
  form.append('doctorName', doctor.doctorName);
  form.append('specialization', doctor.specialization);
  form.append('contactNumber', doctor.contactNumber);
  form.append('consultationFee', String(doctor.consultationFee));
  form.append('availableDay', JSON.stringify(doctor.availableDay));
  if (image) await appendImage(form, image);
  else if (removeImage) form.append('removeImage', 'true');
  return form;
};

export const getDoctors = async (params = {}) => (await api.get('/doctors', { params })).data;

export const getDoctorById = async (id) => (await api.get(`/doctors/${id}`)).data;

export const createDoctor = async (doctor, image) =>
  (await api.post('/doctors', await buildDoctorForm(doctor, image))).data;

export const updateDoctor = async (id, doctor, image, removeImage = false) =>
  (await api.put(`/doctors/${id}`, await buildDoctorForm(doctor, image, removeImage))).data;

export const uploadDoctorImage = async (id, image) => {
  const form = new FormData();
  await appendImage(form, image);
  return (await api.put(`/doctors/${id}/image`, form)).data;
};

export const deleteDoctor = async (id) => (await api.delete(`/doctors/${id}`)).data;
