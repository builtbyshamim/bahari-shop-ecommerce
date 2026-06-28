import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { SslPayment, SslPaymentStatus } from './entities/ssl-payment.entity';
import { Order, PaymentStatus } from '../orders/entities/order.entity';
import { OrderPaymentsService } from '../order-payments/order-payments.service';

@Injectable()
export class SslPaymentService {
  private readonly logger = new Logger(SslPaymentService.name);
  private readonly storeId: string;
  private readonly storePasswd: string;
  private readonly sslApiUrl: string;
  private readonly sslValidationUrl: string;
  private readonly backendUrl: string;
  private readonly frontendUrl: string;
  private readonly sslAccountId: string | null;

  constructor(
    @InjectRepository(SslPayment)
    private readonly sslPaymentRepo: Repository<SslPayment>,

    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,

    private readonly configService: ConfigService,
    private readonly orderPaymentsService: OrderPaymentsService,
  ) {
    this.storeId = configService.get<string>('SSL_STORE_ID') || 'testbox';
    this.storePasswd = configService.get<string>('SSL_STORE_PASSWD') || 'qwerty';
    this.sslApiUrl =
      configService.get<string>('SSL_API_URL') ||
      'https://sandbox.sslcommerz.com/gwprocess/v4/api.php';
    this.sslValidationUrl =
      configService.get<string>('SSL_VALIDATION_URL') ||
      'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php';
    this.backendUrl =
      configService.get<string>('BACKEND_URL') || 'http://localhost:5000';
    this.frontendUrl =
      configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    this.sslAccountId = configService.get<string>('SSL_ACCOUNT_ID') || null;
  }

