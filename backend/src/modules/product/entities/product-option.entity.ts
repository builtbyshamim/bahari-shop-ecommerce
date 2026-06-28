import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Product } from './product.entity';
import { ProductOptionValue } from './product-option-value';

@Entity('product_options')
@Index(['product_id'])
export class ProductOption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, (product) => product.options, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'uuid' })
  product_id: string;

  @Column()
  name: string; // "Color", "Size", "Material"

  @Column({ type: 'int', default: 0 })
  position: number; // display order

  @OneToMany(() => ProductOptionValue, (val) => val.option, { cascade: true })
  values: ProductOptionValue[];
}