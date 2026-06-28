import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { DateRangeDto } from './date-range.dto';
import { TransactionType } from '../../accounting/transaction/entities/transaction.entity';

export class TransactionsReportDto extends DateRangeDto {
  @ApiPropertyOptional({
    enum: TransactionType,
    description: 'Filter by transaction type (INCOME or EXPENSE)',
  })
  @IsOptional()
  @IsEnum(TransactionType, { message: 'type must be a valid TransactionType' })
  type?: TransactionType;
}
