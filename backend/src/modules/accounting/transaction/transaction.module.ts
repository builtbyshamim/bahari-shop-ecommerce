import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModule } from '../account/account.module';
import { TransactionEntity } from './entities/transaction.entity';

@Module({
   imports: [
    TypeOrmModule.forFeature([TransactionEntity]),
    AccountModule, // needed for AccountEntity in raw queries
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}
