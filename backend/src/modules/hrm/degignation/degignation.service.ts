import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DesignationEntity } from './entities/degignation.entity';
import { CreateDesignationDto, UpdateDesignationDto } from './dto/create-degignation.dto';

@Injectable()
export class DesignationService {
  constructor(
    @InjectRepository(DesignationEntity)
    private readonly repo: Repository<DesignationEntity>,
  ) {}

  async create(dto: CreateDesignationDto): Promise<DesignationEntity> {
    const exists = await this.repo.findOne({ where: { name: dto.name } });
    if (exists) {
      throw new BadRequestException(`Designation "${dto.name}" already exists`);
    }
    const designation = this.repo.create(dto);
    return this.repo.save(designation);
  }

  async findAll(query: {
    search?: string;
    page?: number;
    limit?: number;
    is_active?: boolean;
  }) {
    const { search, page = 1, limit = 10, is_active } = query;
    const skip = (page - 1) * limit;

    const qb = this.repo
      .createQueryBuilder('d')
      .orderBy('d.name', 'ASC')
      .skip(skip)
      .take(limit);

    if (search) {
      qb.where('d.name ILIKE :search', { search: `%${search}%` });
    }
    if (is_active !== undefined) {
      qb.andWhere('d.is_active = :is_active', { is_active });
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

  async findOne(id: string): Promise<DesignationEntity> {
    const d = await this.repo.findOne({ where: { id } });
    if (!d) throw new NotFoundException(`Designation ${id} not found`);
    return d;
  }

  async update(id: string, dto: UpdateDesignationDto): Promise<DesignationEntity> {
    const d = await this.findOne(id);
    Object.assign(d, dto);
    return this.repo.save(d);
  }

  async remove(id: string): Promise<{ message: string }> {
    const d = await this.findOne(id);
    // Check if any employee uses this designation
    const count = await this.repo
      .createQueryBuilder('d')
      .innerJoin('d.employees', 'e')
      .where('d.id = :id', { id })
      .getCount();

    if (count > 0) {
      throw new BadRequestException(
        `Cannot delete — ${count} employee(s) are assigned to this designation`,
      );
    }

    await this.repo.remove(d);
    return { message: 'Designation deleted successfully' };
  }
}