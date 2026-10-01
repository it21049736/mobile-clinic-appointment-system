const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const { removeUpload } = require('../middleware/upload.middleware');
const { WEEKDAYS } = require('../utils/constants');
const { MESSAGES } = require('../utils/validation');

const uploadedPath = (file) => (file ? `uploads/${file.filename}` : null);

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Multipart forms send arrays as JSON text or "Monday,Tuesday"; normalise to ordered weekday names.
const parseDays = (input) => {
  if (input === undefined) return undefined;
  let days = input;
  if (typeof input === 'string') {
    try {
      days = JSON.parse(input);
    } catch {
      days = input.split(',');
    }
  }
  if (!Array.isArray(days)) days = [days];
  const wanted = new Set(days.map((d) => String(d).trim().toLowerCase()));
  const valid = WEEKDAYS.filter((d) => wanted.has(d.toLowerCase()));
  if (valid.length !== wanted.size) {
    const err = new Error(`Available days must be from: ${WEEKDAYS.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }
  return valid;
};

const pickDoctorFields = (body) => {
  const fields = {};
  ['doctorName', 'specialization', 'contactNumber'].forEach((key) => {
    if (body[key] !== undefined) fields[key] = String(body[key]).trim();
  });
  if (body.consultationFee !== undefined && body.consultationFee !== '') {
    const fee = Number(body.consultationFee);
    if (!Number.isFinite(fee)) {
      const err = new Error(MESSAGES.fee);
      err.statusCode = 400;
      throw err;
    }
    fields.consultationFee = fee;
  }
  const days = parseDays(body.availableDay);
  if (days !== undefined) fields.availableDay = days;
  return fields;
};

// @route GET /api/doctors?search=&specialization=&day=  (Private)
const getDoctors = async (req, res, next) => {
  try {
    const { search, specialization, day } = req.query;
    const filter = {};
    if (specialization) {
      filter.specialization = new RegExp(`^${escapeRegex(specialization)}$`, 'i');
    }
    if (day) filter.availableDay = day;
    if (search) {
      const rx = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ doctorName: rx }, { specialization: rx }];
    }
    const doctors = await Doctor.find(filter).sort('doctorName');
    res.json(doctors);
  } catch (error) {
    next(error);
  }
};

// @route GET /api/doctors/:id  (Private)
const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      res.status(404);
      throw new Error('Doctor not found');
    }
    res.json(doctor);
  } catch (error) {
    next(error);
  }
};

// @route POST /api/doctors  (Admin, multipart with optional "profileImage")
const createDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.create({
      ...pickDoctorFields(req.body),
      profileImage: uploadedPath(req.file),
    });
    res.status(201).json(doctor);
  } catch (error) {
    removeUpload(uploadedPath(req.file));
    next(error);
  }
};

// @route PUT /api/doctors/:id  (Admin, multipart with optional "profileImage"; removeImage=true clears it)
const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      res.status(404);
      throw new Error('Doctor not found');
    }

    const oldImage = doctor.profileImage;
    doctor.set(pickDoctorFields(req.body));
    if (req.file) {
      doctor.profileImage = uploadedPath(req.file);
    } else if (String(req.body.removeImage) === 'true') {
      doctor.profileImage = null;
    }

    await doctor.save();
    if (oldImage && oldImage !== doctor.profileImage) removeUpload(oldImage);
    res.json(doctor);
  } catch (error) {
    removeUpload(uploadedPath(req.file));
    next(error);
  }
};

// @route PUT /api/doctors/:id/image  (Admin, multipart "profileImage")
const uploadDoctorImage = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Please choose an image to upload');
    }
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      res.status(404);
      throw new Error('Doctor not found');
    }
    const oldImage = doctor.profileImage;
    doctor.profileImage = uploadedPath(req.file);
    await doctor.save();
    removeUpload(oldImage);
    res.json(doctor);
  } catch (error) {
    removeUpload(uploadedPath(req.file));
    next(error);
  }
};

// @route DELETE /api/doctors/:id  (Admin)
const deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      res.status(404);
      throw new Error('Doctor not found');
    }

    const activeCount = await Appointment.countDocuments({
      doctorId: doctor._id,
      status: { $in: ['Pending', 'Confirmed'] },
    });
    if (activeCount > 0) {
      res.status(400);
      throw new Error(
        `This doctor has ${activeCount} pending/confirmed appointment(s). Cancel or complete them before deleting.`
      );
    }

    await doctor.deleteOne();
    removeUpload(doctor.profileImage);
    res.json({ message: 'Doctor deleted', _id: doctor._id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  uploadDoctorImage,
  deleteDoctor,
};
