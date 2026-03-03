import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../entities/user.entity';
import { Patient, Gender, BloodGroup } from '../entities/patient.entity';
import { Doctor } from '../entities/doctor.entity';
import { Medicine } from '../entities/medicine.entity';

export async function seedDatabase(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);
  const patientRepository = dataSource.getRepository(Patient);
  const doctorRepository = dataSource.getRepository(Doctor);
  const medicineRepository = dataSource.getRepository(Medicine);

  // Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = userRepository.create({
    email: 'admin@hospital.com',
    password: adminPassword,
    firstName: 'Admin',
    lastName: 'User',
    phone: '+1234567890',
    role: UserRole.ADMIN,
  });
  await userRepository.save(admin);

  // Create Doctor Users
  const doctorPassword = await bcrypt.hash('doctor123', 10);
  
  const doctor1User = userRepository.create({
    email: 'dr.smith@hospital.com',
    password: doctorPassword,
    firstName: 'John',
    lastName: 'Smith',
    phone: '+1234567891',
    role: UserRole.DOCTOR,
  });
  await userRepository.save(doctor1User);

  const doctor2User = userRepository.create({
    email: 'dr.johnson@hospital.com',
    password: doctorPassword,
    firstName: 'Sarah',
    lastName: 'Johnson',
    phone: '+1234567892',
    role: UserRole.DOCTOR,
  });
  await userRepository.save(doctor2User);

  // Create Doctor Profiles
  const doctor1 = doctorRepository.create({
    userId: doctor1User.id,
    specialization: 'Cardiology',
    qualification: 'MD, MBBS',
    experience: 15,
    consultationFee: 200,
    department: 'Cardiology',
    availableFrom: '09:00',
    availableTo: '17:00',
  });
  await doctorRepository.save(doctor1);

  const doctor2 = doctorRepository.create({
    userId: doctor2User.id,
    specialization: 'Pediatrics',
    qualification: 'MD, DCH',
    experience: 10,
    consultationFee: 150,
    department: 'Pediatrics',
    availableFrom: '10:00',
    availableTo: '18:00',
  });
  await doctorRepository.save(doctor2);

  // Create Patient Users
  const patientPassword = await bcrypt.hash('patient123', 10);
  
  const patient1User = userRepository.create({
    email: 'patient1@example.com',
    password: patientPassword,
    firstName: 'Michael',
    lastName: 'Brown',
    phone: '+1234567893',
    role: UserRole.PATIENT,
  });
  await userRepository.save(patient1User);

  const patient2User = userRepository.create({
    email: 'patient2@example.com',
    password: patientPassword,
    firstName: 'Emily',
    lastName: 'Davis',
    phone: '+1234567894',
    role: UserRole.PATIENT,
  });
  await userRepository.save(patient2User);

  // Create Patient Profiles
  const patient1 = patientRepository.create({
    userId: patient1User.id,
    dateOfBirth: new Date('1985-05-15'),
    gender: Gender.MALE,
    bloodGroup: BloodGroup.O_POSITIVE,
    address: '123 Main Street, City, State 12345',
    emergencyContact: 'Jane Brown',
    emergencyPhone: '+1234567895',
    insuranceProvider: 'HealthCare Plus',
    insuranceNumber: 'HCP123456',
    medicalHistory: 'No major medical history',
    allergies: 'None',
  });
  await patientRepository.save(patient1);

  const patient2 = patientRepository.create({
    userId: patient2User.id,
    dateOfBirth: new Date('1992-08-22'),
    gender: Gender.FEMALE,
    bloodGroup: BloodGroup.A_POSITIVE,
    address: '456 Oak Avenue, City, State 12345',
    emergencyContact: 'Robert Davis',
    emergencyPhone: '+1234567896',
    insuranceProvider: 'MediCare Insurance',
    insuranceNumber: 'MCI789012',
    medicalHistory: 'Asthma',
    allergies: 'Penicillin',
  });
  await patientRepository.save(patient2);

  // Create Medicines
  const medicines = [
    {
      name: 'Aspirin',
      description: 'Pain reliever and fever reducer',
      manufacturer: 'PharmaCorp',
      price: 5.99,
      stock: 500,
      expiryDate: new Date('2025-12-31'),
      category: 'Pain Relief',
      dosage: '500mg',
      isAvailable: true,
    },
    {
      name: 'Amoxicillin',
      description: 'Antibiotic for bacterial infections',
      manufacturer: 'MediPharm',
      price: 12.99,
      stock: 300,
      expiryDate: new Date('2025-10-31'),
      category: 'Antibiotics',
      dosage: '250mg',
      isAvailable: true,
    },
    {
      name: 'Lisinopril',
      description: 'Blood pressure medication',
      manufacturer: 'CardioMed',
      price: 18.50,
      stock: 200,
      expiryDate: new Date('2026-03-31'),
      category: 'Cardiovascular',
      dosage: '10mg',
      isAvailable: true,
    },
    {
      name: 'Metformin',
      description: 'Diabetes medication',
      manufacturer: 'DiabetesCare',
      price: 15.75,
      stock: 250,
      expiryDate: new Date('2025-11-30'),
      category: 'Diabetes',
      dosage: '500mg',
      isAvailable: true,
    },
    {
      name: 'Ibuprofen',
      description: 'Anti-inflammatory pain reliever',
      manufacturer: 'PharmaCorp',
      price: 7.99,
      stock: 400,
      expiryDate: new Date('2025-09-30'),
      category: 'Pain Relief',
      dosage: '200mg',
      isAvailable: true,
    },
  ];

  for (const medicineData of medicines) {
    const medicine = medicineRepository.create(medicineData);
    await medicineRepository.save(medicine);
  }

  console.log('Database seeded successfully!');
  console.log('\nTest Credentials:');
  console.log('Admin: admin@hospital.com / admin123');
  console.log('Doctor 1: dr.smith@hospital.com / doctor123');
  console.log('Doctor 2: dr.johnson@hospital.com / doctor123');
  console.log('Patient 1: patient1@example.com / patient123');
  console.log('Patient 2: patient2@example.com / patient123');
}
