import { Controller, Get } from '@nestjs/common';
import { CourierServiceService } from './courier-service.service';
@Controller('courier_service')
export class CourierServiceController {
  constructor(private readonly courierServiceService: CourierServiceService) { }
  @Get()
  findAll() {
    return this.courierServiceService.findAll();
  }
}
