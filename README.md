# Hospital Management System - Backend

A comprehensive hospital management system built with NestJS, TypeORM, and PostgreSQL.

## Features

- 🔐 **Authentication & Authorization** - JWT-based with role-based access control
- 👥 **Patient Management** - Complete patient records and medical history
- 👨‍⚕️ **Doctor Management** - Doctor profiles, specializations, and availability
- 📅 **Appointment System** - Book, reschedule, and manage appointments
- 💊 **Pharmacy Module** - Medicine inventory and prescription management
- 💰 **Billing System** - Invoice generation and payment tracking
- 🔔 **Notifications** - Real-time notifications using WebSockets
- 📊 **Reports & Analytics** - Patient history and billing reports

## Tech Stack

- **Framework:** NestJS
- **Database:** PostgreSQL
- **ORM:** TypeORM
- **Authentication:** JWT (Passport)
- **Validation:** class-validator, class-transformer
- **Real-time:** WebSockets (Socket.IO)

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd hospital-backend
```

2. Install dependencies
```bash
npm install --legacy-peer-deps
```

3. Set up environment variables
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=hospital_db

JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION=24h

PORT=3000
NODE_ENV=development
```

4. Create the database
```bash
# Using psql
createdb hospital_db

# Or using SQL
psql -U postgres -c "CREATE DATABASE hospital_db;"
```

5. Run the application
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`

## Database Schema

### Entities

- **Users** - System users with roles (Admin, Doctor, Nurse, Receptionist, Patient)
- **Patients** - Patient profiles with medical history
- **Doctors** - Doctor profiles with specializations and availability
- **Appointments** - Appointment bookings and scheduling
- **Billing** - Invoices and payment tracking
- **Medicines** - Pharmacy inventory

### User Roles

- `ADMIN` - Full system access
- `DOCTOR` - Access to appointments, patients, prescriptions
- `NURSE` - Access to patient records and appointments
- `RECEPTIONIST` - Manage appointments and billing
- `PATIENT` - View own records and appointments

## API Endpoints

### Authentication
```
POST   /auth/register     - Register new user
POST   /auth/login        - Login user
GET    /auth/profile      - Get current user profile (Protected)
```

### Patients
```
POST   /patients          - Create patient profile (Protected)
GET    /patients          - Get all patients (Protected, Paginated)
GET    /patients/search   - Search patients (Protected)
GET    /patients/:id      - Get patient by ID (Protected)
PATCH  /patients/:id      - Update patient (Protected)
DELETE /patients/:id      - Delete patient (Protected)
```

### Doctors
```
POST   /doctors                      - Create doctor profile (Protected)
GET    /doctors                      - Get all doctors (Protected, Paginated)
GET    /doctors/specialization/:spec - Get doctors by specialization (Protected)
GET    /doctors/:id                  - Get doctor by ID (Protected)
GET    /doctors/:id/availability     - Check doctor availability (Protected)
PATCH  /doctors/:id                  - Update doctor (Protected)
DELETE /doctors/:id                  - Delete doctor (Protected)
```

### Appointments
```
POST   /appointments                    - Book appointment (Protected)
GET    /appointments                    - Get all appointments (Protected, Paginated)
GET    /appointments/today              - Get today's appointments (Protected)
GET    /appointments/patient/:patientId - Get patient appointments (Protected)
GET    /appointments/doctor/:doctorId   - Get doctor appointments (Protected)
GET    /appointments/:id                - Get appointment by ID (Protected)
PATCH  /appointments/:id                - Update appointment (Protected)
DELETE /appointments/:id                - Cancel appointment (Protected)
```

### Billing
```
POST   /billing                    - Create invoice (Protected)
GET    /billing                    - Get all invoices (Protected, Paginated)
GET    /billing/patient/:patientId - Get patient invoices (Protected)
GET    /billing/:id                - Get invoice by ID (Protected)
PATCH  /billing/:id                - Update invoice (Protected)
PUT    /billing/:id/payment        - Record payment (Protected)
```

### Pharmacy
```
POST   /pharmacy/medicines                      - Add medicine (Protected)
GET    /pharmacy/medicines                      - Get all medicines (Protected, Paginated)
GET    /pharmacy/medicines/:id                  - Get medicine by ID (Protected)
PATCH  /pharmacy/medicines/:id                  - Update medicine (Protected)
DELETE /pharmacy/medicines/:id                  - Delete medicine (Protected)
POST   /pharmacy/prescriptions                  - Create prescription (Protected)
GET    /pharmacy/prescriptions/:id              - Get prescription (Protected)
GET    /pharmacy/prescriptions/patient/:patientId - Get patient prescriptions (Protected)
```

## Example Usage

### 1. Register a User
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@hospital.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "role": "DOCTOR"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@hospital.com",
    "password": "password123"
  }'
```

### 3. Create Patient Profile
```bash
curl -X POST http://localhost:3000/patients \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid",
    "dateOfBirth": "1990-01-01",
    "gender": "MALE",
    "bloodGroup": "O+",
    "address": "123 Main St",
    "emergencyContact": "Jane Doe",
    "emergencyPhone": "+1234567891"
  }'
```

### 4. Book Appointment
```bash
curl -X POST http://localhost:3000/appointments \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "patient-uuid",
    "doctorId": "doctor-uuid",
    "appointmentDate": "2024-03-15",
    "appointmentTime": "10:00",
    "reason": "Regular checkup"
  }'
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── dto/              # Data transfer objects
│   ├── guards/           # JWT guards
│   ├── strategies/       # Passport strategies
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── patients/             # Patient management
├── doctors/              # Doctor management
├── appointments/         # Appointment system
├── billing/              # Billing and invoicing
├── pharmacy/             # Pharmacy and medicines
├── notifications/        # Real-time notifications
├── database/             # Database entities
│   └── entities/         # TypeORM entities
├── config/               # Configuration files
├── app.module.ts         # Root module
└── main.ts               # Application entry point
```

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Input validation with class-validator
- SQL injection prevention (TypeORM)
- CORS configuration
- Rate limiting (recommended for production)

## Deployment

### Production Checklist

- [ ] Set strong JWT_SECRET
- [ ] Configure production database
- [ ] Enable HTTPS
- [ ] Set up database backups
- [ ] Configure monitoring and logging
- [ ] Set up rate limiting
- [ ] Configure CORS for production domains
- [ ] Set up email/SMS service for notifications
- [ ] Enable database connection pooling
- [ ] Set up load balancing (if needed)

### Docker Deployment (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

## Support

For issues and questions, please open an issue in the repository.
