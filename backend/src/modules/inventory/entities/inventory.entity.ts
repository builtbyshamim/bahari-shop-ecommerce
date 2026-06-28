import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, OneToMany, JoinColumn,
  UpdateDateColumn, Index,
} from 'typeorm';
import { StockMovement } from './stock-movement.entity';
import { StockReservation } from './stock-reservation.entity';
import { ProductVariant } from 'src/modules/product/entities/product-variant.entity';
import { Product } from 'src/modules/product/entities/product.entity';

@Entity('inventory')
@Index(['product_id', 'variant_id'], { unique: true }) // একটা product/variant এর একটাই row
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  vendor_id: string;

  @Column({ type: 'uuid' })
  product_id: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  // hasVariants=false হলে এটা null
  @Column({ type: 'uuid', nullable: true })
  variant_id: string | null;

  @ManyToOne(() => ProductVariant, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant | null;

  // ─── Stock Numbers ────────────────────────────────────────────────
  @Column({ type: 'int', default: 0 })
  qty_on_hand: number; // physically যা আছে

  @Column({ type: 'int', default: 0 })
  qty_reserved: number; // order placed কিন্তু এখনো ship হয়নি

  @Column({ type: 'int', default: 0 })
  qty_available: number; // = qty_on_hand - qty_reserved (সবসময় sync রাখতে হবে)

  // ─── Settings ─────────────────────────────────────────────────────
  @Column({ type: 'int', default: 5 })
  low_stock_threshold: number; // এর নিচে গেলে alert

  @Column({ default: true })
  is_tracked: boolean; // false হলে stock count ধরা হয় না (digital/service)

  @Column({ default: false })
  allow_backorder: boolean; // stock 0 হলেও order নেওয়া যাবে কিনা


  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  avg_cost_price: number; // WAC — প্রতিটা PURCHASE_IN এ recalculate হবে

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_cost_value: number; // = qty_on_hand × avg_cost_price (quick reference)

  // ─── Relations ────────────────────────────────────────────────────
  @OneToMany(() => StockMovement, (m) => m.inventory, { cascade: true })
  movements: StockMovement[];

  @OneToMany(() => StockReservation, (r) => r.inventory, { cascade: true })
  reservations: StockReservation[];

  @UpdateDateColumn()
  updated_at: Date;
}