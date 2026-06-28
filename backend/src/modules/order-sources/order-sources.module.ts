import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderSourcesController } from './order-sources.controller';
import { OrderSourcesService } from './order-sources.service';
import { OrderSource } from './entities/order-source.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderSource])],
  controllers: [OrderSourcesController],
  providers: [OrderSourcesService],
  exports: [OrderSourcesService],
})
export class OrderSourcesModule {}
