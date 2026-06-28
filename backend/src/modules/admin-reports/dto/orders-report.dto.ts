import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { DateRangeDto } from './date-range.dto';
import { OrderStatus } from '../../orders/entities/order.entity';

export class OrdersReportDto extends DateRangeDto {
  @ApiPropertyOptional({ enum: OrderStatus, description: 'Filter by order status' })
  @IsOptional()
  @IsEnum(OrderStatus, { message: 'status must be a valid OrderStatus' })
  status?: OrderStatus;
}
