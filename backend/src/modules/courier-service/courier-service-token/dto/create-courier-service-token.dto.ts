import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsInt,
} from 'class-validator';

export class CreateCourierServiceTokenDto {

  @ApiPropertyOptional({
    example: 'your_api_key_here',
  })
  @IsOptional()
  @IsString()
  api_key?: string;

  @ApiPropertyOptional({
    example: 'your_secret_key_here',
  })
  @IsOptional()
  @IsString()
  secret_key?: string;

  @ApiPropertyOptional({
    example: 'server_token_here',
  })
  @IsOptional()
  @IsString()
  server_generation_token?: string;

  @ApiPropertyOptional({
    example: 'username_here',
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    example: 'password_here',
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({
    example: 1,
    description: '0:Inactive, 1:Active',
    default: 1,
  })
  @IsOptional()
  @IsInt()
  status?: number;

  @ApiProperty({
    example: 1,
  })
  @IsNumber()
  courier_service_id: number;
}
