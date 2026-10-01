# Project Structure — Mobile Clinic Appointment Management System

```text
Mobile Clinic Appointment Management System/
├── README.md                         Setup, features, accounts
├── API_Endpoint_Table.md             Every REST endpoint
├── Database_Schema_Diagram.md        Collections, relationships, indexes
├── System_Architecture_Diagram.md    Components and booking flow
├── Problem_Statement.md
├── Project_Structure.md
├── Team_Responsibility.md
├── ARCHITECTURE_COMPLETE_GUIDE.md    Detailed walkthrough of the code
│
├── backend/
│   ├── .env                          PORT, MONGO_URI, JWT_SECRET (not committed)
│   ├── package.json                  scripts: dev, start, seed:admin, seed:doctors, test:api
│   ├── seedAdmin.js                  creates admin@clinic.com / admin123
│   ├── seedDoctors.js                adds 4 sample doctors
│   ├── testApi.js                    end-to-end API checks (34 assertions)
│   └── src/
│       ├── server.js                 Express app, routes, static /uploads, 404 + error handler
│       ├── config/db.js              MongoDB connection
│       ├── models/
│       │   ├── User.js               name, email, password (hashed), phoneNumber, role
│       │   ├── Doctor.js             doctorName, specialization, contactNumber, consultationFee, availableDay, profileImage
│       │   └── Appointment.js        doctorId, userId, appointmentDate, appointmentTime, reason, status + unique slot index
│       ├── controllers/
│       │   ├── auth.controller.js    register (patient only), login, me, list patients
│       │   ├── doctor.controller.js  CRUD + image upload/replace/remove
│       │   └── appointment.controller.js  booking rules, double-booking check, status transitions, cancel
│       ├── routes/                   auth.routes.js · doctor.routes.js · appointment.routes.js
│       ├── middleware/
│       │   ├── auth.middleware.js    protect (JWT), adminOnly
│       │   ├── upload.middleware.js  Multer (JPG/PNG ≤ 5 MB) + removeUpload helper
│       │   └── error.middleware.js   validation / cast / Multer / duplicate-key handling
│       ├── utils/constants.js        WEEKDAYS, TIME_SLOTS, statuses, transitions, messages
│       └── uploads/                  stored doctor images
│
└── frontend/
    ├── App.js                        SafeAreaProvider → AuthProvider → RootNavigator
    ├── app.json                      Expo config (name, image-picker permission)
    └── src/
        ├── navigation/
        │   ├── RootNavigator.js      picks Auth / Patient / Admin by login + role
        │   ├── AuthNavigator.js      Landing · Login · Register
        │   ├── PatientNavigator.js   tabs: Home · Doctors · Appointments · Profile
        │   ├── AdminNavigator.js     tabs: Dashboard · Doctors · Appointments · Profile
        │   └── navTheme.js           shared header / tab styling
        ├── screens/
        │   ├── auth/                 LandingScreen · LoginScreen · RegisterScreen
        │   ├── home/                 PatientHomeScreen
        │   ├── admin/                AdminDashboardScreen
        │   ├── doctors/              DoctorListScreen · DoctorDetailScreen · DoctorFormScreen (admin)
        │   ├── appointments/         BookAppointmentScreen (book + reschedule) · AppointmentListScreen · AppointmentDetailScreen
        │   └── profile/              ProfileScreen
        ├── components/               CustomButton · CustomInput · DoctorAvatar · DoctorCard · AppointmentCard
        │                             StatusBadge · FilterChips · InfoRow · EmptyState
        ├── services/                 api (Axios + JWT) · authService · doctorService · appointmentService
        ├── context/AuthContext.js    session state, login / register / logout
        ├── constants/                colors · config (API URL) · clinic (slots, dates, formatting)
        └── utils/                    dialogs (cross-platform alerts) · pickImage (expo-image-picker)
```

Screens shared by both roles (`DoctorListScreen`, `DoctorDetailScreen`, `AppointmentListScreen`, `AppointmentDetailScreen`, `ProfileScreen`) read the user's role from `AuthContext` and show patient or admin actions accordingly.
