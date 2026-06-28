import { Module } from '@nestjs/common';
import { CourierServiceService } from './courier-service.service';
import { CourierServiceController } from './courier-service.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourierService } from './entities/courier-service.entity';

@Module({
  controllers: [CourierServiceController],
  imports: [TypeOrmModule.forFeature([CourierService])],
  providers: [CourierServiceService],
})
export class CourierServiceModule {}
