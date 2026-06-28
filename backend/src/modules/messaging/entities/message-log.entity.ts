import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum LogChannel {
  EMAIL = 'email',
  SMS = 'sms',
  BOTH = 'both',
}

export enum RecipientType {
  SINGLE = 'single',
  MULTIPLE = 'multiple',
  ALL = 'all',
}

export enum MessageStatus {
  PENDING = 'pending',
  SENT = 'sent',
  PARTIAL = 'partial',
  FAILED = 'failed',
}

export interface MessageRecipient {
  userId?: string;
  name?: string;
  email?: string;
  phone?: string;
  status: 'sent' | 'failed';
  error?: string;
}

@Entity('message_logs')
export class MessageLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: LogChannel })
  channel: LogChannel;

  @Column({ type: 'enum', enum: RecipientType })
  recipientType: RecipientType;

  @Column({ type: 'varchar', nullable: true })
  subject: string | null;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'jsonb', nullable: true })
  recipients: MessageRecipient[];

  @Column({ type: 'int', default: 0 })
  totalSent: number;

  @Column({ type: 'int', default: 0 })
  totalFailed: number;

  @Column({ type: 'enum', enum: MessageStatus, default: MessageStatus.PENDING })
  status: MessageStatus;

  @Column({ type: 'uuid', nullable: true })
  sentBy: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
