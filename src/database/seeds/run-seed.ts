import { DataSource } from 'typeorm';
import { seedDatabase } from './seed';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'hospital_db',
  entities: ['src/database/entities/*.entity.ts'],
  synchronize: false,
});

async function runSeed() {
  try {
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');
    
    await seedDatabase(AppDataSource);
    
    await AppDataSource.destroy();
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

runSeed();
