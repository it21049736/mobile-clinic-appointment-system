# Mobile Clinic Appointment Management System — Architecture Guide

**Version:** 1.0.0 · **Stack:** MongoDB, Express, React Native (Expo), Node.js

## Contents
1. [Overview](#1-overview)
2. [Backend layers](#2-backend-layers)
3. [Booking rules and double-booking prevention](#3-booking-rules-and-double-booking-prevention)
4. [Appointment status lifecycle](#4-appointment-status-lifecycle)
5. [Doctor images](#5-doctor-images)
6. [Authentication and authorization](#6-authentication-and-authorization)
7. [Frontend structure](#7-frontend-structure)
8. [Where each requirement is implemented](#8-where-each-requirement-is-implemented)
9. [Running and testing](#9-running-and-testing)
10. [Common issues](#10-common-issues)

---

## 1. Overview
A three-tier app: an Expo React Native client (Android, iOS, web) talks JSON over HTTP to an Express REST API, which stores data in MongoDB through Mongoose. The API is stateless — every protected request carries a JWT.

```
React Native (screens → services/Axios) ──HTTP+JWT──▶ Express (routes → middleware → controllers → models) ──▶ MongoDB
```

## 2. Backend layers
| Layer | Files | Responsibility |
|-------|-------|----------------|
| Entry | `src/server.js` | Loads `.env`, connects DB, JSON/CORS middleware, mounts `/api/auth`, `/api/doctors`, `/api/appointments`, serves `/uploads`, 404 handler, error handler |
| Routes | `src/routes/*.routes.js` | Map HTTP method + path to controller, attach `protect`, `adminOnly`, `upload.single('profileImage')` |
| Middleware | `auth.middleware.js` | `protect` verifies `Bearer` JWT and loads `req.user`; `adminOnly` requires `role === 'admin'` |
| | `upload.middleware.js` | Multer disk storage in `src/uploads`, JPG/PNG only, 5 MB limit; `removeUpload()` deletes replaced files |
| | `error.middleware.js` | Converts Mongoose validation / cast errors, Multer errors and duplicate keys into clean `{ message }` responses |
| Controllers | `auth`, `doctor`, `appointment` | Business logic (see below) |
| Models | `User`, `Doctor`, `Appointment` | Schemas, validation, password hashing hook, unique slot index |
| Constants | `src/utils/constants.js` | `WEEKDAYS`, `TIME_SLOTS` (09:00–16:30 every 30 min), `APPOINTMENT_STATUS`, `STATUS_TRANSITIONS`, `DOUBLE_BOOKING_MESSAGE` |

## 3. Booking rules and double-booking prevention
`assertSlotBookable()` in `appointment.controller.js` runs for every new booking and every reschedule:

1. `appointmentDate` is a real `YYYY-MM-DD` date and not before today.
2. The date's weekday is in the doctor's `availableDay`.
3. `appointmentTime` is one of `TIME_SLOTS`; if the date is today the slot must not have passed.
4. No **active** appointment (status ≠ Cancelled) exists for the same `doctorId + appointmentDate + appointmentTime` (the appointment being rescheduled is excluded).

If rule 4 fails the API responds **409** with `This time slot is already booked. Please select another time.`

**Race safety.** Two requests arriving at the same instant could both pass step 4. The `Appointment` schema therefore has a unique partial index on `{doctorId, appointmentDate, appointmentTime}` filtered by `isActive: true`. The database rejects the second insert with duplicate-key error 11000, which the controller converts to the same 409 message. `isActive` is kept in sync with `status` in a `pre('validate')` hook, so cancelling an appointment frees its slot. (Tested: six simultaneous bookings for one slot → one 201, five 409s.)

**UI support.** `GET /appointments/booked-slots` returns booked and past slots so `BookAppointmentScreen` greys them out; if a slot is taken between loading and submitting, the 409 message is shown and the grid refreshes.

## 4. Appointment status lifecycle
```
Pending ──▶ Confirmed ──▶ Completed
   │            │
   └──▶ Cancelled ◀──┘
```
- Admin changes status with `PATCH /appointments/:id/status`; any other transition returns 400.
- Patients cancel with `PATCH /appointments/:id/cancel` (Pending or Confirmed, not past dates).
- Only **Pending** appointments can be rescheduled (`PUT /appointments/:id`).
- Completed and Cancelled are final.

## 5. Doctor images
- Create/update doctor accept `multipart/form-data` with an optional `profileImage` file; `PUT /doctors/:id/image` changes only the photo.
- Files are saved as `src/uploads/profileImage-<timestamp>-<random>.<ext>` and stored in the DB as `uploads/<file>`; the app loads them from `http://<api>/uploads/<file>`.
- Replaced or removed images, images from failed saves and images of deleted doctors are deleted from disk.
- Frontend: `utils/pickImage.js` (expo-image-picker, square crop, JPG/PNG check) and `services/doctorService.js` (builds `FormData`; uses a Blob on web and `{uri, name, type}` on native).

## 6. Authentication and authorization
- Passwords are hashed with bcrypt (`User` pre-save hook); login compares with `matchPassword`.
- Tokens are JWTs signed with `JWT_SECRET`, valid 30 days, stored in AsyncStorage by the app.
- Registration always creates role `patient`; the admin is created by `seedAdmin.js`.
- Axios interceptor adds the token to each request; a 401 on a protected call logs the user out automatically.

| Resource | Patient | Admin |
|----------|---------|-------|
| Doctors list / details | ✔ | ✔ |
| Doctor create / update / delete / image | ✖ | ✔ |
| Book appointment | ✔ | ✖ |
| View appointments | own only | all |
| Reschedule (Pending) | own | ✔ |
| Cancel | own | ✔ |
| Change status / delete record | ✖ | ✔ |
| List patients | ✖ | ✔ |

## 7. Frontend structure
- `App.js` → `SafeAreaProvider` → `AuthProvider` → `RootNavigator`.
- `RootNavigator` shows `AuthNavigator` when logged out, otherwise `AdminNavigator` or `PatientNavigator` depending on `user.role`.
- Each tab contains a native stack, so detail screens keep the tab bar. Shared screens read the role from `AuthContext`:
  - `DoctorListScreen` — search + filter chips; admin sees a **+** button.
  - `DoctorDetailScreen` — patient: **Book Appointment**; admin: **Edit / Change Photo / Delete**.
  - `AppointmentListScreen` — patient: Upcoming/All/status filters; admin: search by patient/doctor, Today filter, patient details on cards.
  - `AppointmentDetailScreen` — patient: Reschedule / Cancel; admin: next-status buttons + Delete.
- `BookAppointmentScreen` handles both booking and rescheduling: date strip of the next 14 clinic days, slot grid, reason field.
- Screens reload with `useFocusEffect`, so lists are fresh after edits made on other screens.
- `utils/dialogs.js` wraps `Alert.alert` with `window.alert/confirm` on web (Alert callbacks don't run on react-native-web).

## 8. Where each requirement is implemented
| Requirement (topic document) | Implementation |
|------------------------------|----------------|
| Patient registers and logs in | `RegisterScreen`, `LoginScreen` → `POST /auth/register`, `/auth/login` |
| View available doctors | `DoctorListScreen` → `GET /doctors` (filter "Available today") |
| View doctor details (name, specialization, availability) | `DoctorDetailScreen` → `GET /doctors/:id` |
| Book by selecting doctor, date, available time | `BookAppointmentScreen` → `GET /appointments/booked-slots`, `POST /appointments` |
| View booked appointments / details | `AppointmentListScreen`, `AppointmentDetailScreen` → `GET /appointments`, `/appointments/:id` |
| Update permitted appointment information | Reschedule → `PUT /appointments/:id` (Pending only) |
| Cancel appointment | `PATCH /appointments/:id/cancel` |
| Admin logs in | same `LoginScreen`; role routes to `AdminNavigator` |
| Admin add / view / update / delete doctors | `DoctorFormScreen`, `DoctorDetailScreen` → `POST/PUT/DELETE /doctors` |
| Upload doctor image | `DoctorFormScreen`, "Change Photo" → Multer, `PUT /doctors/:id/image` |
| Admin views all appointments | `AppointmentListScreen` (admin), `AdminDashboardScreen` |
| Admin updates status Pending → Confirmed → Completed / Cancelled | `PATCH /appointments/:id/status` |
| Prevent double booking | `assertSlotBookable()` + unique partial index → 409 with the required message |

## 9. Running and testing
```bash
# backend
cd backend && npm install
npm run seed:admin && npm run seed:doctors
npm run dev
npm run test:api        # in a second terminal: 34 end-to-end API checks

# frontend
cd frontend && npm install
npx expo start -c       # w = web, a = Android, or scan QR with Expo Go
```

## 10. Common issues
| Symptom | Fix |
|---------|-----|
| "Project is incompatible with this version of Expo Go" | The project must use the same SDK as the store Expo Go (currently SDK 57). Upgrade with `npm install expo@^<sdk>` then `npx expo install --fix`. |
| "Cannot reach the server" on a phone | Phone and PC on the same Wi-Fi; backend running; allow Node.js / port 5000 in Windows Firewall. The API address is taken from the Expo dev server host automatically. |
| Android emulator can't connect | It uses `10.0.2.2:5000` automatically — make sure the backend is running. |
| Login as admin fails | Run `npm run seed:admin` (admin@clinic.com / admin123). |
| Image upload rejected | Only JPG/PNG up to 5 MB. |
| Cannot delete a doctor | Cancel or complete the doctor's Pending/Confirmed appointments first. |
| Logged out unexpectedly | The token was invalid/expired or the user was deleted — log in again. |
