# Admin Features Implementation - Complete Guide

## Overview

This document provides a comprehensive guide to the admin features implemented in the Hospital Backend. These features enable administrators to manage users, view system logs, and control access to the platform.

## Features Implemented

### 1. Admin User Management

#### Invite Users
Admins can invite new staff members (doctors, nurses, receptionists) to the system.

**Endpoint:** `POST /admin/invite-user`

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
    "createdAt": "2026-03-16T10:00:00Z"
  },
  "temporaryPassword": "Abc123!@#$%^"
}
```

**Allowed Roles:** DOCTOR, NURSE, RECEPTIONIST
**Restrictions:** Cannot invite ADMIN or PATIENT roles

#### Create User
Admins can directly create user accounts with custom passwords.

**Endpoint:** `POST /admin/create-user`

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

#### Get All Users
Retrieve paginated list of all users in the system.

**Endpoint:** `GET /admin/users?page=1&limit=10`

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
      "createdAt": "2026-03-16T10:00:00Z"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10,
  "totalPages": 3
}
```

#### Update User
Modify user information (email, name, phone, role).

**Endpoint:** `PATCH /admin/users/:userId`

**Request Body:**
```json
{
  "firstName": "Jonathan",
  "phone": "+254712345680"
}
```

#### Delete User
Permanently remove a user from the system.

**Endpoint:** `DELETE /admin/users/:userId`

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

**Restrictions:** Cannot delete ADMIN users

#### Deactivate User
Disable a user account without deleting it.

**Endpoint:** `PATCH /admin/users/:userId/deactivate`

**Response:**
```json
{
  "id": "uuid",
  "email": "doctor@hospital.com",
  "isActive": false
}
```

**Effect:** User cannot login with deactivated account

#### Activate User
Re-enable a previously deactivated user account.

**Endpoint:** `PATCH /admin/users/:userId/activate`

**Response:**
```json
{
  "id": "uuid",
  "email": "doctor@hospital.com",
  "isActive": true
}
```

### 2. System Logging

#### Log Actions Tracked

The system automatically logs the following actions:

- **LOGIN** - User login attempts (successful and failed)
- **LOGOUT** - User logout events
- **CREATE_USER** - Admin creates new user
- **UPDATE_USER** - Admin updates user or deactivates/activates account
- **DELETE_USER** - Admin deletes user
- **INVITE_USER** - Admin invites new staff member
- **APPOINTMENT_CREATED** - Appointment created
- **APPOINTMENT_UPDATED** - Appointment updated
- **APPOINTMENT_CANCELLED** - Appointment cancelled
- **BILLING_CREATED** - Billing record created
- **BILLING_UPDATED** - Billing record updated
- **ERROR** - System errors and failed operations
- **OTHER** - Miscellaneous events

#### Log Entity Structure

Each log entry contains:
- `id` - Unique identifier (UUID)
- `action` - Type of action (LogAction enum)
- `description` - Human-readable description
- `details` - JSON details about the action
- `userId` - ID of user who performed the action
- `ipAddress` - IP address of the request
- `userAgent` - Browser/client information
- `stackTrace` - Error stack trace (for errors)
- `createdAt` - Timestamp of the action

#### Get All Logs
Retrieve paginated system logs with optional filtering.

