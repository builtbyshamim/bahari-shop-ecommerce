import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn, Index,
} from 'typeorm';
import { Inventory } from './inventory.entity';

export enum ReservationStatus {
  PENDING   = 'pending',   // cart / checkout এ hold
  CONFIRMED = 'confirmed', // order placed, payment done
  FULFILLED = 'fulfilled', // shipped → StockMovement(SALE_OUT) তৈরি হয়েছে
  RELEASED  = 'released',  // cancel বা expire → stock ফেরত
}

@Entity('stock_reservations')
@Index(['inventory_id', 'status'])
@Index(['order_id'])
@Index(['expires_at']) // cron job এর জন্য
export class StockReservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  inventory_id: string;

  @ManyToOne(() => Inventory, (i) => i.reservations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inventory_id' })
  inventory: Inventory;

  @Column({ type: 'uuid' })
  order_id: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'enum', enum: ReservationStatus, default: ReservationStatus.PENDING })
  status: ReservationStatus;

  // cart abandon হলে এই time এর পর auto-release হবে (cron দিয়ে)
  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date | null;

  @CreateDateColumn()
  created_at: Date;
}