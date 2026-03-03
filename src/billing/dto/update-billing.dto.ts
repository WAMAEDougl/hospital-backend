import { PartialType } from '@nestjs/mapped-types';
import { CreateBillingDto } from './create-billing.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { PaymentStatus } from '../../database/entities/billing.entity';

export class UpdateBillingDto extends PartialType(CreateBillingDto) {
  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;
}
