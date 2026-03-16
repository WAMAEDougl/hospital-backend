# Admin Features Documentation

## Overview

This document describes the admin-only features including user management, logging system, and role-based access control.

## Features Implemented

### 1. Admin User Management

Only administrators can invite, create, update, and manage users (Doctors, Nurses, Receptionists).

#### Invite User

**Endpoint:** `POST /api/admin/invite-user`

**Authentication:** Required (JWT Token)
**Authorization:** Admin only

**Request Body:**
```json
{
  "email": "doctor@hospital.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+254712345678",
  "role": "DOCTOR"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "doctor@hospital.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+254712345678",
    "role": "DOCTOR",
    "isActive": true,
    "createdAt": "2026-03-16T10:30:00Z"
  },
  "temporaryPassword": "Abc123!@#$%^"
}
```

**Notes:**
- A temporary password is generated and returned
- User must change password on first login
- Only DOCTOR, NURSE, and RECEPTIONIST roles can be invited

#### Create User

**Endpoint:** `POST /api/admin/create-user`

**Authentication:** Required (JWT Token)
**Authorization:** Admin only

**Request Body:**
```json
{
  "email": "nurse@hospital.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+254712345679",
  "role": "NURSE",
  "temporaryPassword": "CustomPass123!"
}
```

**Response:** Same as invite-user

**Notes:**
- Similar to invite-user but allows custom password
- If no password provided, one is generated

#### Get All Users

**Endpoint:** `GET /api/admin/users?page=1&limit=10`

**Authentication:** Required (JWT Token)
**Authorization:** Admin only

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "email": "doctor@hospital.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+254712345678",
      "role": "DOCTOR",
      "isActive": true,
      "createdAt": "2026-03-16T10:30:00Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

#### Update User

**Endpoint:** `PATCH /api/admin/users/:userId`

**Authentication:** Required (JWT Token)
**Authorization:** Admin only

**Request Body:**
```json
{
  "firstName": "Jonathan",
  "lastName": "Doe",
  "phone": "+254712345680",
  "role": "DOCTOR"
}
```

**Response:** Updated user object

**Notes:**
- Cannot change role to ADMIN or PATIENT
- Email can be updated if not already in use

#### Delete User

**Endpoint:** `DELETE /api/admin/users/:userId`

**Authentication:** Required (JWT Token)
**Authorization:** Admin only

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

**Notes:**
- Cannot delete admin users
- Deletion is permanent

#### Deactivate User

**Endpoint:** `PATCH /api/admin/users/:userId/deactivate`

**Authentication:** Required (JWT Token)
**Authorization:** Admin only

**Response:** Updated user object with `isActive: false`

**Notes:**
- Deactivated users cannot login
- Can be reactivated later

#### Activate User

**Endpoint:** `PATCH /api/admin/users/:userId/activate`

**Authentication:** Required (JWT Token)
**Authorization:** Admin only

**Response:** Updated user object with `isActive: true`

---

### 2. Logging System

All system activities are logged for audit purposes. Only admins can view logs.

#### Get All Logs

**Endpoint:** `GET /api/logs?page=1&limit=50&action=LOGIN&userId=uuid`

**Authentication:** Required (JWT Token)
**Authorization:** Admin only

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `action` (optional): Filter by action type
- `userId` (optional): Filter by user ID

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "action": "LOGIN",
      "description": "User logged in: john@hospital.com",
      "details": "{\"email\":\"john@hospital.com\",\"role\":\"DOCTOR\"}",
      "userId": "uuid",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2026-03-16T10:30:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 50,
  "totalPages": 3
}
```

#### Get Logs by User

**Endpoint:** `GET /api/logs/user/:userId?page=1&limit=50`

**Authentication:** Required (JWT Token)
**Authorization:** Admin only

**Response:** Same as Get All Logs

#### Get Logs by Action

**Endpoint:** `GET /api/logs/action/:action?page=1&limit=50`

**Authentication:** Required (JWT Token)
**Authorization:** Admin only

**Supported Actions:**
- `LOGIN` - User login
- `LOGOUT` - User logout
- `CREATE_USER` - User creation
- `UPDATE_USER` - User update
- `DELETE_USER` - User deletion
- `INVITE_USER` - User invitation
- `APPOINTMENT_CREATED` - Appointment created
- `APPOINTMENT_UPDATED` - Appointment updated
- `APPOINTMENT_CANCELLED` - Appointment cancelled
- `BILLING_CREATED` - Billing record created
- `BILLING_UPDATED` - Billing record updated
- `ERROR` - System error
- `OTHER` - Other actions

**Response:** Same as Get All Logs

---

### 3. Role-Based Access Control

#### Roles

- **ADMIN** - Full system access, can manage users and view logs
- **DOCTOR** - Can manage appointments, prescriptions, and patient records
- **NURSE** - Can assist with patient care and records
- **RECEPTIONIST** - Can manage appointments and billing
- **PATIENT** - Can view own appointments and medical records

#### Protected Endpoints

Admin-only endpoints:
- `POST /api/admin/invite-user`
- `POST /api/admin/create-user`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:userId`
- `DELETE /api/admin/users/:userId`
- `PATCH /api/admin/users/:userId/deactivate`
- `PATCH /api/admin/users/:userId/activate`
- `GET /api/logs`
- `GET /api/logs/user/:userId`
- `GET /api/logs/action/:action`

