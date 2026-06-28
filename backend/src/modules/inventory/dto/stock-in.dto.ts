// dto/stock-in.dto.ts
import { IsUUID, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class StockInDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  unit_cost_price: number;

  @IsUUID()
  @IsOptional()
  reference_id?: string; // purchase order id

  @IsString()
  @IsOptional()
  note?: string;
}