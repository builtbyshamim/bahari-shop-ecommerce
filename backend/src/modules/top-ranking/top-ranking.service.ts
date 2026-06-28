import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { TopRanking } from './entities/top-ranking.entity';
import { FeatureType } from '../feature-types/entities/feature-type.entity';
import { Product, ProductStatus } from '../product/entities/product.entity';
import { CreateTopRankingDto } from './dto/create-top-ranking.dto';
import { UpdateTopRankingDto } from './dto/update-top-ranking.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { UserEntity } from '../users/entities/user.entity';

export const TOP_RANKING_TTL = 300;

@Injectable()
export class TopRankingService {
  constructor(
    @InjectRepository(TopRanking)
    private readonly rankingRepo: Repository<TopRanking>,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    @InjectRepository(FeatureType)
    private readonly featureTypeRepo: Repository<FeatureType>,

    private readonly dataSource: DataSource,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async create(user: UserEntity, dto: CreateTopRankingDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = await queryRunner.manager.findOne(Product, {
        where: { id: dto.productId },
      });
      if (!product)
        throw new NotFoundException(`Product #${dto.productId} not found`);

      const featureType = await queryRunner.manager.findOne(FeatureType, {
        where: { id: dto.featureTypeId },
      });
      if (!featureType)
        throw new NotFoundException(
          `Feature type #${dto.featureTypeId} not found`,
        );

      const existing = await queryRunner.manager
        .createQueryBuilder(TopRanking, 'ranking')
        .where('ranking.productId = :productId', { productId: dto.productId })
        .andWhere('ranking.featureTypeId = :featureTypeId', {
          featureTypeId: dto.featureTypeId,
        })
        .andWhere('ranking.isActive = true')
        .andWhere('ranking.startAt < :endAt', { endAt: dto.endAt })
        .andWhere('ranking.endAt > :startAt', { startAt: dto.startAt })
        .getOne();

      if (existing) {
        throw new BadRequestException(
          'Ranking already exists in this date range for this feature type',
        );
      }

      const ranking = queryRunner.manager.create(TopRanking, {
        ...dto,
        addedBy: user.id,
        startAt: new Date(dto.startAt),
        endAt: new Date(dto.endAt),
      });

      const saved = await queryRunner.manager.save(ranking);
      await queryRunner.commitTransaction();
      return saved;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(query: PaginationQueryDto) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await this.rankingRepo
      .createQueryBuilder('ranking')
      .leftJoinAndSelect('ranking.product', 'product')
      .leftJoinAndSelect('product.images', 'image', 'image.isThumbnail = true')
      .leftJoinAndSelect('ranking.featureType', 'featureType')
      .orderBy('ranking.priority', 'DESC')
      .addOrderBy('ranking.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: {
        totalItems: total,
        itemCount: data.length,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }

  async getRankingProducts(slug: string) {
    const CACHE_KEY = `ranking_${slug}`;

    try {
      const cached = await this.cacheManager.get(CACHE_KEY);
      if (cached) return cached;

      const featureType = await this.featureTypeRepo.findOne({
        where: { slug, isActive: true },
      });
      if (!featureType) throw new NotFoundException(`Feature type not found`);
      const featureTypeId = featureType.id;

      const now = new Date();

      const rows = await this.rankingRepo
        .createQueryBuilder('ranking')
        .leftJoin('ranking.product', 'product')
        .leftJoin('product.category', 'category')
        .leftJoin('product.images', 'image', 'image.isThumbnail = true')
        .select([
          'ranking.id',
          'ranking.priority',
          'ranking.score',
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
        .where('ranking.featureTypeId = :featureTypeId', { featureTypeId })
        .andWhere('ranking.isActive = true')
        .andWhere('product.isActive = true')
        .andWhere('product.productStatus = :status', {
          status: ProductStatus.APPROVED,
        })
        .andWhere('(ranking.startAt IS NULL OR ranking.startAt <= :now)', {
          now,
        })
        .andWhere('(ranking.endAt IS NULL OR ranking.endAt >= :now)', { now })
        .orderBy('ranking.priority', 'DESC')
        .addOrderBy('ranking.score', 'DESC')
        .limit(10)
        .getMany();

      if (!rows.length) {
        const empty = { data: [], meta: { totalItems: 0 } };
        await this.cacheManager.set(CACHE_KEY, empty, TOP_RANKING_TTL);
        return empty;
      }

      const ids = rows.map((r) => r.product.id);

      const variantPrices = await this.productRepo
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
        .getRawMany();

      const priceMap = new Map(
        variantPrices.map((v) => [
          v.product_id,
          { price: v.minPrice, compareAtPrice: v.maxComparePrice },
        ]),
      );

      const data = rows.map(({ product }) => {
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
          hasVariants: product.hasVariants,
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
      await this.cacheManager.set(CACHE_KEY, result, TOP_RANKING_TTL);
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Failed to fetch ranking products',
      );
    }
  }

  async getActiveSections() {
    const now = new Date();

    const featureTypes = await this.featureTypeRepo.find({
      where: { isActive: true },
      order: { priority: 'DESC', createdAt: 'DESC' },
    });

    const sections = await Promise.all(
      featureTypes.map(async (ft) => {
        const rows = await this.rankingRepo
          .createQueryBuilder('ranking')
          .leftJoin('ranking.product', 'product')
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
          .where('ranking.featureTypeId = :id', { id: ft.id })
          .andWhere('ranking.isActive = true')
          .andWhere('product.isActive = true')
          .andWhere('product.productStatus = :status', {
            status: ProductStatus.APPROVED,
          })
          .andWhere('(ranking.startAt IS NULL OR ranking.startAt <= :now)', {
            now,
          })
          .andWhere('(ranking.endAt IS NULL OR ranking.endAt >= :now)', { now })
          .orderBy('ranking.priority', 'DESC')
          .limit(10)
          .getMany();

        const products = rows.map(({ product }) => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          basePrice: product.basePrice,
          hasVariants: product.hasVariants,
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
        }));

        return { id: ft.id, name: ft.name, slug: ft.slug, products };
      }),
    );

    return sections.filter((s) => s.products.length > 0);
  }

  async findOne(id: string) {
    const ranking = await this.rankingRepo.findOne({
      where: { id },
      relations: ['product', 'featureType'],
    });
    if (!ranking) throw new NotFoundException(`Ranking #${id} not found`);
    return ranking;
  }

  async update(id: string, dto: UpdateTopRankingDto) {
    const ranking = await this.rankingRepo.findOne({ where: { id } });
    if (!ranking) throw new NotFoundException(`Ranking #${id} not found`);

    Object.assign(ranking, {
      ...dto,
      ...(dto.startAt && { startAt: new Date(dto.startAt) }),
      ...(dto.endAt && { endAt: new Date(dto.endAt) }),
    });

    return this.rankingRepo.save(ranking);
  }

  async remove(id: string) {
    const ranking = await this.rankingRepo.findOne({ where: { id } });
    if (!ranking) throw new NotFoundException(`Ranking #${id} not found`);
    await this.rankingRepo.remove(ranking);
    return { message: 'Ranking removed successfully' };
  }
}
