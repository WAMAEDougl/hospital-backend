import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum LeaveType {
  VACATION = 'vacation',
  SICK = 'sick',
  PERSONAL = 'personal',
  MATERNITY = 'maternity',
  OTHER = 'other',
}

export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('leave_requests')
export class LeaveRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  employeeId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'employeeId' })
  employee: User;

  @Column()
  employeeName: string;

  @Column({ type: 'enum', enum: LeaveType, default: LeaveType.VACATION })
  type: LeaveType;

  @Column()
  startDate: string;

  @Column()
  endDate: string;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'enum', enum: LeaveStatus, default: LeaveStatus.PENDING })
  status: LeaveStatus;

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ nullable: true })
  approvedAt: string;

  @CreateDateColumn()
  requestedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
