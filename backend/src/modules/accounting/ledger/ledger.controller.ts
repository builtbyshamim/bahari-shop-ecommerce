import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LedgerService } from './ledger.service';

@ApiTags('Ledger')
@ApiBearerAuth()
@Controller('ledger')
export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {}

  /**
   * GET /api/v1/ledger/:accountId
   * ?startDate=2024-01-01&endDate=2024-12-31
   */
  @Get(':accountId')
  async getLedger(
    @Param('accountId') accountId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const data = await this.ledgerService.getLedger(
      accountId,
      startDate,
      endDate,
    );
    return { success: true, data };
  }
}