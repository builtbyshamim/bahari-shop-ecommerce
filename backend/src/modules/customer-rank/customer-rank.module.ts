import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { CustomerRank } from './entities/customer-rank.entity';
import { CustomerLevel } from './entities/customer-level.entity';
import { CustomerRankService } from './customer-rank.service';
import { CustomerRankController } from './customer-rank.controller';
import { RankingCronService } from './ranking.cron.service';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { Order } from 'src/modules/orders/entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CustomerRank, CustomerLevel, UserEntity, Order]),
    ScheduleModule.forRoot(), // only once — move to AppModule if already there
  ],
  providers: [CustomerRankService, RankingCronService],
  controllers: [CustomerRankController],
  exports: [CustomerRankService],
})
export class CustomerRankModule {}