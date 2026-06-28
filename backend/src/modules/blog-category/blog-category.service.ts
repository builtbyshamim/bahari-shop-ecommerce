import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import slugify from 'slugify';
import { BlogCategory } from './entities/blog-category.entity';
import { CreateBlogCategoryDto } from './dto/create-blog-category.dto';
import { UpdateBlogCategoryDto } from './dto/update-blog-category.dto';

@Injectable()
export class BlogCategoryService {
  constructor(
    @InjectRepository(BlogCategory)
    private readonly repo: Repository<BlogCategory>,
  ) {}

  async create(dto: CreateBlogCategoryDto): Promise<BlogCategory> {
    const slug = dto.slug || slugify(dto.name, { lower: true, strict: true });
    const exists = await this.repo.findOne({ where: { slug } });
    if (exists) throw new ConflictException(`Blog category slug "${slug}" already exists`);

    const category = this.repo.create({ ...dto, slug });
    return this.repo.save(category);
  }

  async findAll(query: { search?: string; page?: number; limit?: number }) {
    const { search = '', page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await this.repo.findAndCount({
      where: search ? { name: Like(`%${search}%`) } : {},
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
      take: limit,
      skip,
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

  async findOne(id: string): Promise<BlogCategory> {
    const cat = await this.repo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException(`Blog category "${id}" not found`);
    return cat;
  }

  async update(id: string, dto: UpdateBlogCategoryDto): Promise<BlogCategory> {
    const cat = await this.findOne(id);
    if (dto.slug && dto.slug !== cat.slug) {
      const exists = await this.repo.findOne({ where: { slug: dto.slug } });
      if (exists) throw new ConflictException(`Slug "${dto.slug}" already taken`);
    }
    Object.assign(cat, dto);
    return this.repo.save(cat);
  }

  async remove(id: string): Promise<{ message: string }> {
    const cat = await this.findOne(id);
    await this.repo.remove(cat);
    return { message: 'Blog category deleted successfully' };
  }
}
