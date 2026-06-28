import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { VariantImage } from './variant-image.entity';
import { VariantOptionValue } from './variant-option-value';

@Entity('product_variants')
@Index(['product_id'])
@Index(['sku'], { unique: true })
@Index(['isActive'])
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'uuid' })
  product_id: string;

  @Column({ unique: true })
  sku: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  compareAtPrice: number; // original price (crossed out price)

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  costPrice: number; // vendor cost (internal only)

  @Column({ type: 'int', nullable: true })
  stock: number; // null = unlimited

  @Column({ type: 'int', default: 0 })
  reservedStock: number; // reserved in pending orders

  // ─── Physical ─────────────────────────────────────────────────────
  @Column({ type: 'int', nullable: true })
  weightGrams: number;

  @Column({ type: 'jsonb', nullable: true })
  dimensions: {
    length: number; // cm
    width: number;
    height: number;
  };

  // ─── Digital ──────────────────────────────────────────────────────
  @Column({ nullable: true })
  digitalFileUrl: string;

  @Column({ nullable: true })
  digitalFileName: string;

  // ─── Service ──────────────────────────────────────────────────────
  @Column({ type: 'int', nullable: true })
  durationMinutes: number;

  // ─── Identifiers ──────────────────────────────────────────────────
  @Column({ nullable: true })
  barcode: string;

  @Column({ nullable: true })
  hsCode: string; // customs/shipping

  @Column({ default: true })
  isActive: boolean;

  // ─── Relations ────────────────────────────────────────────────────
  @OneToMany(() => VariantOptionValue, (vov) => vov.variant, { cascade: true })
  variantOptionValues: VariantOptionValue[];

  @OneToMany(() => VariantImage, (image) => image.variant, { cascade: true })
  images: VariantImage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // ─── Virtual / Computed ───────────────────────────────────────────
  get availableStock(): number | null {
    if (this.stock === null) return null;
    return Math.max(0, this.stock - this.reservedStock);
  }
}