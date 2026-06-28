import { Controller, Get, Post, Body, Param, Req } from '@nestjs/common';
import { CourierServiceTokenService } from './courier-service-token.service';
import { CreateCourierServiceTokenDto } from './dto/create-courier-service-token.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserEntity } from 'src/modules/users/entities/user.entity';
@Controller('courier-service-token')
export class CourierServiceTokenController {
  constructor(private readonly courierServiceTokenService: CourierServiceTokenService) { }

  @Post()
  create(@CurrentUser() user: UserEntity, @Body() createCourierServiceTokenDto: CreateCourierServiceTokenDto) {
    const performedBy = user?.id;
    return this.courierServiceTokenService.create(performedBy, createCourierServiceTokenDto);
  }

  @Get()
  myCourierservice() {
    return this.courierServiceTokenService.myCourierservice();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courierServiceTokenService.findOne(id);
  }


}
