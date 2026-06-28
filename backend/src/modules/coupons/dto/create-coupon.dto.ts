import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { CouponDiscountType } from '../entities/coupon.entity';

export class CreateCouponDto {
  @ApiProperty({ example: 'SAVE20' })
  @IsString()
  @MinLength(2)
  code: string;

  @ApiPropertyOptional({ example: 'Get 20% off on orders above ৳500' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: CouponDiscountType, example: CouponDiscountType.PERCENT })
  @IsEnum(CouponDiscountType)
  discountType: CouponDiscountType;

  @ApiProperty({ example: 20, description: 'Percent (1-100) or fixed amount' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  discountValue: number;

  @ApiPropertyOptional({ example: 500, description: 'Minimum cart total required' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minPurchase?: number;

  @ApiPropertyOptional({ example: 100, description: 'Max total uses (null = unlimited)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  maxUses?: number;

  @ApiPropertyOptional({ example: '2025-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @ApiPropertyOptional({ example: '2025-12-31T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;
}
