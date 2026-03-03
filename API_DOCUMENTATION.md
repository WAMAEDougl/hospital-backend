# Hospital Backend API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication
All endpoints (except `/auth/register` and `/auth/login`) require JWT authentication.

Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "role": "PATIENT"
}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "PATIENT"
}
```

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "access_token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "PATIENT"
  }
}
```

---

## Patients Endpoints

### Create Patient Profile
```http
POST /patients
```

**Request Body:**
```json
{
  "userId": "user-uuid",
  "dateOfBirth": "1990-01-01",
  "gender": "Male",
  "bloodGroup": "O+",
  "address": "123 Main St",
  "emergencyContact": "Jane Doe",
  "emergencyPhone": "+1234567890",
  "insuranceProvider": "HealthCare Inc",
  "insuranceNumber": "INS123456"
}
```

### Get All Patients
```http
GET /patients?page=1&limit=10
```

### Search Patients
```http
GET /patients/search?q=john&page=1&limit=10
```

### Get Patient by ID
```http
GET /patients/:id
```

### Update Patient
```http
PATCH /patients/:id
```

### Delete Patient
```http
DELETE /patients/:id
```

---

## Doctors Endpoints

### Create Doctor Profile
```http
POST /doctors
```

**Request Body:**
```json
{
  "userId": "user-uuid",
  "specialization": "Cardiology",
  "qualification": "MD, MBBS",
  "experience": 10,
  "consultationFee": 150.00,
  "department": "Cardiology",
  "availableFrom": "09:00",
  "availableTo": "17:00"
}
```

### Get All Doctors
```http
GET /doctors?page=1&limit=10
```

### Get Doctors by Specialization
```http
GET /doctors/specialization/Cardiology?page=1&limit=10
```

### Check Doctor Availability
```http
GET /doctors/:id/availability?date=2024-03-15
```

### Get Doctor by ID
```http
GET /doctors/:id
```

### Update Doctor
```http
PATCH /doctors/:id
```

### Delete Doctor
```http
DELETE /doctors/:id
```

---

## Appointments Endpoints

### Book Appointment
```http
POST /appointments
```

**Request Body:**
```json
{
  "patientId": "patient-uuid",
  "doctorId": "doctor-uuid",
  "appointmentDate": "2024-03-15",
  "appointmentTime": "10:00",
  "reason": "Regular checkup"
}
```

**Response:**
```json
{
  "id": "appointment-uuid",
  "patientId": "patient-uuid",
  "doctorId": "doctor-uuid",
  "appointmentDate": "2024-03-15",
  "appointmentTime": "10:00",
  "status": "SCHEDULED",
  "reason": "Regular checkup",
  "createdAt": "2024-03-01T10:00:00Z"
}
```

### Get All Appointments
```http
GET /appointments?page=1&limit=10
```

### Get Appointment by ID
```http
GET /appointments/:id
```

**Response includes patient, doctor, and billing relations**

### Get Patient Appointments
```http
GET /appointments/patient/:patientId?page=1&limit=10
```

### Get Doctor Appointments
```http
GET /appointments/doctor/:doctorId?page=1&limit=10
```

### Update Appointment
```http
PATCH /appointments/:id
```

**Request Body:**
```json
{
  "status": "COMPLETED",
  "notes": "Patient responded well to treatment",
  "diagnosis": "Mild hypertension",
  "prescription": "Medication XYZ, 10mg daily"
}
```

### Cancel Appointment
```http
DELETE /appointments/:id
```

---

## Billing Endpoints

### Create Invoice
```http
POST /billing
```

**Request Body:**
```json
{
  "patientId": "patient-uuid",
  "appointmentId": "appointment-uuid",
  "amount": 150.00,
  "description": "Consultation fee",
  "insuranceClaim": false,
  "notes": "Payment due within 30 days"
}
```

**Response:**
```json
{
  "id": "billing-uuid",
  "patientId": "patient-uuid",
  "appointmentId": "appointment-uuid",
  "amount": 150.00,
  "paidAmount": 0,
  "paymentStatus": "PENDING",
  "description": "Consultation fee",
  "createdAt": "2024-03-01T10:00:00Z"
}
```

### Get All Invoices
```http
GET /billing?page=1&limit=10
```

### Get Invoice by ID
```http
GET /billing/:id
```

### Get Patient Invoices
```http
GET /billing/patient/:patientId?page=1&limit=10
```

### Get Pending Bills
```http
GET /billing/pending?page=1&limit=10
```

### Update Invoice
```http
PATCH /billing/:id
```

### Process Payment
```http
POST /billing/:id/payment
```

