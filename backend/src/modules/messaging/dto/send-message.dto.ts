import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export enum SendChannel {
  EMAIL = 'email',
  SMS = 'sms',
  BOTH = 'both',
}

export enum TargetType {
  ALL = 'all',
  SINGLE = 'single',
  MULTIPLE = 'multiple',
}

export class SendMessageDto {
  @ApiProperty({ enum: SendChannel })
  @IsEnum(SendChannel)
  channel: SendChannel;

  @ApiProperty({ enum: TargetType })
  @IsEnum(TargetType)
  targetType: TargetType;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  userIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  body: string;
}
