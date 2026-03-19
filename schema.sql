-- ============================================================
-- Hospital Backend - PostgreSQL Database Schema
-- ============================================================
-- Run this against your PostgreSQL database to set up the schema.
-- TypeORM synchronize=true in development will auto-create tables,
-- but this file serves as the canonical reference schema.
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PATIENT');
CREATE TYPE gender AS ENUM ('MALE', 'FEMALE', 'OTHER');
CREATE TYPE blood_group AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
CREATE TYPE appointment_status AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
CREATE TYPE payment_status AS ENUM ('PAID', 'PENDING', 'PARTIAL');
CREATE TYPE payment_method AS ENUM ('CASH', 'CARD', 'INSURANCE', 'ONLINE');
CREATE TYPE log_action AS ENUM (
  'LOGIN', 'LOGOUT', 'OAUTH_LOGIN',
  'CREATE_USER', 'UPDATE_USER', 'DELETE_USER', 'INVITE_USER',
  'APPOINTMENT_CREATED', 'APPOINTMENT_UPDATED', 'APPOINTMENT_CANCELLED',
  'BILLING_CREATED', 'BILLING_UPDATED',
  'ERROR', 'OTHER'
);

-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       VARCHAR(255) NOT NULL UNIQUE,
  password    VARCHAR(255),                        -- nullable for OAuth-only accounts
  role        user_role NOT NULL DEFAULT 'PATIENT',
  "firstName" VARCHAR(100) NOT NULL,
  "lastName"  VARCHAR(100) NOT NULL,
  phone       VARCHAR(30),
  "isActive"  BOOLEAN NOT NULL DEFAULT TRUE,
  "googleId"  VARCHAR(255),
  "profilePicture" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role  ON users(role);

-- ============================================================
-- PATIENTS
-- ============================================================

CREATE TABLE patients (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId"            UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  "dateOfBirth"       DATE NOT NULL,
  gender              gender NOT NULL,
  "bloodGroup"        blood_group,
  address             TEXT NOT NULL,
  "emergencyContact"  VARCHAR(100) NOT NULL,
  "emergencyPhone"    VARCHAR(30) NOT NULL,
  "insuranceProvider" VARCHAR(100),
  "insuranceNumber"   VARCHAR(100),
  "medicalHistory"    TEXT,
  allergies           TEXT,
  "createdAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_patients_user ON patients("userId");

-- ============================================================
-- DOCTORS
-- ============================================================

CREATE TABLE doctors (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId"         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  specialization   VARCHAR(100) NOT NULL,
  qualification    VARCHAR(200) NOT NULL,
  experience       INTEGER NOT NULL,
  "consultationFee" NUMERIC(10,2) NOT NULL,
  department       VARCHAR(100) NOT NULL,
  "availableFrom"  TIME NOT NULL,
  "availableTo"    TIME NOT NULL,
  "availableDays"  TEXT,                           -- stored as comma-separated array
  "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_doctors_user       ON doctors("userId");
CREATE INDEX idx_doctors_department ON doctors(department);

-- ============================================================
-- APPOINTMENTS
-- ============================================================

CREATE TABLE appointments (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "patientId"       UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  "doctorId"        UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  "appointmentDate" DATE NOT NULL,
  "appointmentTime" TIME NOT NULL,
  status            appointment_status NOT NULL DEFAULT 'SCHEDULED',
  reason            TEXT,
  notes             TEXT,
  diagnosis         TEXT,
  prescription      TEXT,
  "createdAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_appointments_patient ON appointments("patientId");
CREATE INDEX idx_appointments_doctor  ON appointments("doctorId");
CREATE INDEX idx_appointments_date    ON appointments("appointmentDate");
CREATE INDEX idx_appointments_status  ON appointments(status);

-- ============================================================
-- BILLING
-- ============================================================

CREATE TABLE billing (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "patientId"     UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  "appointmentId" UUID REFERENCES appointments(id) ON DELETE SET NULL,
  amount          NUMERIC(10,2) NOT NULL,
  "paidAmount"    NUMERIC(10,2) NOT NULL DEFAULT 0,
  "paymentStatus" payment_status NOT NULL DEFAULT 'PENDING',
  "paymentMethod" payment_method,
  description     TEXT,
  notes           TEXT,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_billing_patient ON billing("patientId");
CREATE INDEX idx_billing_status  ON billing("paymentStatus");

-- ============================================================
-- MEDICINES
-- ============================================================

CREATE TABLE medicines (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         VARCHAR(200) NOT NULL,
  description  TEXT,
  manufacturer VARCHAR(200),
  price        NUMERIC(10,2) NOT NULL,
  stock        INTEGER NOT NULL DEFAULT 0,
  "expiryDate" DATE,
  category     VARCHAR(100),
  dosage       VARCHAR(100),
  "isAvailable" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_medicines_name     ON medicines(name);
CREATE INDEX idx_medicines_category ON medicines(category);

-- ============================================================
-- PRESCRIPTIONS
-- ============================================================

CREATE TABLE prescriptions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "patientId"     UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  "doctorId"      UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  "appointmentId" UUID REFERENCES appointments(id) ON DELETE SET NULL,
  medicines       JSONB NOT NULL DEFAULT '[]',     -- [{medicineId, name, dosage, frequency, duration, quantity}]
  instructions    TEXT,
  notes           TEXT,
  dispensed       BOOLEAN NOT NULL DEFAULT FALSE,
  "dispensedAt"   TIMESTAMPTZ,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prescriptions_patient ON prescriptions("patientId");
CREATE INDEX idx_prescriptions_doctor  ON prescriptions("doctorId");

-- ============================================================
-- LOGS (AUDIT)
-- ============================================================

CREATE TABLE logs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action       log_action NOT NULL DEFAULT 'OTHER',
  description  TEXT,
  details      TEXT,
  "userId"     UUID REFERENCES users(id) ON DELETE SET NULL,
  "ipAddress"  VARCHAR(45),
  "userAgent"  TEXT,
  "stackTrace" TEXT,
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_logs_user   ON logs("userId");
CREATE INDEX idx_logs_action ON logs(action);
CREATE INDEX idx_logs_date   ON logs("createdAt");

-- ============================================================
-- SEED: Default Admin Account
-- ============================================================
-- Password: Admin@123456  (bcrypt hash below)
-- Change this immediately after first login!

INSERT INTO users (id, email, password, role, "firstName", "lastName", phone, "isActive")
VALUES (
  uuid_generate_v4(),
  'admin@hospital.com',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Admin@123456
  'ADMIN',
  'System',
  'Administrator',
  '+1000000000',
  TRUE
) ON CONFLICT (email) DO NOTHING;
