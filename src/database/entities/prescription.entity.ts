import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Patient } from './patient.entity';
import { Doctor } from './doctor.entity';
import { Appointment } from './appointment.entity';

@Entity('prescriptions')
export class Prescription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Appointment, { nullable: true })
  @JoinColumn()
  appointment: Appointment;

  @Column({ nullable: true })
  appointmentId: string;

  @ManyToOne(() => Patient, (patient) => patient.prescriptions)
  @JoinColumn()
  patient: Patient;

  @Column()
  patientId: string;

  @ManyToOne(() => Doctor)
  @JoinColumn()
  doctor: Doctor;

  @Column()
  doctorId: string;

  @Column({ type: 'jsonb' })
  medicines: {
    medicineId: string;
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity: number;
  }[];

  @Column({ type: 'text' })
  instructions: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: false })
  dispensed: boolean;

  @Column({ type: 'timestamp', nullable: true })
  dispensedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
