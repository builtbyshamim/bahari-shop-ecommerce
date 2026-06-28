import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { OrderItem } from './order.item.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { OrderAddress } from './order-address.entity';
import { OrderSource } from '../../order-sources/entities/order-source.entity';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}
export enum CourierServiceId {
  PATHAO = 1,
  STEADFAST = 2,
  REDX = 3,
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  PARTIAL = 'partial',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  CASH = 'Cash',
  BKASH = 'bkash',
  NAGAD = 'nagad',
  CARD = 'card',
  BANK = 'bank',
  SSL_COMMERCE = 'ssl_commerce',
  CASH_ON_DELIVERY = 'cash_on_delivery',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => OrderAddress, (address) => address.order, {
    cascade: true,
    eager: true,
  })
  address: OrderAddress;

  @Column({ unique: true })
  orderNumber: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.UNPAID })
  paymentStatus: PaymentStatus;

  @Column({ type: 'enum', enum: PaymentMethod, nullable: true })
  paymentMethod: PaymentMethod | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subTotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  couponDiscount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  deliveryCharge: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalPrice: number;

  @Column({ type: 'uuid', nullable: true })
  deliveryMethodId: string | null;

  @Column({ type: 'varchar', nullable: true })
  deliveryMethodName: string | null;

  @Column({ type: 'varchar', nullable: true })
  couponCode: string | null;

  @Column({ type: 'text', nullable: true })
  orderNote: string | null;

  // ── Courier fields ─────────────────────────────────────────────
  @Column({ type: 'int', nullable: true })
  courier_service_id: number | null;

  @Column({ type: 'int', nullable: true })
  courier_service_token_id: number | null;

  @Column({ type: 'varchar', nullable: true })
  consignment_id: string | null;

  @Column({ type: 'varchar', nullable: true })
  tracking_code: string | null;

  @Column({ type: 'varchar', nullable: true })
  courier_order_status: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  delivery_fee: number | null;
  // ──────────────────────────────────────────────────────────────

  @ManyToOne(() => UserEntity, { eager: true, nullable: false })
  @JoinColumn({ name: 'customer_id' })
  customer: UserEntity;

  @Column({ name: 'customer_id' })
  customerId: string;

  @ManyToOne(() => OrderSource, (source) => source.orders, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: 'order_source_id' })
  orderSource: OrderSource | null;

  @Column({ name: 'order_source_id', type: 'uuid', nullable: true })
  orderSourceId: string | null;

  // ── Created by (admin / employee who placed the order) ──────────
  @ManyToOne(() => UserEntity, { nullable: true, eager: false })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: UserEntity | null;

  @Column({ name: 'created_by_id', type: 'uuid', nullable: true })
  createdById: string | null;
  // ──────────────────────────────────────────────────────────────

  // ── Marketing / UTM tracking fields ────────────────────────────
  @Column({ type: 'varchar', nullable: true })
  utmSource: string | null;

  @Column({ type: 'varchar', nullable: true })
  utmMedium: string | null;

  @Column({ type: 'varchar', nullable: true })
  utmCampaign: string | null;

  @Column({ type: 'varchar', nullable: true })
  utmContent: string | null;

  @Column({ type: 'varchar', nullable: true })
  utmTerm: string | null;

  @Column({ type: 'varchar', nullable: true })
  clickId: string | null;

  @Column({ type: 'varchar', nullable: true })
  fbp: string | null;

  @Column({ type: 'varchar', nullable: true })
  fbc: string | null;
  // ──────────────────────────────────────────────────────────────

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: true,
  })
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
