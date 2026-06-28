import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CustomerRank } from './customer-rank.entity';

@Entity('customer_levels')
export class CustomerLevel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 10, nullable: true })
  badge: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  minAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  maxAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discountPercent: number;

  @Column({ default: false })
  isDefault: boolean;

  @Column({ default: 1 })
  sortOrder: number;

  @OneToMany(() => CustomerRank, (rank) => rank.level)
  ranks: CustomerRank[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}