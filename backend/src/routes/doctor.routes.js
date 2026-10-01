const express = require('express');
const router = express.Router();
const {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  uploadDoctorImage,
  deleteDoctor,
} = require('../controllers/doctor.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');
const { uploadImage } = require('../middleware/upload.middleware');

router
  .route('/')
  .get(protect, getDoctors)
  .post(protect, adminOnly, uploadImage('profileImage'), createDoctor);

router
  .route('/:id')
  .get(protect, getDoctorById)
  .put(protect, adminOnly, uploadImage('profileImage'), updateDoctor)
  .delete(protect, adminOnly, deleteDoctor);

router.put('/:id/image', protect, adminOnly, uploadImage('profileImage'), uploadDoctorImage);

module.exports = router;
