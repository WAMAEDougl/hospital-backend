# Hospital Backend - Complete Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn package manager

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 2. Database Setup

#### Create PostgreSQL Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE hospital_db;

# Create user (optional)
CREATE USER hospital_user WITH PASSWORD 'your_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE hospital_db TO hospital_user;

# Exit
\q
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=hospital_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=24h

# Application Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3001
```

### 4. Database Synchronization

The application uses TypeORM with `synchronize: true` in development, which automatically creates tables.

**For Production:** Use migrations instead:

```bash
# Generate migration
npm run migration:generate -- -n InitialSchema

# Run migrations
npm run migration:run

# Revert migration (if needed)
npm run migration:revert
```

### 5. Seed Database (Optional)

Populate the database with test data:

```bash
npm run seed
```

This will create:
- 1 Admin user
- 2 Doctors
- 2 Patients
- 5 Medicines

**Test Credentials:**
- Admin: `admin@hospital.com` / `admin123`
- Doctor 1: `dr.smith@hospital.com` / `doctor123`
- Doctor 2: `dr.johnson@hospital.com` / `doctor123`
- Patient 1: `patient1@example.com` / `patient123`
- Patient 2: `patient2@example.com` / `patient123`

### 6. Start the Application

#### Development Mode
```bash
npm run start:dev
```

#### Production Mode
```bash
# Build
npm run build

# Start
npm run start:prod
```

### 7. Verify Installation

The application should be running at:
- API: `http://localhost:3000/api`
- WebSocket: `ws://localhost:3000`

Check health endpoint:
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-03-01T10:00:00.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

## Testing the API

### 1. Register a User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "phone": "+1234567890",
    "role": "PATIENT"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the `access_token` from the response.

### 3. Access Protected Endpoints

```bash
curl -X GET http://localhost:3000/api/patients \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## WebSocket Testing

### Using JavaScript Client

```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected to WebSocket server');
  
  // Join a room
  socket.emit('join', 'user-123');
});

socket.on('notification', (data) => {
  console.log('Notification received:', data);
});

socket.on('appointment-update', (data) => {
  console.log('Appointment update:', data);
});

socket.on('billing-update', (data) => {
  console.log('Billing update:', data);
});
```

## Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Common Issues and Solutions

### Issue 1: Database Connection Error

**Error:** `ECONNREFUSED` or `Connection refused`

**Solution:**
- Ensure PostgreSQL is running: `sudo service postgresql status`
- Check database credentials in `.env`
- Verify database exists: `psql -U postgres -l`

### Issue 2: Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:**
- Change port in `.env`: `PORT=3001`
- Or kill the process using port 3000:
  ```bash
  # Find process
  lsof -i :3000
  
  # Kill process
  kill -9 <PID>
  ```

### Issue 3: JWT Secret Not Set

**Error:** `JWT_SECRET is not defined`

**Solution:**
- Ensure `.env` file exists
- Set `JWT_SECRET` in `.env`
- Restart the application

### Issue 4: TypeORM Synchronization Issues

**Error:** Table already exists or schema mismatch

**Solution:**
- Drop and recreate database:
  ```bash
  psql -U postgres
  DROP DATABASE hospital_db;
  CREATE DATABASE hospital_db;
  ```
- Or use migrations in production

## Development Workflow

### 1. Create a New Module

```bash
nest g module modules/new-module
nest g controller modules/new-module
nest g service modules/new-module
```

### 2. Create a New Entity

```bash
nest g class database/entities/new-entity --no-spec
```

### 3. Create DTOs

```bash
nest g class modules/new-module/dto/create-new.dto --no-spec
nest g class modules/new-module/dto/update-new.dto --no-spec
```

## Production Deployment

### 1. Environment Variables

Set production environment variables:
- Strong `JWT_SECRET`
- Production database credentials
- `NODE_ENV=production`
- Specific `CORS_ORIGIN`

### 2. Database Configuration

Update `database.config.ts`:
```typescript
synchronize: false, // NEVER use true in production
logging: false,
ssl: true, // Enable SSL for production
```

### 3. Build and Deploy

```bash
# Build
npm run build

# Start with PM2 (recommended)
pm2 start dist/main.js --name hospital-backend

# Or use Docker
docker build -t hospital-backend .
docker run -p 3000:3000 hospital-backend
```

### 4. Security Checklist

- [ ] Change default JWT_SECRET
- [ ] Enable HTTPS
- [ ] Configure CORS for specific origins
- [ ] Set up rate limiting
- [ ] Enable database SSL
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Use environment-specific configs
- [ ] Disable synchronize in TypeORM
- [ ] Use migrations for schema changes

## API Documentation

Full API documentation is available in:
- `API_DOCUMENTATION.md` - Complete API reference
- `IMPLEMENTATION_GUIDE.md` - Implementation details

## Support

For issues or questions:
1. Check the documentation
2. Review common issues above
3. Check application logs
4. Verify database connection

## License

UNLICENSED
