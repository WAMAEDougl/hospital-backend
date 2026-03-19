# Admin Features - Quick Start Guide

## 🚀 Quick Reference

### Base URL
```
http://localhost:3000
```

### Authentication
All admin endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer {JWT_TOKEN}
```

---

## 📝 Common Tasks

### 1. Get Admin Token (Login as Admin)

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hospital.com",
    "password": "admin123"
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

Save the `accessToken` for use in other requests.

---

### 2. Invite a Doctor

```bash
curl -X POST http://localhost:3000/admin/invite-user \
  -H "Authorization: Bearer {ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@hospital.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+254712345678",
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
    "lastName": "Doe",
    "role": "DOCTOR",
    "isActive": true
  },
  "temporaryPassword": "Abc123!@#$%^"
}
```

---

### 3. Invite a Nurse

```bash
curl -X POST http://localhost:3000/admin/invite-user \
  -H "Authorization: Bearer {ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nurse@hospital.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "phone": "+254712345679",
    "role": "NURSE"
  }'
```

---

### 4. Invite a Receptionist

```bash
curl -X POST http://localhost:3000/admin/invite-user \
  -H "Authorization: Bearer {ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "receptionist@hospital.com",
    "firstName": "Mary",
    "lastName": "Johnson",
    "phone": "+254712345680",
    "role": "RECEPTIONIST"
  }'
```

---

### 5. Get All Users

```bash
curl -X GET "http://localhost:3000/admin/users?page=1&limit=10" \
  -H "Authorization: Bearer {ADMIN_TOKEN}"
```

---

### 6. Update User Information

```bash
curl -X PATCH http://localhost:3000/admin/users/{USER_ID} \
  -H "Authorization: Bearer {ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated Name",
    "phone": "+254712345681"
  }'
```

---

### 7. Deactivate User

```bash
curl -X PATCH http://localhost:3000/admin/users/{USER_ID}/deactivate \
  -H "Authorization: Bearer {ADMIN_TOKEN}"
```

**Effect:** User cannot login anymore

---

### 8. Activate User

```bash
curl -X PATCH http://localhost:3000/admin/users/{USER_ID}/activate \
  -H "Authorization: Bearer {ADMIN_TOKEN}"
```

**Effect:** User can login again

---

### 9. Delete User

```bash
curl -X DELETE http://localhost:3000/admin/users/{USER_ID} \
  -H "Authorization: Bearer {ADMIN_TOKEN}"
```

---

### 10. View All Logs

```bash
curl -X GET "http://localhost:3000/logs?page=1&limit=50" \
  -H "Authorization: Bearer {ADMIN_TOKEN}"
```

---

### 11. View Login Logs

```bash
curl -X GET "http://localhost:3000/logs/action/LOGIN?page=1&limit=50" \
  -H "Authorization: Bearer {ADMIN_TOKEN}"
```

---

### 12. View User-Specific Logs

```bash
curl -X GET "http://localhost:3000/logs/user/{USER_ID}?page=1&limit=50" \
  -H "Authorization: Bearer {ADMIN_TOKEN}"
```

---

### 13. Test Failed Login (Wrong Password)

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@hospital.com",
    "password": "wrongpassword"
  }'
```

**Response:**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials"
}
```

**Check logs to see it was logged as failed attempt**

---

### 14. Test Deactivated Account Login

```bash
# First deactivate the user
curl -X PATCH http://localhost:3000/admin/users/{USER_ID}/deactivate \
  -H "Authorization: Bearer {ADMIN_TOKEN}"

# Then try to login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@hospital.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "statusCode": 401,
  "message": "Account is deactivated"
}
```

---

### 15. Test Unauthorized Access (Non-Admin)

```bash
# Login as non-admin user
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@hospital.com",
    "password": "password123"
  }'

# Try to access admin endpoint with non-admin token
curl -X GET http://localhost:3000/admin/users \
  -H "Authorization: Bearer {NON_ADMIN_TOKEN}"
