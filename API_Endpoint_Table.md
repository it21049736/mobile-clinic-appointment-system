# API Endpoints — Mobile Clinic Appointment Management System

Base URL: `http://<host>:5000/api`
Authenticated requests send `Authorization: Bearer <token>`.
Errors return `{ "message": "..." }` with a 4xx/5xx status.

## Auth — `/api/auth`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/auth/register` | Public | Register a patient. Body: `name, email, password, phoneNumber`. Any `role` in the body is ignored. Returns `{ user, token }`. |
| POST | `/auth/login` | Public | Log in (patient or admin). Body: `email, password`. Returns `{ user, token }`. |
| GET | `/auth/me` | Logged in | Current user profile. |
| GET | `/auth/users` | Admin | List registered patients (no passwords). |

## Doctors — `/api/doctors` (primary entity)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/doctors` | Logged in | List doctors. Optional query: `search`, `specialization`, `day` (e.g. `Monday`). |
| GET | `/doctors/:id` | Logged in | Doctor details. |
| POST | `/doctors` | Admin | Create doctor. `multipart/form-data`: `doctorName, specialization, contactNumber, consultationFee, availableDay` (JSON array or comma list) and optional file `profileImage`. |
| PUT | `/doctors/:id` | Admin | Update doctor (same fields, all optional). Optional `profileImage` file replaces the old one; `removeImage=true` clears it. |
| PUT | `/doctors/:id/image` | Admin | Upload / replace only the profile image (`profileImage` file, JPG/PNG ≤ 5 MB). |
| DELETE | `/doctors/:id` | Admin | Delete doctor and image. Rejected (400) while the doctor has Pending/Confirmed appointments. |

## Appointments — `/api/appointments` (related entity)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/appointments` | Logged in | Patient: own appointments. Admin: all. Optional query: `status`, `date`, `doctorId`. Doctor and patient are populated. |
| GET | `/appointments/booked-slots?doctorId=&date=` | Logged in | `{ slots, bookedSlots, pastSlots, isAvailableDay, dayName }` for the booking screen. Optional `excludeId` when rescheduling. |
| GET | `/appointments/:id` | Owner / Admin | Appointment details. |
| POST | `/appointments` | Patient | Book. Body: `doctorId, appointmentDate (YYYY-MM-DD), appointmentTime (HH:mm), reason`. **409 "This time slot is already booked. Please select another time."** if taken. |
| PUT | `/appointments/:id` | Owner / Admin | Change `appointmentDate`, `appointmentTime`, `reason` while status is **Pending**. Same slot checks as booking. |
| PATCH | `/appointments/:id/status` | Admin | Body `{ status }`. Allowed: Pending→Confirmed/Cancelled, Confirmed→Completed/Cancelled. |
| PATCH | `/appointments/:id/cancel` | Owner / Admin | Cancel a Pending or Confirmed appointment (patients cannot cancel past dates). Frees the slot. |
| DELETE | `/appointments/:id` | Admin | Permanently delete the record. |

## Booking validation summary

| Rule | Response |
|------|----------|
| Doctor must exist | 404 |
| Date must be a real `YYYY-MM-DD`, not in the past | 400 |
| Date's weekday must be in the doctor's `availableDay` | 400 |
| Time must be a clinic slot 09:00–16:30 (30 min), not already passed today | 400 |
| Doctor + date + time must not have an active (non-cancelled) appointment | **409** |

## Static files
| Method | Path | Description |
|--------|------|-------------|
| GET | `/uploads/<file>` | Doctor profile images (public). |
