export const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

// Clinic order (Mon first) for pickers and display.
export const WEEKDAYS_MON_FIRST = [...WEEKDAYS.slice(1), WEEKDAYS[0]];

export const SPECIALIZATIONS = [
  'General Physician',
  'Pediatrician',
  'Cardiologist',
  'Dermatologist',
  'Gynecologist',
  'ENT Specialist',
  'Orthopedic',
  'Eye Specialist',
  'Dentist',
  'Psychiatrist',
];

export const APPOINTMENT_STATUSES = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

// Mirrors backend STATUS_TRANSITIONS.
export const STATUS_ACTIONS = {
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Completed', 'Cancelled'],
  Completed: [],
  Cancelled: [],
};

export const DOUBLE_BOOKING_MESSAGE =
  'This time slot is already booked. Please select another time.';

const pad = (n) => String(n).padStart(2, '0');

export const toDateString = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const todayString = () => toDateString(new Date());

// "YYYY-MM-DD" -> local Date at midnight (avoids UTC shift of new Date("YYYY-MM-DD")).
export const parseDate = (str) => {
  const [y, m, d] = String(str).split('-').map(Number);
  return new Date(y, m - 1, d);
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const formatDate = (str) => {
  if (!str) return '';
  const d = parseDate(str);
  return `${WEEKDAYS[d.getDay()].slice(0, 3)}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

export const formatTime = (slot) => {
  if (!slot) return '';
  const [h, m] = slot.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${pad(hour)}:${pad(m)} ${suffix}`;
};

export const formatFee = (fee) => `Rs. ${Number(fee || 0).toLocaleString('en-US')}`;

// Next `count` calendar dates (from today) that fall on one of `availableDays`.
export const upcomingDates = (availableDays = [], count = 14, horizonDays = 60) => {
  const result = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  for (let i = 0; i < horizonDays && result.length < count; i += 1) {
    if (availableDays.includes(WEEKDAYS[cursor.getDay()])) {
      result.push(toDateString(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return result;
};

export const shortDayLabel = (str) => {
  const d = parseDate(str);
  return { day: WEEKDAYS[d.getDay()].slice(0, 3), date: d.getDate(), month: MONTHS[d.getMonth()] };
};

export const isUpcoming = (appointment) =>
  ['Pending', 'Confirmed'].includes(appointment.status) &&
  appointment.appointmentDate >= todayString();
