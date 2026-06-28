import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { TransactionType } from '../transaction/entities/transaction.entity';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /**
   * GET /api/v1/reports/summary
   * Total income, expense, profit/loss, account balance
   */
  @Get('summary')
  async getSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('account_id') account_id?: string,
    @Query('category_id') category_id?: string,
  ) {
    const data = await this.reportsService.getSummary({
      startDate,
      endDate,
      account_id,
      category_id,
    });
    return { success: true, data };
  }

  /**
   * GET /api/v1/reports/by-category
   */
  @Get('by-category')
  async getByCategory(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('account_id') account_id?: string,
    @Query('type') type?: TransactionType,
  ) {
    const data = await this.reportsService.getByCategory({
      startDate,
      endDate,
      account_id,
      type,
    });
    return { success: true, data };
  }

  /**
   * GET /api/v1/reports/time-series?groupBy=day|month
   */
  @Get('time-series')
  async getTimeSeries(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('account_id') account_id?: string,
    @Query('groupBy') groupBy: 'day' | 'month' = 'day',
  ) {
    const data = await this.reportsService.getTimeSeries(
      { startDate, endDate, account_id },
      groupBy,
    );
    return { success: true, data };
  }

  /**
   * GET /api/v1/reports/account-balances
   */
  @Get('account-balances')
  async getAccountBalances() {
    const data = await this.reportsService.getAccountBalances();
    return { success: true, data };
  }
}