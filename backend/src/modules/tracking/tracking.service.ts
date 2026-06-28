import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import axios from 'axios';
import { Order } from '../orders/entities/order.entity';
import { TrackingJobData } from './tracking.types';

@Injectable()
export class TrackingService {
  private readonly logger = new Logger(TrackingService.name);

  constructor(
    @InjectQueue('tracking') private readonly trackingQueue: Queue,
    private readonly configService: ConfigService,
  ) {}

  async enqueueTrackingJob(order: Order): Promise<void> {
    const jobData: TrackingJobData = {
      orderNumber: order.orderNumber,
      totalPrice: Number(order.totalPrice),
      createdAt: order.createdAt?.toISOString() ?? new Date().toISOString(),
      utmSource: order.utmSource ?? null,
      utmMedium: order.utmMedium ?? null,
      utmCampaign: order.utmCampaign ?? null,
      clickId: order.clickId ?? null,
      fbp: order.fbp ?? null,
      fbc: order.fbc ?? null,
      address: order.address
        ? { email: order.address.email, phone: order.address.phone }
        : null,
      items:
        order.items?.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })) ?? [],
    };

    await this.trackingQueue.add('purchase', jobData, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 200 },
    });
  }

  private hash(value: string | null | undefined): string | null {
    if (!value?.trim()) return null;
    return createHash('sha256')
      .update(value.trim().toLowerCase())
      .digest('hex');
  }

  async sendPurchaseEvent(data: TrackingJobData): Promise<void> {
    const pixelId = this.configService.get<string>('FB_PIXEL_ID');
    const accessToken = this.configService.get<string>('FB_ACCESS_TOKEN');

    if (!pixelId || !accessToken) {
      this.logger.warn('FB CAPI not configured (FB_PIXEL_ID / FB_ACCESS_TOKEN missing)');
      return;
    }

    const eventTime = Math.floor(new Date(data.createdAt).getTime() / 1000);

    const userData: Record<string, any> = {};
    const hashedEmail = this.hash(data.address?.email);
    const hashedPhone = this.hash(data.address?.phone);
    if (hashedEmail) userData.em = [hashedEmail];
    if (hashedPhone) userData.ph = [hashedPhone];
    if (data.fbp) userData.fbp = data.fbp;
    if (data.fbc) userData.fbc = data.fbc;

    const payload = {
      data: [
        {
          event_name: 'Purchase',
          event_time: eventTime,
          event_id: data.orderNumber,
          action_source: 'website',
          user_data: userData,
          custom_data: {
            currency: 'BDT',
            value: data.totalPrice,
            contents: data.items.map((i) => ({
              id: i.productId,
              quantity: i.quantity,
            })),
            content_type: 'product',
          },
        },
      ],
    };

    const url = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`;

    try {
      const res = await axios.post(url, payload, { timeout: 10000 });
      this.logger.log(
        `FB CAPI Purchase sent — order: ${data.orderNumber}, fbtrace_id: ${res.data?.fbtrace_id}`,
      );
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ?? err?.message ?? 'Unknown error';
      this.logger.error(`FB CAPI failed for order ${data.orderNumber}: ${msg}`);
      throw err;
    }
  }
}
