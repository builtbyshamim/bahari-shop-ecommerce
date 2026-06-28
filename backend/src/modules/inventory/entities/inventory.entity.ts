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
@Index(['product_id', 'variant_id'], { unique: true })
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

  // null when hasVariants=false
  @Column({ type: 'uuid', nullable: true })
  variant_id: string | null;

  @ManyToOne(() => ProductVariant, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant | null;

  // ─── Stock Numbers ────────────────────────────────────────────────
  @Column({ type: 'int', default: 0 })
  qty_on_hand: number; // physical stock count

  @Column({ type: 'int', default: 0 })
  qty_reserved: number; // order placed but not yet shipped

  @Column({ type: 'int', default: 0 })
  qty_available: number; // = qty_on_hand - qty_reserved (always kept in sync)

  // ─── Settings ─────────────────────────────────────────────────────
  @Column({ type: 'int', default: 5 })
  low_stock_threshold: number; // triggers alert when stock falls below this

  @Column({ default: true })
  is_tracked: boolean; // when false, stock count is not tracked (digital/service)

  @Column({ default: false })
  allow_backorder: boolean; // whether orders are accepted when stock is 0


  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  avg_cost_price: number; // WAC — recalculated on every PURCHASE_IN

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_cost_value: number; // = qty_on_hand * avg_cost_price (quick reference)

  // ─── Relations ────────────────────────────────────────────────────
  @OneToMany(() => StockMovement, (m) => m.inventory, { cascade: true })
  movements: StockMovement[];

  @OneToMany(() => StockReservation, (r) => r.inventory, { cascade: true })
  reservations: StockReservation[];

  @UpdateDateColumn()
  updated_at: Date;
}