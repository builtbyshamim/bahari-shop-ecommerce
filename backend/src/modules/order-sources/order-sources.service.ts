import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderSource } from './entities/order-source.entity';
import { CreateOrderSourceDto } from './dto/create-order-source.dto';
import { UpdateOrderSourceDto } from './dto/update-order-source.dto';

@Injectable()
export class OrderSourcesService {
  constructor(
    @InjectRepository(OrderSource)
    private readonly repo: Repository<OrderSource>,
  ) {}

  async create(dto: CreateOrderSourceDto): Promise<OrderSource> {
    const existing = await this.repo.findOne({ where: { name: dto.name } });
    if (existing) {
      throw new ConflictException(
        `Order source with name "${dto.name}" already exists`,
      );
    }

    const orderSource = this.repo.create({
      name: dto.name ?? 'ecommerce',
      status: dto.status ?? true,
    });

    return this.repo.save(orderSource);
  }

  async findAll(): Promise<OrderSource[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<OrderSource> {
    const orderSource = await this.repo.findOne({ where: { id } });
    if (!orderSource) {
      throw new NotFoundException(`Order source with ID "${id}" not found`);
    }
    return orderSource;
  }

  async update(id: string, dto: UpdateOrderSourceDto): Promise<OrderSource> {
    const orderSource = await this.findOne(id);

    if (dto.name && dto.name !== orderSource.name) {
      const existing = await this.repo.findOne({ where: { name: dto.name } });
      if (existing) {
        throw new ConflictException(
          `Order source with name "${dto.name}" already exists`,
        );
      }
    }

    Object.assign(orderSource, dto);
    return this.repo.save(orderSource);
  }

  async remove(id: string): Promise<{ message: string }> {
    const orderSource = await this.findOne(id);
    await this.repo.remove(orderSource);
    return { message: `Order source "${orderSource.name}" deleted successfully` };
  }
}
