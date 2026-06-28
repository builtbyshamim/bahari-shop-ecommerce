// deals.service.ts
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { UserEntity } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Deal } from './entities/deal.entity';
import { Product } from '../product/entities/product.entity';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Inventory } from '../inventory/entities/inventory.entity';
export const TOP_DEALS_TTL = 300; // 5 minutes
@Injectable()
export class DealsService {
  constructor(
    @InjectRepository(Deal)
    private readonly dealRepository: Repository<Deal>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,

    private readonly dataSource: DataSource,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async create(user: UserEntity, dto: CreateDealDto): Promise<Deal> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = await queryRunner.manager.findOne(Product, {
        where: { id: dto.productId },
      });

      const { id } = user;
      if (!product) {
        throw new NotFoundException(`Product #${dto.productId} not found`);
      }

      // Check overlapping active deal for same product & type
      const existing = await queryRunner.manager
        .createQueryBuilder(Deal, 'deal')
        .where('deal.productId = :productId', { productId: dto.productId })
        .andWhere('deal.type = :type', { type: dto.type })
        .andWhere('deal.isActive = true')
        .andWhere('deal.startAt < :endAt', { endAt: dto.endAt })
        .andWhere('deal.endAt > :startAt', { startAt: dto.startAt })
        .getOne();

      if (existing) {
        throw new BadRequestException(
          `An active deal of type "${dto.type}" already exists for this product in the given date range`,
        );
      }

      const deal = queryRunner.manager.create(Deal, {
        ...dto,
        addedBy: id,
        isActive: dto.isActive == 'active' ? true : false,
        startAt: new Date(dto.startAt),
        endAt: new Date(dto.endAt),
      });

      const saved = await queryRunner.manager.save(Deal, deal);
      await queryRunner.commitTransaction();
      return saved;
    } catch (err) {
      console.log(err, 'err');
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(query: PaginationQueryDto): Promise<any> {
    const { page = 1, limit = 10, search = '' } = query;
    const skip = (page - 1) * limit;
    try {
      const qb = this.dealRepository
        .createQueryBuilder('deal')
        .leftJoinAndSelect('deal.product', 'product')
        .leftJoinAndSelect(
          'product.images',
          'image',
          'image.isThumbnail = true',
        )
        .orderBy('deal.priority', 'DESC')
        .addOrderBy('deal.createdAt', 'DESC')
        .skip(skip)
        .take(limit);

      if (search) {
        qb.where('product.name ILIKE :search', { search: `%${search}%` });
      }

      const [data, total] = await qb.getManyAndCount();

      return {
        data,
        meta: {
          totalItems: total,
          itemCount: data.length,
          itemsPerPage: Number(limit),
          totalPages: Math.ceil(total / limit),
          currentPage: Number(page),
        },
      };
    } catch (error) {
      console.log(error, 'errorerror');
      throw new BadRequestException(error.message);
    }
  }

  async getTopDealsProduct(): Promise<any> {
    const CACHE_KEY = 'top_deals_products';

    const cached = await this.cacheManager.get(CACHE_KEY);
    if (cached) return cached;

    const dealRows = await this.dealRepository
      .createQueryBuilder('deal')
      .innerJoin('deal.product', 'product')
      .select('deal.id', 'deal_id')
      .addSelect('product.id', 'product_id')
      .addSelect('deal.type', 'deal_type')
      .addSelect('deal.discountType', 'deal_discountType')
      .addSelect('deal.discountValue', 'deal_discountValue')
      .addSelect('deal.startAt', 'deal_startAt')
      .addSelect('deal.endAt', 'deal_endAt')
      .addSelect('deal.priority', 'priority')
      .addSelect('deal.createdAt', 'deal_createdAt')
      .where('product.productStatus = :status', { status: 'approved' })
      .andWhere('product.isActive = :isActive', { isActive: true })
      .andWhere('deal.isActive = :isActive', { isActive: true })
      .orderBy('deal.priority', 'DESC')
      .addOrderBy('deal.createdAt', 'DESC')
      .limit(10)
      .getRawMany<{
        deal_id: string;
        product_id: string;
        deal_type: string;
        deal_discountType: string;
        deal_discountValue: string;
        deal_startAt: Date;
        deal_endAt: Date;
        priority: number;
      }>();

    const ids = dealRows.map((r) => r.product_id);

    const emptyResult = { data: [], meta: { totalItems: 0, itemCount: 0 } };

    if (ids.length === 0) {
      await this.cacheManager.set(CACHE_KEY, emptyResult, TOP_DEALS_TTL);
      return emptyResult;
    }

    // ── Step 2: Product details + Variant prices parallel fetch ──
    const [products, variantPrices, stockData] = await Promise.all([
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
          'category.id',
          'category.name',
          'category.slug',
          'image.id',
          'image.url',
          'image.altText',
        ])
        .where('product.id IN (:...ids)', { ids })
        .getMany(),

      // Variant price — only for products where hasVariants=true
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

    // Build stockMap — after priceMap
    const stockMap = new Map<string, { qty: number; isTracked: boolean }>();
    for (const s of stockData) {
      const existing = stockMap.get(s.product_id);
      const qty = Number(s.qty_available);
      if (!existing) {
        stockMap.set(s.product_id, { qty, isTracked: s.is_tracked });
      } else {
        stockMap.set(s.product_id, {
          qty: Math.min(existing.qty, qty),
          isTracked: s.is_tracked,
        });
      }
    }
    // ── Step 3: Sort by deal priority order ──────────
    const productMap = new Map(products.map((p) => [p.id, p]));
    const priceMap = new Map(
      variantPrices.map((v) => [
        v.product_id,
        { price: v.minPrice, compareAtPrice: v.maxComparePrice },
      ]),
    );

    const data = dealRows
      .map((row) => {
        const product = productMap.get(row.product_id);
        if (!product) return null;

        const variantPrice = priceMap.get(product.id);
        const price = product.hasVariants
          ? (variantPrice?.price ?? null)
          : product.basePrice;
        const compareAtPrice = product.hasVariants
          ? (variantPrice?.compareAtPrice ?? null)
          : null;

        const discountPercent =
          price && compareAtPrice && Number(compareAtPrice) > Number(price)
            ? Math.round(
                ((Number(compareAtPrice) - Number(price)) /
                  Number(compareAtPrice)) *
                  100,
              )
            : null;
        const stock = stockMap.get(product.id);
        const inStock = stock ? !stock.isTracked || stock.qty > 0 : false;

        return {
          dealId: row.deal_id,
          dealType: row.deal_type,
          discountType: row.deal_discountType,
          discountValue: Number(row.deal_discountValue),
          startAt: row.deal_startAt,
          endAt: row.deal_endAt,
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: price ? Number(price) : null,
          compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
          discountPercent,
          inStock,
          availableQty: stock?.isTracked ? stock.qty : null,
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
      })
      .filter(Boolean);

    const result = {
      data,
      meta: {
        totalItems: data.length,
        itemCount: data.length,
      },
    };

    // ✅ Cache in Redis
    await this.cacheManager.set(CACHE_KEY, result, TOP_DEALS_TTL);
    return result;
  }

  async getAllDealsProducts(query: PaginationQueryDto): Promise<any> {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * Number(limit);

    const [dealRows, total] = await Promise.all([
      this.dealRepository
        .createQueryBuilder('deal')
        .innerJoin('deal.product', 'product')
        .select('deal.id', 'deal_id')
        .addSelect('product.id', 'product_id')
        .addSelect('deal.type', 'deal_type')
        .addSelect('deal.discountType', 'deal_discountType')
        .addSelect('deal.discountValue', 'deal_discountValue')
        .addSelect('deal.startAt', 'deal_startAt')
        .addSelect('deal.endAt', 'deal_endAt')
        .addSelect('deal.priority', 'priority')
        .addSelect('deal.createdAt', 'deal_createdAt')
        .where('product.productStatus = :status', { status: 'approved' })
        .andWhere('product.isActive = true')
        .andWhere('deal.isActive = true')
        .orderBy('deal.priority', 'DESC')
        .addOrderBy('deal.createdAt', 'DESC')
        .skip(skip)
        .take(Number(limit))
        .getRawMany(),

      this.dealRepository
        .createQueryBuilder('deal')
        .innerJoin('deal.product', 'product')
        .where('product.productStatus = :status', { status: 'approved' })
        .andWhere('product.isActive = true')
        .andWhere('deal.isActive = true')
        .getCount(),
    ]);

    const ids = dealRows.map((r) => r.product_id);

    const emptyResult = {
      data: [],
      meta: {
        totalItems: 0,
        itemCount: 0,
        itemsPerPage: Number(limit),
        totalPages: 0,
        currentPage: Number(page),
      },
    };

    if (ids.length === 0) return emptyResult;

    const [products, variantPrices, stockData] = await Promise.all([
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
          'category.id',
          'category.name',
          'image.id',
          'image.url',
          'image.altText',
        ])
        .where('product.id IN (:...ids)', { ids })
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

      this.inventoryRepo
        .createQueryBuilder('inv')
        .select('inv.product_id', 'product_id')
        .addSelect('inv.qty_available', 'qty_available')
        .addSelect('inv.is_tracked', 'is_tracked')
        .where('inv.product_id IN (:...ids)', { ids })
        .getRawMany(),
    ]);

    const productMap = new Map(products.map((p) => [p.id, p]));
    const priceMap = new Map(
      variantPrices.map((v) => [
        v.product_id,
        { price: v.minPrice, compareAtPrice: v.maxComparePrice },
      ]),
    );
    const stockMap = new Map<string, { qty: number; isTracked: boolean }>();
    for (const s of stockData) {
      const existing = stockMap.get(s.product_id);
      const qty = Number(s.qty_available);
      stockMap.set(s.product_id, {
        qty: existing ? Math.min(existing.qty, qty) : qty,
        isTracked: s.is_tracked,
      });
    }

    const data = dealRows
      .map((row) => {
        const product = productMap.get(row.product_id);
        if (!product) return null;

        const variantPrice = priceMap.get(product.id);
        const price = product.hasVariants
          ? (variantPrice?.price ?? null)
          : product.basePrice;
        const compareAtPrice = product.hasVariants
          ? (variantPrice?.compareAtPrice ?? null)
          : null;
        const discountPercent =
          price && compareAtPrice && Number(compareAtPrice) > Number(price)
            ? Math.round(
                ((Number(compareAtPrice) - Number(price)) /
                  Number(compareAtPrice)) *
                  100,
              )
            : null;
        const stock = stockMap.get(product.id);
        const inStock = stock ? !stock.isTracked || stock.qty > 0 : false;

        return {
          dealId: row.deal_id,
          dealType: row.deal_type,
          discountType: row.deal_discountType,
          discountValue: Number(row.deal_discountValue),
          startAt: row.deal_startAt,
          endAt: row.deal_endAt,
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: price ? Number(price) : null,
          compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
          discountPercent,
          inStock,
          availableQty: stock?.isTracked ? stock.qty : null,
          category: product.category
            ? { id: product.category.id, name: product.category.name }
            : null,
          thumbnail: product.images?.[0]
            ? { url: product.images[0].url, altText: product.images[0].altText }
            : null,
        };
      })
      .filter(Boolean);

    return {
      data,
      meta: {
        totalItems: total,
        itemCount: data.length,
        itemsPerPage: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
        currentPage: Number(page),
      },
    };
  }

