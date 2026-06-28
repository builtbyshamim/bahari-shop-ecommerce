// courier-assign.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { AssignSteadfastDto, AssignPathaoDto } from './dto/assign-courier.dto';
import { CourierAssignService } from './courier-aasign-service.service';

@Controller('courier-assign')
export class CourierAssignController {
  constructor(private readonly courierAssignService: CourierAssignService) {}

  @Post('steadfast')
  assignSteadfast(@Body() dto: AssignSteadfastDto) {
    return this.courierAssignService.assignSteadfast(dto);
  }

  @Post('pathao')
  assignPathao(@Body() dto: AssignPathaoDto) {
    return this.courierAssignService.assignPathao(dto);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// courier-assign.module.ts
// ─────────────────────────────────────────────────────────────────────────────
// import { Module } from '@nestjs/common';
// import { CourierAssignService } from './courier-assign.service';
// import { CourierAssignController } from './courier-assign.controller';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { Order } from '../orders/entities/order.entity';
// import { CourierServiceToken } from '../courier-service-token/entities/courier-service-token.entity';
//
// @Module({
//   imports: [TypeOrmModule.forFeature([Order, CourierServiceToken])],
//   controllers: [CourierAssignController],
//   providers: [CourierAssignService],
// })
// export class CourierAssignModule {}