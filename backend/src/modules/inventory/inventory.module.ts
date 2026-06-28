import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { InventoryCleanupCronService } from './inventory-cleanup.cron';
import { Inventory } from './entities/inventory.entity';
import { StockMovement } from './entities/stock-movement.entity';
import { StockReservation } from './entities/stock-reservation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Inventory, StockMovement, StockReservation])],
  controllers: [InventoryController],
  providers: [InventoryService, InventoryCleanupCronService],
  exports: [InventoryService, TypeOrmModule],
})
export class InventoryModule {}
