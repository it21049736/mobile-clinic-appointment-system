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
const { upload } = require('../middleware/upload.middleware');

router
  .route('/')
  .get(protect, getDoctors)
  .post(protect, adminOnly, upload.single('profileImage'), createDoctor);

router
  .route('/:id')
  .get(protect, getDoctorById)
  .put(protect, adminOnly, upload.single('profileImage'), updateDoctor)
  .delete(protect, adminOnly, deleteDoctor);

router.put('/:id/image', protect, adminOnly, upload.single('profileImage'), uploadDoctorImage);

module.exports = router;
