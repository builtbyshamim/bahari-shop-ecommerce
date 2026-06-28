import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { TrackingJobData } from './tracking.types';

@Processor('tracking')
export class TrackingProcessor extends WorkerHost {
  private readonly logger = new Logger(TrackingProcessor.name);

  constructor(private readonly trackingService: TrackingService) {
    super();
  }

  async process(job: Job<TrackingJobData>): Promise<void> {
    this.logger.log(`Processing tracking job for order ${job.data.orderNumber}`);
    await this.trackingService.sendPurchaseEvent(job.data);
  }
}
