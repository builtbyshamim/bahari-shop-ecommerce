import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import slugify from 'slugify';

import { Product, ProductStatus } from './entities/product.entity';
import { ProductOption } from './entities/product-option.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductImage } from './entities/product-image.entity';
import { VariantImage } from './entities/variant-image.entity';
import { BulkPricingTier } from './entities/bulk-pricing-tier.entity';

import { CreateProductDto } from './dto/create-product.dto';
import { ProductOptionValue } from './entities/product-option-value';
import { VariantOptionValue } from './entities/variant-option-value';
import { generateId } from 'src/common/helpers/helpers';
import { GetProductsDto } from './dto/get-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    @InjectRepository(ProductOption)
    private readonly optionRepo: Repository<ProductOption>,

    @InjectRepository(ProductOptionValue)
    private readonly optionValueRepo: Repository<ProductOptionValue>,

    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,

    @InjectRepository(VariantOptionValue)
    private readonly variantOptionValueRepo: Repository<VariantOptionValue>,

    @InjectRepository(ProductImage)
    private readonly productImageRepo: Repository<ProductImage>,

    @InjectRepository(VariantImage)
    private readonly variantImageRepo: Repository<VariantImage>,

    @InjectRepository(BulkPricingTier)
    private readonly bulkPricingRepo: Repository<BulkPricingTier>,

    private readonly dataSource: DataSource, // transaction এর জন্য
  ) {}

  // ─── Create Product ─────────────────────────────────────────────
  async createProduct(vendorId: string, dto: CreateProductDto) {
    try {
      // Validation
      if (dto.hasVariants) {
        if (!dto.options?.length)
          throw new BadRequestException('Variant product requires options');
        if (!dto.variants?.length)
          throw new BadRequestException('Variant product requires variants');
        this.validateVariantOptionValues(dto);
      }
      // সব কিছু একটা transaction এ করি — যেকোনো step fail করলে rollback হবে
      return await this.dataSource.transaction(async (manager) => {
        // ── Step 1: Product Save ─────────────────────────────────────
        const slug = await this.generateUniqueSlug(dto.name);

        const product = manager.create(Product, {
          name: dto.name,
          slug,
          description: dto.description,
          priority: dto.priority,
          shortDescription: dto.shortDescription,
          specifications: dto.specifications,
          type: dto.type,
          vendor_id: vendorId,
          categoryId: dto.categoryId,
          costPrice: dto.costPrice,
          compareAtPrice: dto.compareAtPrice,
          brandId: dto.brandId,
          featureTypeId: dto.featureTypeId,
          moq: dto.moq ?? 1,
          seoMeta: dto.seoMeta,
          hasVariants: dto.hasVariants,
          basePrice: dto.hasVariants ? 0 : dto.basePrice,
          baseStock: dto.hasVariants ? 0 : dto.baseStock,
          productStatus: ProductStatus.APPROVED,
        });
        await manager.save(product);

        // ── Step 3: Simple Product Bulk Pricing ──────────────────────
        if (!dto.hasVariants && dto.bulkPricingTiers?.length) {
          const tiers = dto.bulkPricingTiers.map((tier) =>
            manager.create(BulkPricingTier, {
              product_id: product.id,
              minQty: tier.minQty,
              maxQty: tier.maxQty,
              price: tier.price,
              discountPercent: tier.discountPercent,
            }),
          );
          await manager.save(tiers);
        }

        // ── Step 4: Options & Variants (variant product only) ────────
        if (dto.hasVariants) {
          // option value name → entity map (service এ lookup করতে)
          const optionValueMap = new Map<string, ProductOptionValue>();
          const options = dto.options ?? [];
          const variants = dto.variants ?? [];
          // Options save
          for (const [optIdx, optDto] of options.entries()) {
            const option = manager.create(ProductOption, {
              product_id: product.id,
              name: optDto.name,
              position: optDto.position ?? optIdx,
            });
            await manager.save(option);

            // Option Values save
            for (const [valIdx, valDto] of optDto.values.entries()) {
              const optionValue = manager.create(ProductOptionValue, {
                option_id: option.id,
                value: valDto.value,
                colorHex: valDto.colorHex,
                position: valDto.position ?? valIdx,
              });
              await manager.save(optionValue);
              optionValueMap.set(valDto.value, optionValue); // "Red" → entity
            }
          }
          // Variants save
          for (const variantDto of variants) {
            const sku = variantDto.sku
              ? variantDto.sku
              : await this.generateSKU(dto.name, variantDto.optionValues);

            // SKU duplicate check
            const skuExists = await manager.findOne(ProductVariant, {
              where: { sku },
            });

            if (skuExists)
              throw new ConflictException(`SKU "${sku}" already exists`);

            const variant = manager.create(ProductVariant, {
              product_id: product.id,
              sku,
              price: variantDto.price,
              compareAtPrice: variantDto.compareAtPrice,
              costPrice: variantDto.costPrice,
              stock: variantDto.stock ?? 0,
              weightGrams: variantDto.weightGrams,
              dimensions: variantDto.dimensions,
              digitalFileUrl: variantDto.digitalFileUrl,
              digitalFileName: variantDto.digitalFileName,
              durationMinutes: variantDto.durationMinutes,
              barcode: variantDto.barcode,
              hsCode: variantDto.hsCode,
            });
            await manager.save(variant);

            // VariantOptionValue bridge rows save
            for (const valueStr of variantDto.optionValues) {
              const optionValue = optionValueMap.get(valueStr);
              if (!optionValue) {
                throw new BadRequestException(
                  `Option value "${valueStr}" not found in product options`,
                );
              }
              const vov = manager.create(VariantOptionValue, {
                variant_id: variant.id,
                option_value_id: optionValue.id,
              });
              await manager.save(vov);
            }

            // // Variant Images
            // if (variantDto.images?.length) {
            //   const variantImages = variantDto.images.map((img, idx) =>
            //     manager.create(VariantImage, {
            //       variant_id: variant.id,
            //       url: img.url,
            //       altText: img.altText,
            //       sortOrder: img.sortOrder ?? idx,
            //     }),
            //   );
            //   await manager.save(variantImages);
            // }

            // Variant level Bulk Pricing
            if (variantDto.bulkPricingTiers?.length) {
              const tiers = variantDto.bulkPricingTiers.map((tier) =>
                manager.create(BulkPricingTier, {
                  variant_id: variant.id,
                  minQty: tier.minQty,
                  maxQty: tier.maxQty,
                  price: tier.price,
                  discountPercent: tier.discountPercent,
                }),
              );
              await manager.save(tiers);
            }
          }
        }

        // Full product return with relations
        return manager.findOne(Product, {
          where: { id: product.id },
          relations: [
            'options',
            'options.values',
            'variants',
            'variants.variantOptionValues',
            'variants.variantOptionValues.optionValue',
            'variants.images',
            'images',
            'bulkPricingTiers',
          ],
        });
      });
    } catch (error) {
      console.log(error, 'errorerror');
      throw new BadRequestException(
        error.message || 'Failed to create product',
      );
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────
  private async generateUniqueSlug(name: string): Promise<string> {
    const nanoid = await generateId(6);
    const base = slugify(name, { lower: true, strict: true });
    let slug = base;
    let attempt = 0;
    while (await this.productRepo.findOne({ where: { slug } })) {
      slug = `${base}-${nanoid}`;
      if (++attempt > 5) throw new Error('Failed to generate unique slug');
    }
    return slug;
  }

  private async generateSKU(
    productName: string,
    optionValues: string[],
  ): Promise<string> {
    const nanoid = await generateId(4);
    const prefix = productName
      .split(' ')
      .map((w) => w[0].toUpperCase())
      .join('')
      .slice(0, 4);
    const suffix = optionValues
      .map((v) => v.slice(0, 3).toUpperCase())
      .join('-');
    const unique = nanoid.toUpperCase();
    console.log(unique, 'unique');
    return `${prefix}-${suffix}-${unique}`;
  }

  // Variant এর optionValues গুলো defined options এ আছে কিনা check
  private validateVariantOptionValues(dto: CreateProductDto): void {
    const allDefinedValues = new Set(
      (dto.options ?? []).flatMap((o) => o.values.map((v) => v.value)),
    );
    for (const variant of dto.variants ?? []) {
      for (const val of variant.optionValues) {
        if (!allDefinedValues.has(val)) {
          throw new BadRequestException(
            `Variant option value "${val}" is not defined in product options`,
          );
        }
      }
    }
  }
  // get product
  async getProducts(dto: GetProductsDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;
    const skip = (page - 1) * limit;

    const qb = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.options', 'options')
      .leftJoinAndSelect('options.values', 'optionValues')
      .leftJoinAndSelect('product.variants', 'variants')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.bulkPricingTiers', 'bulkPricingTiers')
      .orderBy('product.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    // PaginationQueryDto থেকে আসা search
    if (dto.search) {
      qb.andWhere(
        '(product.name ILIKE :search OR product.slug ILIKE :search)',
        { search: `%${dto.search}%` },
      );
    }

    // PaginationQueryDto থেকে আসা date range
    if (dto.startDate) {
      qb.andWhere('product.createdAt >= :startDate', {
        startDate: dto.startDate,
      });
    }
    if (dto.endDate) {
      qb.andWhere('product.createdAt <= :endDate', { endDate: dto.endDate });
    }

    if (dto.status) {
      qb.andWhere('product.productStatus = :status', { status: dto.status });
    }

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        totalItems: total,
        itemCount: data.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }

  async updateProduct(productId: string, dto: UpdateProductDto) {
    try {
      const product = await this.productRepo.findOne({
        where: { id: productId },
      });
      if (!product) throw new BadRequestException('Product not found');

      return await this.dataSource.transaction(async (manager) => {
        // Basic fields update
        await manager.update(Product, productId, {
          ...(dto.name && { name: dto.name }),
          ...(dto.description !== undefined && {
            description: dto.description,
          }),
          ...(dto.shortDescription !== undefined && {
            shortDescription: dto.shortDescription,
          }),
          ...(dto.compareAtPrice !== undefined && {
            compareAtPrice: dto.compareAtPrice,
          }),

          ...(dto.specifications !== undefined && {
            specifications: dto.specifications,
          }),
          ...(dto.type && { type: dto.type }),
          ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
          ...(dto.brandId !== undefined && { brandId: dto.brandId }),
          ...(dto.featureTypeId !== undefined && {
            featureTypeId: dto.featureTypeId,
          }),
          ...(dto.moq !== undefined && { moq: dto.moq }),
          ...(dto.priority !== undefined && { priority: dto.priority }),
          ...(dto.seoMeta !== undefined && { seoMeta: dto.seoMeta }),
          ...(dto.basePrice !== undefined &&
            !dto.hasVariants && { basePrice: dto.basePrice }),
          ...(dto.baseStock !== undefined &&
            !dto.hasVariants && { baseStock: dto.baseStock }),
        });

        // Simple product bulk pricing update
        if (!product.hasVariants && dto.bulkPricingTiers !== undefined) {
          await manager.delete(BulkPricingTier, { product_id: productId });
          if (dto.bulkPricingTiers.length) {
            const tiers = dto.bulkPricingTiers.map((tier) =>
              manager.create(BulkPricingTier, {
                product_id: productId,
                minQty: tier.minQty,
                maxQty: tier.maxQty,
                price: tier.price,
                discountPercent: tier.discountPercent,
              }),
            );
            await manager.save(tiers);
          }
        }

        return manager.findOne(Product, {
          where: { id: productId },
          relations: [
            'options',
            'options.values',
            'variants',
            'variants.variantOptionValues',
            'variants.variantOptionValues.optionValue',
            'variants.images',
            'images',
            'bulkPricingTiers',
          ],
        });
      });
    } catch (error) {
      console.log(error, 'error');
      throw new BadRequestException(error?.messgae || 'Product Update Fails');
    }
  }

  // ── Single product get (public) ──────────────────────────────
  async getProductById(productId: string) {
    const product = await this.productRepo.findOne({
      where: { id: productId },
      relations: [
        'options',
        'options.values',
        'variants',
        'variants.variantOptionValues',
        'variants.variantOptionValues.optionValue',
        'variants.images',
        'images',
        'bulkPricingTiers',
      ],
    });
    if (!product) throw new BadRequestException('Product not found');
    return product;
  }

  // ── Delete product ───────────────────────────────────────────
  async deleteProduct(productId: string) {
    return await this.dataSource.transaction(async (manager) => {
      const product = await manager.findOne(Product, {
        where: { id: productId },
        relations: ['deals', 'rankings'],
      });

      if (!product) throw new BadRequestException('Product not found');

      if (product.deals?.length > 0 || product.rankings?.length > 0) {
        throw new BadRequestException(
          'Cannot delete a product linked to active deals or rankings. Remove those associations first.',
        );
      }

      await manager.remove(product);
      return { message: 'Product deleted successfully' };
    });
  }
}
