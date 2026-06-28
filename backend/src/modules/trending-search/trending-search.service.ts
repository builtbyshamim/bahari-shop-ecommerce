import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrendingSearch } from './entities/trending-search.entity';
import { CreateTrendingSearchDto } from './dto/create-trending-search.dto';
import { UpdateTrendingSearchDto } from './dto/update-trending-search.dto';

@Injectable()
export class TrendingSearchService {
  constructor(
    @InjectRepository(TrendingSearch)
    private readonly repo: Repository<TrendingSearch>,
  ) {}

  create(dto: CreateTrendingSearchDto) {
    const item = this.repo.create({
      name: dto.name,
      position: dto.position ?? 0,
      isActive: dto.isActive ?? true,
    });
    return this.repo.save(item);
  }

  findAll() {
    return this.repo.find({ order: { position: 'ASC', createdAt: 'ASC' } });
  }

  findAllActive() {
    return this.repo.find({
      where: { isActive: true },
      order: { position: 'ASC', createdAt: 'ASC' },
    });
  }

  async update(id: string, dto: UpdateTrendingSearchDto) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Trending search #${id} not found`);
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async remove(id: string) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Trending search #${id} not found`);
    await this.repo.remove(item);
    return { message: 'Deleted successfully' };
  }
}
