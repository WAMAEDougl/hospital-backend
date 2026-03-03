import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from '../database/entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
  ) {}

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
