import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page } from './entities/page.entity';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(Page)
    private readonly repo: Repository<Page>,
  ) {}

  async create(dto: CreatePageDto): Promise<Page> {
    const exists = await this.repo.findOne({ where: { slug: dto.slug } });
    if (exists) {
      throw new ConflictException(`Page with slug "${dto.slug}" already exists`);
    }

    const page = this.repo.create({
      title: dto.title,
      slug: dto.slug,
      content: dto.content ?? null,
      isPublished: dto.isPublished ?? true,
      sortOrder: dto.sortOrder ?? 0,
    });

    return this.repo.save(page);
  }

  async findAll(): Promise<Page[]> {
    return this.repo.find({ order: { sortOrder: 'ASC', createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Page> {
    const page = await this.repo.findOne({ where: { id } });
    if (!page) throw new NotFoundException(`Page with ID "${id}" not found`);
    return page;
  }

  async findBySlug(slug: string): Promise<Page> {
    const page = await this.repo.findOne({
      where: { slug, isPublished: true },
    });
    if (!page) throw new NotFoundException(`Page "${slug}" not found`);
    return page;
  }

  async update(id: string, dto: UpdatePageDto): Promise<Page> {
    const page = await this.findOne(id);

    if (dto.slug && dto.slug !== page.slug) {
      const exists = await this.repo.findOne({ where: { slug: dto.slug } });
      if (exists) {
        throw new ConflictException(`Page with slug "${dto.slug}" already exists`);
      }
    }

    Object.assign(page, dto);
    return this.repo.save(page);
  }

  async remove(id: string): Promise<{ message: string }> {
    const page = await this.findOne(id);
    await this.repo.remove(page);
    return { message: 'Page deleted successfully' };
  }
}
