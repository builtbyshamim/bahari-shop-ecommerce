import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourierService } from './entities/courier-service.entity';


@Injectable()
export class CourierServiceService {
  constructor(
    @InjectRepository(CourierService)
    private readonly courierServiceRepository: Repository<CourierService>,
  ) { }

  async onModuleInit() {
    const courierServices = [
      { id: 1, name: 'Pathao Courier' },
      { id: 2, name: 'Steadfast Courier' },
      { id: 3, name: 'RedX Courier' },
    ];

    for (const courierService of courierServices) {
      const exists = await this.courierServiceRepository.findOne({
        where: { id: courierService.id },
      });

      if (!exists) {
        await this.courierServiceRepository.save(courierService);
      }
    }
  }

  findAll() {
    return this.courierServiceRepository.find({
      order: { id: 'ASC' },
    });
  }
}
