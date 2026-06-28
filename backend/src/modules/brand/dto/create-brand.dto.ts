import { IsOptional, IsString, MaxLength, IsUrl, IsEnum, IsBoolean, IsObject, ValidateNested, IsArray } from "class-validator";
import { Transform, Type } from "class-transformer";
import { BrandStatus } from "../entities/brand.entity";

export class CreateBrandDto {
  @IsString()
  @MaxLength(120)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsUrl()
  logo?: string;

  @IsOptional()
  @IsUrl()
  bannerImage?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsString()
  countryOfOrigin?: string;

  @IsOptional()
  @IsEnum(BrandStatus)
  status?: BrandStatus;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isVerified?: boolean;

  // 🔥 IMPORTANT PART
  @IsOptional()
  @IsString()
  @MaxLength(60)
  meta_title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  meta_description?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (Array.isArray(value)) return value;
    return [value];
  })
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @IsOptional()
  @IsString()
  logoFileId?: string;

  @IsOptional()
  @IsString()
  bannerImageFileId?: string;
}

// Optional: Create a separate DTO for updates
export class UpdateBrandDto extends CreateBrandDto {
  @IsOptional()
  @IsString()
  slug?: string;
}