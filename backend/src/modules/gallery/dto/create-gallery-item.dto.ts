import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { GalleryMediaType } from '../entities/gallery-item.entity';

export class CreateGalleryItemDto {
  @IsOptional() @IsString() @MaxLength(200) title?: string;

  @IsOptional()
  @IsEnum(GalleryMediaType)
  @Transform(({ value }) => value || GalleryMediaType.IMAGE)
  mediaType?: GalleryMediaType;

  @IsOptional() @IsString() imageUrl?: string;
  @IsOptional() @IsString() imageFileId?: string;

  @IsOptional() @IsString() @MaxLength(1000) videoUrl?: string;
  @IsOptional() @IsString() @MaxLength(1000) link?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => (value !== undefined && value !== '' ? Number(value) : 0))
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return true;
  })
  isActive?: boolean;
}
