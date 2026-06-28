import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { MailModule } from 'src/modules/mail/mail.module';
import { MessageTemplate } from './entities/message-template.entity';
import { MessageLog } from './entities/message-log.entity';
import { MessageTemplateService } from './services/message-template.service';
import { SmsService } from './services/sms.service';
import { MessagingService } from './services/messaging.service';
import { MessageTemplateController } from './controllers/message-template.controller';
import { MessagingController } from './controllers/messaging.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageTemplate, MessageLog, UserEntity]),
    MailModule,
  ],
  providers: [MessageTemplateService, SmsService, MessagingService],
  controllers: [MessageTemplateController, MessagingController],
})
export class MessagingModule {}
