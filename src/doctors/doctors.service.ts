import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from '../database/entities/doctor.entity';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
  ) {}

  async create(createDoctorDto: CreateDoctorDto) {
    const doctor = this.doctorRepository.create(createDoctorDto);
    return this.doctorRepository.save(doctor);
  }

  async findAll(page: number = 1, limit: number = 10) {
    const [doctors, total] = await this.doctorRepository.findAndCount({
      relations: ['user'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: doctors,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const doctor = await this.doctorRepository.findOne({
      where: { id },
      relations: ['user', 'appointments'],
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }

    return doctor;
  }

  async findBySpecialization(specialization: string) {
    return this.doctorRepository.find({
      where: { specialization },
      relations: ['user'],
    });
  }

  async update(id: string, updateDoctorDto: UpdateDoctorDto) {
    const doctor = await this.findOne(id);
    Object.assign(doctor, updateDoctorDto);
    return this.doctorRepository.save(doctor);
  }

  async remove(id: string) {
    const doctor = await this.findOne(id);
    await this.doctorRepository.remove(doctor);
    return { message: 'Doctor deleted successfully' };
  }

  async checkAvailability(id: string, date: string, time: string) {
    const doctor = await this.findOne(id);
    
    // Check if time is within doctor's available hours
    const appointmentTime = new Date(`2000-01-01 ${time}`);
    const availableFrom = new Date(`2000-01-01 ${doctor.availableFrom}`);
    const availableTo = new Date(`2000-01-01 ${doctor.availableTo}`);

    if (appointmentTime < availableFrom || appointmentTime > availableTo) {
      return { available: false, reason: 'Outside available hours' };
    }

    // Check if doctor has appointments at this time
    const existingAppointment = await this.doctorRepository
      .createQueryBuilder('doctor')
      .leftJoinAndSelect('doctor.appointments', 'appointment')
      .where('doctor.id = :id', { id })
      .andWhere('appointment.appointmentDate = :date', { date })
      .andWhere('appointment.appointmentTime = :time', { time })
      .andWhere('appointment.status != :status', { status: 'CANCELLED' })
      .getOne();

    if (existingAppointment && existingAppointment.appointments.length > 0) {
      return { available: false, reason: 'Time slot already booked' };
    }

    return { available: true };
  }
}
