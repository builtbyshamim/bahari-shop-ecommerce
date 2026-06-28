import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ProductVariant } from './product-variant.entity';
import { ProductImage } from './product-image.entity';
import { ProductOption } from './product-option.entity';
import { BulkPricingTier } from './bulk-pricing-tier.entity';
import { Category } from 'src/modules/categories/entities/category.entity';
import { Brand } from 'src/modules/brand/entities/brand.entity';
import { Deal } from 'src/modules/deals/entities/deal.entity';
import { TopRanking } from 'src/modules/top-ranking/entities/top-ranking.entity';
import { FeatureType } from 'src/modules/feature-types/entities/feature-type.entity';

export enum ProductType {
  PHYSICAL = 'physical',
  DIGITAL = 'digital',
  SERVICE = 'service',
}

export enum ProductStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DISABLED = 'disabled',
}

@Entity('products')
@Index(['vendor_id'])
@Index(['slug'], { unique: true })
@Index(['productStatus'])
@Index(['categoryId'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  shortDescription: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  specifications: string;

  @Column({
    type: 'enum',
    enum: ProductType,
    default: ProductType.PHYSICAL,
  })
  type: ProductType;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.APPROVED,
  })
  productStatus: ProductStatus;

  @Column({ default: true })
  isActive: boolean;

  // ─── Simple Product Support ──────────────────────────────────────
  // hasVariants = false হলে basePrice/baseStock use হয়
  // hasVariants = true হলে variants থেকে price/stock নেওয়া হয়
  @Column({ default: false })
  hasVariants: boolean;

  @Column({ type: 'varchar', nullable: true })
  sku: string;

  @Column({ type: 'int', default: 0 })
  priority: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  basePrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  compareAtPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  costPrice: number; // vendor cost (internal only)

  @Column({ type: 'int', nullable: true })
  baseStock: number;

  // ─── Relations ────────────────────────────────────────────────────
  @OneToMany(() => ProductOption, (option) => option.product, { cascade: true })
  options: ProductOption[];

  @OneToMany(() => ProductVariant, (variant) => variant.product, {
    cascade: true,
  })
  variants: ProductVariant[];

  @OneToMany(() => ProductImage, (image) => image.product, { cascade: true })
  images: ProductImage[];

  @OneToMany(() => BulkPricingTier, (tier) => tier.product, { cascade: true })
  bulkPricingTiers: BulkPricingTier[];

  @OneToMany(() => Deal, (deal) => deal.product)
  deals: Deal[];

  @OneToMany(() => TopRanking, (ranking) => ranking.product)
  rankings: TopRanking[];

  // ─── Vendor / Category / Brand ───────────────────────────────────
  @Column({ type: 'uuid' })
  vendor_id: string;

  @Column({ type: 'uuid', nullable: true })
  categoryId: string;

  @ManyToOne(() => Category, { nullable: true, eager: false })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ type: 'uuid', nullable: true })
  brandId: string;

  @ManyToOne(() => Brand, { nullable: true, eager: false })
  @JoinColumn({ name: 'brandId' })
  brand: Brand;

  // ─── SEO ──────────────────────────────────────────────────────────
  @Column({ type: 'jsonb', nullable: true })
  seoMeta: {
    title: string;
    description: string;
    keywords: string[];
  };

  // ─── B2B Fields ───────────────────────────────────────────────────
  @Column({ type: 'int', default: 1 })
  moq: number; // Minimum Order Quantity

  // ─── Feature Type ─────────────────────────────────────────────────
  @Column({ type: 'uuid', nullable: true })
  featureTypeId: string;

  @ManyToOne(() => FeatureType, { nullable: true, eager: false })
  @JoinColumn({ name: 'featureTypeId' })
  featureType: FeatureType;

  // ─── Admin ────────────────────────────────────────────────────────
  @Column({ nullable: true })
  rejectionReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
