import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeatureType } from './entities/feature-type.entity';
import { CreateFeatureTypeDto } from './dto/create-feature-type.dto';
import { UpdateFeatureTypeDto } from './dto/update-feature-type.dto';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class FeatureTypesService {
  constructor(
    @InjectRepository(FeatureType)
    private readonly repo: Repository<FeatureType>,
  ) {}

  async create(dto: CreateFeatureTypeDto) {
    const slug = slugify(dto.name);
    const existing = await this.repo.findOne({ where: { slug } });
    if (existing) {
      throw new ConflictException(`Feature type "${dto.name}" already exists`);
    }

    const entity = this.repo.create({
      name: dto.name,
      slug,
      priority: dto.priority ?? 0,
      isActive: dto.isActive ?? true,
    });

    return this.repo.save(entity);
  }

  async findAll() {
    return this.repo.find({
      order: { priority: 'ASC' },
    });
  }

  async findAllActive() {
    return this.repo.find({
      where: { isActive: true },
      order: { priority: 'ASC' },
    });
  }

  async findOne(id: string) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Feature type #${id} not found`);
    return item;
  }

  async findBySlug(slug: string) {
    const item = await this.repo.findOne({ where: { slug } });
    if (!item) throw new NotFoundException(`Feature type "${slug}" not found`);
    return item;
  }

  async update(id: string, dto: UpdateFeatureTypeDto) {
    const item = await this.findOne(id);

    if (dto.name && dto.name !== item.name) {
      const slug = slugify(dto.name);
      const conflict = await this.repo.findOne({ where: { slug } });
      if (conflict && conflict.id !== id) {
        throw new ConflictException(
          `Feature type "${dto.name}" already exists`,
        );
      }
      item.name = dto.name;
      item.slug = slug;
    }

    if (dto.priority !== undefined) item.priority = dto.priority;
    if (dto.isActive !== undefined) item.isActive = dto.isActive;

    return this.repo.save(item);
  }

  async remove(id: string) {
    const item = await this.findOne(id);
    await this.repo.remove(item);
    return { message: 'Feature type deleted successfully' };
  }
}
