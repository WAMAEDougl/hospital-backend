import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { PaymentMethod } from '../../database/entities/billing.entity';

export class PaymentDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;
}
