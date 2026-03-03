import { IsNotEmpty, IsNumber, IsString, IsOptional, IsBoolean, IsUUID } from 'class-validator';

export class CreateBillingDto {
  @IsUUID()
  @IsNotEmpty()
  patientId: string;

  @IsUUID()
  @IsOptional()
  appointmentId?: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsBoolean()
  @IsOptional()
  insuranceClaim?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;
}
