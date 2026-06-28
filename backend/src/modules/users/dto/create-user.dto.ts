import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { UserRole } from 'src/common/shared/enums/user-role.enum';

export class RegisterUserDto {
  @ApiProperty()
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty()
  @MinLength(6)
  password: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  acceptTerms: boolean;

  @ApiProperty({ enum: UserRole })
  @IsOptional()
  role?: UserRole;
}
