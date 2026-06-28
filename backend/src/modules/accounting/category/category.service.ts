import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountingCategoryEntity, CategoryType } from './entities/category.entity';
import { CreateAccountingCategoryDto, UpdateAccountingCategoryDto } from './dto/create-category.dto';


@Injectable()
export class AccountingCategoryService {
  constructor(
    @InjectRepository(AccountingCategoryEntity)
    private readonly repo: Repository<AccountingCategoryEntity>,
  ) {}

  async create(
    dto: CreateAccountingCategoryDto,
    user: any,
  ): Promise<AccountingCategoryEntity> {
    const exists = await this.repo.findOne({
      where: { name: dto.name, type: dto.type },
    });
    if (exists)
      throw new BadRequestException(
        `Category "${dto.name}" already exists for type "${dto.type}"`,
      );

    const category = this.repo.create({ ...dto, createdBy: user });
    return this.repo.save(category);
  }

  async findAll(query: {
    search?: string;
    type?: CategoryType;
    page?: number;
    limit?: number;
  }) {
    const { search = '', type, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const qb = this.repo
      .createQueryBuilder('cat')
      .orderBy('cat.name', 'ASC')
      .skip(skip)
      .take(limit);

    if (search) {
      qb.where('cat.name ILIKE :search', { search: `%${search}%` });
    }
    if (type) {
      qb.andWhere('cat.type = :type', { type });
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

  async findOne(id: string): Promise<AccountingCategoryEntity> {
    const cat = await this.repo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException(`Category ${id} not found`);
    return cat;
  }

  async update(
    id: string,
    dto: UpdateAccountingCategoryDto,
  ): Promise<AccountingCategoryEntity> {
    const cat = await this.findOne(id);
    Object.assign(cat, dto);
    return this.repo.save(cat);
  }

  async remove(id: string): Promise<{ message: string }> {
    const cat = await this.findOne(id);
    await this.repo.remove(cat);
    return { message: 'Category deleted successfully' };
  }
}