import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Patient } from '../database/entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
  ) {}

  async create(createPatientDto: CreatePatientDto) {
    const patient = this.patientRepository.create(createPatientDto);
    return this.patientRepository.save(patient);
  }

  async findAll(page: number = 1, limit: number = 10) {
    const [patients, total] = await this.patientRepository.findAndCount({
      relations: ['user'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: patients,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const patient = await this.patientRepository.findOne({
      where: { id },
      relations: ['user', 'appointments', 'billings'],
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    return patient;
  }

  async findByUserId(userId: string) {
    const patient = await this.patientRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!patient) {
      throw new NotFoundException(`Patient with user ID ${userId} not found`);
    }

    return patient;
  }

  async update(id: string, updatePatientDto: UpdatePatientDto) {
    const patient = await this.findOne(id);
    Object.assign(patient, updatePatientDto);
    return this.patientRepository.save(patient);
  }

  async remove(id: string) {
    const patient = await this.findOne(id);
    await this.patientRepository.remove(patient);
    return { message: 'Patient deleted successfully' };
  }

  async search(query: string) {
    return this.patientRepository.find({
      where: [
        { user: { firstName: Like(`%${query}%`) } },
        { user: { lastName: Like(`%${query}%`) } },
        { user: { email: Like(`%${query}%`) } },
        { user: { phone: Like(`%${query}%`) } },
      ],
      relations: ['user'],
      take: 20,
    });
  }
}
