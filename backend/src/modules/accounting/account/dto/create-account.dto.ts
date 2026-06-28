import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { AccountType } from '../entities/account.entity';

export class CreateAccountDto {
  @ApiProperty({ example: 'Main Cash' })
  @IsString()
  @IsNotEmpty()
  account_name: string;

  @ApiProperty({ enum: AccountType, example: AccountType.CASH })
  @IsEnum(AccountType)
  account_type: AccountType;

  @ApiPropertyOptional({ example: 'Bkash' })
  @IsOptional()
  @IsString()
  mobile_provider?: string;

  @ApiPropertyOptional({ example: 5000, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  opening_balance?: number;
}

export class UpdateAccountDto extends PartialType(CreateAccountDto) {}