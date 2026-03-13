# Email API Documentation

## Overview

The Hospital Backend includes a comprehensive email service that automatically sends confirmation emails when patients book consultations. The email service supports multiple email templates for different appointment scenarios.

## Features

- ✅ Automatic appointment confirmation emails
- ✅ Appointment reminder emails (24 hours before)
- ✅ Appointment cancellation emails
- ✅ Appointment reschedule emails
- ✅ HTML and plain text email templates
- ✅ Professional email design with hospital branding
- ✅ Error handling and logging

## Email Service Architecture

### Email Module (`src/email/email.module.ts`)
- Provides the EmailService as a singleton
- Exported for use in other modules

### Email Service (`src/email/email.service.ts`)
- Handles all email operations
- Supports multiple email templates
- Uses Nodemailer for SMTP communication
- Includes error handling and logging

## Configuration

### Environment Variables

Add the following to your `.env` file:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@hospital.com

# Hospital Information
HOSPITAL_NAME=juja-hub Hospital
HOSPITAL_PHONE=+254746960010
HOSPITAL_EMAIL=juja-hub@gmail.com
```

### Gmail Setup (Recommended)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer" (or your device)
   - Copy the generated 16-character password
   - Use this as `EMAIL_PASSWORD` in your `.env` file

### Alternative Email Providers

You can use any SMTP provider by updating the configuration:

**SendGrid:**
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.your-sendgrid-api-key
```

**AWS SES:**
```env
EMAIL_HOST=email-smtp.region.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=your-ses-username
EMAIL_PASSWORD=your-ses-password
```

**Office 365:**
```env
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=your-email@company.com
EMAIL_PASSWORD=your-password
```

## API Endpoints

### Create Appointment (Automatic Email)

When a patient books an appointment via the API, an automatic confirmation email is sent.

**Endpoint:** `POST /api/appointments`

**Request Body:**
```json
{
  "patientId": "patient-uuid",
  "doctorId": "doctor-uuid",
  "appointmentDate": "2025-03-20",
  "appointmentTime": "14:30",
  "reason": "General Consultation"
}
```

**Response:**
```json
{
  "id": "appointment-uuid",
  "patientId": "patient-uuid",
  "doctorId": "doctor-uuid",
  "appointmentDate": "2025-03-20",
  "appointmentTime": "14:30",
  "reason": "General Consultation",
  "status": "pending",
  "createdAt": "2025-03-12T10:30:00Z"
}
```

**Email Sent:** Appointment Confirmation Email

---

## Email Templates

### 1. Appointment Confirmation Email

**Trigger:** When appointment is created

**Content:**
- Appointment details (doctor, date, time, reason)
- Instructions to arrive early
- Contact information for rescheduling
- Professional HTML design

**Example:**
```
Subject: Appointment Confirmation - juja-hub Hospital

Dear John Doe,

Thank you for booking an appointment with us. Your appointment details are as follows:

Doctor: Dr. Jane Smith
Date: March 20, 2025
Time: 2:30 PM
Reason: General Consultation

IMPORTANT: Please arrive 10-15 minutes before your appointment time.

If you need to reschedule or cancel your appointment, please contact us at:
juja-hub Hospital
Phone: +254746960010
Email: juja-hub@gmail.com
```

### 2. Appointment Reminder Email

**Trigger:** 24 hours before appointment (requires scheduled job)

**Content:**
- Appointment details
- Reminder to arrive early
- Contact information

### 3. Appointment Cancellation Email

**Trigger:** When appointment is cancelled

**Content:**
- Cancellation confirmation
- Option to reschedule
- Contact information

### 4. Appointment Reschedule Email

**Trigger:** When appointment is rescheduled

**Content:**
- Old appointment details
- New appointment details
- Confirmation message

---

## Integration with Appointments Module

The email service is automatically integrated with the Appointments module:

```typescript
// In appointments.service.ts
async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
  const appointment = this.appointmentsRepository.create(createAppointmentDto);
  const savedAppointment = await this.appointmentsRepository.save(appointment);

  // Automatically sends confirmation email
  await this.sendConfirmationEmail(savedAppointment);

  return savedAppointment;
}
```

---

## Usage Examples

### Frontend (React/TypeScript)

