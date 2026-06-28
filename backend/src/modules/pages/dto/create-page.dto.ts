import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePageDto {
  @ApiProperty({ example: 'About Us' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'about-us' })
  @IsString()
  @MaxLength(200)
  slug: string;

  @ApiPropertyOptional({ description: 'HTML content from rich text editor' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsNumber()
  sortOrder?: number;
}
