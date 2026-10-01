const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

// 30-minute slots from 09:00 to 16:30, stored in 24h "HH:mm" so they sort correctly.
const TIME_SLOTS = [];
for (let minutes = 9 * 60; minutes <= 16 * 60 + 30; minutes += 30) {
  const h = String(Math.floor(minutes / 60)).padStart(2, '0');
  const m = String(minutes % 60).padStart(2, '0');
  TIME_SLOTS.push(`${h}:${m}`);
}

const APPOINTMENT_STATUS = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

const STATUS_TRANSITIONS = {
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Completed', 'Cancelled'],
  Completed: [],
  Cancelled: [],
};

const DOUBLE_BOOKING_MESSAGE =
  'This time slot is already booked. Please select another time.';

module.exports = {
  WEEKDAYS,
  TIME_SLOTS,
  APPOINTMENT_STATUS,
  STATUS_TRANSITIONS,
  DOUBLE_BOOKING_MESSAGE,
};
