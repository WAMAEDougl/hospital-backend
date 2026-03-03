import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDoctorDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  specialization: string;

  @IsString()
  @IsNotEmpty()
  qualification: string;

  @IsNumber()
  @IsNotEmpty()
  experience: number;

  @IsNumber()
  @IsNotEmpty()
  consultationFee: number;

  @IsString()
  @IsNotEmpty()
  department: string;

  @IsString()
  @IsNotEmpty()
  availableFrom: string;

  @IsString()
  @IsNotEmpty()
  availableTo: string;

  @IsArray()
  @IsOptional()
  availableDays?: string[];
}
