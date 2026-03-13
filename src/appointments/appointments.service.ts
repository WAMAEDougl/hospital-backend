import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Appointment } from '../database/entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
    private emailService: EmailService,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    const appointment = this.appointmentsRepository.create(createAppointmentDto);
    const savedAppointment = await this.appointmentsRepository.save(appointment);

    // Send confirmation email
    await this.sendConfirmationEmail(savedAppointment);

    return savedAppointment;
  }

  private async sendConfirmationEmail(appointment: Appointment): Promise<void> {
    try {
      // Load relations if not already loaded
      const fullAppointment = await this.appointmentsRepository.findOne({
        where: { id: appointment.id },
        relations: ['patient', 'doctor'],
      });

      if (fullAppointment && fullAppointment.patient && fullAppointment.doctor) {
        await this.emailService.sendAppointmentConfirmation({
          patientName: fullAppointment.patient.name,
          patientEmail: fullAppointment.patient.email,
          doctorName: fullAppointment.doctor.name,
          appointmentDate: fullAppointment.appointmentDate,
          appointmentTime: fullAppointment.appointmentTime,
          reason: fullAppointment.reason,
          hospitalName: process.env.HOSPITAL_NAME || 'juja-hub Hospital',
          hospitalPhone: process.env.HOSPITAL_PHONE || '+254746960010',
          hospitalEmail: process.env.HOSPITAL_EMAIL || 'juja-hub@gmail.com',
        });
      }
    } catch (error) {
      console.error('Failed to send appointment confirmation email:', error);
      // Don't throw error - appointment was created successfully
    }
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: Appointment[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.appointmentsRepository.findAndCount({
      relations: ['patient', 'doctor'],
      skip: (page - 1) * limit,
      take: limit,
      order: { appointmentDate: 'DESC', appointmentTime: 'DESC' },
    });

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor', 'billing'],
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    return appointment;
  }

  async findByPatient(patientId: string, page: number = 1, limit: number = 10) {
    const [data, total] = await this.appointmentsRepository.findAndCount({
      where: { patientId },
      relations: ['doctor'],
      skip: (page - 1) * limit,
      take: limit,
      order: { appointmentDate: 'DESC', appointmentTime: 'DESC' },
    });

    return { data, total, page, limit };
  }

  async findByDoctor(doctorId: string, page: number = 1, limit: number = 10) {
    const [data, total] = await this.appointmentsRepository.findAndCount({
      where: { doctorId },
      relations: ['patient'],
      skip: (page - 1) * limit,
      take: limit,
      order: { appointmentDate: 'DESC', appointmentTime: 'DESC' },
    });

    return { data, total, page, limit };
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto): Promise<Appointment> {
    const appointment = await this.findOne(id);
    const oldStatus = appointment.status;
    const oldAppointmentDate = appointment.appointmentDate;
    const oldAppointmentTime = appointment.appointmentTime;

    Object.assign(appointment, updateAppointmentDto);
    const updatedAppointment = await this.appointmentsRepository.save(appointment);

    // Send appropriate email based on status change
    await this.handleAppointmentStatusChange(
      updatedAppointment,
      oldStatus,
      oldAppointmentDate,
      oldAppointmentTime,
    );

    return updatedAppointment;
  }

  private async handleAppointmentStatusChange(
    appointment: Appointment,
    oldStatus: string,
    oldAppointmentDate: string,
    oldAppointmentTime: string,
  ): Promise<void> {
    try {
      const fullAppointment = await this.appointmentsRepository.findOne({
        where: { id: appointment.id },
        relations: ['patient', 'doctor'],
      });

      if (!fullAppointment || !fullAppointment.patient || !fullAppointment.doctor) {
        return;
      }

      const emailData = {
        patientName: fullAppointment.patient.name,
        patientEmail: fullAppointment.patient.email,
        doctorName: fullAppointment.doctor.name,
        appointmentDate: fullAppointment.appointmentDate,
        appointmentTime: fullAppointment.appointmentTime,
        reason: fullAppointment.reason,
        hospitalName: process.env.HOSPITAL_NAME || 'juja-hub Hospital',
        hospitalPhone: process.env.HOSPITAL_PHONE || '+254746960010',
        hospitalEmail: process.env.HOSPITAL_EMAIL || 'juja-hub@gmail.com',
      };

      // Handle cancellation
      if (appointment.status === 'cancelled' && oldStatus !== 'cancelled') {
        await this.emailService.sendAppointmentCancellation(emailData);
      }
      // Handle reschedule
      else if (
        (oldAppointmentDate !== fullAppointment.appointmentDate ||
          oldAppointmentTime !== fullAppointment.appointmentTime) &&
        appointment.status !== 'cancelled'
      ) {
        await this.emailService.sendAppointmentReschedule({
          ...emailData,
          oldAppointmentDate,
          oldAppointmentTime,
        });
      }
    } catch (error) {
      console.error('Failed to send appointment status change email:', error);
      // Don't throw error - appointment was updated successfully
    }
  }

  // Scheduled task to send appointment reminders 24 hours before appointment
  @Cron(CronExpression.EVERY_HOUR)
  async sendAppointmentReminders(): Promise<void> {
    try {
      // Calculate date range for appointments in the next 24-25 hours
      const now = new Date();
      const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const in25Hours = new Date(now.getTime() + 25 * 60 * 60 * 1000);

      const upcomingAppointments = await this.appointmentsRepository.find({
        where: {
          appointmentDate: MoreThan(in24Hours.toISOString().split('T')[0]),
          appointmentDate: LessThan(in25Hours.toISOString().split('T')[0]),
          status: 'scheduled',
        },
        relations: ['patient', 'doctor'],
      });

      for (const appointment of upcomingAppointments) {
        if (appointment.patient && appointment.doctor) {
          try {
            await this.emailService.sendAppointmentReminder({
              patientName: appointment.patient.name,
              patientEmail: appointment.patient.email,
              doctorName: appointment.doctor.name,
              appointmentDate: appointment.appointmentDate,
              appointmentTime: appointment.appointmentTime,
              reason: appointment.reason,
              hospitalName: process.env.HOSPITAL_NAME || 'juja-hub Hospital',
              hospitalPhone: process.env.HOSPITAL_PHONE || '+254746960010',
              hospitalEmail: process.env.HOSPITAL_EMAIL || 'juja-hub@gmail.com',
            });
          } catch (error) {
            console.error(
              `Failed to send reminder for appointment ${appointment.id}:`,
              error,
            );
          }
        }
      }
    } catch (error) {
      console.error('Error in sendAppointmentReminders task:', error);
    }
  }

  async remove(id: string): Promise<void> {
    const appointment = await this.findOne(id);
    await this.appointmentsRepository.remove(appointment);
  }
}
