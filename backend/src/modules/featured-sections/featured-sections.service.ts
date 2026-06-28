import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { FeaturedSection } from './entities/featured-section.entity';
import { Product, ProductStatus } from '../product/entities/product.entity';
import { CreateFeaturedSectionDto } from './dto/create-featured-section.dto';
import { UpdateFeaturedSectionDto } from './dto/update-featured-section.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class FeaturedSectionsService {
  constructor(
    @InjectRepository(FeaturedSection)
    private readonly sectionRepo: Repository<FeaturedSection>,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async create(dto: CreateFeaturedSectionDto) {
    const slug = slugify(dto.name);

    const existing = await this.sectionRepo.findOne({ where: { slug } });
    if (existing) {
      throw new ConflictException(
        `A featured section named "${dto.name}" already exists`,
      );
    }

    const products = dto.productIds?.length
      ? await this.productRepo.findBy({ id: In(dto.productIds) })
      : [];

    const section = this.sectionRepo.create({
      name: dto.name,
      slug,
      description: dto.description,
      priority: dto.priority ?? 0,
      isActive: dto.isActive ?? true,
      startAt: dto.startAt ? new Date(dto.startAt) : undefined,
      endAt: dto.endAt ? new Date(dto.endAt) : undefined,
      products,
    });

    return this.sectionRepo.save(section);
  }

  async findAll(query: PaginationQueryDto) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await this.sectionRepo
      .createQueryBuilder('section')
      .leftJoinAndSelect('section.products', 'product')
      .leftJoinAndSelect('product.images', 'image', 'image.isThumbnail = true')
      .orderBy('section.priority', 'DESC')
      .addOrderBy('section.createdAt', 'DESC')
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

  async getActiveSections() {
    const now = new Date();

    const sections = await this.sectionRepo
      .createQueryBuilder('section')
      .leftJoinAndSelect('section.products', 'product')
      .leftJoinAndSelect('product.images', 'image', 'image.isThumbnail = true')
      .leftJoinAndSelect('product.category', 'category')
      .where('section.isActive = true')
      .andWhere('(section.startAt IS NULL OR section.startAt <= :now)', { now })
      .andWhere('(section.endAt IS NULL OR section.endAt >= :now)', { now })
      .andWhere('product.isActive = true')
      .andWhere('product.productStatus = :status', {
        status: ProductStatus.APPROVED,
      })
      .orderBy('section.priority', 'DESC')
      .addOrderBy('section.createdAt', 'DESC')
      .getMany();

    return sections
      .filter((s) => s.products.length > 0)
      .map((section) => ({
        id: section.id,
        name: section.name,
        slug: section.slug,
        description: section.description,
        products: section.products.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          basePrice: p.basePrice,
          hasVariants: p.hasVariants,
          category: p.category
            ? {
                id: p.category.id,
                name: p.category.name,
                slug: p.category.slug,
              }
            : null,
          thumbnail: p.images?.[0]
            ? { url: p.images[0].url, altText: p.images[0].altText }
            : null,
        })),
      }));
  }

  async findOne(id: string) {
    const section = await this.sectionRepo.findOne({
      where: { id },
      relations: ['products', 'products.images', 'products.category'],
    });

    if (!section)
      throw new NotFoundException(`Featured section #${id} not found`);
    return section;
  }

  async update(id: string, dto: UpdateFeaturedSectionDto) {
    const section = await this.findOne(id);

    if (dto.name && dto.name !== section.name) {
      const slug = slugify(dto.name);
      const conflict = await this.sectionRepo.findOne({ where: { slug } });
      if (conflict && conflict.id !== id) {
        throw new ConflictException(
          `A section named "${dto.name}" already exists`,
        );
      }
      section.name = dto.name;
      section.slug = slug;
    }

    if (dto.description !== undefined) section.description = dto.description;
    if (dto.priority !== undefined) section.priority = dto.priority;
    if (dto.isActive !== undefined) section.isActive = dto.isActive;
    if (dto.startAt !== undefined)
      section.startAt = dto.startAt ? new Date(dto.startAt) : null;
    if (dto.endAt !== undefined)
      section.endAt = dto.endAt ? new Date(dto.endAt) : null;

    if (dto.productIds !== undefined) {
      section.products = dto.productIds.length
        ? await this.productRepo.findBy({ id: In(dto.productIds) })
        : [];
    }

    return this.sectionRepo.save(section);
  }

  async remove(id: string) {
    const section = await this.findOne(id);
    await this.sectionRepo.remove(section);
    return { message: 'Featured section deleted successfully' };
  }
}
