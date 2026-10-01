# Team Responsibilities — Mobile Clinic Appointment Management System

> Fill in the **Member** column with who owns each component. Each component spans frontend screens, backend logic and the database schema.

| # | Component | Member | Frontend (React Native) | Backend (Express) | Database (Mongoose) |
|---|-----------|--------|-------------------------|-------------------|---------------------|
| 1 | User & Authentication | _to assign_ | `LandingScreen`, `LoginScreen`, `RegisterScreen`, `ProfileScreen`, `AuthContext`, `authService` | `auth.controller.js`, `auth.routes.js`, `auth.middleware.js` (JWT `protect`, `adminOnly`) | `User.js` (name, email, password, phoneNumber, role) |
| 2 | Doctor Management (primary entity) | _to assign_ | `DoctorListScreen`, `DoctorDetailScreen`, `DoctorFormScreen`, `DoctorCard`, `DoctorAvatar`, `doctorService`, `pickImage` | `doctor.controller.js`, `doctor.routes.js`, `upload.middleware.js` (Multer image upload) | `Doctor.js` (doctorName, specialization, contactNumber, consultationFee, availableDay, profileImage) |
| 3 | Appointment Booking (related entity) | _to assign_ | `BookAppointmentScreen` (date strip, slot grid), `AppointmentListScreen`, `AppointmentDetailScreen`, `AppointmentCard`, `appointmentService` | `appointment.controller.js` — booking validation, **double-booking prevention**, reschedule, cancel | `Appointment.js` (doctorId, userId, appointmentDate, appointmentTime, reason, status) + unique slot index |
| 4 | Admin Appointment Management | _to assign_ | `AdminDashboardScreen`, admin actions in `AppointmentDetailScreen` / `AppointmentListScreen` | `PATCH /appointments/:id/status` transitions, `DELETE /appointments/:id`, `GET /auth/users` | status lifecycle Pending → Confirmed → Completed / Cancelled |

## Group members (previous group roster — update as needed)
- Rajapaksha R.G.M.B (IT21839160)
- U.G.M.N Janaranjana (IT20668990)
- Anjitha T.Y (IT20057138)
- Warnakulasooriya H.M.G.L (IT21315800)
- Ekanayake E.M.S.P (IT21138218)
