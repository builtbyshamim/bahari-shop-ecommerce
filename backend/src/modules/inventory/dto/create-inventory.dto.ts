// dto/create-inventory.dto.ts
import { IsUUID, IsInt, IsBoolean, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInventoryDto {
  @IsUUID()
  product_id: string;

  @IsUUID()
  @IsOptional()
  variant_id?: string;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  qty_on_hand: number; 

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  low_stock_threshold?: number = 5;

  @IsBoolean()
  @IsOptional()
  is_tracked?: boolean = true;

  @IsBoolean()
  @IsOptional()
  allow_backorder?: boolean = false;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  avg_cost_price?: number = 0; // opening cost price
}