**Request Body:**
```json
{
  "amount": 150.00,
  "paymentMethod": "CARD"
}
```

**Response:**
```json
{
  "id": "billing-uuid",
  "amount": 150.00,
  "paidAmount": 150.00,
  "paymentStatus": "PAID",
  "paymentMethod": "CARD"
}
```

### Delete Invoice
```http
DELETE /billing/:id
```

---

## Pharmacy Endpoints

### Add Medicine
```http
POST /pharmacy
```

**Request Body:**
```json
{
  "name": "Aspirin",
  "description": "Pain reliever and fever reducer",
  "manufacturer": "PharmaCorp",
  "price": 5.99,
  "stock": 100,
  "expiryDate": "2025-12-31",
  "category": "Pain Relief",
  "dosage": "500mg",
  "isAvailable": true
}
```

### Get All Medicines
```http
GET /pharmacy?page=1&limit=10
```

### Search Medicines
```http
GET /pharmacy/search?q=aspirin&page=1&limit=10
```

### Get Medicines by Category
```http
GET /pharmacy/category/Pain%20Relief?page=1&limit=10
```

### Get Low Stock Medicines
```http
GET /pharmacy/low-stock?threshold=10&page=1&limit=10
```

### Get Medicine by ID
```http
GET /pharmacy/:id
```

### Update Medicine
```http
PATCH /pharmacy/:id
```

**Request Body:**
```json
{
  "price": 6.99,
  "stock": 150
}
```

### Update Medicine Stock
```http
PATCH /pharmacy/:id/stock
```

**Request Body:**
```json
{
  "quantity": -10
}
```
*Note: Use negative values to reduce stock, positive to add stock*

### Delete Medicine
```http
DELETE /pharmacy/:id
```

---

## Prescriptions Endpoints

### Create Prescription
```http
POST /prescriptions
```

**Request Body:**
```json
{
  "patientId": "patient-uuid",
  "doctorId": "doctor-uuid",
  "appointmentId": "appointment-uuid",
  "medicines": [
    {
      "medicineId": "medicine-uuid",
      "medicineName": "Aspirin",
      "dosage": "500mg",
      "frequency": "Twice daily",
      "duration": "7 days",
      "quantity": 14
    }
  ],
  "instructions": "Take after meals with water",
  "notes": "Follow up in 1 week"
}
```

**Response:**
```json
{
  "id": "prescription-uuid",
  "patientId": "patient-uuid",
  "doctorId": "doctor-uuid",
  "appointmentId": "appointment-uuid",
  "medicines": [...],
  "instructions": "Take after meals with water",
  "dispensed": false,
  "createdAt": "2024-03-01T10:00:00Z"
}
```

### Get All Prescriptions
```http
GET /prescriptions?page=1&limit=10
```

### Get Prescription by ID
```http
GET /prescriptions/:id
```

**Response includes patient, doctor, and appointment relations**

### Get Patient Prescriptions
```http
GET /prescriptions/patient/:patientId?page=1&limit=10
```

### Get Doctor Prescriptions
```http
GET /prescriptions/doctor/:doctorId?page=1&limit=10
```

### Update Prescription
```http
PATCH /prescriptions/:id
```

### Mark Prescription as Dispensed
```http
POST /prescriptions/:id/dispense
```

**Response:**
```json
{
  "id": "prescription-uuid",
  "dispensed": true,
  "dispensedAt": "2024-03-01T15:30:00Z"
}
```

### Delete Prescription
```http
DELETE /prescriptions/:id
```

---

## WebSocket Notifications

### Connection
```javascript
const socket = io('http://localhost:3000');
```

### Join Room
```javascript
socket.emit('join', 'user-123');
```

### Leave Room
```javascript
socket.emit('leave', 'user-123');
```

### Listen for Notifications
```javascript
socket.on('notification', (data) => {
  console.log('Notification:', data);
});

socket.on('appointment-update', (data) => {
  console.log('Appointment Update:', data);
});

socket.on('billing-update', (data) => {
  console.log('Billing Update:', data);
});
```

---

## Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid authentication
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Pagination Response Format

All paginated endpoints return data in this format:
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

---

## Enums

### User Roles
- `ADMIN`
- `DOCTOR`
- `NURSE`
- `RECEPTIONIST`
- `PATIENT`

### Appointment Status
- `SCHEDULED`
- `COMPLETED`
- `CANCELLED`
- `NO_SHOW`

### Payment Status
- `PAID`
- `PENDING`
- `PARTIAL`

### Payment Method
- `CASH`
- `CARD`
- `INSURANCE`
- `ONLINE`
