import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { ProductOption } from './product-option.entity';
import { VariantOptionValue } from './variant-option-value';

@Entity('product_option_values')
@Index(['option_id'])
export class ProductOptionValue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ProductOption, (option) => option.values, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'option_id' })
  option: ProductOption;

  @Column({ type: 'uuid' })
  option_id: string;

  @Column()
  value: string; // "Red", "M", "Cotton"

  @Column({ nullable: true })
  colorHex: string; // optional: Color option এর জন্য (#FF0000)

  @Column({ type: 'int', default: 0 })
  position: number;

  @OneToMany(() => VariantOptionValue, (vov) => vov.optionValue)
  variantOptionValues: VariantOptionValue[];
}