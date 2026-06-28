import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryChargesService } from './delivery-charges.service';
import { DeliveryChargesController } from './delivery-charges.controller';
import { DeliveryCharge } from './entities/delivery-charge.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryCharge])],
  controllers: [DeliveryChargesController],
  providers: [DeliveryChargesService],
  exports: [DeliveryChargesService],
})
export class DeliveryChargesModule {}