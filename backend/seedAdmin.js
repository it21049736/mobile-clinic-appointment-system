/**
 * Creates the clinic admin account (run once):  npm run seed:admin
 *   Email: admin@clinic.com   Password: admin123
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./src/models/User');

const ADMIN = {
  name: 'Clinic Admin',
  email: 'admin@clinic.com',
  password: 'admin123',
  phoneNumber: '0771234567',
  role: 'admin',
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const existing = await User.findOne({ email: ADMIN.email });
    if (existing) {
      console.log(`Admin already exists: ${ADMIN.email} / ${ADMIN.password}`);
    } else {
      await User.create(ADMIN);
      console.log(`Admin created: ${ADMIN.email} / ${ADMIN.password}`);
    }
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seed();
