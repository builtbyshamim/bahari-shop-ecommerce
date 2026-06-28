import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class DateRangeDto {
  @ApiPropertyOptional({ example: '2025-01-01', description: 'Start date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString({}, { message: 'startDate must be a valid date string (YYYY-MM-DD)' })
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-12-31', description: 'End date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString({}, { message: 'endDate must be a valid date string (YYYY-MM-DD)' })
  endDate?: string;
}
