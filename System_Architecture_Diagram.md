# System Architecture — Mobile Clinic Appointment Management System

```mermaid
flowchart LR
    subgraph Client["React Native app (Expo) — Android / iOS / Web"]
        UI["Screens<br/>Auth · Home · Doctors · Appointments · Admin"]
        CTX["AuthContext<br/>(token + user in AsyncStorage)"]
        SVC["Services (Axios)<br/>auth · doctor · appointment"]
        UI --> CTX
        UI --> SVC
    end

    subgraph Server["Node.js + Express API (:5000)"]
        R["Routes<br/>/api/auth · /api/doctors · /api/appointments"]
        MW["Middleware<br/>protect (JWT) · adminOnly · Multer upload · errorHandler"]
        C["Controllers<br/>auth · doctor · appointment<br/>(double-booking & status rules)"]
        M["Mongoose models<br/>User · Doctor · Appointment"]
        U[("/uploads<br/>doctor images")]
        R --> MW --> C --> M
        C --> U
    end

    DB[("MongoDB Atlas<br/>users · doctors · appointments")]

    SVC -- "HTTPS/JSON + Bearer JWT<br/>multipart for images" --> R
    M --> DB
    UI -- "GET /uploads/..." --> U
```

## Request flow — booking an appointment
1. Patient picks a doctor → the app loads `GET /doctors/:id` and shows the doctor's next clinic days.
2. For the chosen date the app calls `GET /appointments/booked-slots` and greys out booked/past slots.
3. Patient submits `POST /appointments`.
4. `protect` verifies the JWT and loads the user; the controller checks: patient role, doctor exists, date valid and not past, weekday in `availableDay`, valid slot, no active appointment in that slot.
5. If the slot is taken → **409 "This time slot is already booked. Please select another time."** The unique partial index catches simultaneous requests too.
6. Otherwise the appointment is saved as **Pending** and returned with doctor details populated.
7. Admin later confirms → completes (or cancels) via `PATCH /appointments/:id/status`.

## Roles
| Role | Navigator | Can do |
|------|-----------|--------|
| patient | PatientNavigator (Home · Doctors · Appointments · Profile) | view doctors, book / reschedule / cancel own appointments |
| admin | AdminNavigator (Dashboard · Doctors · Appointments · Profile) | CRUD doctors + images, view all appointments, change status, delete records |
