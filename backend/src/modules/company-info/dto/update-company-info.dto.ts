import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, plainToInstance } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';

class SocialLinksDto {
  @IsOptional() @IsString() facebook?: string;
  @IsOptional() @IsString() instagram?: string;
  @IsOptional() @IsString() twitter?: string;
  @IsOptional() @IsString() youtube?: string;
  @IsOptional() @IsString() tiktok?: string;
  @IsOptional() @IsString() linkedin?: string;
  @IsOptional() @IsString() whatsapp?: string;
}

export class UpdateCompanyInfoDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() website?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() tagline?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() logoUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() logoFileId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() faviconUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() faviconFileId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() seoTitle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() seoDescription?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() seoKeywords?: string;

  @ApiPropertyOptional({ type: SocialLinksDto })
  @IsOptional()
  @Transform(({ value }) => {
    let obj = value;
    if (typeof value === 'string') {
      try { obj = JSON.parse(value); } catch { return undefined; }
    }
    if (obj && typeof obj === 'object') {
      return plainToInstance(SocialLinksDto, obj);
    }
    return undefined;
  })
  @ValidateNested()
  socialLinks?: SocialLinksDto;
}
