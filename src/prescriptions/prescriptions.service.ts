import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prescription } from '../database/entities/prescription.entity';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';

@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectRepository(Prescription)
    private prescriptionRepository: Repository<Prescription>,
  ) {}

  async create(createPrescriptionDto: CreatePrescriptionDto): Promise<Prescription> {
    const prescription = this.prescriptionRepository.create(createPrescriptionDto);
    return await this.prescriptionRepository.save(prescription);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: Prescription[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.prescriptionRepository.findAndCount({
      relations: ['patient', 'doctor', 'appointment'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Prescription> {
    const prescription = await this.prescriptionRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor', 'appointment'],
    });

    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }

    return prescription;
  }

  async findByPatient(patientId: string, page: number = 1, limit: number = 10) {
    const [data, total] = await this.prescriptionRepository.findAndCount({
      where: { patientId },
      relations: ['doctor', 'appointment'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  async findByDoctor(doctorId: string, page: number = 1, limit: number = 10) {
    const [data, total] = await this.prescriptionRepository.findAndCount({
      where: { doctorId },
      relations: ['patient', 'appointment'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  async update(id: string, updatePrescriptionDto: UpdatePrescriptionDto): Promise<Prescription> {
    const prescription = await this.findOne(id);
    Object.assign(prescription, updatePrescriptionDto);
    return await this.prescriptionRepository.save(prescription);
  }

  async markAsDispensed(id: string): Promise<Prescription> {
    const prescription = await this.findOne(id);
    prescription.dispensed = true;
    prescription.dispensedAt = new Date();
    return await this.prescriptionRepository.save(prescription);
  }

  async remove(id: string): Promise<void> {
    const prescription = await this.findOne(id);
    await this.prescriptionRepository.remove(prescription);
  }
}
