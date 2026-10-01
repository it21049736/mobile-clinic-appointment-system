const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { PATTERNS, MESSAGES, normalizePhone } = require('../utils/validation');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      match: [PATTERNS.personName, MESSAGES.name],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [100, 'Email is too long'],
      match: [PATTERNS.email, MESSAGES.email],
    },
    // Stored as a bcrypt hash; the plain-text strength rule is enforced in registerUser.
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      set: normalizePhone,
      match: [PATTERNS.phone, MESSAGES.phone],
    },
    role: {
      type: String,
      enum: ['patient', 'admin'],
      default: 'patient',
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
