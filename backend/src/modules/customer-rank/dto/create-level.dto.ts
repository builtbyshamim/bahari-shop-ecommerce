import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateLevelDto {
  @ApiProperty({ example: 'Gold' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: '🥇' })
  @IsOptional()
  @IsString()
  badge?: string;

  @ApiProperty({ example: 15000 })
  @IsNumber()
  @Min(0)
  minAmount: number;

  @ApiPropertyOptional({ example: 29999 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxAmount?: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  sortOrder?: number;
}