// src/modules/product/entities/variant-image.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ProductVariant } from './product-variant.entity';

@Entity('variant_images')
export class VariantImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ProductVariant, (variant) => variant.images, {
    onDelete: 'CASCADE',
  })
  variant: ProductVariant;

  @Column()
  url: string;

  @Column({ default: 0 })
  sortOrder: number;
}
