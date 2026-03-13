import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface AppointmentConfirmationData {
  patientName: string;
  patientEmail: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
  hospitalName: string;
  hospitalPhone: string;
  hospitalEmail: string;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // Using environment variables for email configuration
    const emailUser = process.env.EMAIL_USER || 'noreply@hospital.com';
    const emailPassword = process.env.EMAIL_PASSWORD || 'password';
    const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const emailPort = parseInt(process.env.EMAIL_PORT || '587', 10);

    this.transporter = nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailPort === 465, // true for 465, false for other ports
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@hospital.com',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || '',
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to ${options.to}. Message ID: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      return false;
    }
  }

  async sendAppointmentConfirmation(data: AppointmentConfirmationData): Promise<boolean> {
    const html = this.generateAppointmentConfirmationHTML(data);
    const text = this.generateAppointmentConfirmationText(data);

    return this.sendEmail({
      to: data.patientEmail,
      subject: `Appointment Confirmation - ${data.hospitalName}`,
      html,
      text,
    });
  }

  async sendAppointmentReminder(data: AppointmentConfirmationData): Promise<boolean> {
    const html = this.generateAppointmentReminderHTML(data);
    const text = this.generateAppointmentReminderText(data);

    return this.sendEmail({
      to: data.patientEmail,
      subject: `Appointment Reminder - ${data.hospitalName}`,
      html,
      text,
    });
  }

  async sendAppointmentCancellation(data: AppointmentConfirmationData): Promise<boolean> {
    const html = this.generateAppointmentCancellationHTML(data);
    const text = this.generateAppointmentCancellationText(data);

    return this.sendEmail({
      to: data.patientEmail,
      subject: `Appointment Cancelled - ${data.hospitalName}`,
      html,
      text,
    });
  }

  async sendAppointmentReschedule(
    data: AppointmentConfirmationData,
    oldDate: string,
    oldTime: string,
  ): Promise<boolean> {
    const html = this.generateAppointmentRescheduleHTML(data, oldDate, oldTime);
    const text = this.generateAppointmentRescheduleText(data, oldDate, oldTime);

    return this.sendEmail({
      to: data.patientEmail,
      subject: `Appointment Rescheduled - ${data.hospitalName}`,
      html,
      text,
    });
  }

  private generateAppointmentConfirmationHTML(data: AppointmentConfirmationData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
            .appointment-details { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 15px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: bold; color: #667eea; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
            .button { display: inline-block; background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Appointment Confirmation</h1>
              <p>Your appointment has been successfully booked</p>
            </div>
            <div class="content">
              <p>Dear ${data.patientName},</p>
              <p>Thank you for booking an appointment with us. Your appointment details are as follows:</p>
              
              <div class="appointment-details">
                <div class="detail-row">
                  <span class="detail-label">Doctor:</span>
                  <span>${data.doctorName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Date:</span>
                  <span>${data.appointmentDate}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Time:</span>
                  <span>${data.appointmentTime}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Reason:</span>
                  <span>${data.reason}</span>
                </div>
              </div>

              <p><strong>Important:</strong> Please arrive 10-15 minutes before your appointment time.</p>
              
              <p>If you need to reschedule or cancel your appointment, please contact us at:</p>
              <p>
                <strong>${data.hospitalName}</strong><br>
                Phone: ${data.hospitalPhone}<br>
                Email: ${data.hospitalEmail}
              </p>

              <div class="footer">
                <p>This is an automated email. Please do not reply to this email.</p>
                <p>&copy; ${new Date().getFullYear()} ${data.hospitalName}. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateAppointmentConfirmationText(data: AppointmentConfirmationData): string {
    return `
Appointment Confirmation

Dear ${data.patientName},

Thank you for booking an appointment with us. Your appointment details are as follows:

Doctor: ${data.doctorName}
Date: ${data.appointmentDate}
Time: ${data.appointmentTime}
Reason: ${data.reason}

IMPORTANT: Please arrive 10-15 minutes before your appointment time.

If you need to reschedule or cancel your appointment, please contact us at:
${data.hospitalName}
Phone: ${data.hospitalPhone}
Email: ${data.hospitalEmail}

This is an automated email. Please do not reply to this email.
© ${new Date().getFullYear()} ${data.hospitalName}. All rights reserved.
    `;
  }

  private generateAppointmentReminderHTML(data: AppointmentConfirmationData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
            .appointment-details { background: white; padding: 15px; border-left: 4px solid #f5576c; margin: 15px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: bold; color: #f5576c; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Appointment Reminder</h1>
              <p>Your appointment is coming up soon</p>
            </div>
            <div class="content">
              <p>Dear ${data.patientName},</p>
              <p>This is a friendly reminder about your upcoming appointment:</p>
              
              <div class="appointment-details">
                <div class="detail-row">
                  <span class="detail-label">Doctor:</span>
                  <span>${data.doctorName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Date:</span>
                  <span>${data.appointmentDate}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Time:</span>
                  <span>${data.appointmentTime}</span>
                </div>
              </div>

              <p>Please arrive 10-15 minutes early. If you cannot make it, please let us know as soon as possible.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateAppointmentReminderText(data: AppointmentConfirmationData): string {
    return `
Appointment Reminder

Dear ${data.patientName},

This is a friendly reminder about your upcoming appointment:

Doctor: ${data.doctorName}
Date: ${data.appointmentDate}
Time: ${data.appointmentTime}

Please arrive 10-15 minutes early. If you cannot make it, please let us know as soon as possible.
    `;
  }

  private generateAppointmentCancellationHTML(data: AppointmentConfirmationData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
            .appointment-details { background: white; padding: 15px; border-left: 4px solid #fa709a; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Appointment Cancelled</h1>
              <p>Your appointment has been cancelled</p>
            </div>
            <div class="content">
              <p>Dear ${data.patientName},</p>
              <p>Your appointment with ${data.doctorName} on ${data.appointmentDate} at ${data.appointmentTime} has been cancelled.</p>
              
              <p>If you would like to reschedule, please contact us at:</p>
              <p>
                <strong>${data.hospitalName}</strong><br>
                Phone: ${data.hospitalPhone}<br>
                Email: ${data.hospitalEmail}
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateAppointmentCancellationText(data: AppointmentConfirmationData): string {
    return `
Appointment Cancelled

Dear ${data.patientName},

Your appointment with ${data.doctorName} on ${data.appointmentDate} at ${data.appointmentTime} has been cancelled.

If you would like to reschedule, please contact us at:
${data.hospitalName}
Phone: ${data.hospitalPhone}
Email: ${data.hospitalEmail}
    `;
  }

  private generateAppointmentRescheduleHTML(
    data: AppointmentConfirmationData,
    oldDate: string,
    oldTime: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
            .appointment-details { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 15px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: bold; color: #667eea; }
            .old-appointment { background: #fff3cd; padding: 10px; border-radius: 5px; margin: 10px 0; }
            .new-appointment { background: #d4edda; padding: 10px; border-radius: 5px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Appointment Rescheduled</h1>
              <p>Your appointment has been rescheduled</p>
            </div>
            <div class="content">
              <p>Dear ${data.patientName},</p>
              <p>Your appointment has been successfully rescheduled. Here are the details:</p>
              
              <div class="old-appointment">
                <strong>Previous Appointment:</strong>
                <p>Date: ${oldDate}<br>Time: ${oldTime}</p>
              </div>

              <div class="new-appointment">
                <strong>New Appointment:</strong>
                <div class="appointment-details">
                  <div class="detail-row">
                    <span class="detail-label">Doctor:</span>
                    <span>${data.doctorName}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span>${data.appointmentDate}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Time:</span>
                    <span>${data.appointmentTime}</span>
                  </div>
                </div>
              </div>

              <p>Please arrive 10-15 minutes before your new appointment time.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateAppointmentRescheduleText(
    data: AppointmentConfirmationData,
    oldDate: string,
    oldTime: string,
  ): string {
    return `
Appointment Rescheduled

Dear ${data.patientName},

Your appointment has been successfully rescheduled. Here are the details:

Previous Appointment:
Date: ${oldDate}
Time: ${oldTime}

New Appointment:
Doctor: ${data.doctorName}
Date: ${data.appointmentDate}
Time: ${data.appointmentTime}

Please arrive 10-15 minutes before your new appointment time.
    `;
  }
}
