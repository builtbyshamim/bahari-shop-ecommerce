import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_images')
@Index(['productId'])
export class ProductImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, (product) => product.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'uuid' })
  productId: string;

  @Column()
  url: string;

  @Column()
  fileId: string;

  @Column({ nullable: true })
  altText: string;

  @Column({ default: false })
  isThumbnail: boolean; // main display image

  @Column({ type: 'int', default: 0 })
  sortOrder: number;
}