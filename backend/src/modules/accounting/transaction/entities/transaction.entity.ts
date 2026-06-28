import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { AccountEntity } from '../../account/entities/account.entity';
import { AccountingCategoryEntity } from '../../category/entities/category.entity';
import { UserEntity } from 'src/modules/users/entities/user.entity';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

@Entity('accounting_transactions')
export class TransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ type: 'date' })
  date: string;

  // ─── Account ──────────────────────────────────────────────────────────────
  // nullable: true here matches the existing DB column so TypeORM sync won't crash
  @Column({ name: 'account_id', nullable: true })
  account_id: string;

  @ManyToOne(() => AccountEntity, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'account_id' })
  account: AccountEntity;

  // ─── Category ─────────────────────────────────────────────────────────────
  @Column({ name: 'category_id', nullable: true })
  category_id: string;

  @ManyToOne(() => AccountingCategoryEntity, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category: AccountingCategoryEntity;

  // ─── User ─────────────────────────────────────────────────────────────────
  @Column({ name: 'user_id', nullable: true })
  user_id: string;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}