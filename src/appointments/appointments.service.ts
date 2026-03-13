import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    const appointment = this.appointmentsRepository.create(createAppointmentDto);
    return await this.appointmentsRepository.save(appointment);
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
    Object.assign(appointment, updateAppointmentDto);
    return await this.appointmentsRepository.save(appointment);
  }

  async remove(id: string): Promise<void> {
    const appointment = await this.findOne(id);
    await this.appointmentsRepository.remove(appointment);
  }
}
