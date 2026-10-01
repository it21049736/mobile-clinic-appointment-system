# Problem Statement — Mobile Clinic Appointment Management System

## Background
Many clinics still take appointments by phone or on paper. Patients have to call during working hours, often cannot see which doctor is available on which day, and two patients are sometimes given the same time with the same doctor. Clinic staff spend time answering calls and fixing clashes instead of caring for patients.

## Problem
- Patients cannot see doctors, their specializations, fees and available days in one place.
- Booking requires a phone call; there is no self-service way to pick a free time slot.
- Manual scheduling leads to **double booking** — the same doctor, date and time given to two patients.
- Patients cannot easily check or cancel their own appointments.
- Staff lack a single view of all appointments and their status (pending, confirmed, completed, cancelled).

## Proposed solution
A mobile application with two user types:

- **Patient** — registers and logs in, views available doctors and their details, books an appointment by selecting a doctor, date and available time, views their booked appointments and cancels when needed.
- **Admin** — logs in, adds / views / updates / deletes doctors (including a profile image), views all patient appointments and manages each appointment's status (Pending → Confirmed → Completed, or Cancelled).

The core business rule: **before creating an appointment, the system checks whether the selected doctor already has an appointment for the same date and time slot. If so, the booking is blocked with the message "This time slot is already booked. Please select another time."**

## Entities
| Entity | Purpose | Key fields |
|--------|---------|-----------|
| User | Authentication for patients and admin | name, email, password, phoneNumber, role |
| Doctor (primary) | Doctors offered by the clinic — full CRUD + image upload | doctorName, specialization, contactNumber, consultationFee, availableDay, profileImage |
| Appointment (related) | A patient's booking with one doctor | doctorId → Doctor, userId → User, appointmentDate, appointmentTime, reason, status |

One doctor can have many appointments; each appointment relates to exactly one doctor.

## Scope
In scope: authentication, doctor management with image upload, appointment booking / viewing / rescheduling / cancelling, admin status management, double-booking prevention.
Out of scope: online payments, notifications (SMS/e-mail), medical records and prescriptions.
