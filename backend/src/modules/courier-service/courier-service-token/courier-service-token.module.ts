import { Module } from '@nestjs/common';
import { CourierServiceTokenService } from './courier-service-token.service';
import { CourierServiceTokenController } from './courier-service-token.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourierServiceToken } from './entities/courier-service-token.entity';

@Module({
  controllers: [CourierServiceTokenController],
  imports: [TypeOrmModule.forFeature([CourierServiceToken])],
  providers: [CourierServiceTokenService],
})
export class CourierServiceTokenModule { }
