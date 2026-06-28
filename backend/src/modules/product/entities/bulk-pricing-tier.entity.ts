import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';

// JSONB থেকে আলাদা table এ — queryable & indexable
// Product level অথবা Variant level এ bulk price দেওয়া যাবে

@Entity('bulk_pricing_tiers')
@Index(['product_id'])
@Index(['variant_id'])
export class BulkPricingTier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Product level bulk pricing (hasVariants = false)
  @ManyToOne(() => Product, (p) => p.bulkPricingTiers, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'uuid', nullable: true })
  product_id: string;

  // Variant level bulk pricing (hasVariants = true)
  @ManyToOne(() => ProductVariant, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  @Column({ type: 'uuid', nullable: true })
  variant_id: string;

  @Column({ type: 'int' })
  minQty: number;

  @Column({ type: 'int', nullable: true })
  maxQty: number; // null = no upper limit

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  discountPercent: number; // optional: show "10% off" instead
}