import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CustomerLevel } from './customer-level.entity';

@Entity('customer_ranks')
export class CustomerRank {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  userId: string;

  @Column()
  levelId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalSpent: number;

  @Column({ type: 'timestamp', nullable: true })
  lastEvaluatedAt: Date;

  @ManyToOne(() => CustomerLevel, (level) => level.ranks, { eager: false })
  @JoinColumn({ name: 'levelId' })
  level: CustomerLevel;

  // Populated via join from UserEntity when needed
  user?: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}