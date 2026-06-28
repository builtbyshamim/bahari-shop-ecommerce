import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ProductVariant } from './product-variant.entity';

@Entity('variant_images')
@Index(['variant_id'])
export class VariantImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ProductVariant, (variant) => variant.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  @Column({ type: 'uuid' })
  variant_id: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  altText: string;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;
}