import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscriber } from './entities/subscriber.entity';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';

@Injectable()
export class SubscribersService {
  constructor(
    @InjectRepository(Subscriber)
    private readonly repo: Repository<Subscriber>,
  ) {}

  async create(dto: CreateSubscriberDto, source = 'website'): Promise<Subscriber> {
    const existing = await this.repo.findOne({ where: { email: dto.email } });
    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        return this.repo.save(existing);
      }
      throw new BadRequestException('Email is already subscribed');
    }
    const subscriber = this.repo.create({ ...dto, source });
    return this.repo.save(subscriber);
  }

  async findAll(query: { search?: string; page?: number; limit?: number }) {
    const { search = '', page = 1, limit = 10 } = query;
    const qb = this.repo
      .createQueryBuilder('s')
      .orderBy('s.createdAt', 'DESC');

    if (search) {
      qb.where('(s.email ILIKE :s OR s.name ILIKE :s)', { s: `%${search}%` });
    }

    const totalItems = await qb.getCount();
    const data = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data,
      meta: { totalItems, totalPages: Math.ceil(totalItems / limit) },
    };
  }

  async remove(id: string): Promise<void> {
    const sub = await this.repo.findOne({ where: { id } });
    if (!sub) throw new NotFoundException('Subscriber not found');
    await this.repo.remove(sub);
  }

  async toggleActive(id: string): Promise<Subscriber> {
    const sub = await this.repo.findOne({ where: { id } });
    if (!sub) throw new NotFoundException('Subscriber not found');
    sub.isActive = !sub.isActive;
    return this.repo.save(sub);
  }
}
