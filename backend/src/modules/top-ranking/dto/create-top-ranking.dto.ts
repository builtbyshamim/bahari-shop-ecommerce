import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTopRankingDto {
  @ApiProperty({ example: 'a3fa1e9c-8f9e-4b2c-bc8d-123456789abc' })
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 'b5fb2e0c-9a1e-5c3d-cd9e-234567890bcd', description: 'Feature Type ID' })
  @IsUUID()
  featureTypeId: string;

  @ApiProperty({ example: '2025-06-01T00:00:00.000Z' })
  @IsDateString()
  startAt: string;

  @ApiProperty({ example: '2025-12-31T23:59:59.000Z' })
  @IsDateString()
  endAt: string;

  @ApiPropertyOptional({ example: 1, description: 'Higher = shown first' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  priority?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;
}