**Endpoint:** `GET /logs?page=1&limit=50&action=LOGIN&userId=uuid`

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50)
- `action` - Filter by action type (optional)
- `userId` - Filter by user ID (optional)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "action": "LOGIN",
      "description": "User logged in: doctor@hospital.com",
      "details": "{\"email\":\"doctor@hospital.com\",\"role\":\"DOCTOR\"}",
      "userId": "uuid",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "stackTrace": null,
      "createdAt": "2026-03-16T10:00:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 50,
  "totalPages": 3
}
```

#### Get Logs by User
Retrieve all logs for a specific user.

**Endpoint:** `GET /logs/user/:userId?page=1&limit=50`

#### Get Logs by Action
Retrieve all logs for a specific action type.

**Endpoint:** `GET /logs/action/LOGIN?page=1&limit=50`

### 3. Role-Based Access Control

#### Roles Defined

- **ADMIN** - Full system access, can manage users and view logs
- **DOCTOR** - Can manage patients and appointments
- **NURSE** - Can assist with patient care
- **RECEPTIONIST** - Can manage appointments and billing
- **PATIENT** - Can view own appointments and medical records

#### Protected Endpoints

All admin endpoints are protected with:
1. **JwtAuthGuard** - Requires valid JWT token
2. **RolesGuard** - Requires ADMIN role

**Protected Routes:**
- `POST /admin/invite-user` - ADMIN only
- `POST /admin/create-user` - ADMIN only
- `GET /admin/users` - ADMIN only
- `PATCH /admin/users/:userId` - ADMIN only
- `DELETE /admin/users/:userId` - ADMIN only
- `PATCH /admin/users/:userId/deactivate` - ADMIN only
- `PATCH /admin/users/:userId/activate` - ADMIN only
- `GET /logs` - ADMIN only
- `GET /logs/user/:userId` - ADMIN only
- `GET /logs/action/:action` - ADMIN only

#### Access Control Flow

1. Request arrives at protected endpoint
2. JwtAuthGuard validates JWT token
3. RolesGuard checks user role
4. If role matches, request proceeds
5. If role doesn't match, ForbiddenException is thrown

### 4. Login Improvements

#### Enhanced Login Validation

The login endpoint now includes:

1. **User Existence Check** - Verifies user exists in database
2. **Password Validation** - Uses bcrypt to verify password
3. **Account Status Check** - Ensures account is active
4. **Comprehensive Logging** - Logs all login attempts

#### Login Error Handling

**Failed Login Scenarios:**

1. **User Not Found**
   - Error: "Invalid credentials"
   - Logged as: "Failed login attempt: user not found"

2. **Invalid Password**
   - Error: "Invalid credentials"
   - Logged as: "Failed login attempt: invalid password"

3. **Account Deactivated**
   - Error: "Account is deactivated"
   - Logged as: "Failed login attempt: account deactivated"

4. **Successful Login**
   - Returns JWT token and user info
   - Logged as: "User logged in: {email}"

#### Login Response

**Endpoint:** `POST /auth/login`

**Request:**
```json
{
  "email": "doctor@hospital.com",
  "password": "password123"
}
```

**Success Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "doctor@hospital.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "DOCTOR"
  }
}
```

## Implementation Details

### Files Created/Modified

#### New Files
- `src/admin/admin.service.ts` - Admin business logic
- `src/admin/admin.controller.ts` - Admin API endpoints
- `src/admin/admin.module.ts` - Admin module configuration
- `src/logs/logs.service.ts` - Logging service
- `src/logs/logs.controller.ts` - Logs API endpoints
- `src/logs/logs.module.ts` - Logs module configuration
- `src/database/entities/log.entity.ts` - Log database entity
- `src/auth/guards/roles.guard.ts` - Role-based access guard
- `src/auth/decorators/roles.decorator.ts` - Roles decorator

#### Modified Files
- `src/auth/auth.service.ts` - Added login logging
- `src/app.module.ts` - Imported new modules

### Database Schema

#### Log Table
```sql
CREATE TABLE logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR NOT NULL,
  description TEXT,
  details TEXT,
  userId UUID REFERENCES users(id),
  ipAddress VARCHAR,
  userAgent TEXT,
  stackTrace TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### User Table (Updated)
```sql
ALTER TABLE users ADD COLUMN isActive BOOLEAN DEFAULT true;
```

### Module Dependencies

```
AdminModule
├── TypeOrmModule (User entity)
└── LogsModule
    ├── TypeOrmModule (Log entity)
    └── LogsService

LogsModule
├── TypeOrmModule (Log entity)
└── LogsService

AuthModule
├── JwtModule
├── TypeOrmModule (User entity)
├── LogsService
├── RolesGuard
└── RolesDecorator
```

## Testing Guide

### 1. Test Admin User Invitation

```bash
# Invite a doctor
curl -X POST http://localhost:3000/admin/invite-user \
  -H "Authorization: Bearer {ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newdoctor@hospital.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "phone": "+254712345678",
    "role": "DOCTOR"
  }'
```

### 2. Test User Management

```bash
# Get all users
curl -X GET http://localhost:3000/admin/users \
  -H "Authorization: Bearer {ADMIN_TOKEN}"

# Update user
curl -X PATCH http://localhost:3000/admin/users/{USER_ID} \
  -H "Authorization: Bearer {ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated Name"
  }'

# Deactivate user
curl -X PATCH http://localhost:3000/admin/users/{USER_ID}/deactivate \
  -H "Authorization: Bearer {ADMIN_TOKEN}"

