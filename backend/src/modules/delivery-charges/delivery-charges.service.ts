import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryCharge } from './entities/delivery-charge.entity';
import { CreateDeliveryChargeDto } from './dto/create-delivery-charge.dto';
import { UpdateDeliveryChargeDto } from './dto/update-delivery-charge.dto';

@Injectable()
export class DeliveryChargesService {
  constructor(
    @InjectRepository(DeliveryCharge)
    private readonly deliveryChargeRepository: Repository<DeliveryCharge>,
  ) {}

  async create(
    createDeliveryChargeDto: CreateDeliveryChargeDto,
    userId: string,
  ): Promise<DeliveryCharge> {
    const existing = await this.deliveryChargeRepository.findOne({
      where: { name: createDeliveryChargeDto.name },
    });
    if (existing) {
      throw new ConflictException(
        `Delivery charge with name "${createDeliveryChargeDto.name}" already exists`,
      );
    }

    const deliveryCharge = this.deliveryChargeRepository.create({
      ...createDeliveryChargeDto,
      createdBy: userId,
    });
    return this.deliveryChargeRepository.save(deliveryCharge);
  }

  async findAll(): Promise<DeliveryCharge[]> {
    return this.deliveryChargeRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findAllActive(): Promise<DeliveryCharge[]> {
    return this.deliveryChargeRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<DeliveryCharge> {
    const deliveryCharge = await this.deliveryChargeRepository.findOne({
      where: { id },
    });
    if (!deliveryCharge) {
      throw new NotFoundException(`Delivery charge with ID "${id}" not found`);
    }
    return deliveryCharge;
  }

  async update(
    id: string,
    updateDeliveryChargeDto: UpdateDeliveryChargeDto,
  ): Promise<DeliveryCharge> {
    const deliveryCharge = await this.findOne(id);

    if (
      updateDeliveryChargeDto.name &&
      updateDeliveryChargeDto.name !== deliveryCharge.name
    ) {
      const existing = await this.deliveryChargeRepository.findOne({
        where: { name: updateDeliveryChargeDto.name },
      });
      if (existing) {
        throw new ConflictException(
          `Delivery charge with name "${updateDeliveryChargeDto.name}" already exists`,
        );
      }
    }

    Object.assign(deliveryCharge, updateDeliveryChargeDto);
    return this.deliveryChargeRepository.save(deliveryCharge);
  }

  async remove(id: string): Promise<{ message: string }> {
    const deliveryCharge = await this.findOne(id);
    await this.deliveryChargeRepository.remove(deliveryCharge);
    return { message: `Delivery charge "${deliveryCharge.name}" deleted successfully` };
  }
}