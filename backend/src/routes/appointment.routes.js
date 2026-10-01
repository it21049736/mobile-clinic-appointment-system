const express = require('express');
const router = express.Router();
const {
  getAppointments,
  getBookedSlots,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  deleteAppointment,
} = require('../controllers/appointment.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

router.use(protect);

router.route('/').get(getAppointments).post(createAppointment);

// Must be registered before "/:id" so "booked-slots" isn't treated as an id.
router.get('/booked-slots', getBookedSlots);

router
  .route('/:id')
  .get(getAppointmentById)
  .put(updateAppointment)
  .delete(adminOnly, deleteAppointment);

router.patch('/:id/status', adminOnly, updateAppointmentStatus);
router.patch('/:id/cancel', cancelAppointment);

module.exports = router;
