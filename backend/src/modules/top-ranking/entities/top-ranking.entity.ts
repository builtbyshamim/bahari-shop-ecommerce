import { Product } from 'src/modules/product/entities/product.entity';
import { FeatureType } from 'src/modules/feature-types/entities/feature-type.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('top_rankings')
@Index(['productId', 'featureTypeId'])
@Index(['featureTypeId', 'priority'])
export class TopRanking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, (product) => product.rankings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'uuid' })
  productId: string;

  @ManyToOne(() => FeatureType, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'featureTypeId' })
  featureType: FeatureType;

  @Column({ type: 'uuid' })
  featureTypeId: string;

  @Column({ type: 'int', default: 0 })
  priority: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, default: 0 })
  score: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  startAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  endAt: Date;

  @Column({ type: 'uuid' })
  addedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
