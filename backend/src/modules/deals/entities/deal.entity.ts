import { Product } from "src/modules/product/entities/product.entity";
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum DealType {
    TOP = 'top',
    FLASH = 'flash',
    CAMPAIGN = 'campaign',
}

export enum DiscountType {
    PERCENT = 'percent',
    FIXED = 'fixed',
}

@Entity('deals')
@Index(['productId'])
export class Deal {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Product, (product) => product.images, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'productId' })
    product: Product;

    @Column({ type: 'uuid' })
    productId: string;

    @Column({ type: 'enum', enum: DealType })
    type: DealType;

    @Column({ type: 'enum', enum: DiscountType })
    discountType: DiscountType;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    discountValue: number;

    @Column({ type: 'timestamp' })
    startAt: Date;

    @Column({ type: 'timestamp' })
    endAt: Date;

    @Column({ type: 'int', default: 0 })
    priority: number;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @Column({ type: 'uuid' })
    addedBy: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}