  async findOne(id: string): Promise<Deal> {
    const deal = await this.dealRepository
      .createQueryBuilder('deal')
      .leftJoinAndSelect('deal.product', 'product')
      .where('deal.id = :id', { id })
      .getOne();

    if (!deal) throw new NotFoundException(`Deal #${id} not found`);
    return deal;
  }

  async update(id: string, dto: UpdateDealDto): Promise<Deal> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const deal = await queryRunner.manager
        .createQueryBuilder(Deal, 'deal')
        .where('deal.id = :id', { id })
        .getOne();

      if (!deal) throw new NotFoundException(`Deal #${id} not found`);

      // If date range or type is being updated, check for conflicts
      if (dto.startAt || dto.endAt || dto.type) {
        const startAt = dto.startAt ?? deal.startAt.toISOString();
        const endAt = dto.endAt ?? deal.endAt.toISOString();
        const type = dto.type ?? deal.type;
        const productId = dto.productId ?? deal.productId;

        const conflict = await queryRunner.manager
          .createQueryBuilder(Deal, 'deal')
          .where('deal.productId = :productId', { productId })
          .andWhere('deal.type = :type', { type })
          .andWhere('deal.isActive = true')
          .andWhere('deal.id != :id', { id })
          .andWhere('deal.startAt < :endAt', { endAt })
          .andWhere('deal.endAt > :startAt', { startAt })
          .getOne();

        if (conflict) {
          throw new BadRequestException(
            `Another active deal of type "${type}" conflicts with the given date range`,
          );
        }
      }