  // ─── Initiate SSL Commerce payment ────────────────────────────────────────────
  async initiate(orderId: string): Promise<{ gatewayUrl: string; tranId: string }> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['address', 'items'],
    });
    if (!order) throw new NotFoundException('Order not found');

    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Order is already paid');
    }

    const tranId = randomUUID();
    const amount = Number(order.totalPrice);

    const params = new URLSearchParams({
      store_id: this.storeId,
      store_passwd: this.storePasswd,
      total_amount: amount.toFixed(2),
      currency: 'BDT',
      tran_id: tranId,
      success_url: `${this.backendUrl}/api/v1/ssl-payment/success`,
      fail_url: `${this.backendUrl}/api/v1/ssl-payment/fail`,
      cancel_url: `${this.backendUrl}/api/v1/ssl-payment/cancel`,
      ipn_url: `${this.backendUrl}/api/v1/ssl-payment/ipn`,
      cus_name: order.address?.fullName || 'Customer',
      cus_email: order.address?.email || 'customer@example.com',
      cus_add1: order.address?.fullAddress || 'Dhaka, Bangladesh',
      cus_city: 'Dhaka',
      cus_country: 'Bangladesh',
      cus_phone: order.address?.phone || '01711111111',
      shipping_method: 'Courier',
      product_name: `Order #${order.orderNumber}`,
      product_category: 'General',
      product_profile: 'general',
      num_of_item: String(order.items?.length || 1),
    });

    const response = await fetch(this.sslApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const data = (await response.json()) as any;

    if (data.status !== 'SUCCESS' || !data.GatewayPageURL) {
      this.logger.error('SSL initiation failed', data);
      throw new BadRequestException(
        data.failedreason || 'SSL Commerce payment initiation failed',
      );
    }

    const sslPayment = this.sslPaymentRepo.create({
      orderId,
      tranId,
      amount,
      status: SslPaymentStatus.PENDING,
    });
    await this.sslPaymentRepo.save(sslPayment);

    return { gatewayUrl: data.GatewayPageURL, tranId };
  }

  // ─── Validate payment and record in accounting ────────────────────────────────
  async validateAndComplete(body: Record<string, any>): Promise<string> {
    const { val_id, tran_id } = body;

    if (!tran_id) throw new BadRequestException('Missing tran_id');

    const sslPayment = await this.sslPaymentRepo.findOne({
      where: { tranId: tran_id },
    });
    if (!sslPayment) throw new NotFoundException('SSL payment record not found');

    // Idempotency — already successfully processed
    if (sslPayment.status === SslPaymentStatus.SUCCESS) {
      return sslPayment.orderId;
    }

    if (!val_id) {
      await this.markFailed(sslPayment, body);
      throw new BadRequestException('Missing val_id — payment not validated');
    }

    // Validate with SSL Commerce validation API
    const validationUrl = new URL(this.sslValidationUrl);
    validationUrl.searchParams.set('val_id', String(val_id));
    validationUrl.searchParams.set('store_id', this.storeId);
    validationUrl.searchParams.set('store_passwd', this.storePasswd);
    validationUrl.searchParams.set('format', 'json');

    let vData: any;
    try {
      const vRes = await fetch(validationUrl.toString());
      vData = await vRes.json();
    } catch (err) {
      this.logger.error('SSL validation API error', err);
      throw new BadRequestException('SSL validation API unreachable');
    }

    if (vData.status !== 'VALID' || vData.tran_id !== tran_id) {
      this.logger.warn('SSL validation failed', vData);
      await this.markFailed(sslPayment, body);
      throw new BadRequestException('SSL Commerce payment validation failed');
    }

    // Mark SSL payment as successful
    sslPayment.valId = String(val_id);
    sslPayment.status = SslPaymentStatus.SUCCESS;
    sslPayment.sslResponse = body;
    await this.sslPaymentRepo.save(sslPayment);

    // ── Record payment in accounting ledger ──────────────────────────────────
    const today = new Date().toISOString().split('T')[0];
    try {
      await this.orderPaymentsService.create(
        {
          orderId: sslPayment.orderId,
          amount: Number(sslPayment.amount),
          accountId: this.sslAccountId || undefined,
          paymentMethod: 'ssl_commerce',
          paidAt: today,
          note: `SSL Commerce payment verified. Val ID: ${val_id}, Tran ID: ${tran_id}`,
        },
        null,
      );
    } catch (err: any) {
      // Payment already recorded (if IPN and success_url both fire) — safe to ignore
      this.logger.warn('Order payment creation skipped (possibly duplicate):', err?.message);
    }

    return sslPayment.orderId;
  }

  // ─── Mark FAILED ──────────────────────────────────────────────────────────────
  async markFailed(
    sslPayment: SslPayment,
    body: Record<string, any>,
  ): Promise<void> {
    sslPayment.status = SslPaymentStatus.FAILED;
    sslPayment.sslResponse = body;
    await this.sslPaymentRepo.save(sslPayment);
  }

  // ─── Handle fail callback ─────────────────────────────────────────────────────
  async handleFail(body: Record<string, any>): Promise<void> {
    const { tran_id } = body;
    if (!tran_id) return;
    const sslPayment = await this.sslPaymentRepo.findOne({
      where: { tranId: String(tran_id) },
    });
    if (sslPayment && sslPayment.status === SslPaymentStatus.PENDING) {
      await this.markFailed(sslPayment, body);
    }
  }

  // ─── Handle cancel callback ───────────────────────────────────────────────────
  async handleCancel(body: Record<string, any>): Promise<void> {
    const { tran_id } = body;
    if (!tran_id) return;
    const sslPayment = await this.sslPaymentRepo.findOne({
      where: { tranId: String(tran_id) },
    });
    if (sslPayment && sslPayment.status === SslPaymentStatus.PENDING) {
      sslPayment.status = SslPaymentStatus.CANCELLED;
      sslPayment.sslResponse = body;
      await this.sslPaymentRepo.save(sslPayment);
    }
  }

  // ─── Get front-end URL for redirects ─────────────────────────────────────────
  getFrontendUrl(): string {
    return this.frontendUrl;
  }
}
