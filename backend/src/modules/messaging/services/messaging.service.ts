import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { UserRole } from 'src/common/shared/enums/user-role.enum';
import { MailService } from 'src/modules/mail/mail.service';
import { SmsService } from './sms.service';
import { MessageLog, LogChannel, MessageStatus, RecipientType, MessageRecipient } from '../entities/message-log.entity';
import { SendMessageDto, SendChannel, TargetType } from '../dto/send-message.dto';

@Injectable()
export class MessagingService {
  private readonly logger = new Logger(MessagingService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(MessageLog)
    private readonly logRepo: Repository<MessageLog>,
    private readonly mailService: MailService,
    private readonly smsService: SmsService,
  ) {}

  async send(dto: SendMessageDto, sentBy?: string): Promise<MessageLog> {
    const users = await this.resolveRecipients(dto);

    const log = this.logRepo.create({
      channel: dto.channel as unknown as LogChannel,
      recipientType: dto.targetType as unknown as RecipientType,
      subject: dto.subject ?? null,
      body: dto.body,
      sentBy: sentBy ?? null,
      status: MessageStatus.PENDING,
      recipients: [],
    });

    await this.logRepo.save(log);

    if (dto.channel === SendChannel.EMAIL || dto.channel === SendChannel.BOTH) {
      await this.dispatchEmails(users, dto, log);
    }

    if (dto.channel === SendChannel.SMS || dto.channel === SendChannel.BOTH) {
      await this.dispatchSms(users, dto, log);
    }

    log.status =
      log.totalFailed === 0 ? MessageStatus.SENT :
      log.totalSent === 0 ? MessageStatus.FAILED :
      MessageStatus.PARTIAL;

    return this.logRepo.save(log);
  }

  private async dispatchEmails(
    users: UserEntity[],
    dto: SendMessageDto,
    log: MessageLog,
  ) {
    const emailUsers = users.filter((u) => !!u.email);

    await Promise.allSettled(
      emailUsers.map(async (u) => {
        const personalised = dto.body.replace(/\{\{name\}\}/g, u.name || 'Customer');
        const recipient: MessageRecipient = {
          userId: u.id,
          name: u.name,
          email: u.email ?? undefined,
          status: 'sent',
        };
        try {
          await this.mailService.sendMail({
            to: u.email!,
            subject: dto.subject || 'Message from KCommerce',
            html: personalised,
          });
          log.totalSent++;
        } catch (err: any) {
          recipient.status = 'failed';
          recipient.error = err?.message;
          log.totalFailed++;
        }
        log.recipients = [...(log.recipients || []), recipient];
      }),
    );
  }

  private async dispatchSms(
    users: UserEntity[],
    dto: SendMessageDto,
    log: MessageLog,
  ) {
    const smsUsers = users.filter((u) => !!u.phone);
    const results = await this.smsService.sendBulk(
      smsUsers.map((u) => ({ phone: u.phone!, name: u.name })),
      dto.body,
    );

    for (const r of results) {
      const user = smsUsers.find((u) => u.phone === r.phone);
      const recipient: MessageRecipient = {
        userId: user?.id,
        name: user?.name,
        phone: r.phone,
        status: r.success ? 'sent' : 'failed',
        error: r.error,
      };
      if (r.success) log.totalSent++;
      else log.totalFailed++;
      log.recipients = [...(log.recipients || []), recipient];
    }
  }

  private async resolveRecipients(dto: SendMessageDto): Promise<UserEntity[]> {
    if (dto.targetType === TargetType.ALL) {
      return this.userRepo.find({
        where: { role: UserRole.CUSTOMER, isDeleted: false, isBanned: false },
        select: ['id', 'name', 'email', 'phone'],
      });
    }

    if (dto.targetType === TargetType.SINGLE || dto.targetType === TargetType.MULTIPLE) {
      if (!dto.userIds?.length) return [];
      return this.userRepo.find({
        where: { id: In(dto.userIds) },
        select: ['id', 'name', 'email', 'phone'],
      });
    }

    return [];
  }

  getLogs(page = 1, limit = 20): Promise<[MessageLog[], number]> {
    return this.logRepo.findAndCount({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });
  }
}
