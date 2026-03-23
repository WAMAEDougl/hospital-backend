import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('leave_balances')
export class LeaveBalance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  employeeId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'employeeId' })
  employee: User;

  @Column({ default: 20 })
  vacation: number;

  @Column({ default: 10 })
  sick: number;

  @Column({ default: 5 })
  personal: number;

  @Column({ type: 'jsonb', default: '{"vacation":0,"sick":0,"personal":0}' })
  used: { vacation: number; sick: number; personal: number };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
