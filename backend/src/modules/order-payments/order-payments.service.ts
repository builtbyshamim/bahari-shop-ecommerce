import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { OrderPayment } from './entities/order-payment.entity';
import { Order, PaymentStatus } from '../orders/entities/order.entity';
import { AccountEntity } from '../accounting/account/entities/account.entity';
import { TransactionEntity, TransactionType } from '../accounting/transaction/entities/transaction.entity';
import {
  CreateOrderPaymentDto,
  OrderPaymentFilterDto,
} from './dto/create-order-payment.dto';

@Injectable()
export class OrderPaymentsService {
  constructor(
    @InjectRepository(OrderPayment)
    private readonly paymentRepo: Repository<OrderPayment>,

    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  // ── Create Payment ──────────────────────────────────────────────────────────
  async create(dto: CreateOrderPaymentDto, userId: string | null): Promise<OrderPayment> {
    const saved = await this.dataSource.transaction(async (em) => {
      // Load order
      const order = await em.findOne(Order, {
        where: { id: dto.orderId },
        relations: ['items', 'address'],
      });
      if (!order) throw new NotFoundException('Order not found');

      const amount = Number(dto.amount);
      if (amount <= 0) throw new BadRequestException('Amount must be greater than 0');

      // Update account balance if account provided
      if (dto.accountId) {
        const account = await em.findOne(AccountEntity, {
          where: { id: dto.accountId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!account) throw new NotFoundException('Account not found');
        account.current_balance = Number(account.current_balance) + amount;
        await em.save(AccountEntity, account);
      }

      // Create accounting transaction record (balance already adjusted above — just the row)
      let transactionId: string | null = null;
      if (dto.accountId) {
        const txNote = `Order payment: ${order.orderNumber}${dto.note ? ` — ${dto.note}` : ''}`;
        const tx = em.create(TransactionEntity, {
          amount,
          type: TransactionType.INCOME,
          account_id: dto.accountId,
          note: txNote,
          date: dto.paidAt,
          user_id: userId ?? undefined,
        });
        const savedTx = await em.save(TransactionEntity, tx);
        transactionId = savedTx.id;
      }

      // Save payment record
      const payment = em.create(OrderPayment, {
        orderId: dto.orderId,
        amount,
        accountId: dto.accountId ?? null,
        paymentMethod: dto.paymentMethod ?? null,
        paidAt: dto.paidAt,
        note: dto.note ?? null,
        createdById: userId,
        transactionId,
      });
      const savedPayment = await em.save(OrderPayment, payment);

      // Recalculate payment status
      const allPayments = await em.find(OrderPayment, {
        where: { orderId: dto.orderId },
      });
      const totalPaid = allPayments.reduce((s, p) => s + Number(p.amount), 0);
      const orderTotal = Number(order.totalPrice);

      let newStatus: PaymentStatus;
      if (totalPaid >= orderTotal) {
        newStatus = PaymentStatus.PAID;
      } else if (totalPaid > 0) {
        newStatus = PaymentStatus.PARTIAL;
      } else {
        newStatus = PaymentStatus.UNPAID;
      }
      await em.update(Order, dto.orderId, { paymentStatus: newStatus });

      return savedPayment;
    });

    return this.findOne(saved.id);
  }

  // ── Find All ────────────────────────────────────────────────────────────────
  async findAll(filter: OrderPaymentFilterDto) {
    const { page = 1, limit = 20, orderId, orderNumber, accountId, from, to } = filter;

    const qb = this.paymentRepo
      .createQueryBuilder('p')
      .leftJoin('p.order', 'order')
      .leftJoin('order.address', 'address')
      .leftJoin('p.account', 'account')
      .leftJoin('p.createdBy', 'creator')
      .addSelect([
        'order.id', 'order.orderNumber', 'order.totalPrice',
        'order.status', 'order.paymentStatus', 'order.createdAt',
        'address.fullName', 'address.phone',
        'account.id', 'account.account_name', 'account.account_type',
        'creator.id', 'creator.name',
      ])
      .orderBy('p.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (orderId)     qb.andWhere('p.order_id = :orderId', { orderId });
    if (orderNumber) qb.andWhere('order.orderNumber ILIKE :on', { on: `%${orderNumber}%` });
    if (accountId)   qb.andWhere('p.account_id = :accountId', { accountId });
    if (from)        qb.andWhere('p.paidAt >= :from', { from });
    if (to)          qb.andWhere('p.paidAt <= :to', { to });

    const [data, total] = await qb.getManyAndCount();
    return {
      data,
      meta: { totalItems: total, totalPages: Math.ceil(total / limit), page, limit },
    };
  }

  // ── Payments for a single order ─────────────────────────────────────────────
  async findByOrder(orderId: string) {
    const order = await this.dataSource.getRepository(Order).findOne({
      where: { id: orderId },
      relations: ['items', 'address'],
    });
    if (!order) throw new NotFoundException('Order not found');

    const payments = await this.paymentRepo
      .createQueryBuilder('p')
      .leftJoin('p.account', 'account')
      .leftJoin('p.createdBy', 'creator')
      .addSelect([
        'account.id', 'account.account_name', 'account.account_type', 'account.mobile_provider',
        'creator.id', 'creator.name',
      ])
      .where('p.order_id = :orderId', { orderId })
      .orderBy('p.paidAt', 'ASC')
      .addOrderBy('p.createdAt', 'ASC')
      .getMany();

    const totalPaid = payments.reduce((s, p) => s + Number(p.amount), 0);
    const due = Math.max(0, Number(order.totalPrice) - totalPaid);

    return { order, payments, totalPaid, due };
  }

  // ── Search by invoice number ─────────────────────────────────────────────────
  async findByOrderNumber(orderNumber: string) {
    const order = await this.dataSource.getRepository(Order).findOne({
      where: { orderNumber },
      relations: ['items', 'address'],
    });
    if (!order) throw new NotFoundException(`Order not found: ${orderNumber}`);
    return this.findByOrder(order.id);
  }

  // ── Single payment ───────────────────────────────────────────────────────────
  async findOne(id: string): Promise<OrderPayment> {
    const p = await this.paymentRepo
      .createQueryBuilder('p')
      .leftJoin('p.order', 'order')
      .leftJoin('p.account', 'account')
      .addSelect(['order.id', 'order.orderNumber', 'account.id', 'account.account_name'])
      .where('p.id = :id', { id })
      .getOne();
    if (!p) throw new NotFoundException('Payment not found');
    return p;
  }

  // ── Delete Payment (reverse account balance) ─────────────────────────────────
  async remove(id: string): Promise<{ message: string }> {
    return this.dataSource.transaction(async (em) => {
      const payment = await em.findOne(OrderPayment, { where: { id } });
      if (!payment) throw new NotFoundException('Payment not found');

      // Reverse account balance
      if (payment.accountId) {
        const account = await em.findOne(AccountEntity, {
          where: { id: payment.accountId },
          lock: { mode: 'pessimistic_write' },
        });
        if (account) {
          account.current_balance =
            Number(account.current_balance) - Number(payment.amount);
          await em.save(AccountEntity, account);
        }
      }

      // Delete linked accounting transaction row (balance already reversed above)
      if (payment.transactionId) {
        const tx = await em.findOne(TransactionEntity, {
          where: { id: payment.transactionId },
        });
        if (tx) await em.remove(TransactionEntity, tx);
      }

      await em.remove(OrderPayment, payment);

      // Recalculate payment status
      const remaining = await em.find(OrderPayment, { where: { orderId: payment.orderId } });
      const order = await em.findOne(Order, { where: { id: payment.orderId } });
      if (order) {
        const totalPaid = remaining.reduce((s, p) => s + Number(p.amount), 0);
        const orderTotal = Number(order.totalPrice);
        let newStatus: PaymentStatus;
        if (totalPaid >= orderTotal) newStatus = PaymentStatus.PAID;
        else if (totalPaid > 0)      newStatus = PaymentStatus.PARTIAL;
        else                          newStatus = PaymentStatus.UNPAID;
        await em.update(Order, order.id, { paymentStatus: newStatus });
      }

      return { message: 'Payment deleted and balance restored' };
    });
  }
}