```typescript
import { appointmentsService } from '@/services/appointments.service';

// Create appointment - email is sent automatically
const handleBookAppointment = async () => {
  try {
    const appointment = await appointmentsService.create({
      patientId: 'patient-123',
      doctorId: 'doctor-456',
      date: '2025-03-20',
      time: '14:30',
      reason: 'General Consultation',
    });
    
    // Email is automatically sent to patient
    console.log('Appointment booked and confirmation email sent');
  } catch (error) {
    console.error('Failed to book appointment:', error);
  }
};
```

### Backend (NestJS)

```typescript
import { EmailService } from './email/email.service';

@Injectable()
export class AppointmentsService {
  constructor(
    private emailService: EmailService,
  ) {}

  async sendCustomEmail() {
    await this.emailService.sendAppointmentConfirmation({
      patientName: 'John Doe',
      patientEmail: 'john@example.com',
      doctorName: 'Dr. Jane Smith',
      appointmentDate: '2025-03-20',
      appointmentTime: '14:30',
      reason: 'General Consultation',
      hospitalName: 'juja-hub Hospital',
      hospitalPhone: '+254746960010',
      hospitalEmail: 'juja-hub@gmail.com',
    });
  }
}
```

---

## Error Handling

The email service includes comprehensive error handling:

```typescript
// Errors are logged but don't prevent appointment creation
try {
  await this.sendConfirmationEmail(appointment);
} catch (error) {
  console.error('Failed to send appointment confirmation email:', error);
  // Appointment is still created successfully
}
```

---

## Testing Email Functionality

### Using Mailtrap (Development)

1. Sign up at https://mailtrap.io
2. Create a new inbox
3. Update `.env`:
```env
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your-mailtrap-username
EMAIL_PASSWORD=your-mailtrap-password
```

### Using MailHog (Local Development)

1. Install MailHog: https://github.com/mailhog/MailHog
2. Run MailHog: `mailhog`
3. Update `.env`:
```env
EMAIL_HOST=localhost
EMAIL_PORT=1025
EMAIL_USER=test
EMAIL_PASSWORD=test
```
4. View emails at http://localhost:8025

---

## Scheduled Email Tasks (Future Enhancement)

To implement appointment reminders 24 hours before:

```typescript
import { Cron } from '@nestjs/schedule';

@Injectable()
export class AppointmentReminderService {
  constructor(
    private appointmentsService: AppointmentsService,
    private emailService: EmailService,
  ) {}

  @Cron('0 10 * * *') // Run daily at 10 AM
  async sendReminderEmails() {
    // Get appointments for tomorrow
    const tomorrowAppointments = await this.appointmentsService.findTomorrow();
    
    for (const appointment of tomorrowAppointments) {
      await this.emailService.sendAppointmentReminder({
        // ... appointment details
      });
    }
  }
}
```

---

## Troubleshooting

### Emails Not Sending

1. **Check environment variables:**
   ```bash
   echo $EMAIL_HOST
   echo $EMAIL_USER
   ```

2. **Verify SMTP credentials:**
   - Test with a simple SMTP client
   - Check email provider's security settings

3. **Check logs:**
   ```bash
   docker-compose logs backend
   ```

4. **Verify patient email:**
   - Ensure patient record has valid email address
   - Check for typos in email address

### Gmail Authentication Failed

1. Enable 2-Factor Authentication
2. Generate App Password (not regular password)
3. Use 16-character App Password in `.env`

### Port Already in Use

If port 587 is blocked:
- Try port 465 (SSL)
- Use alternative SMTP provider
- Check firewall settings

---

## Best Practices

1. **Always use environment variables** for sensitive data
2. **Test email configuration** before production deployment
3. **Monitor email delivery** rates and failures
4. **Use professional email templates** with hospital branding
5. **Include clear contact information** in all emails
6. **Handle errors gracefully** without blocking operations
7. **Log all email activities** for audit trails
8. **Implement rate limiting** to prevent spam

---

## Security Considerations

1. **Never commit credentials** to version control
2. **Use App Passwords** instead of main account password
3. **Enable 2FA** on email account
4. **Rotate credentials** regularly
5. **Monitor email logs** for suspicious activity
6. **Use SMTP over TLS** (port 587) or SSL (port 465)
7. **Validate email addresses** before sending
8. **Implement rate limiting** on email endpoints

---

## Support

For issues or questions:
- Check the logs: `docker-compose logs backend`
- Review email provider documentation
- Test with Mailtrap or MailHog
- Verify environment configuration

