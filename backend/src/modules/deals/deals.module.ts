import { Module } from '@nestjs/common';
import { DealsService } from './deals.service';
import { DealsController } from './deals.controller';
import { Deal } from './entities/deal.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from '../product/product.module';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  controllers: [DealsController],
  imports: [
    TypeOrmModule.forFeature([Deal]),
    ProductModule,
    InventoryModule
  ],
  providers: [DealsService],
})
export class DealsModule { }
