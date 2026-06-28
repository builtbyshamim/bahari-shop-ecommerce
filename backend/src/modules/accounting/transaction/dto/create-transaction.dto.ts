import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { TransactionType } from '../entities/transaction.entity';
import { Transform, Type } from 'class-transformer';

// Reusable transformer: converts empty string "" → undefined so @IsOptional skips validation
const emptyToUndefined = () =>
  Transform(({ value }) => (value === '' ? undefined : value));

export class CreateTransactionDto {
  @ApiProperty({ example: 1500 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ enum: TransactionType, example: TransactionType.INCOME })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({ example: 'uuid-of-account' })
  @IsUUID()
  @IsNotEmpty()
  account_id: string;

  @ApiProperty({ example: 'uuid-of-category' })
  @IsUUID()
  @IsNotEmpty()
  category_id: string;

  @ApiProperty({ example: '2024-06-15' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: 'Monthly salary received' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {}

export class TransactionFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @emptyToUndefined()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @emptyToUndefined()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @emptyToUndefined()
  @IsUUID()
  account_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @emptyToUndefined()
  @IsUUID()
  category_id?: string;

  @ApiPropertyOptional({ enum: TransactionType })
  @IsOptional()
  @emptyToUndefined()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional()
  @IsOptional()
  @emptyToUndefined()
  @IsString()
  search?: string;
}