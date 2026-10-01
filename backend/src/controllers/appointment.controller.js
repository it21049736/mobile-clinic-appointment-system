const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const {
  WEEKDAYS,
  TIME_SLOTS,
  APPOINTMENT_STATUS,
  STATUS_TRANSITIONS,
  DOUBLE_BOOKING_MESSAGE,
} = require('../utils/constants');
const { LIMITS, MESSAGES } = require('../utils/validation');

const POPULATE = [
  {
    path: 'doctorId',
    select: 'doctorName specialization consultationFee profileImage contactNumber availableDay',
  },
  { path: 'userId', select: 'name email phoneNumber' },
];

const httpError = (statusCode, message) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const assertValidReason = (reason) => {
  const length = typeof reason === 'string' ? reason.trim().length : 0;
  if (length < LIMITS.reasonMin || length > LIMITS.reasonMax) throw httpError(400, MESSAGES.reason);
};

const pad = (n) => String(n).padStart(2, '0');

const todayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const minutesNow = () => {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
};

const slotMinutes = (slot) => {
  const [h, m] = slot.split(':').map(Number);
  return h * 60 + m;
};

// Returns the weekday name for a "YYYY-MM-DD" string, or null if it isn't a real calendar date.
const weekdayOf = (dateStr) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr || '')) return null;
  const d = new Date(`${dateStr}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== dateStr) return null;
  return WEEKDAYS[d.getUTCDay()];
};

const ownerIdOf = (appointment) => String(appointment.userId?._id || appointment.userId);

const canAccess = (appointment, user) =>
  user.role === 'admin' || ownerIdOf(appointment) === String(user._id);

const isDuplicateSlotError = (error) =>
  error && error.code === 11000 && error.keyPattern && error.keyPattern.appointmentTime;

// Core booking rules shared by create and update.
const assertSlotBookable = async ({ doctor, date, time, excludeId }) => {
  const dayName = weekdayOf(date);
  if (!dayName) throw httpError(400, 'Please select a valid date (YYYY-MM-DD)');

  const today = todayString();
  if (date < today) throw httpError(400, 'Appointment date cannot be in the past');

  if (!doctor.availableDay.includes(dayName)) {
    throw httpError(
      400,
      `${doctor.doctorName} is not available on ${dayName}. Available days: ${doctor.availableDay.join(', ')}`
    );
  }

  if (!TIME_SLOTS.includes(time)) throw httpError(400, 'Please select a valid time slot');

  if (date === today && slotMinutes(time) <= minutesNow()) {
    throw httpError(400, 'This time slot has already passed. Please select a later time.');
  }

  const clash = await Appointment.exists({
    doctorId: doctor._id,
    appointmentDate: date,
    appointmentTime: time,
    isActive: true,
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  });
  if (clash) throw httpError(409, DOUBLE_BOOKING_MESSAGE);
};

const findDoctor = async (doctorId) => {
  if (!mongoose.isValidObjectId(doctorId)) throw httpError(400, 'Please select a doctor');
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw httpError(404, 'Doctor not found');
  return doctor;
};

const findAccessibleAppointment = async (id, user) => {
  if (!mongoose.isValidObjectId(id)) throw httpError(404, 'Appointment not found');
  const appointment = await Appointment.findById(id);
  if (!appointment) throw httpError(404, 'Appointment not found');
  if (!canAccess(appointment, user)) {
    throw httpError(403, 'You are not allowed to access this appointment');
  }
  return appointment;
};

// @route GET /api/appointments?status=&date=&doctorId=  (Private)
// Admin sees every appointment; a patient sees only their own.
const getAppointments = async (req, res, next) => {
  try {
    const { status, date, doctorId } = req.query;
    const filter = req.user.role === 'admin' ? {} : { userId: req.user._id };
    if (status && APPOINTMENT_STATUS.includes(status)) filter.status = status;
    if (date) filter.appointmentDate = date;
    if (doctorId && mongoose.isValidObjectId(doctorId)) filter.doctorId = doctorId;

    const appointments = await Appointment.find(filter)
      .populate(POPULATE)
      .sort({ appointmentDate: -1, appointmentTime: 1 });
    res.json(appointments);
  } catch (error) {
    next(error);
  }
};

// @route GET /api/appointments/booked-slots?doctorId=&date=&excludeId=  (Private)
// Lets the booking screen grey out taken/past slots before the patient submits.
const getBookedSlots = async (req, res, next) => {
  try {
    const { doctorId, date, excludeId } = req.query;
    const doctor = await findDoctor(doctorId);
    const dayName = weekdayOf(date);
    if (!dayName) throw httpError(400, 'Please select a valid date (YYYY-MM-DD)');

    const filter = { doctorId, appointmentDate: date, isActive: true };
    if (excludeId && mongoose.isValidObjectId(excludeId)) filter._id = { $ne: excludeId };
    const booked = await Appointment.find(filter).select('appointmentTime');

    const today = todayString();
    const pastSlots =
      date < today
        ? [...TIME_SLOTS]
        : date === today
          ? TIME_SLOTS.filter((s) => slotMinutes(s) <= minutesNow())
          : [];

    res.json({
      doctorId,
      date,
      dayName,
      isAvailableDay: doctor.availableDay.includes(dayName),
      slots: TIME_SLOTS,
      bookedSlots: booked.map((a) => a.appointmentTime),
      pastSlots,
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/appointments/:id  (Owner or Admin)
const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await findAccessibleAppointment(req.params.id, req.user);
    await appointment.populate(POPULATE);
    res.json(appointment);
  } catch (error) {
    next(error);
  }
};

// @route POST /api/appointments  (Patient)
const createAppointment = async (req, res, next) => {
  try {
    if (req.user.role !== 'patient') {
      throw httpError(403, 'Only patients can book appointments');
    }
    const { doctorId, appointmentDate, appointmentTime, reason } = req.body;
    assertValidReason(reason);

    const doctor = await findDoctor(doctorId);
    await assertSlotBookable({ doctor, date: appointmentDate, time: appointmentTime });

    const appointment = await Appointment.create({
      doctorId: doctor._id,
      userId: req.user._id,
      appointmentDate,
      appointmentTime,
      reason,
    });
    await appointment.populate(POPULATE);
    res.status(201).json(appointment);
  } catch (error) {
    next(isDuplicateSlotError(error) ? httpError(409, DOUBLE_BOOKING_MESSAGE) : error);
  }
};

// @route PUT /api/appointments/:id  (Owner or Admin) — date, time and reason; Pending only
const updateAppointment = async (req, res, next) => {
  try {
    const appointment = await findAccessibleAppointment(req.params.id, req.user);
    if (appointment.status !== 'Pending') {
      throw httpError(400, `Only pending appointments can be changed (current status: ${appointment.status})`);
    }

    const { appointmentDate, appointmentTime, reason } = req.body;
    if (reason !== undefined) assertValidReason(reason);
    const date = appointmentDate || appointment.appointmentDate;
    const time = appointmentTime || appointment.appointmentTime;

    if (date !== appointment.appointmentDate || time !== appointment.appointmentTime) {
      const doctor = await findDoctor(appointment.doctorId);
      await assertSlotBookable({ doctor, date, time, excludeId: appointment._id });
      appointment.appointmentDate = date;
      appointment.appointmentTime = time;
    }
    if (reason !== undefined) appointment.reason = reason;

    await appointment.save();
    await appointment.populate(POPULATE);
    res.json(appointment);
  } catch (error) {
    next(isDuplicateSlotError(error) ? httpError(409, DOUBLE_BOOKING_MESSAGE) : error);
  }
};

// @route PATCH /api/appointments/:id/status  (Admin)
// Pending → Confirmed/Cancelled, Confirmed → Completed/Cancelled.
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!APPOINTMENT_STATUS.includes(status)) {
      throw httpError(400, `Status must be one of: ${APPOINTMENT_STATUS.join(', ')}`);
    }
    const appointment = await findAccessibleAppointment(req.params.id, req.user);
    if (!STATUS_TRANSITIONS[appointment.status].includes(status)) {
      throw httpError(400, `Cannot change status from ${appointment.status} to ${status}`);
    }

    appointment.status = status;
    await appointment.save();
    await appointment.populate(POPULATE);
    res.json(appointment);
  } catch (error) {
    next(error);
  }
};

// @route PATCH /api/appointments/:id/cancel  (Owner or Admin)
const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await findAccessibleAppointment(req.params.id, req.user);
    if (!['Pending', 'Confirmed'].includes(appointment.status)) {
      throw httpError(400, `A ${appointment.status.toLowerCase()} appointment cannot be cancelled`);
    }
    if (req.user.role !== 'admin' && appointment.appointmentDate < todayString()) {
      throw httpError(400, 'Past appointments cannot be cancelled');
    }

    appointment.status = 'Cancelled';
    await appointment.save();
    await appointment.populate(POPULATE);
    res.json(appointment);
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/appointments/:id  (Admin)
const deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await findAccessibleAppointment(req.params.id, req.user);
    await appointment.deleteOne();
    res.json({ message: 'Appointment deleted', _id: appointment._id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAppointments,
  getBookedSlots,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  deleteAppointment,
};
