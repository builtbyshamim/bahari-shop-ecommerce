import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ArrayUnique,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFeaturedSectionDto {
  @ApiProperty({ example: 'Summer Collection' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Top picks for the summer season' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 10, description: 'Higher = shown first' })
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

  @ApiPropertyOptional({ example: '2025-06-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  startAt?: string;

  @ApiPropertyOptional({ example: '2025-12-31T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  endAt?: string;

  @ApiPropertyOptional({ type: [String], description: 'Product IDs to include' })
  @IsOptional()
  @IsUUID(undefined, { each: true })
  @ArrayUnique()
  productIds?: string[];
}
