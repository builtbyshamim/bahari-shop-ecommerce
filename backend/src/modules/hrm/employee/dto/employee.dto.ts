import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsDateString, IsEmail, IsEnum, IsNotEmpty,
  IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { EmployeeStatus, EmployeeType } from '../entities/employee-profile.entity';

const emptyToUndefined = () =>
  Transform(({ value }) => (value === '' ? undefined : value));

export class CreateEmployeeDto {
  // ── User table fields ──────────────────────────────────────────────────
  @ApiProperty({ example: 'Md. Shamim Hossain' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  full_name: string;

  @ApiProperty({ example: 'shamim@company.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ example: '01712345678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ description: 'Default: Employee@1234' })
  @IsOptional()
  @IsString()
  password?: string;

  // ── Profile table fields ───────────────────────────────────────────────
  @ApiPropertyOptional({ example: '1995-06-15' })
  @IsOptional()
  @IsDateString()
  date_of_birth?: string;

  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  @IsNotEmpty()
  join_date: string;

  @ApiPropertyOptional({ enum: EmployeeType, default: EmployeeType.FULL_TIME })
  @IsOptional()
  @IsEnum(EmployeeType)
  employment_type?: EmployeeType;

  @ApiPropertyOptional({ enum: EmployeeStatus, default: EmployeeStatus.ACTIVE })
  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;

  @ApiPropertyOptional({ example: 35000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  salary?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nid?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  emergency_contact?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  designation_id?: string;
}

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {}

export class EmployeeFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @emptyToUndefined()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: EmployeeStatus })
  @IsOptional()
  @emptyToUndefined()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;

  @ApiPropertyOptional({ enum: EmployeeType })
  @IsOptional()
  @emptyToUndefined()
  @IsEnum(EmployeeType)
  employment_type?: EmployeeType;

  @ApiPropertyOptional()
  @IsOptional()
  @emptyToUndefined()
  @IsUUID()
  designation_id?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;
}