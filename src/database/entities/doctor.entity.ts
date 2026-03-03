import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Appointment } from './appointment.entity';

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.doctor)
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  @Column()
  specialization: string;

  @Column()
  qualification: string;

  @Column({ type: 'int' })
  experience: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  consultationFee: number;

  @Column()
  department: string;

  @Column({ type: 'time' })
  availableFrom: string;

  @Column({ type: 'time' })
  availableTo: string;

  @Column({ type: 'simple-array', nullable: true })
  availableDays: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Appointment, (appointment) => appointment.doctor)
  appointments: Appointment[];
}
