// inventory.controller.ts
import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, Req,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { StockInDto } from './dto/stock-in.dto';
import { StockAdjustmentDto } from './dto/stock-adjustment.dto';
import { ReserveStockDto } from './dto/reserve-stock.dto';
import { FulfillStockDto } from './dto/fulfill-stock.dto';
import { QueryInventoryDto } from './dto/query-inventory.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserEntity } from '../users/entities/user.entity';
import { UpdateInventorySettingsDto } from './dto/update-inventory-settings.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) { }

  // Opening stock create
  @Post()
  create(@CurrentUser() user: UserEntity, @Body() dto: CreateInventoryDto, @Req() req: any) {
    const performedBy = user?.id;
    return this.inventoryService.create(dto, performedBy);
  }

  // List all
  @Get()
  findAll(@Query() query: QueryInventoryDto) {
    return this.inventoryService.findAll(query);
  }

  // Single inventory with history
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  // Movement history
  @Get(':id/movements')
  getMovements(@Param('id') id: string, @Query() query: QueryInventoryDto) {
    return this.inventoryService.getMovements(id, query);
  }
  @Patch(':id/settings')
  updateSettings(
    @Param('id') id: string,
    @Body() dto: UpdateInventorySettingsDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.inventoryService.updateSettings(id, dto, user.id);
  }
  // Profit report
  @Get(':id/profit')
  getProfitReport(@Param('id') id: string) {
    return this.inventoryService.getProfitReport(id);
  }

  // Stock in (purchase)
  @Post(':id/stock-in')
  stockIn(@CurrentUser() user: UserEntity, @Param('id') id: string, @Body() dto: StockInDto) {
    const performed_by = user.id;
    return this.inventoryService.stockIn(id, dto, performed_by);
  }

  // Manual adjustment
  @Post(':id/adjust')
  adjust(@Param('id') id: string, @Body() dto: StockAdjustmentDto, @Req() req: any) {
    return this.inventoryService.adjust(id, dto, req.user?.id ?? 'system');
  }

  // Reserve (order placed)
  @Post(':id/reserve')
  reserve(@Param('id') id: string, @Body() dto: ReserveStockDto, @Req() req: any) {
    return this.inventoryService.reserve(id, dto, req.user?.id ?? 'system');
  }

  // Fulfill (shipped)
  @Post(':id/fulfill')
  fulfill(@Param('id') id: string, @Body() dto: FulfillStockDto, @Req() req: any) {
    return this.inventoryService.fulfill(id, dto, req.user?.id ?? 'system');
  }

  // Release reservation (cancel)
  @Post(':id/release/:orderId')
  release(@Param('id') id: string, @Param('orderId') orderId: string) {
    return this.inventoryService.release(id, orderId);
  }
}