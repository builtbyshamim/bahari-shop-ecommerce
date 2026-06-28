// dto/fulfill-stock.dto.ts
import { IsUUID, IsInt, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FulfillStockDto {
  @IsUUID()
  order_id: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  unit_sale_price: number;
}