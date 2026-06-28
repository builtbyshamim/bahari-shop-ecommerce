import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { DateRangeDto } from './date-range.dto';
import { MovementType } from '../../inventory/entities/stock-movement.entity';

export class StockMovementsReportDto extends DateRangeDto {
  @ApiPropertyOptional({
    enum: MovementType,
    description: 'Filter by movement type',
  })
  @IsOptional()
  @IsEnum(MovementType, { message: 'movementType must be a valid MovementType' })
  movementType?: MovementType;
}
