import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get dashboard summary stats (admin)' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    example: '2025-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    example: '2025-12-31T23:59:59.999Z',
  })
  getSummary(@Query() dto?: any) {
    const start = dto?.startDate ? new Date(dto.startDate) : undefined;
    const end = dto?.endDate ? new Date(dto.endDate) : undefined;
    return this.dashboardService.getSummary(start, end);
  }
}
