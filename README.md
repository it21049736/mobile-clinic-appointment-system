# MediCare — Mobile Clinic Appointment Management System

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)

A full-stack mobile app for a clinic: **patients** browse doctors and book, view, reschedule or cancel appointments; **admins** manage doctors (with profile images) and move appointments through their status lifecycle. Built with **Node.js + Express + MongoDB** (backend) and **React Native via Expo** (frontend).

---

## Features

### Patient
- Register (name, email, phone number, password) and log in
- View all doctors, search by name, filter by specialization or "available today"
- View doctor details: specialization, contact number, consultation fee, available days
- Book an appointment by picking a doctor, one of the doctor's clinic days, and a free 30-minute time slot
- View own appointments (Upcoming / All / by status) and appointment details
- Reschedule a **Pending** appointment; cancel a Pending or Confirmed appointment

### Admin
- Log in with the seeded admin account
- Dashboard: doctor / patient / appointment counts, pending requests with one-tap Confirm/Cancel, today's schedule
- Add, view, update and delete doctors; upload or change a doctor's profile image
- View every patient appointment with patient contact details, search and filter by status / today
- Update appointment status: **Pending → Confirmed → Completed**, or **Cancelled**; delete records

### Business rule — prevent double booking
Before an appointment is created (or rescheduled) the API checks whether the selected doctor already has an active appointment on the same date and time slot. If so, the request is rejected with HTTP 409 and the message:

> **This time slot is already booked. Please select another time.**

A partial unique MongoDB index on `{doctorId, appointmentDate, appointmentTime}` (ignoring cancelled appointments) enforces the same rule at database level, so two simultaneous requests cannot both succeed. Cancelling an appointment frees the slot again. The booking screen also greys out booked and past slots.

Additional booking rules: the date must not be in the past, must fall on one of the doctor's `availableDay`s, and the time must be a valid clinic slot (09:00–16:30).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React Native (Expo SDK 57), React Navigation (tabs + native stack), Axios, AsyncStorage, expo-image-picker |
| Backend | Node.js, Express 4 |
| Database | MongoDB with Mongoose 7 |
| Security | JWT (30-day tokens), bcryptjs password hashing, role-based access (`patient`, `admin`) |
| Uploads | Multer (JPG/PNG, max 5 MB), served from `/uploads` |

---

## Getting Started

### Prerequisites
- Node.js 18+ (22 recommended)
- A MongoDB Atlas cluster URI or local MongoDB
- Expo Go on your phone, or a web browser / Android emulator

### 1. Backend
```bash
cd backend
npm install
# create backend/.env (see below)
npm run seed:admin      # admin@clinic.com / admin123
npm run seed:doctors    # optional: 4 sample doctors
npm run dev             # http://localhost:5000
```

`backend/.env`
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key
```

Run the automated API check (server must be running and admin seeded):
```bash
npm run test:api
```

### 2. Frontend
```bash
cd frontend
npm install
npx expo start -c        # press w for web, a for Android, or scan the QR with Expo Go
```
On a physical phone, install **Expo Go** (latest, SDK 57) and keep the phone and computer on the same Wi-Fi. The app finds the backend automatically from the Expo dev server address; `FALLBACK_LAN_IP` in `frontend/src/constants/config.js` is only used outside Expo Go.

### Default accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@clinic.com | admin123 |
| Patient | register in the app | — |

Self-registration always creates a **patient**; admin accounts can only be created with `seedAdmin.js`.

---

## Project Structure
```text
backend/
├── seedAdmin.js · seedDoctors.js · testApi.js
└── src/
    ├── config/db.js
    ├── models/          User.js · Doctor.js · Appointment.js
    ├── controllers/     auth · doctor · appointment
    ├── routes/          auth · doctor · appointment
    ├── middleware/      auth (protect/adminOnly) · upload (Multer) · error
    ├── utils/constants.js   time slots, weekdays, status transitions
    ├── uploads/         doctor profile images
    └── server.js
frontend/
├── App.js
└── src/
    ├── navigation/      Root · Auth · Patient (tabs) · Admin (tabs)
    ├── screens/         auth · home · doctors · appointments · admin · profile
    ├── components/      DoctorCard · AppointmentCard · StatusBadge · ...
    ├── services/        api · authService · doctorService · appointmentService
    ├── context/         AuthContext
    ├── constants/       colors · config · clinic (slots, formatting)
    └── utils/           dialogs · pickImage
```

See [API_Endpoint_Table.md](API_Endpoint_Table.md), [Database_Schema_Diagram.md](Database_Schema_Diagram.md) and [ARCHITECTURE_COMPLETE_GUIDE.md](ARCHITECTURE_COMPLETE_GUIDE.md) for details.
