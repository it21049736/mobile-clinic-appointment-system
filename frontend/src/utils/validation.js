// Same rules as backend/src/utils/validation.js — the server re-checks everything.

export const LIMITS = { feeMax: 100000, reasonMin: 5, reasonMax: 500 };

export const normalizePhone = (value) => String(value ?? '').replace(/[\s-]/g, '');

const PATTERNS = {
  personName: /^[A-Za-z][A-Za-z .']{1,49}$/,
  email: /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/,
  phone: /^(?:0\d{9}|\+94\d{9})$/,
  password: /^(?=.*[A-Za-z])(?=.*\d).{6,50}$/,
  specialization: /^[A-Za-z][A-Za-z &\-/]{1,49}$/,
  fee: /^\d+(\.\d{1,2})?$/,
};

// Each rule returns an error message, or '' when the value is valid.
export const rules = {
  name: (v, label = 'Name') => {
    const s = v.trim();
    if (!s) return `${label} is required`;
    if (s.length < 2 || s.length > 50) return `${label} must be 2-50 characters`;
    if (!PATTERNS.personName.test(s)) return `${label} can contain only letters, spaces, dots and apostrophes`;
    return '';
  },
  email: (v) => {
    const s = v.trim();
    if (!s) return 'Email is required';
    if (!PATTERNS.email.test(s)) return 'Enter a valid email, e.g. name@example.com';
    return '';
  },
  phone: (v, label = 'Phone number') => {
    const s = normalizePhone(v);
    if (!s) return `${label} is required`;
    if (!PATTERNS.phone.test(s)) return 'Enter a valid Sri Lankan number, e.g. 0771234567 or +94771234567';
    return '';
  },
  password: (v) => {
    if (!v) return 'Password is required';
    if (v.length < 6) return 'Password must be at least 6 characters';
    if (v.length > 50) return 'Password must be at most 50 characters';
    if (!PATTERNS.password.test(v)) return 'Password must include at least one letter and one number';
    return '';
  },
  confirmPassword: (v, password) => {
    if (!v) return 'Please confirm your password';
    if (v !== password) return 'Passwords do not match';
    return '';
  },
  loginPassword: (v) => (v ? '' : 'Password is required'),
  specialization: (v) => {
    const s = v.trim();
    if (!s) return 'Specialization is required';
    if (!PATTERNS.specialization.test(s)) return 'Specialization must be 2-50 letters';
    return '';
  },
  fee: (v) => {
    const s = String(v).trim();
    if (!s) return 'Consultation fee is required';
    if (!PATTERNS.fee.test(s)) return 'Enter a valid amount (numbers only, up to 2 decimals)';
    if (Number(s) > LIMITS.feeMax) return 'Fee cannot be more than Rs. 100,000';
    return '';
  },
  days: (days) => (days.length ? '' : 'Select at least one available day'),
  reason: (v) => {
    const n = v.trim().length;
    if (!n) return 'Please enter the reason for your visit';
    if (n < LIMITS.reasonMin) return `Reason must be at least ${LIMITS.reasonMin} characters`;
    if (n > LIMITS.reasonMax) return `Reason must be at most ${LIMITS.reasonMax} characters`;
    return '';
  },
};

// Runs { field: () => message } checks and returns only the failing fields.
export const collectErrors = (checks) =>
  Object.fromEntries(
    Object.entries(checks)
      .map(([key, check]) => [key, check()])
      .filter(([, message]) => message)
  );
