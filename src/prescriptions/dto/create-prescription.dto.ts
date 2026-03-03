import { IsNotEmpty, IsString, IsArray, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class MedicineItemDto {
  @IsUUID()
  @IsNotEmpty()
  medicineId: string;

  @IsString()
  @IsNotEmpty()
  medicineName: string;

  @IsString()
  @IsNotEmpty()
  dosage: string;

  @IsString()
  @IsNotEmpty()
  frequency: string;

  @IsString()
  @IsNotEmpty()
  duration: string;

  @IsNotEmpty()
  quantity: number;
}

export class CreatePrescriptionDto {
  @IsUUID()
  @IsNotEmpty()
  patientId: string;

  @IsUUID()
  @IsNotEmpty()
  doctorId: string;

  @IsUUID()
  @IsOptional()
  appointmentId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicineItemDto)
  medicines: MedicineItemDto[];

  @IsString()
  @IsNotEmpty()
  instructions: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
