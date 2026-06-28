import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsInt,
  IsArray,
  IsUUID,
  IsUrl,
  IsHexColor,
  Min,
  Max,
  ValidateNested,
  ValidateIf,
  ArrayMinSize,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ProductType } from '../entities/product.entity';

// ═══════════════════════════════════════════════════════════════
// SEO META DTO
// ═══════════════════════════════════════════════════════════════
export class SeoMetaDto {
  @ApiPropertyOptional({ example: 'Buy Premium T-Shirt Online' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    example: 'High quality cotton t-shirt available in multiple colors',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: ['t-shirt', 'cotton', 'fashion'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];
}

// ═══════════════════════════════════════════════════════════════
// PRODUCT OPTION DTOs
// ═══════════════════════════════════════════════════════════════
export class CreateOptionValueDto {
  @ApiProperty({ example: 'Red' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  value: string;

  @ApiPropertyOptional({
    example: '#FF0000',
    description: 'Only for Color type options',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  @IsHexColor()
  colorHex?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}

export class CreateProductOptionDto {
  @ApiProperty({
    example: 'Color',
    description: 'Option name (Color, Size, Material...)',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @ApiProperty({ type: [CreateOptionValueDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOptionValueDto)
  values: CreateOptionValueDto[];

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}

// ═══════════════════════════════════════════════════════════════
// VARIANT IMAGE DTO
// ═══════════════════════════════════════════════════════════════
export class CreateVariantImageDto {
  @ApiProperty({ example: 'https://cdn.example.com/image.jpg' })
  @IsUrl()
  url: string;

  @ApiPropertyOptional({ example: 'Red T-Shirt front view' })
  @IsOptional()
  @IsString()
  altText?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

// ═══════════════════════════════════════════════════════════════
// BULK PRICING DTO
// ═══════════════════════════════════════════════════════════════
export class CreateBulkPricingTierDto {
  @ApiProperty({ example: 10, description: 'Minimum quantity for this tier' })
  @IsInt()
  @Min(1)
  minQty: number;

  @ApiPropertyOptional({
    example: 49,
    description: 'Maximum quantity (null = unlimited)',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxQty?: number;

  @ApiProperty({ example: 450.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    example: 10.5,
    description: 'Optional: show discount % in UI',
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  discountPercent?: number;
}

// ═══════════════════════════════════════════════════════════════
// PRODUCT VARIANT DTO
// ═══════════════════════════════════════════════════════════════
export class CreateVariantDto {
  @ApiPropertyOptional({
    example: 'TSHIRT-RED-M-001',
    description: 'Leave empty for auto-generation',
  })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty({ example: 799.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    example: 999.0,
    description: 'Original price (shown as crossed out)',
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  compareAtPrice?: number;

  @ApiPropertyOptional({
    example: 500.0,
    description: 'Internal cost (not shown to buyers)',
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  costPrice?: number;

  @ApiPropertyOptional({
    example: 100,
    description: 'null = unlimited stock (digital/service)',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  // ─── Physical ─────────────────────────────────────────────
  @ApiPropertyOptional({
    example: 250,
    description: 'Weight in grams (physical products)',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  weightGrams?: number;

  @ApiPropertyOptional({
    example: { length: 30, width: 20, height: 5 },
    description: 'Dimensions in cm',
  })
  @IsOptional()
  dimensions?: { length: number; width: number; height: number };

  // ─── Digital ──────────────────────────────────────────────
  @ApiPropertyOptional({ example: 'https://cdn.example.com/file.zip' })
  @IsOptional()
  @IsUrl()
  digitalFileUrl?: string;

  @ApiPropertyOptional({ example: 'software-v2.zip' })
  @IsOptional()
  @IsString()
  digitalFileName?: string;

  // ─── Service ──────────────────────────────────────────────
  @ApiPropertyOptional({
    example: 60,
    description: 'Duration in minutes (service products)',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  // ─── Identifiers ──────────────────────────────────────────
  @ApiPropertyOptional({ example: '1234567890123' })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiPropertyOptional({ example: '6109.10' })
  @IsOptional()
  @IsString()
  hsCode?: string;

  // ─── Option Values ────────────────────────────────────────
  // variant এর জন্য কোন option values apply হবে (by value string)
  // Example: ["Red", "M"] — option names থেকে match করা হবে service এ
  @ApiProperty({
    example: ['Red', 'M'],
    description:
      'Option values for this variant. Must match values defined in product options. Empty array for simple products.',
  })
  @IsArray()
  @IsString({ each: true })
  optionValues: string[];

  // ─── Variant Images ───────────────────────────────────────
  @ApiPropertyOptional({ type: [CreateVariantImageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantImageDto)
  images?: CreateVariantImageDto[];

  // ─── Bulk Pricing (variant level) ────────────────────────
  @ApiPropertyOptional({ type: [CreateBulkPricingTierDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBulkPricingTierDto)
  bulkPricingTiers?: CreateBulkPricingTierDto[];
}

// ═══════════════════════════════════════════════════════════════
// PRODUCT IMAGE DTO
// ═══════════════════════════════════════════════════════════════
export class CreateProductImageDto {
  @ApiProperty({ example: 'https://cdn.example.com/product.jpg' })
  @IsUrl()
  url: string;

  @ApiPropertyOptional({ example: 'Premium T-Shirt' })
  @IsOptional()
  @IsString()
  altText?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isThumbnail?: boolean;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

// ═══════════════════════════════════════════════════════════════
// MAIN CREATE PRODUCT DTO
// ═══════════════════════════════════════════════════════════════
export class CreateProductDto {
  @ApiProperty({ example: 'Premium Cotton T-Shirt' })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Higher number = higher priority',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  priority?: number;

  @ApiPropertyOptional({
    example: 'Premium cotton t-shirt, lightweight and breathable.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  shortDescription?: string;

  @ApiPropertyOptional({ example: 'High quality 100% cotton t-shirt...' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: '<p>Weight: 250g</p><p>Dimensions: 30x20x5cm</p>',
  })
  @IsOptional()
  @IsString()
  specifications?: string;

  @ApiProperty({ enum: ProductType, example: ProductType.PHYSICAL })
  @IsEnum(ProductType)
  type: ProductType;

  @ApiPropertyOptional({ example: 'cat-uuid-here' })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ example: 'brand-uuid-here' })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  @IsString()
  brandId?: string;

  @ApiPropertyOptional({ example: 'feature-type-uuid-here' })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  @IsUUID()
  featureTypeId?: string;

  @ApiPropertyOptional({ example: 5, description: 'Minimum Order Quantity' })
  @IsOptional()
  @IsInt()
  @Min(1)
  moq?: number;

  @ApiPropertyOptional({ type: SeoMetaDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SeoMetaDto)
  seoMeta?: SeoMetaDto;

  // ─── Simple Product ───────────────────────────────────────
  @ApiProperty({
    example: false,
    description:
      'false = simple product (basePrice/baseStock use হবে), true = variant product',
  })
  @IsBoolean()
  hasVariants: boolean;

  @ApiPropertyOptional({
    example: 500.0,
    description: 'Required when hasVariants = false',
  })
  @ValidateIf((o) => o.hasVariants === false)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  basePrice?: number;

  @ApiPropertyOptional({
    example: 100,
    description: 'Required when hasVariants = false. null = unlimited',
  })
  @ValidateIf((o) => o.hasVariants === false)
  @IsOptional()
  @IsInt()
  @Min(0)
  baseStock?: number;

  @ApiPropertyOptional({
    example: 100,
    description: 'Required when hasVariants = false. null = unlimited',
  })
  @ValidateIf((o) => o.hasVariants === false)
  @IsOptional()
  @IsInt()
  @Min(0)
  compareAtPrice?: number;

  @ApiPropertyOptional({
    example: 100,
    description: 'Required when hasVariants = false. null = unlimited',
  })
  @ValidateIf((o) => o.hasVariants === false)
  @IsOptional()
  @IsInt()
  @Min(0)
  costPrice?: number;

  // ─── Variant Product ──────────────────────────────────────
  @ApiPropertyOptional({
    type: [CreateProductOptionDto],
    description: 'Required when hasVariants = true',
  })
  @ValidateIf((o) => o.hasVariants === true)
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateProductOptionDto)
  options?: CreateProductOptionDto[];

  @ApiPropertyOptional({
    type: [CreateVariantDto],
    description: 'Required when hasVariants = true',
  })
  @ValidateIf((o) => o.hasVariants === true)
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  variants?: CreateVariantDto[];

  // ─── Images ───────────────────────────────────────────────
  @ApiPropertyOptional({ type: [CreateProductImageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductImageDto)
  images?: CreateProductImageDto[];

  // ─── Simple Product Bulk Pricing ─────────────────────────
  @ApiPropertyOptional({
    type: [CreateBulkPricingTierDto],
    description:
      'For simple products only. Variant products set bulk pricing per variant.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBulkPricingTierDto)
  bulkPricingTiers?: CreateBulkPricingTierDto[];
}
