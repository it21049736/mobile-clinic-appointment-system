import api from './api';

export const getAppointments = async (params = {}) =>
  (await api.get('/appointments', { params })).data;

export const getAppointmentById = async (id) => (await api.get(`/appointments/${id}`)).data;

export const getBookedSlots = async (doctorId, date, excludeId) =>
  (await api.get('/appointments/booked-slots', { params: { doctorId, date, excludeId } })).data;

export const bookAppointment = async ({ doctorId, appointmentDate, appointmentTime, reason }) =>
  (await api.post('/appointments', { doctorId, appointmentDate, appointmentTime, reason })).data;

export const updateAppointment = async (id, { appointmentDate, appointmentTime, reason }) =>
  (await api.put(`/appointments/${id}`, { appointmentDate, appointmentTime, reason })).data;

export const cancelAppointment = async (id) => (await api.patch(`/appointments/${id}/cancel`)).data;

export const updateAppointmentStatus = async (id, status) =>
  (await api.patch(`/appointments/${id}/status`, { status })).data;

export const deleteAppointment = async (id) => (await api.delete(`/appointments/${id}`)).data;
