import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionEntity } from '../transaction/entities/transaction.entity';
import { AccountEntity } from '../account/entities/account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionEntity, AccountEntity])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule { }
