# Admin Features Setup Guide

## Quick Start

### 1. Create Initial Admin User

First, you need to create an admin user. You can do this directly in the database or through the registration endpoint.

**Via Registration (Development Only):**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hospital.com",
    "password": "AdminPassword123!",
    "firstName": "Admin",
    "lastName": "User",
    "phone": "+254712345678",
    "role": "ADMIN"
  }'
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "admin-uuid",
    "email": "admin@hospital.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "ADMIN"
  }
}
```

Save the `accessToken` for use in subsequent requests.

### 2. Login as Admin

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hospital.com",
    "password": "AdminPassword123!"
  }'
```

### 3. Invite a Doctor

```bash
curl -X POST http://localhost:3000/api/admin/invite-user \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@hospital.com",
    "firstName": "John",
    "lastName": "Smith",
    "phone": "+254712345679",
    "role": "DOCTOR"
  }'
```

**Response includes temporary password:**
```json
{
  "user": {
    "id": "doctor-uuid",
    "email": "doctor@hospital.com",
    "firstName": "John",
    "lastName": "Smith",
    "role": "DOCTOR",
    "isActive": true
  },
  "temporaryPassword": "Abc123!@#$%^&*"
}
```

### 4. Doctor Logs In with Temporary Password

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@hospital.com",
    "password": "Abc123!@#$%^&*"
  }'
```

### 5. View Login Logs

```bash
curl -X GET "http://localhost:3000/api/logs?action=LOGIN&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Testing Scenarios

### Scenario 1: Admin Invites Multiple Staff

```bash
# Invite a Nurse
curl -X POST http://localhost:3000/api/admin/invite-user \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nurse@hospital.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "phone": "+254712345680",
    "role": "NURSE"
  }'

# Invite a Receptionist
curl -X POST http://localhost:3000/api/admin/invite-user \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "receptionist@hospital.com",
    "firstName": "Mike",
    "lastName": "Johnson",
    "phone": "+254712345681",
    "role": "RECEPTIONIST"
  }'
```

### Scenario 2: Admin Views All Users

```bash
curl -X GET "http://localhost:3000/api/admin/users?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Scenario 3: Admin Updates User Information

```bash
curl -X PATCH http://localhost:3000/api/admin/users/DOCTOR_UUID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jonathan",
    "phone": "+254712345690"
  }'
```

### Scenario 4: Admin Deactivates User

```bash
curl -X PATCH http://localhost:3000/api/admin/users/DOCTOR_UUID/deactivate \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Scenario 5: Deactivated User Cannot Login

```bash
# This will fail with "Account is deactivated"
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@hospital.com",
    "password": "Abc123!@#$%^&*"
  }'
```

### Scenario 6: Admin Reactivates User

```bash
curl -X PATCH http://localhost:3000/api/admin/users/DOCTOR_UUID/activate \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Scenario 7: View Logs by Action

```bash
# View all CREATE_USER logs
curl -X GET "http://localhost:3000/api/logs/action/CREATE_USER?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# View all UPDATE_USER logs
curl -X GET "http://localhost:3000/api/logs/action/UPDATE_USER?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Scenario 8: View Logs for Specific User

```bash
curl -X GET "http://localhost:3000/api/logs/user/DOCTOR_UUID?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Error Scenarios

### Non-Admin Trying to Access Admin Endpoints

```bash
# This will fail with "Only admins can view logs"
curl -X GET "http://localhost:3000/api/logs" \
  -H "Authorization: Bearer DOCTOR_TOKEN"
```

**Response:**
```json
{
  "statusCode": 403,
  "message": "Only admins can view logs",
  "error": "Forbidden"
}
```

### Invalid Login Credentials

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@hospital.com",
    "password": "WrongPassword"
  }'
```

**Response:**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### Trying to Invite Invalid Role

```bash
curl -X POST http://localhost:3000/api/admin/invite-user \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@hospital.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+254712345678",
    "role": "PATIENT"
  }'
```

**Response:**
```json
{
  "statusCode": 400,
  "message": "Only DOCTOR, NURSE, RECEPTIONIST can be invited",
  "error": "Bad Request"
}
```

---

## Database Verification

### Check Users Table

```sql
SELECT id, email, firstName, lastName, role, isActive, createdAt 
FROM users 
ORDER BY createdAt DESC;
```

### Check Logs Table

```sql
SELECT id, action, description, userId, createdAt 
FROM logs 
ORDER BY createdAt DESC 
LIMIT 20;
```

### Check Specific User Logs

```sql
SELECT id, action, description, details, createdAt 
FROM logs 
WHERE userId = 'USER_UUID' 
ORDER BY createdAt DESC;
```

---

## Postman Collection

You can import this into Postman for easier testing:

```json
{
  "info": {
    "name": "Hospital Admin API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register Admin",
          "request": {
            "method": "POST",
            "url": "http://localhost:3000/api/auth/register",
            "body": {
              "mode": "raw",
              "raw": "{\"email\":\"admin@hospital.com\",\"password\":\"AdminPassword123!\",\"firstName\":\"Admin\",\"lastName\":\"User\",\"phone\":\"+254712345678\",\"role\":\"ADMIN\"}"
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "http://localhost:3000/api/auth/login",
            "body": {
              "mode": "raw",
              "raw": "{\"email\":\"admin@hospital.com\",\"password\":\"AdminPassword123!\"}"
            }
          }
        }
      ]
    },
    {
      "name": "Admin",
      "item": [
        {
          "name": "Invite User",
          "request": {
            "method": "POST",
            "url": "http://localhost:3000/api/admin/invite-user",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"email\":\"doctor@hospital.com\",\"firstName\":\"John\",\"lastName\":\"Smith\",\"phone\":\"+254712345679\",\"role\":\"DOCTOR\"}"
            }
          }
        },
        {
          "name": "Get All Users",
          "request": {
            "method": "GET",
            "url": "http://localhost:3000/api/admin/users?page=1&limit=10",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ]
          }
        }
      ]
    },
    {
      "name": "Logs",
      "item": [
        {
          "name": "Get All Logs",
          "request": {
            "method": "GET",
            "url": "http://localhost:3000/api/logs?page=1&limit=50",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ]
          }
        }
      ]
    }
  ]
}
```

---

## Troubleshooting

### Issue: "Cannot find module" errors

**Solution:** Ensure all new modules are imported in `app.module.ts`

### Issue: Database migration errors

**Solution:** 
1. Check if PostgreSQL is running
2. Verify database connection in `.env`
3. Run migrations: `npm run migration:run`

### Issue: JWT token expired

**Solution:** 
1. Get a new token by logging in again
2. Check JWT_SECRET in `.env`
3. Verify token expiration time

### Issue: Admin endpoints return 403 Forbidden

**Solution:**
1. Verify user role is ADMIN
2. Check JWT token is valid
3. Ensure Authorization header is present

---

## Next Steps

1. Create admin user
2. Invite staff members
3. Monitor logs for activity
4. Test deactivation/activation
5. Verify role-based access control

For more details, see `ADMIN_FEATURES.md`