```

**Response:**
```json
{
  "statusCode": 403,
  "message": "This action requires one of the following roles: ADMIN"
}
```

---

## 🔑 Key Points

### Allowed Roles for Invitation
- ✅ DOCTOR
- ✅ NURSE
- ✅ RECEPTIONIST
- ❌ ADMIN (cannot invite)
- ❌ PATIENT (cannot invite)

### Admin-Only Endpoints
- `POST /admin/invite-user`
- `POST /admin/create-user`
- `GET /admin/users`
- `PATCH /admin/users/:userId`
- `DELETE /admin/users/:userId`
- `PATCH /admin/users/:userId/deactivate`
- `PATCH /admin/users/:userId/activate`
- `GET /logs`
- `GET /logs/user/:userId`
- `GET /logs/action/:action`

### Logged Actions
- LOGIN - Successful login
- ERROR - Failed login attempts
- CREATE_USER - User created by admin
- UPDATE_USER - User updated or deactivated/activated
- DELETE_USER - User deleted
- INVITE_USER - User invited
- APPOINTMENT_CREATED - Appointment created
- APPOINTMENT_UPDATED - Appointment updated
- APPOINTMENT_CANCELLED - Appointment cancelled
- BILLING_CREATED - Billing created
- BILLING_UPDATED - Billing updated

---

## 🐛 Troubleshooting

### "Invalid credentials" on login
- Check email is correct
- Check password is correct
- Verify user exists in database

### "Account is deactivated"
- Admin needs to activate the account
- Use `/admin/users/:userId/activate` endpoint

### "This action requires one of the following roles: ADMIN"
- You're not logged in as admin
- Login with admin account first
- Use admin token in Authorization header

### "User with this email already exists"
- Email is already in use
- Use different email address

### "Only DOCTOR, NURSE, RECEPTIONIST can be invited"
- Cannot invite ADMIN or PATIENT roles
- Use one of the allowed roles

### No logs appearing
- Ensure you're logged in as admin
- Check database is running
- Verify LogsModule is imported

---

## 📊 Testing Workflow

1. **Login as Admin**
   - Get admin token
   - Save for use in other requests

2. **Create Users**
   - Invite doctor
   - Invite nurse
   - Invite receptionist

3. **Test User Management**
   - Get all users
   - Update user info
   - Deactivate user
   - Activate user

4. **Test Login**
   - Login with new user
   - Check logs for login entry
   - Try wrong password
   - Check logs for failed attempt

5. **Test Access Control**
   - Try admin endpoint with non-admin token
   - Verify 403 error

6. **View Logs**
   - Get all logs
   - Filter by action
   - Filter by user

---

## 💡 Tips

### Using Postman
1. Create new request
2. Set method to POST/GET/PATCH/DELETE
3. Enter URL
4. Go to Headers tab
5. Add header: `Authorization: Bearer {TOKEN}`
6. Add header: `Content-Type: application/json`
7. Go to Body tab (for POST/PATCH)
8. Select "raw" and "JSON"
9. Paste request body
10. Click Send

### Saving Tokens
```bash
# Save token to variable
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Use in curl
curl -X GET http://localhost:3000/admin/users \
  -H "Authorization: Bearer $TOKEN"
```

### Formatting JSON
```bash
# Pretty print response
curl -X GET http://localhost:3000/admin/users \
  -H "Authorization: Bearer {TOKEN}" | jq .
```

---

## 📚 More Information

For detailed information, see:
- `ADMIN_FEATURES_COMPLETE.md` - Complete feature guide
- `ADMIN_SETUP_GUIDE.md` - Detailed testing scenarios
- `API_DOCUMENTATION.md` - Full API reference
- `ADMIN_IMPLEMENTATION_VERIFICATION.md` - Implementation details

---

**Last Updated:** March 16, 2026  
**Status:** ✅ Ready for Testing