# Activate user
curl -X PATCH http://localhost:3000/admin/users/{USER_ID}/activate \
  -H "Authorization: Bearer {ADMIN_TOKEN}"
```

### 3. Test Logging

```bash
# Get all logs
curl -X GET http://localhost:3000/logs \
  -H "Authorization: Bearer {ADMIN_TOKEN}"

# Get logs by action
curl -X GET http://localhost:3000/logs/action/LOGIN \
  -H "Authorization: Bearer {ADMIN_TOKEN}"

# Get logs by user
curl -X GET http://localhost:3000/logs/user/{USER_ID} \
  -H "Authorization: Bearer {ADMIN_TOKEN}"
```

### 4. Test Login with Logging

```bash
# Successful login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@hospital.com",
    "password": "password123"
  }'

# Failed login (wrong password)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@hospital.com",
    "password": "wrongpassword"
  }'

# Failed login (deactivated account)
# First deactivate the user, then try to login
```

### 5. Test Role-Based Access Control

```bash
# Try to access admin endpoint with non-admin token
curl -X GET http://localhost:3000/admin/users \
  -H "Authorization: Bearer {NON_ADMIN_TOKEN}"

# Expected response: 403 Forbidden
# "This action requires one of the following roles: ADMIN"
```

## Security Considerations

### 1. Password Security
- Passwords are hashed using bcrypt with salt rounds of 10
- Temporary passwords are generated with 12 characters including special characters
- Passwords are never logged or exposed in responses

### 2. Access Control
- All admin endpoints require valid JWT token
- Role-based access control enforced at guard level
- Unauthorized access attempts are logged

### 3. Audit Trail
- All admin actions are logged with user ID and timestamp
- Failed login attempts are logged with reason
- Logs include IP address and user agent for forensics

### 4. Account Status
- Deactivated accounts cannot login
- Account status is checked during login
- Deactivation is reversible

## Error Handling

### Common Errors

**401 Unauthorized**
- Missing or invalid JWT token
- Token has expired

**403 Forbidden**
- User role doesn't have permission
- Trying to access admin endpoint as non-admin

**404 Not Found**
- User not found
- Invalid user ID

**409 Conflict**
- Email already exists
- Duplicate user creation attempt

**400 Bad Request**
- Invalid role for invitation
- Missing required fields
- Invalid data format

## Performance Considerations

### Pagination
- Logs endpoint supports pagination (default 50 items per page)
- Users endpoint supports pagination (default 10 items per page)
- Reduces memory usage and improves response time

### Indexing
- Logs table should be indexed on:
  - `action` - For filtering by action type
  - `userId` - For filtering by user
  - `createdAt` - For sorting and time-based queries

### Cleanup
- Old logs can be deleted using `LogsService.deleteOldLogs(daysOld)`
- Recommended: Run cleanup job weekly to remove logs older than 30 days

## Future Enhancements

1. **Email Notifications** - Send email when user is invited
2. **Two-Factor Authentication** - Add 2FA for admin accounts
3. **Audit Reports** - Generate audit reports for compliance
4. **Log Retention Policy** - Automatic log cleanup based on retention rules
5. **Admin Dashboard** - Visual dashboard for system monitoring
6. **User Permissions** - Fine-grained permission system
7. **Activity Alerts** - Real-time alerts for suspicious activities
8. **Export Logs** - Export logs to CSV/PDF for reporting

## Troubleshooting

### Issue: "User not found" error when inviting
**Solution:** Ensure email is unique and properly formatted

### Issue: "Only DOCTOR, NURSE, RECEPTIONIST can be invited"
**Solution:** Cannot invite ADMIN or PATIENT roles. Use appropriate role.

### Issue: "This action requires one of the following roles: ADMIN"
**Solution:** Only ADMIN users can access admin endpoints. Login with admin account.

### Issue: Logs not appearing
**Solution:** Ensure LogsModule is imported in AppModule and database is running

### Issue: "Account is deactivated" error
**Solution:** Admin needs to activate the account using `/admin/users/:userId/activate`

## Support

For issues or questions about admin features, refer to:
- `ADMIN_SETUP_GUIDE.md` - Testing scenarios and examples
- `API_DOCUMENTATION.md` - Complete API reference
- `ADMIN_MODULE_SUMMARY.md` - Module architecture overview

---

**Last Updated:** March 16, 2026
**Status:** ✅ Complete and Ready for Testing
