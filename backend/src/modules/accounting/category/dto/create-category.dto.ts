import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CategoryType } from '../entities/category.entity';

export class CreateAccountingCategoryDto {
  @ApiProperty({ example: 'Product Sales' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: CategoryType, example: CategoryType.INCOME })
  @IsEnum(CategoryType)
  type: CategoryType;

  @ApiPropertyOptional({ example: 'Revenue from product sales' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateAccountingCategoryDto extends PartialType(
  CreateAccountingCategoryDto,
) {}