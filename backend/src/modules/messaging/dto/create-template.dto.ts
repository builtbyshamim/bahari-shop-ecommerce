import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TemplateChannel } from '../entities/message-template.entity';

export class CreateTemplateDto {
  @ApiProperty() @IsNotEmpty() @IsString() name: string;

  @ApiProperty({ enum: TemplateChannel })
  @IsEnum(TemplateChannel)
  channel: TemplateChannel;

  @ApiPropertyOptional() @IsOptional() @IsString() subject?: string;

  @ApiProperty() @IsNotEmpty() @IsString() body: string;

  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}
