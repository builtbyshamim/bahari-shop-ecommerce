import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order.item.entity';
import { UserModule } from '../users/user.module';
import { OrderAddress } from './entities/order-address.entity';
import { InventoryModule } from '../inventory/inventory.module';
import { CourierAssignController } from './courier-assign.controller';
import { CourierAssignService } from './courier-aasign-service.service';
import { OrderSource } from '../order-sources/entities/order-source.entity';
import { CouponsModule } from '../coupons/coupons.module';
import { TrackingModule } from '../tracking/tracking.module';
import { Deal } from '../deals/entities/deal.entity';
import { Product } from '../product/entities/product.entity';
import { ProductVariant } from '../product/entities/product-variant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, OrderAddress, OrderSource, Deal, Product, ProductVariant]),
    UserModule,
    InventoryModule,
    CouponsModule,
    TrackingModule,
  ],
  controllers: [OrdersController, CourierAssignController],
  providers: [OrdersService, CourierAssignService],
  exports: [OrdersService, CourierAssignService],
})
export class OrdersModule {}