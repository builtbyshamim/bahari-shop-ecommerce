import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AdminReportsService } from './admin-reports.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/shared/enums/user-role.enum';
import { DateRangeDto } from './dto/date-range.dto';
import { OrdersReportDto } from './dto/orders-report.dto';
import { TransactionsReportDto } from './dto/transactions-report.dto';
import { StockMovementsReportDto } from './dto/stock-movements-report.dto';

@ApiTags('Admin Reports')
@ApiBearerAuth()
@Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
@Controller('admin-reports')
export class AdminReportsController {
  constructor(private readonly service: AdminReportsService) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Comprehensive summary: sales + accounting + inventory',
  })
  getSummary(@Query() dto: DateRangeDto) {
    return this.service.getComprehensiveSummary(dto.startDate, dto.endDate);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Orders report with full details' })
  getOrders(@Query() dto: OrdersReportDto) {
    return this.service.getOrdersReport(dto.startDate, dto.endDate, dto.status);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Income & expense transactions report' })
  getTransactions(@Query() dto: TransactionsReportDto) {
    return this.service.getTransactionsReport(dto.startDate, dto.endDate, dto.type);
  }

  @Get('inventory')
  @ApiOperation({ summary: 'Inventory snapshot report' })
  getInventory() {
    return this.service.getInventoryReport();
  }

  @Get('stock-movements')
  @ApiOperation({ summary: 'Stock movements report' })
  getStockMovements(@Query() dto: StockMovementsReportDto) {
    return this.service.getStockMovementsReport(
      dto.startDate,
      dto.endDate,
      dto.movementType,
    );
  }

  @Get('campaigns')
  @ApiOperation({ summary: 'Campaign attribution — orders & revenue by UTM source / campaign' })
  getCampaignReport(@Query() dto: DateRangeDto) {
    return this.service.getCampaignReport(dto.startDate, dto.endDate);
  }
}
