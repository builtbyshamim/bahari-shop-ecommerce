import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn, Index,
} from 'typeorm';
import { Inventory } from './inventory.entity';

export enum MovementType {
  // ── In ──────────────────────────
  INITIAL = 'initial',        // প্রথমবার stock set
  PURCHASE_IN = 'purchase_in',    // supplier থেকে stock এলো
  RETURN_IN = 'return_in',      // customer return এলো
  ADJUSTMENT_IN = 'adjustment_in',  // manual বাড়ানো (found, recount)
  TRANSFER_IN = 'transfer_in',    // অন্য জায়গা থেকে এলো

  // ── Out ─────────────────────────
  SALE_OUT = 'sale_out',       // order ship হলো
  ADJUSTMENT_OUT = 'adjustment_out', // manual কমানো (damaged, lost)
  DAMAGE_OUT = 'damage_out',     // নষ্ট/expired
  TRANSFER_OUT = 'transfer_out',   // অন্য জায়গায় গেলো
}

@Entity('stock_movements')
@Index(['inventory_id'])
@Index(['reference_id', 'reference_type'])
@Index(['created_at'])
export class StockMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  inventory_id: string;

  @ManyToOne(() => Inventory, (i) => i.movements, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inventory_id' })
  inventory: Inventory;

  @Column({ type: 'enum', enum: MovementType })
  movement_type: MovementType;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'int' })
  qty_before: number;

  @Column({ type: 'int' })
  qty_after: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  unit_cost_price: number | null; // এই movement এ প্রতিটার cost কত ছিল

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  unit_sale_price: number | null; 

  @Column({ type: 'uuid', nullable: true })
  reference_id: string | null;

  @Column({ type: 'varchar', nullable: true })
  reference_type: string | null;

  @Column({ type: 'text', nullable: true })
  note: string | null; // adjustment এর কারণ

  @Column({ type: 'uuid' })
  performed_by: string; // vendor user id বা admin id

  @CreateDateColumn()
  created_at: Date;
}