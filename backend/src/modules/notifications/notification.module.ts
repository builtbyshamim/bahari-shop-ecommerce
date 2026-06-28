import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { FcmService } from './fcm.service';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [NotificationController],
  providers: [FcmService, NotificationService],
  exports: [FcmService, NotificationService],
})
export class NotificationModule {}