---

## Login Issue Fixes

### Issues Fixed

1. **Improved Error Handling**
   - Better error messages for debugging
   - Proper HTTP status codes

2. **Login Logging**
   - All login attempts are logged
   - Failed attempts are recorded with reason
   - Successful logins include user role and email

3. **Account Status Validation**
   - Checks if account is active before allowing login
   - Deactivated accounts cannot login

4. **Password Validation**
   - Proper bcrypt comparison
   - Clear error messages for invalid credentials

### Testing Login

**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "email": "user@hospital.com",
  "password": "password123"
}
```

**Success Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@hospital.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "DOCTOR"
  }
}
```

**Error Response:**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

---

## Usage Examples

### Example 1: Admin Inviting a Doctor

```bash
curl -X POST http://localhost:3000/api/admin/invite-user \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dr.smith@hospital.com",
    "firstName": "Smith",
    "lastName": "Johnson",
    "phone": "+254712345678",
    "role": "DOCTOR"
  }'
```

### Example 2: Admin Viewing Login Logs

```bash
curl -X GET "http://localhost:3000/api/logs?action=LOGIN&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Example 3: Admin Deactivating a User

```bash
curl -X PATCH http://localhost:3000/api/admin/users/USER_ID/deactivate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Security Considerations

1. **JWT Tokens**
   - Tokens include user role for authorization
   - Tokens expire after configured duration
   - Always use HTTPS in production

2. **Password Security**
   - Passwords are hashed with bcrypt
   - Temporary passwords are generated securely
   - Users should change temporary passwords on first login

3. **Audit Logging**
   - All admin actions are logged
   - Logs include timestamp, user, and action details
   - Logs are immutable for audit trail

4. **Role-Based Access**
   - Guards prevent unauthorized access
   - Roles are checked on every protected endpoint
   - Admin role is required for user management

---

## Troubleshooting

### Login Not Working

1. Check if user account exists
2. Verify password is correct
3. Check if account is active (not deactivated)
4. Check JWT token is valid and not expired
5. Review login logs for error details

### Cannot Access Admin Endpoints

1. Verify JWT token is included in Authorization header
2. Check if user role is ADMIN
3. Review logs for access denied errors
4. Ensure token is not expired

### Missing Logs

1. Check if logs are being created (check database)
2. Verify admin user has permission to view logs
3. Check log retention policy (old logs may be deleted)

---

## Best Practices

1. **User Management**
   - Always use temporary passwords for new users
   - Require password change on first login
   - Regularly review active users
   - Deactivate instead of deleting when possible

2. **Logging**
   - Regularly review logs for suspicious activity
   - Archive old logs for compliance
   - Monitor failed login attempts
   - Track user creation and deletion

3. **Security**
   - Use strong passwords
   - Enable 2FA when available
   - Rotate admin credentials regularly
   - Monitor admin activity closely

---

## API Summary

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | /api/admin/invite-user | Yes | ADMIN | Invite new user |
| POST | /api/admin/create-user | Yes | ADMIN | Create new user |
| GET | /api/admin/users | Yes | ADMIN | List all users |
| PATCH | /api/admin/users/:id | Yes | ADMIN | Update user |
| DELETE | /api/admin/users/:id | Yes | ADMIN | Delete user |
| PATCH | /api/admin/users/:id/deactivate | Yes | ADMIN | Deactivate user |
| PATCH | /api/admin/users/:id/activate | Yes | ADMIN | Activate user |
| GET | /api/logs | Yes | ADMIN | View all logs |
| GET | /api/logs/user/:id | Yes | ADMIN | View user logs |
| GET | /api/logs/action/:action | Yes | ADMIN | View logs by action |
| POST | /api/auth/login | No | - | User login |
| GET | /api/auth/profile | Yes | - | Get user profile |
