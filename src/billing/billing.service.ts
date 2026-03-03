import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Billing, PaymentStatus } from '../database/entities/billing.entity';
import { CreateBillingDto } from './dto/create-billing.dto';
import { UpdateBillingDto } from './dto/update-billing.dto';
import { PaymentDto } from './dto/payment.dto';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(Billing)
    private billingRepository: Repository<Billing>,
  ) {}

  async create(createBillingDto: CreateBillingDto): Promise<Billing> {
    const billing = this.billingRepository.create(createBillingDto);
    return await this.billingRepository.save(billing);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: Billing[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.billingRepository.findAndCount({
      relations: ['patient', 'appointment'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Billing> {
    const billing = await this.billingRepository.findOne({
      where: { id },
      relations: ['patient', 'appointment'],
    });

    if (!billing) {
      throw new NotFoundException(`Billing record with ID ${id} not found`);
    }

    return billing;
  }

  async findByPatient(patientId: string, page: number = 1, limit: number = 10) {
    const [data, total] = await this.billingRepository.findAndCount({
      where: { patientId },
      relations: ['appointment'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  async findPending(page: number = 1, limit: number = 10) {
    const [data, total] = await this.billingRepository.findAndCount({
      where: { paymentStatus: PaymentStatus.PENDING },
      relations: ['patient', 'appointment'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  async update(id: string, updateBillingDto: UpdateBillingDto): Promise<Billing> {
    const billing = await this.findOne(id);
    Object.assign(billing, updateBillingDto);
    return await this.billingRepository.save(billing);
  }

  async processPayment(id: string, paymentDto: PaymentDto): Promise<Billing> {
    const billing = await this.findOne(id);

    if (billing.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('This bill has already been paid');
    }

    const newPaidAmount = Number(billing.paidAmount) + Number(paymentDto.amount);
    const totalAmount = Number(billing.amount);

    if (newPaidAmount > totalAmount) {
      throw new BadRequestException('Payment amount exceeds the total bill amount');
    }

    billing.paidAmount = newPaidAmount;
    billing.paymentMethod = paymentDto.paymentMethod;

    if (newPaidAmount >= totalAmount) {
      billing.paymentStatus = PaymentStatus.PAID;
    } else if (newPaidAmount > 0) {
      billing.paymentStatus = PaymentStatus.PARTIAL;
    }

    return await this.billingRepository.save(billing);
  }

  async remove(id: string): Promise<void> {
    const billing = await this.findOne(id);
    await this.billingRepository.remove(billing);
  }
}
