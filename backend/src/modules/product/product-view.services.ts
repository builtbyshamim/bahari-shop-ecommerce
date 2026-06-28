import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Product, ProductStatus } from './entities/product.entity';
import { GetProductsViewDto } from './dto/get-product-view.dto';
import { CacheKeys } from '../../common/constants/cache-keys.constant';
import { Category } from '../categories/entities/category.entity';
import { GetShopProductsViewDto } from './dto/get-shop-product-view.dto';
import { Inventory } from '../inventory/entities/inventory.entity';
import { FeatureType } from '../feature-types/entities/feature-type.entity';

const PRODUCTS_LIST_TTL = 5 * 60 * 1000; // 5 minutes
const PRODUCT_DETAIL_TTL = 10 * 60 * 1000; // 10 minutes

const FEATURE_TYPE_PRODUCTS_TTL = 5 * 60 * 1000; // 5 minutes

@Injectable()
export class ProductViewService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,

    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,

    @InjectRepository(FeatureType)
    private readonly featureTypeRepo: Repository<FeatureType>,

    private readonly dataSource: DataSource,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  // ── Cache key builder ──────────────────────────────────────
  private buildListCacheKey(dto: GetProductsViewDto): string {
    const parts = [
      `page=${dto.page ?? 1}`,
      `limit=${dto.limit ?? 10}`,
      dto.search ? `search=${dto.search}` : '',
      dto.startDate ? `from=${dto.startDate}` : '',
      dto.endDate ? `to=${dto.endDate}` : '',
    ]
      .filter(Boolean)
      .join('&');
    return `${CacheKeys.PRODUCTS_LIST}${parts}`;
  }

  // ── Get Products (with Redis cache) ───────────────────────
  async getProducts(dto: GetProductsViewDto) {
    const cacheKey = this.buildListCacheKey(dto);
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    // ── DB Query ──────────────────────────────────────────────
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;
    const offset = (page - 1) * limit;

    const idQb = this.productRepo
      .createQueryBuilder('product')
      .select('product.id', 'id')
      .where('product.productStatus = :status', { status: 'approved' })
      .andWhere('product.isActive = :isActive', { isActive: true })
      .orderBy('product.priority', 'ASC')
      .limit(limit)
      .offset(offset);

    if (dto.search) {
      idQb.andWhere(
        '(product.name ILIKE :search OR product.slug ILIKE :search)',
        { search: `%${dto.search}%` },
      );
    }
    if (dto.startDate) {
      idQb.andWhere('product.createdAt >= :startDate', {
        startDate: dto.startDate,
      });
    }
    if (dto.endDate) {
      idQb.andWhere('product.createdAt <= :endDate', { endDate: dto.endDate });
    }

    const [idsResult, total] = await Promise.all([
      idQb.getRawMany<{ id: string }>(),
      idQb.getCount(),
    ]);

    const ids = idsResult.map((r) => r.id);

    const emptyResult = {
      data: [],
      meta: {
        totalItems: total,
        itemCount: 0,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };

    if (ids.length === 0) {
      await this.cacheManager.set(cacheKey, emptyResult, PRODUCTS_LIST_TTL);
      return emptyResult;
    }

    const [products, variantPrices] = await Promise.all([
      this.productRepo
        .createQueryBuilder('product')
        .leftJoin('product.category', 'category')
        .leftJoin('product.images', 'image', 'image.isThumbnail = true')
        .select([
          'product.id',
          'product.name',
          'product.slug',
          'product.basePrice',
          'product.compareAtPrice',
          'product.hasVariants',
          'category.id',
          'category.name',
          'category.slug',
          'image.id',
          'image.url',
          'image.altText',
        ])
        .where('product.id IN (:...ids)', { ids })
        .orderBy('product.priority', 'ASC')
        .getMany(),

      // Variant price — শুধু hasVariants=true product গুলোর জন্য
      this.productRepo
        .createQueryBuilder('product')
        .leftJoin('product.variants', 'variant')
        .select('product.id', 'product_id')
        .addSelect('MIN(CAST(variant.price AS DECIMAL))', 'minPrice')
        .addSelect(
          'MAX(CAST(variant.compareAtPrice AS DECIMAL))',
          'maxComparePrice',
        )
        .where('product.id IN (:...ids)', { ids })
        .andWhere('product.hasVariants = true')
        .groupBy('product.id')
        .getRawMany(),
      this.inventoryRepo
        .createQueryBuilder('inv')
        .select('inv.product_id', 'product_id')
        .addSelect('inv.variant_id', 'variant_id')
        .addSelect('inv.qty_available', 'qty_available')
        .addSelect('inv.is_tracked', 'is_tracked')
        .where('inv.product_id IN (:...ids)', { ids })
        .getRawMany(),
    ]);

    const priceMap = new Map(
      variantPrices.map((v) => [
        v.product_id,
        { price: v.minPrice, compareAtPrice: v.maxComparePrice },
      ]),
    );

    const data = products.map((product) => {
      const variantPrice = priceMap.get(product.id);
      const price = product.hasVariants
        ? (variantPrice?.price ?? null)
        : product.basePrice;
      const compareAtPrice = product.hasVariants
        ? (variantPrice?.compareAtPrice ?? null)
        : (product?.compareAtPrice ?? null);

      const discountPercent =
        price && compareAtPrice && Number(compareAtPrice) > Number(price)
          ? Math.round(
              ((Number(compareAtPrice) - Number(price)) /
                Number(compareAtPrice)) *
                100,
            )
          : null;

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: price ? Number(price) : null,
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
        discountPercent,
        category: product.category
          ? { id: product.category.id, name: product.category.name }
          : null,
        thumbnail: product.images?.[0]
          ? { url: product.images[0].url, altText: product.images[0].altText }
          : null,
      };
    });

    const result = {
      data,
      meta: {
        totalItems: total,
        itemCount: data.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };

    // ✅ Redis এ cache করো
    await this.cacheManager.set(cacheKey, result, PRODUCTS_LIST_TTL);

    return result;
  }

  async getProductsByProductSlug(slug: string) {
    try {
      const limit = 6;

      const product = await this.productRepo.findOne({
        where: { slug },
        select: ['categoryId', 'id'],
      });

      if (!product) {
        return { data: [] };
      }

      const idsResult = await this.productRepo
        .createQueryBuilder('product')
        .leftJoin('product.category', 'category')
        .select('product.id', 'id')
        .where('product.productStatus = :status', { status: 'approved' })
        .andWhere('product.isActive = :isActive', { isActive: true })
        .andWhere('product.id != :productId', { productId: product.id })
        .andWhere('category.id = :categoryId', {
          categoryId: product.categoryId,
        })
        .orderBy('product.priority', 'ASC')
        .limit(limit)
        .getRawMany();

      const ids = idsResult.map((r) => r.id);

      if (!ids.length) {
        return { data: [] };
      }

      const [products, variantPrices] = await Promise.all([
        this.productRepo
          .createQueryBuilder('product')
          .leftJoin('product.category', 'category')
          .leftJoin('product.images', 'image', 'image.isThumbnail = true')
          .select([
            'product.id',
            'product.name',
            'product.slug',
            'product.basePrice',
            'product.hasVariants',
            'product.compareAtPrice',
            'category.id',
            'category.name',
            'category.slug',
            'image.id',
            'image.url',
            'image.altText',
          ])
          .where('product.id IN (:...ids)', { ids })
          .orderBy('product.priority', 'ASC')
          .getMany(),

        this.productRepo
          .createQueryBuilder('product')
          .leftJoin('product.variants', 'variant')
          .select('product.id', 'product_id')
          .addSelect('MIN(CAST(variant.price AS DECIMAL))', 'minPrice')
          .addSelect(
            'MAX(CAST(variant.compareAtPrice AS DECIMAL))',
            'maxComparePrice',
          )
          .where('product.id IN (:...ids)', { ids })
          .andWhere('product.hasVariants = true')
          .groupBy('product.id')
          .getRawMany(),
      ]);

      const priceMap = new Map(
        variantPrices.map((v) => [
          v.product_id,
          { price: v.minPrice, compareAtPrice: v.maxComparePrice },
        ]),
      );

      const data = products.map((product) => {
        const variantPrice = priceMap.get(product.id);

        const price = product.hasVariants
          ? (variantPrice?.price ?? null)
          : product.basePrice;

        const compareAtPrice = product.hasVariants
          ? (variantPrice?.compareAtPrice ?? null)
          : product.compareAtPrice;

        const discountPercent =
          price && compareAtPrice && Number(compareAtPrice) > Number(price)
            ? Math.round(
                ((Number(compareAtPrice) - Number(price)) /
                  Number(compareAtPrice)) *
                  100,
              )
            : null;

        return {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: price ? Number(price) : null,
          compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
          discountPercent,
          category: product.category
            ? {
                id: product.category.id,
                name: product.category.name,
              }
            : null,
          thumbnail: product.images?.[0]
            ? {
                url: product.images[0].url,
                altText: product.images[0].altText,
              }
            : null,
        };
      });

      return {
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  // ── Single product (with Redis cache) ─────────────────────
  async getProductById(slug: string) {
    const cacheKey = `${CacheKeys.PRODUCT_DETAIL}${slug}`;

    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const product = await this.productRepo.findOne({
      where: { slug: slug },
      relations: [
        'options',
        'options.values',
        'category',
        'brand',
        'variants',
        'variants.variantOptionValues',
        'variants.variantOptionValues.optionValue',
        'variants.images',
        'images',
        'bulkPricingTiers',
      ],
    });

    if (!product) throw new BadRequestException('Product not found');

    // ✅ First variant default data
    if (product.hasVariants && product.variants?.length > 0) {
      const firstVariant = product.variants[0];

      product.basePrice = firstVariant.price;
      product.compareAtPrice = firstVariant.compareAtPrice;
      product.costPrice = firstVariant.costPrice;
      product.baseStock = firstVariant.stock;
      product.sku = firstVariant.sku;
    }

    await this.cacheManager.set(cacheKey, product, PRODUCT_DETAIL_TTL);

    return product;
  }

  // ── Cache invalidation (product update/delete এ call করো) ──
  async invalidateProductCache(productId?: string) {
    if (productId) {
      await this.cacheManager.del(`${CacheKeys.PRODUCT_DETAIL}${productId}`);
    }
    await this.cacheManager.del(CacheKeys.PRODUCTS_LIST);
  }

  // ── Products by Feature Type Slug (Redis cached) ───────────
  async getProductsByFeatureTypeSlug(slug: string) {
    const cacheKey = `${CacheKeys.FEATURE_TYPE_PRODUCTS}${slug}`;

    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const featureType = await this.featureTypeRepo.findOne({
      where: { slug, isActive: true },
    });

    console.log(`Feature type lookup for slug "${slug}":`, featureType);
    if (!featureType)
      throw new NotFoundException(`Feature type "${slug}" not found`);

    const products = await this.productRepo
      .createQueryBuilder('product')
      .leftJoin('product.images', 'image', 'image.isThumbnail = true')
      .leftJoin('product.category', 'category')
      .select([
        'product.id',
        'product.name',
        'product.slug',
        'product.basePrice',
        'product.compareAtPrice',
        'product.hasVariants',
        'image.url',
        'image.altText',
        'category.id',
        'category.name',
        'category.slug',
      ])
      .where('product.featureTypeId = :featureTypeId', {
        featureTypeId: featureType.id,
      })
      .andWhere('product.productStatus = :status', {
        status: ProductStatus.APPROVED,
      })
      .andWhere('product.isActive = :isActive', { isActive: true })
      .orderBy('product.createdAt', 'DESC')
      .limit(12)
      .getMany();

    const variantProductIds = products
      .filter((p) => p.hasVariants)
      .map((p) => p.id);

    const priceMap = new Map<
      string,
      { price: number; compareAtPrice: number }
    >();

    if (variantProductIds.length) {
      const variantPrices = await this.productRepo
        .createQueryBuilder('product')
        .leftJoin('product.variants', 'variant')
        .select('product.id', 'product_id')
        .addSelect('MIN(CAST(variant.price AS DECIMAL))', 'minPrice')
        .addSelect(
          'MAX(CAST(variant.compareAtPrice AS DECIMAL))',
          'maxComparePrice',
        )
        .where('product.id IN (:...variantProductIds)', { variantProductIds })
        .andWhere('product.hasVariants = true')
        .groupBy('product.id')
        .getRawMany();

      variantPrices.forEach((v) =>
        priceMap.set(v.product_id, {
          price: v.minPrice,
          compareAtPrice: v.maxComparePrice,
        }),
      );
    }

    const data = products.map((product) => {
      const vp = priceMap.get(product.id);
      const price = product.hasVariants
        ? (vp?.price ?? null)
        : product.basePrice;
      const compareAtPrice = product.hasVariants
        ? (vp?.compareAtPrice ?? null)
        : product.compareAtPrice;
      const discountPercent =
        price && compareAtPrice && Number(compareAtPrice) > Number(price)
          ? Math.round(
              ((Number(compareAtPrice) - Number(price)) /
                Number(compareAtPrice)) *
                100,
            )
          : null;

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: price ? Number(price) : null,
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
        discountPercent,
        category: product.category
          ? {
              id: product.category.id,
              name: product.category.name,
              slug: product.category.slug,
            }
          : null,
        thumbnail: product.images?.[0]
          ? { url: product.images[0].url, altText: product.images[0].altText }
          : null,
      };
    });

    const result = { data, meta: { totalItems: data.length } };
    await this.cacheManager.set(cacheKey, result, FEATURE_TYPE_PRODUCTS_TTL);
    return result;
  }

  async getShopProducts(dto: GetShopProductsViewDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const offset = (page - 1) * limit;

    // ✅ Category slug → descendant IDs resolve
    let categoryIds: string[] | null = null;
    if (dto.category) {
      const cat = await this.categoryRepo.findOne({
        where: { slug: dto.category },
      });
      if (cat) {
        const treeRepo = this.dataSource.getTreeRepository(Category);
        const descendants = await treeRepo.findDescendants(cat);
        categoryIds = descendants.map((c) => c.id);
      }
    }

    // ✅ Brand slug → brandId resolve
    let brandId: string | null = null;
    if (dto.brand) {
      const brand = await this.dataSource
        .getRepository('Brand')
        .findOne({ where: { slug: dto.brand } });
      if (brand) brandId = brand.id;
    }

    // ── ID Query ──────────────────────────────────────────────
    const idQb = this.productRepo
      .createQueryBuilder('product')
      .select('product.id', 'id')
      .where('product.productStatus = :status', { status: 'approved' })
      .andWhere('product.isActive = :isActive', { isActive: true });

    if (dto.search) {
      idQb.andWhere(
        '(product.name ILIKE :search OR product.slug ILIKE :search)',
        { search: `%${dto.search}%` },
      );
    }

    if (categoryIds?.length) {
      idQb.andWhere('product.categoryId IN (:...categoryIds)', { categoryIds });
    }

    if (brandId) {
      idQb.andWhere('product.brandId = :brandId', { brandId });
    }

    if (dto.minPrice !== undefined) {
      idQb.andWhere('product.basePrice >= :minPrice', {
        minPrice: dto.minPrice,
      });
    }

    if (dto.maxPrice !== undefined) {
      idQb.andWhere('product.basePrice <= :maxPrice', {
        maxPrice: dto.maxPrice,
      });
    }

    if (dto.inStock === 'true') {
      idQb.andWhere('product.baseStock > 0');
    }

    if (dto.startDate) {
      idQb.andWhere('product.createdAt >= :startDate', {
        startDate: dto.startDate,
      });
    }
    if (dto.endDate) {
      idQb.andWhere('product.createdAt <= :endDate', { endDate: dto.endDate });
    }

    // ✅ Sort
    switch (dto.sort) {
      case 'price-asc':
        idQb.orderBy('product.basePrice', 'ASC');
        break;
      case 'price-desc':
        idQb.orderBy('product.basePrice', 'DESC');
        break;
      case 'discount':
        idQb.orderBy('product.compareAtPrice', 'DESC');
        break;
      default:
        idQb.orderBy('product.priority', 'ASC');
    }

    idQb.limit(limit).offset(offset);

    const [idsResult, total] = await Promise.all([
      idQb.getRawMany<{ id: string }>(),
      idQb.clone().limit(undefined).offset(undefined).getCount(),
    ]);

    const ids = idsResult.map((r) => r.id);

    if (ids.length === 0) {
      return {
        data: [],
        meta: {
          totalItems: total,
          itemCount: 0,
          itemsPerPage: limit,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
        },
      };
    }

    const [products, variantPrices] = await Promise.all([
      this.productRepo
        .createQueryBuilder('product')
        .leftJoin('product.category', 'category')
        .leftJoin('product.brand', 'brand')
        .leftJoin('product.images', 'image', 'image.isThumbnail = true')
        .select([
          'product.id',
          'product.name',
          'product.slug',
          'product.basePrice',
          'product.compareAtPrice',
          'product.baseStock',
          'product.hasVariants',
          'category.id',
          'category.name',
          'category.slug',
          'brand.id',
          'brand.name',
          'brand.slug',
          'image.id',
          'image.url',
          'image.altText',
        ])
        .where('product.id IN (:...ids)', { ids })
        .orderBy('product.priority', 'ASC')
        .getMany(),

      this.productRepo
        .createQueryBuilder('product')
        .leftJoin('product.variants', 'variant')
        .select('product.id', 'product_id')
        .addSelect('MIN(CAST(variant.price AS DECIMAL))', 'minPrice')
        .addSelect(
          'MAX(CAST(variant.compareAtPrice AS DECIMAL))',
          'maxComparePrice',
        )
        .where('product.id IN (:...ids)', { ids })
        .andWhere('product.hasVariants = true')
        .groupBy('product.id')
        .getRawMany(),
    ]);

    const priceMap = new Map(
      variantPrices.map((v) => [
        v.product_id,
        { price: v.minPrice, compareAtPrice: v.maxComparePrice },
      ]),
    );

    const data = products.map((product) => {
      const variantPrice = priceMap.get(product.id);
      const price = product.hasVariants
        ? (variantPrice?.price ?? null)
        : product.basePrice;
      const compareAtPrice = product.hasVariants
        ? (variantPrice?.compareAtPrice ?? null)
        : product.compareAtPrice;

      const discountPercent =
        price && compareAtPrice && Number(compareAtPrice) > Number(price)
          ? Math.round(
              ((Number(compareAtPrice) - Number(price)) /
                Number(compareAtPrice)) *
                100,
            )
          : null;

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: price ? Number(price) : null,
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
        discountPercent,
        inStock: (product.baseStock ?? 0) > 0,
        category: product.category
          ? {
              id: product.category.id,
              name: product.category.name,
              slug: product.category.slug,
            }
          : null,
        brand: product.brand
          ? {
              id: product.brand.id,
              name: product.brand.name,
              slug: product.brand.slug,
            }
          : null,
        thumbnail: product.images?.[0]
          ? { url: product.images[0].url, altText: product.images[0].altText }
          : null,
      };
    });

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
}
