import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productId: string;

  @Column({ type: 'uuid', nullable: true })
  assignedVariantPriceId:  string | null;

  @Column()
  name: string;

  @Column({ type: "varchar", nullable: true })
  image: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  salePrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  withoutDiscountPrice: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  lineTotal: number;

  // e.g. { "Color": "Maroon", "Size": "S" }
  @Column({ type: 'jsonb', nullable: true })
  selectedVariantOptions: Record<string, string> | null;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn()
  order: Order;
}