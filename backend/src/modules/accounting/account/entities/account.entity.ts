import { UserEntity } from 'src/modules/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TransactionEntity } from '../../transaction/entities/transaction.entity';

export enum AccountType {
  CASH = 'cash',
  BANK = 'bank',
  MOBILE = 'mobile',
}

@Entity('accounts')
export class AccountEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  account_name: string;

  @Column({ type: 'enum', enum: AccountType })
  account_type: AccountType;

  @Column({ name: 'mobile_provider', nullable: true, length: 50 })
  mobile_provider: string; // e.g. Bkash, Nagad, Rocket

  @Column({
    name: 'opening_balance',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  opening_balance: number;

  @Column({
    name: 'current_balance',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  current_balance: number;

  @Column({ name: 'is_active', default: true })
  is_active: boolean;

  @ManyToOne(() => UserEntity, { nullable: true })
  createdBy: UserEntity;

  @OneToMany(() => TransactionEntity, (t) => t.account)
  transactions: TransactionEntity[];

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}