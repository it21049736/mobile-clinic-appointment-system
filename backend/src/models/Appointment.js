const mongoose = require('mongoose');
const { TIME_SLOTS, APPOINTMENT_STATUS } = require('../utils/constants');
const { LIMITS, MESSAGES } = require('../utils/validation');

const appointmentSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor is required'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient is required'],
    },
    // "YYYY-MM-DD" string: a calendar day, independent of server/device timezone.
    appointmentDate: {
      type: String,
      required: [true, 'Appointment date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
    },
    appointmentTime: {
      type: String,
      required: [true, 'Appointment time is required'],
      enum: { values: TIME_SLOTS, message: 'Invalid time slot' },
    },
    reason: {
      type: String,
      required: [true, 'Reason for the visit is required'],
      trim: true,
      minlength: [LIMITS.reasonMin, MESSAGES.reason],
      maxlength: [LIMITS.reasonMax, MESSAGES.reason],
    },
    status: {
      type: String,
      enum: APPOINTMENT_STATUS,
      default: 'Pending',
    },
    // Mirrors status !== 'Cancelled'; lets the partial unique index free a cancelled slot.
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  { timestamps: true }
);

appointmentSchema.pre('validate', function (next) {
  this.isActive = this.status !== 'Cancelled';
  next();
});

// Database-level guard against double booking (covers concurrent requests).
appointmentSchema.index(
  { doctorId: 1, appointmentDate: 1, appointmentTime: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
