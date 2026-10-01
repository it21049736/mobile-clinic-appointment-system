// Shared field rules. Keep in sync with frontend/src/utils/validation.js.

const PATTERNS = {
  personName: /^[A-Za-z][A-Za-z .']{1,49}$/,
  email: /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/,
  // Sri Lankan numbers: 0XXXXXXXXX (10 digits) or +94XXXXXXXXX
  phone: /^(?:0\d{9}|\+94\d{9})$/,
  password: /^(?=.*[A-Za-z])(?=.*\d).{6,50}$/,
  specialization: /^[A-Za-z][A-Za-z &\-/]{1,49}$/,
};

const MESSAGES = {
  name: 'Name must be 2-50 letters (spaces, dots and apostrophes allowed)',
  doctorName: 'Doctor name must be 2-50 letters (spaces, dots and apostrophes allowed)',
  email: 'Please enter a valid email address',
  phone: 'Enter a valid Sri Lankan number, e.g. 0771234567 or +94771234567',
  password: 'Password must be 6-50 characters and include at least one letter and one number',
  specialization: 'Specialization must be 2-50 letters',
  fee: 'Consultation fee must be between Rs. 0 and Rs. 100,000',
  reason: 'Reason must be between 5 and 500 characters',
};

const LIMITS = {
  feeMax: 100000,
  reasonMin: 5,
  reasonMax: 500,
};

const normalizePhone = (value) => String(value ?? '').replace(/[\s-]/g, '');

module.exports = { PATTERNS, MESSAGES, LIMITS, normalizePhone };
