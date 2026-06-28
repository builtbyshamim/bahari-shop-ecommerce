import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  Index,
  Unique,
} from 'typeorm';
import { ProductVariant } from './product-variant.entity';
import { ProductOptionValue } from './product-option-value';

// Variant ↔ OptionValue bridge table
// Example: Variant "Red-M" has two rows:
//   variant_id → optionValue "Red"
//   variant_id → optionValue "M"

@Entity('variant_option_values')
@Unique(['variant_id', 'option_value_id'])
@Index(['variant_id'])
@Index(['option_value_id'])
export class VariantOptionValue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ProductVariant, (v) => v.variantOptionValues, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  @Column({ type: 'uuid' })
  variant_id: string;

  @ManyToOne(() => ProductOptionValue, (ov) => ov.variantOptionValues, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'option_value_id' })
  optionValue: ProductOptionValue;

  @Column({ type: 'uuid' })
  option_value_id: string;
}