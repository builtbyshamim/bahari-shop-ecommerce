import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SslPayment } from './entities/ssl-payment.entity';
import { SslPaymentService } from './ssl-payment.service';
import { SslPaymentController } from './ssl-payment.controller';
import { Order } from '../orders/entities/order.entity';
import { OrderPaymentsModule } from '../order-payments/order-payments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SslPayment, Order]),
    OrderPaymentsModule,
  ],
  controllers: [SslPaymentController],
  providers: [SslPaymentService],
  exports: [SslPaymentService],
})
export class SslPaymentModule {}