      const updated = queryRunner.manager.merge(Deal, deal, {
        ...dto,
        ...(dto.startAt && { startAt: new Date(dto.startAt) }),
        ...(dto.endAt && { endAt: new Date(dto.endAt) }),
        isActive: dto.isActive == 'active' ? true : false,
      });

      const saved = await queryRunner.manager.save(Deal, updated);
      await queryRunner.commitTransaction();
      return saved;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getActiveDealForProduct(productId: string): Promise<any> {
    const now = new Date();
    const deal = await this.dealRepository
      .createQueryBuilder('deal')
      .where('deal.productId = :productId', { productId })
      .andWhere('deal.isActive = true')
      .andWhere('deal.startAt <= :now', { now })
      .andWhere('deal.endAt >= :now', { now })
      .orderBy('deal.priority', 'DESC')
      .addOrderBy('deal.createdAt', 'DESC')
      .getOne();

    if (!deal) return null;

    return {
      dealId: deal.id,
      dealType: deal.type,
      discountType: deal.discountType,
      discountValue: Number(deal.discountValue),
      startAt: deal.startAt,
      endAt: deal.endAt,
    };
  }

  async remove(id: string): Promise<{ message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const deal = await queryRunner.manager
        .createQueryBuilder(Deal, 'deal')
        .where('deal.id = :id', { id })
        .getOne();

      if (!deal) throw new NotFoundException(`Deal #${id} not found`);

      await queryRunner.manager.remove(Deal, deal);
      await queryRunner.commitTransaction();

      return { message: `Deal #${id} removed successfully` };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
