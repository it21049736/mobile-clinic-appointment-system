/**
 * End-to-end API check. Needs the server running and the admin seeded:
 *   npm run seed:admin && npm run dev      (then in another terminal)  npm run test:api
 * Creates two throwaway patients (test.*@example.com) and one test doctor; the doctor
 * and its appointments are removed at the end.
 */
const BASE = process.env.API_URL || 'http://localhost:5000/api';
const PNG_1PX = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64'
);
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

let passed = 0;
let failed = 0;

const check = (label, condition, detail) => {
  if (condition) {
    passed += 1;
    console.log(`  PASS  ${label}`);
  } else {
    failed += 1;
    console.log(`  FAIL  ${label}${detail ? `  ->  ${JSON.stringify(detail)}` : ''}`);
  }
};

const call = async (method, path, { token, json, form } = {}) => {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let body;
  if (json) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(json);
  } else if (form) {
    body = form;
  }
  const res = await fetch(`${BASE}${path}`, { method, headers, body });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
};

const localDate = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const pad = (n) => String(n).padStart(2, '0');
  return { str: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, day: WEEKDAYS[d.getDay()] };
};

async function run() {
  const stamp = Date.now();
  const target = localDate(3);
  const otherDay = localDate(4);

  console.log('\nAuth');
  const admin = await call('POST', '/auth/login', {
    json: { email: 'admin@clinic.com', password: 'admin123' },
  });
  check('admin can log in', admin.status === 200 && admin.data.user.role === 'admin', admin.data);
  if (admin.status !== 200) throw new Error('Seed the admin first: npm run seed:admin');
  const adminToken = admin.data.token;

  const regA = await call('POST', '/auth/register', {
    json: { name: 'Test Patient A', email: `test.a.${stamp}@example.com`, password: 'secret123', phoneNumber: '0770000001', role: 'admin' },
  });
  check('patient registers; role in body is ignored', regA.status === 201 && regA.data.user.role === 'patient', regA.data);
  const tokenA = regA.data.token;

  const regB = await call('POST', '/auth/register', {
    json: { name: 'Test Patient B', email: `test.b.${stamp}@example.com`, password: 'secret123', phoneNumber: '0770000002' },
  });
  const tokenB = regB.data.token;

  const noPhone = await call('POST', '/auth/register', {
    json: { name: 'X', email: `test.x.${stamp}@example.com`, password: 'secret123' },
  });
  check('registration requires phone number', noPhone.status === 400, noPhone.data);

  const loginA = await call('POST', '/auth/login', {
    json: { email: `test.a.${stamp}@example.com`, password: 'secret123' },
  });
  check('patient can log in', loginA.status === 200, loginA.data);

  const usersAsPatient = await call('GET', '/auth/users', { token: tokenA });
  check('patient cannot list users', usersAsPatient.status === 403, usersAsPatient.data);

  console.log('\nValidation');
  const goodUser = { name: 'Valid Person', email: `test.v.${stamp}@example.com`, password: 'secret123', phoneNumber: '0771234567' };
  const badRegistrations = [
    ['name with digits', { name: 'John 123' }],
    ['one-letter name', { name: 'J' }],
    ['invalid email', { email: 'not-an-email' }],
    ['password without a number', { password: 'abcdefg' }],
    ['password too short', { password: 'ab1' }],
    ['phone with 9 digits', { phoneNumber: '077123456' }],
    ['phone not starting with 0 or +94', { phoneNumber: '1771234567' }],
    ['phone with letters', { phoneNumber: '07712345ab' }],
  ];
  for (const [label, override] of badRegistrations) {
    const r = await call('POST', '/auth/register', { json: { ...goodUser, ...override } });
    check(`register rejects ${label}`, r.status === 400, r.data);
  }
  const plus94 = await call('POST', '/auth/register', {
    json: { ...goodUser, email: `test.p.${stamp}@example.com`, phoneNumber: '+94 77 123 4567' },
  });
  check('register accepts +94 number with spaces (stored normalised)', plus94.status === 201 && plus94.data.user.phoneNumber === '+94771234567', plus94.data);
  const dupEmail = await call('POST', '/auth/register', { json: { ...goodUser, email: `TEST.A.${stamp}@example.com` } });
  check('register rejects duplicate email (case-insensitive)', dupEmail.status === 400, dupEmail.data);
  const badLogin = await call('POST', '/auth/login', { json: { email: 'bad-email', password: 'x' } });
  check('login rejects invalid email format', badLogin.status === 400, badLogin.data);

  console.log('\nDoctor');
  const letterStamp = String(stamp).replace(/\d/g, (d) => 'abcdefghij'[d]);
  const form = new FormData();
  form.append('doctorName', `Dr. Test ${letterStamp}`);
  form.append('specialization', 'General Physician');
  form.append('contactNumber', '0711111111');
  form.append('consultationFee', '2500');
  form.append('availableDay', JSON.stringify([target.day]));
  form.append('profileImage', new Blob([PNG_1PX], { type: 'image/png' }), 'doctor.png');
  const created = await call('POST', '/doctors', { token: adminToken, form });
  check('admin creates doctor with image', created.status === 201 && /^uploads\//.test(created.data.profileImage), created.data);
  const doctorId = created.data._id;

  const imgRes = await fetch(`${BASE.replace(/\/api$/, '')}/${created.data.profileImage}`);
  check('uploaded image is served', imgRes.status === 200);

  const badForm = new FormData();
  badForm.append('doctorName', 'Dr. Bad');
  const bad = await call('POST', '/doctors', { token: adminToken, form: badForm });
  check('missing doctor fields rejected', bad.status === 400, bad.data);

  const txtForm = new FormData();
  txtForm.append('profileImage', new Blob(['hello'], { type: 'text/plain' }), 'x.txt');
  const badImg = await call('PUT', `/doctors/${doctorId}/image`, { token: adminToken, form: txtForm });
  check('non-image upload rejected', badImg.status === 400, badImg.data);

  const patientCreate = await call('POST', '/doctors', { token: tokenA, form: new FormData() });
  check('patient cannot create doctor', patientCreate.status === 403, patientCreate.data);

  const list = await call('GET', '/doctors?search=Test', { token: tokenA });
  check('patient can view doctors', list.status === 200 && list.data.some((d) => d._id === doctorId), list.data);

  const one = await call('GET', `/doctors/${doctorId}`, { token: tokenA });
  check('patient can view doctor details', one.status === 200 && one.data.consultationFee === 2500, one.data);

  const upd = await call('PUT', `/doctors/${doctorId}`, { token: adminToken, json: { consultationFee: 3000 } });
  check('admin updates doctor', upd.status === 200 && upd.data.consultationFee === 3000, upd.data);

  const badDoctorUpdates = [
    ['doctor name with digits', { doctorName: 'Dr. 007' }],
    ['specialization with digits', { specialization: 'Cardio 1' }],
    ['invalid contact number', { contactNumber: '12345' }],
    ['negative fee', { consultationFee: -5 }],
    ['fee above Rs. 100,000', { consultationFee: 100001 }],
    ['non-numeric fee', { consultationFee: 'abc' }],
    ['empty available days', { availableDay: [] }],
    ['unknown weekday', { availableDay: ['Funday'] }],
  ];
  for (const [label, body] of badDoctorUpdates) {
    const r = await call('PUT', `/doctors/${doctorId}`, { token: adminToken, json: body });
    check(`doctor update rejects ${label} (400)`, r.status === 400, { status: r.status, message: r.data?.message });
  }
  const unchanged = await call('GET', `/doctors/${doctorId}`, { token: adminToken });
  check('rejected updates left the doctor unchanged', unchanged.data.consultationFee === 3000 && unchanged.data.availableDay.length === 1);

  console.log('\nAppointment');
  const slot = '10:00';
  for (const [label, reason] of [['missing reason', undefined], ['4-character reason', 'Flu.'], ['501-character reason', 'x'.repeat(501)]]) {
    const r = await call('POST', '/appointments', {
      token: tokenA,
      json: { doctorId, appointmentDate: target.str, appointmentTime: slot, reason },
    });
    check(`booking rejects ${label}`, r.status === 400, r.data);
  }
  const badTime = await call('POST', '/appointments', {
    token: tokenA,
    json: { doctorId, appointmentDate: target.str, appointmentTime: '10:15', reason: 'Headache' },
  });
  check('booking rejects time outside the slot list', badTime.status === 400, badTime.data);
  const badDate = await call('POST', '/appointments', {
    token: tokenA,
    json: { doctorId, appointmentDate: '2026-02-30', appointmentTime: slot, reason: 'Headache' },
  });
  check('booking rejects impossible date', badDate.status === 400, badDate.data);
  const bookA = await call('POST', '/appointments', {
    token: tokenA,
    json: { doctorId, appointmentDate: target.str, appointmentTime: slot, reason: 'Fever' },
  });
  check('patient A books slot', bookA.status === 201 && bookA.data.status === 'Pending', bookA.data);
  const apptA = bookA.data._id;

  const bookB = await call('POST', '/appointments', {
    token: tokenB,
    json: { doctorId, appointmentDate: target.str, appointmentTime: slot, reason: 'Cough' },
  });
  check(
    'double booking blocked with exact message',
    bookB.status === 409 && bookB.data.message === 'This time slot is already booked. Please select another time.',
    bookB.data
  );

  const slots = await call('GET', `/appointments/booked-slots?doctorId=${doctorId}&date=${target.str}`, { token: tokenB });
  check('booked-slots lists the taken slot', slots.status === 200 && slots.data.bookedSlots.includes(slot), slots.data);

  const wrongDay = await call('POST', '/appointments', {
    token: tokenB,
    json: { doctorId, appointmentDate: otherDay.str, appointmentTime: slot, reason: 'Cough' },
  });
  check("booking on doctor's unavailable day rejected", wrongDay.status === 400, wrongDay.data);

  const past = await call('POST', '/appointments', {
    token: tokenB,
    json: { doctorId, appointmentDate: localDate(-7).str, appointmentTime: slot, reason: 'Cough' },
  });
  check('booking in the past rejected', past.status === 400, past.data);

  const peek = await call('GET', `/appointments/${apptA}`, { token: tokenB });
  check("patient cannot view another patient's appointment", peek.status === 403, peek.data);

  const mine = await call('GET', '/appointments', { token: tokenB });
  check('patient list shows only own appointments', mine.status === 200 && mine.data.length === 0, mine.data);

  const edit = await call('PUT', `/appointments/${apptA}`, { token: tokenA, json: { reason: 'High fever' } });
  check('patient edits pending appointment', edit.status === 200 && edit.data.reason === 'High fever', edit.data);
  const shortEdit = await call('PUT', `/appointments/${apptA}`, { token: tokenA, json: { reason: 'abc' } });
  check('edit rejects too-short reason', shortEdit.status === 400, shortEdit.data);

  const selfConfirm = await call('PATCH', `/appointments/${apptA}/status`, { token: tokenA, json: { status: 'Confirmed' } });
  check('patient cannot change status', selfConfirm.status === 403, selfConfirm.data);

  const cancel = await call('PATCH', `/appointments/${apptA}/cancel`, { token: tokenA });
  check('patient cancels appointment', cancel.status === 200 && cancel.data.status === 'Cancelled', cancel.data);

  const rebook = await call('POST', '/appointments', {
    token: tokenB,
    json: { doctorId, appointmentDate: target.str, appointmentTime: slot, reason: 'Cough' },
  });
  check('cancelled slot can be booked again', rebook.status === 201, rebook.data);
  const apptB = rebook.data._id;

  const all = await call('GET', '/appointments', { token: adminToken });
  check('admin sees all appointments', all.status === 200 && [apptA, apptB].every((id) => all.data.some((a) => a._id === id)));

  const confirm = await call('PATCH', `/appointments/${apptB}/status`, { token: adminToken, json: { status: 'Confirmed' } });
  check('admin: Pending -> Confirmed', confirm.status === 200 && confirm.data.status === 'Confirmed', confirm.data);

  const editConfirmed = await call('PUT', `/appointments/${apptB}`, { token: tokenB, json: { reason: 'Changed my mind' } });
  check('confirmed appointment cannot be edited', editConfirmed.status === 400, editConfirmed.data);

  const complete = await call('PATCH', `/appointments/${apptB}/status`, { token: adminToken, json: { status: 'Completed' } });
  check('admin: Confirmed -> Completed', complete.status === 200 && complete.data.status === 'Completed', complete.data);

  const illegal = await call('PATCH', `/appointments/${apptB}/status`, { token: adminToken, json: { status: 'Pending' } });
  check('illegal transition rejected', illegal.status === 400, illegal.data);

  const apptC = await call('POST', '/appointments', {
    token: tokenA,
    json: { doctorId, appointmentDate: target.str, appointmentTime: '11:00', reason: 'Checkup' },
  });
  const blockedDelete = await call('DELETE', `/doctors/${doctorId}`, { token: adminToken });
  check('doctor with active appointments cannot be deleted', blockedDelete.status === 400, blockedDelete.data);

  console.log('\nCleanup');
  for (const id of [apptA, apptB, apptC.data?._id].filter(Boolean)) {
    const del = await call('DELETE', `/appointments/${id}`, { token: adminToken });
    check(`admin deletes appointment ${id}`, del.status === 200, del.data);
  }
  const delDoc = await call('DELETE', `/doctors/${doctorId}`, { token: adminToken });
  check('admin deletes doctor', delDoc.status === 200, delDoc.data);

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exitCode = failed ? 1 : 0;
}

run().catch((err) => {
  console.error('\nTest run aborted:', err.message);
  process.exitCode = 1;
});
