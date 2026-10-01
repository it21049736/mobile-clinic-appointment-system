/**
 * Adds sample doctors (skips ones that already exist):  npm run seed:doctors
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const Doctor = require('./src/models/Doctor');

const DOCTORS = [
  {
    doctorName: 'Dr. Nimal Silva',
    specialization: 'General Physician',
    contactNumber: '0712345678',
    consultationFee: 2500,
    availableDay: ['Monday', 'Wednesday', 'Friday'],
  },
  {
    doctorName: 'Dr. Anusha Perera',
    specialization: 'Pediatrician',
    contactNumber: '0723456789',
    consultationFee: 3000,
    availableDay: ['Tuesday', 'Thursday', 'Saturday'],
  },
  {
    doctorName: 'Dr. Ruwan Jayasinghe',
    specialization: 'Cardiologist',
    contactNumber: '0754567890',
    consultationFee: 4500,
    availableDay: ['Monday', 'Thursday'],
  },
  {
    doctorName: 'Dr. Dilani Fernando',
    specialization: 'Dermatologist',
    contactNumber: '0765678901',
    consultationFee: 3500,
    availableDay: ['Wednesday', 'Saturday', 'Sunday'],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    for (const data of DOCTORS) {
      const exists = await Doctor.exists({ doctorName: data.doctorName });
      if (exists) {
        console.log(`Skipped (exists): ${data.doctorName}`);
      } else {
        await Doctor.create(data);
        console.log(`Added: ${data.doctorName}`);
      }
    }
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seed();
