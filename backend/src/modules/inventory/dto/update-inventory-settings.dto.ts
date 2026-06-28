import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateInventorySettingsDto {
  @IsOptional()
  @IsBoolean()
  is_tracked?: boolean;

  @IsOptional()
  @IsBoolean()
  allow_backorder?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  low_stock_threshold?: number;
}