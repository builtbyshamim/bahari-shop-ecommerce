import { IsNotEmpty, IsUUID } from 'class-validator';

export class InitiateSslPaymentDto {
  @IsUUID()
  @IsNotEmpty()
  orderId: string;
}
