import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TrackingService } from './tracking.service';
import { TrackingProcessor } from './tracking.processor';

@Module({
  imports: [BullModule.registerQueue({ name: 'tracking' })],
  providers: [TrackingService, TrackingProcessor],
  exports: [TrackingService],
})
export class TrackingModule {}
