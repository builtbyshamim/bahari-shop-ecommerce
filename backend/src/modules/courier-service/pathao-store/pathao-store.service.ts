import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PathaoStoreEntity } from './entities/pathao-store.entity';
import {
  CreatePathaoStoreDto,
  PathaoStoreFilterDto,
  UpdatePathaoStoreDto,
} from './dto/pathao-store.dto';

@Injectable()
export class PathaoStoreService {
  constructor(
    @InjectRepository(PathaoStoreEntity)
    private readonly repo: Repository<PathaoStoreEntity>,
  ) {}

  // ─── Create ───────────────────────────────────────────────────────────────
  async create(dto: CreatePathaoStoreDto): Promise<PathaoStoreEntity> {
    const exists = await this.repo.findOne({
      where: { store_id: dto.store_id },
    });
    if (exists) {
      throw new BadRequestException(
        `Store with store_id "${dto.store_id}" already exists`,
      );
    }

    const store = this.repo.create(dto);
    return this.repo.save(store);
  }

  // ─── Find All ─────────────────────────────────────────────────────────────
  async findAll(filter: PathaoStoreFilterDto) {
    const { search, page = 1, limit = 10 } = filter;
    const skip = (page - 1) * limit;

    const qb = this.repo
      .createQueryBuilder('s')
      .orderBy('s.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    if (search) {
      qb.where(
        '(s.name ILIKE :search OR s.store_id ILIKE :search OR s.city ILIKE :search OR s.contact_number ILIKE :search)',
        { search: `%${search}%` },
      );
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

  // ─── Find One ─────────────────────────────────────────────────────────────
  async findOne(id: string): Promise<PathaoStoreEntity> {
    const store = await this.repo.findOne({ where: { id } });
    if (!store) throw new NotFoundException(`Pathao store ${id} not found`);
    return store;
  }

  // ─── Update ───────────────────────────────────────────────────────────────
  async update(
    id: string,
    dto: UpdatePathaoStoreDto,
  ): Promise<PathaoStoreEntity> {
    const store = await this.findOne(id);

    // Check store_id uniqueness if it's being changed
    if (dto.store_id && dto.store_id !== store.store_id) {
      const conflict = await this.repo.findOne({
        where: { store_id: dto.store_id },
      });
      if (conflict) {
        throw new BadRequestException(
          `store_id "${dto.store_id}" is already in use`,
        );
      }
    }

    Object.assign(store, dto);
    return this.repo.save(store);
  }

  // ─── Delete ───────────────────────────────────────────────────────────────
  async remove(id: string): Promise<{ message: string }> {
    const store = await this.findOne(id);
    await this.repo.remove(store);
    return { message: 'Pathao store deleted successfully' };
  }
}