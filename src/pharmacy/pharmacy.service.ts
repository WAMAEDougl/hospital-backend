import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Medicine } from '../database/entities/medicine.entity';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';

@Injectable()
export class PharmacyService {
  constructor(
    @InjectRepository(Medicine)
    private medicineRepository: Repository<Medicine>,
  ) {}

  async create(createMedicineDto: CreateMedicineDto): Promise<Medicine> {
    const medicine = this.medicineRepository.create(createMedicineDto);
    return await this.medicineRepository.save(medicine);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: Medicine[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.medicineRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { name: 'ASC' },
    });

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Medicine> {
    const medicine = await this.medicineRepository.findOne({ where: { id } });

    if (!medicine) {
      throw new NotFoundException(`Medicine with ID ${id} not found`);
    }

    return medicine;
  }

  async search(query: string, page: number = 1, limit: number = 10) {
    const [data, total] = await this.medicineRepository.findAndCount({
      where: [
        { name: Like(`%${query}%`) },
        { category: Like(`%${query}%`) },
        { manufacturer: Like(`%${query}%`) },
      ],
      skip: (page - 1) * limit,
      take: limit,
      order: { name: 'ASC' },
    });

    return { data, total, page, limit };
  }

  async findByCategory(category: string, page: number = 1, limit: number = 10) {
    const [data, total] = await this.medicineRepository.findAndCount({
      where: { category },
      skip: (page - 1) * limit,
      take: limit,
      order: { name: 'ASC' },
    });

    return { data, total, page, limit };
  }

  async findLowStock(threshold: number = 10, page: number = 1, limit: number = 10) {
    const [data, total] = await this.medicineRepository
      .createQueryBuilder('medicine')
      .where('medicine.stock <= :threshold', { threshold })
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('medicine.stock', 'ASC')
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async update(id: string, updateMedicineDto: UpdateMedicineDto): Promise<Medicine> {
    const medicine = await this.findOne(id);
    Object.assign(medicine, updateMedicineDto);
    return await this.medicineRepository.save(medicine);
  }

  async updateStock(id: string, quantity: number): Promise<Medicine> {
    const medicine = await this.findOne(id);
    
    const newStock = medicine.stock + quantity;
    
    if (newStock < 0) {
      throw new BadRequestException('Insufficient stock');
    }

    medicine.stock = newStock;
    medicine.isAvailable = newStock > 0;
    
    return await this.medicineRepository.save(medicine);
  }

  async remove(id: string): Promise<void> {
    const medicine = await this.findOne(id);
    await this.medicineRepository.remove(medicine);
  }
}
