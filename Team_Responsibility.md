# Team Responsibility — Mobile Clinic Appointment Management System

**Member:** IT21049736 — Nimesha K.H.
**Role:** Sole developer, responsible for the full system from design to deployment.

| # | Component | Frontend (React Native) | Backend (Node.js / Express) | Database (MongoDB / Mongoose) |
|---|-----------|-------------------------|-----------------------------|-------------------------------|
| 1 | User authentication | Landing, Login and Register screens with form validation; `AuthContext` keeps the JWT and user in AsyncStorage | `auth.controller.js`, `auth.routes.js`; `protect` (JWT) and `adminOnly` middleware | `User` model: name, email, password (bcrypt hash), phoneNumber, role |
| 2 | Doctor management (primary entity) | Doctor list with search and filters, doctor details, add/edit form with photo picker | `doctor.controller.js`, `doctor.routes.js`: full CRUD; Multer image upload with type and size checks | `Doctor` model: doctorName, specialization, contactNumber, consultationFee, availableDay, profileImage |
| 3 | Appointment management (related entity) | Booking screen with date and free-slot selection, my appointments, appointment details, reschedule and cancel | `appointment.controller.js`, `appointment.routes.js`: booking validation, **double-booking prevention**, status changes | `Appointment` model: doctorId → Doctor, userId → User, appointmentDate, appointmentTime, reason, status; unique slot index |
| 4 | Admin functions | Dashboard, manage doctors, all appointments with Confirm / Complete / Cancel actions | Admin-only routes, status transition rules, patient list | Status lifecycle Pending → Confirmed → Completed, or Cancelled |
| 5 | Deployment and documentation | App configured to use the hosted API | Backend hosted online, connected to MongoDB Atlas | MongoDB Atlas database `mobile-clinic` |

## Tools used
- React Native (Expo), React Navigation, Axios
- Node.js, Express.js, Mongoose, bcrypt, JSON Web Tokens, Multer
- MongoDB Atlas, Git and GitHub
- AI assistance: Claude Code (Anthropic) was used during development; see the AI-use declaration in the report.
