import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum PayrollStatus {
  PENDING = 'pending',
  PROCESSED = 'processed',
  PAID = 'paid',
}

@Entity('payroll_records')
export class PayrollRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  employeeId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'employeeId' })
  employee: User;

  @Column()
  employeeName: string;

  @Column()
  month: string; // YYYY-MM

  @Column({ type: 'float', default: 0 })
  baseSalary: number;

  // Allowances stored as JSON
  @Column({ type: 'jsonb', default: '{"housing":0,"transport":0,"medical":0,"other":0}' })
  allowances: { housing: number; transport: number; medical: number; other: number };

  // Deductions stored as JSON
  @Column({ type: 'jsonb', default: '{"tax":0,"insurance":0,"retirement":0,"other":0}' })
  deductions: { tax: number; insurance: number; retirement: number; other: number };

  // Overtime stored as JSON
  @Column({ type: 'jsonb', default: '{"hours":0,"rate":0,"amount":0}' })
  overtime: { hours: number; rate: number; amount: number };

  @Column({ type: 'float', default: 0 })
  grossSalary: number;

  @Column({ type: 'float', default: 0 })
  netSalary: number;

  @Column({ type: 'enum', enum: PayrollStatus, default: PayrollStatus.PENDING })
  status: PayrollStatus;

  @Column({ nullable: true })
  processedAt: string;

  @Column({ nullable: true })
  paidAt: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
