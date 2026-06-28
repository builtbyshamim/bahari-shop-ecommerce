import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

const emptyToUndefined = () =>
  Transform(({ value }) => (value === '' ? undefined : value));

export class CreatePathaoStoreDto {
  @ApiProperty({ example: 'Dhaka Main Store' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @ApiProperty({ example: '12345' })
  @IsString()
  @IsNotEmpty()
  store_id: string;

  @ApiPropertyOptional({ example: 'House 12, Road 5, Dhanmondi' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdatePathaoStoreDto extends PartialType(CreatePathaoStoreDto) {}

export class PathaoStoreFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @emptyToUndefined()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;
}