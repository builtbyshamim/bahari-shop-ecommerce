import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderPayment } from './entities/order-payment.entity';
import { OrderPaymentsService } from './order-payments.service';
import { OrderPaymentsController } from './order-payments.controller';
import { Order } from '../orders/entities/order.entity';
import { AccountEntity } from '../accounting/account/entities/account.entity';
import { TransactionEntity } from '../accounting/transaction/entities/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderPayment, Order, AccountEntity, TransactionEntity])],
  controllers: [OrderPaymentsController],
  providers: [OrderPaymentsService],
  exports: [OrderPaymentsService],
})
export class OrderPaymentsModule {}
