
 🏥 Hospital Management System (HMS) Backend

A robust, modular, and real-time backend architecture built with **NestJS**, **TypeScript**, and **PostgreSQL**. This system is designed to handle critical healthcare workflows, secure patient data, and provide real-time updates via WebSockets.

🚀 Features

* **Modular Architecture**: High separation of concerns (Patients, Doctors, Pharmacy, Billing).
* **Real-time Notifications**: Instant alerts for emergency "Code Blue," lab results, and appointment updates via Socket.io.
* **RBAC Security**: Role-Based Access Control (Admin, Doctor, Nurse, Patient).
* **Data Integrity**: Strictly typed entities using TypeORM and PostgreSQL.
* **Automated Validation**: Request filtering using `class-validator`.

---
 🛠️ Tech Stack

* **Framework**: [NestJS](https://nestjs.com/)
* **Language**: TypeScript
* **Database**: PostgreSQL
* **ORM**: TypeORM
* **Real-time**: WebSockets (Socket.io)
* **Authentication**: Passport.js & JWT

---

📂 Project Structure

```text
src/
├── modules/
│   ├── auth/            # Authentication & JWT Strategy
│   ├── patients/        # Electronic Health Records (EHR)
│   ├── doctors/         # Staff profiles & Scheduling
│   ├── appointments/    # Real-time booking system
│   ├── pharmacy/        # Inventory & Prescriptions
│   └── billing/         # Invoicing & Payments
├── notifications/       # WebSocket Gateway (Real-time Hub)
├── database/            # Connection & Migrations
└── common/              # Shared Guards, Interceptors, and DTOs

```

---

 ⚙️ Installation

1. **Clone the repository**:
```bash
git clone https://github.com/your-username/hospital-backend.git
cd hospital-backend

```


2. **Install dependencies**:
```bash
npm install

```


3. **Environment Setup**:
Create a `.env` file in the root directory:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=yourpassword
DB_NAME=hms_db
JWT_SECRET=super-secret-key

```



---

🚦 Running the App

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod

```

---

 📡 Real-time Events (WebSockets)

The system uses a `NotificationsGateway` to push data.

**Events emitted by server:**

* `emergency_alert`: Triggered for critical patient status.
* `appointment_confirmed`: Sent to patients when a doctor accepts a slot.
* `lab_result_ready`: Sent to doctors when tests are completed.

---

🔒 Security & Compliance

* **CORS**: Configured for secure frontend communication.
* **Validation**: All incoming data is sanitized via `ValidationPipe`.
* **Encryption**: Passwords are hashed using `bcrypt`.

---

 📄 License

This project is licensed under the MIT License.

---

**Would you like me to create the `.env` template and the `TypeORM` configuration file next so you can connect your database?**
