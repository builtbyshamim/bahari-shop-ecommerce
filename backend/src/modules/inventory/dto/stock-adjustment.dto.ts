// dto/stock-adjustment.dto.ts
import { IsInt, IsString, IsIn, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class StockAdjustmentDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity: number;

  @IsIn(['in', 'out'])
  type: 'in' | 'out';

  @IsString()
  note: string; // adjustment এ note mandatory
}