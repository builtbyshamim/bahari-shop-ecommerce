import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderPaymentDto {
  @IsUUID()
  @IsNotEmpty()
  orderId: string;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  amount: number;

  @IsUUID()
  @IsOptional()
  accountId?: string;

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsString()
  @IsNotEmpty()
  paidAt: string;

  @IsString()
  @IsOptional()
  note?: string;
}

export class OrderPaymentFilterDto {
  @IsOptional() page?: number;
  @IsOptional() limit?: number;
  @IsOptional() orderId?: string;
  @IsOptional() orderNumber?: string;
  @IsOptional() accountId?: string;
  @IsOptional() from?: string;
  @IsOptional() to?: string;
}
