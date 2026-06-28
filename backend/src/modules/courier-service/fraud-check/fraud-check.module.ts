import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourierServiceToken } from '../courier-service-token/entities/courier-service-token.entity';
import { FraudCheckService } from './fraud-check.service';
import { FraudCheckController } from './fraud-check.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CourierServiceToken])],
  providers: [FraudCheckService],
  controllers: [FraudCheckController],
})
export class FraudCheckModule {}
