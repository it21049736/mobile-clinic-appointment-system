const mongoose = require('mongoose');
const { WEEKDAYS } = require('../utils/constants');
const { PATTERNS, MESSAGES, LIMITS, normalizePhone } = require('../utils/validation');

const doctorSchema = new mongoose.Schema(
  {
    doctorName: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
      match: [PATTERNS.personName, MESSAGES.doctorName],
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
      match: [PATTERNS.specialization, MESSAGES.specialization],
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required'],
      set: normalizePhone,
      match: [PATTERNS.phone, MESSAGES.phone],
    },
    consultationFee: {
      type: Number,
      required: [true, 'Consultation fee is required'],
      min: [0, MESSAGES.fee],
      max: [LIMITS.feeMax, MESSAGES.fee],
    },
    availableDay: {
      type: [{ type: String, enum: WEEKDAYS }],
      validate: {
        validator: (days) => Array.isArray(days) && days.length > 0,
        message: 'Select at least one available day',
      },
    },
    profileImage: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);
