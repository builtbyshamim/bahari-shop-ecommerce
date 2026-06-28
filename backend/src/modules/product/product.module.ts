import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductOption } from './entities/product-option.entity';
import { ProductOptionValue } from './entities/product-option-value';
import { ProductVariant } from './entities/product-variant.entity';
import { VariantOptionValue } from './entities/variant-option-value';
import { ProductImage } from './entities/product-image.entity';
import { VariantImage } from './entities/variant-image.entity';
import { BulkPricingTier } from './entities/bulk-pricing-tier.entity';
import { ProductImagesService } from './product-images-service';
import { ProductViewService } from './product-view.services';
import { ProductViewController } from './product-view.controller';
import { CategoriesModule } from '../categories/categories.module';
import { InventoryModule } from '../inventory/inventory.module';
import { ReviewModule } from './review/review.module';
import { FeatureType } from '../feature-types/entities/feature-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductOption,
      ProductOptionValue,
      ProductVariant,
      VariantOptionValue,
      ProductImage,
      VariantImage,
      BulkPricingTier,
      FeatureType,
    ]),
    CategoriesModule,
    InventoryModule,
    ReviewModule,
  ],
  providers: [ProductService, ProductImagesService, ProductViewService],
  controllers: [ProductController, ProductViewController],
  exports: [ProductService, ProductViewService, TypeOrmModule],
})
export class ProductModule { }
