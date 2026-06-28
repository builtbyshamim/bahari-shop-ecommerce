import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserEntity } from '../users/entities/user.entity';
import { PublicRoute } from 'src/common/decorators/public.decorator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

@ApiTags('Coupons')
@ApiBearerAuth()
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new coupon (admin)' })
  create(@CurrentUser() user: UserEntity, @Body() dto: CreateCouponDto) {
    return this.couponsService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List all coupons with pagination (admin)' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.couponsService.findAll(query);
  }

  @Post('validate')
  @PublicRoute()
  @ApiOperation({ summary: 'Validate a coupon code (public)' })
  validate(@Body() body: { code: string; cartTotal: number }) {
    return this.couponsService.validate(body.code, body.cartTotal);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a coupon by ID (admin)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.couponsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a coupon (admin)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCouponDto,
  ) {
    return this.couponsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a coupon (admin)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.couponsService.remove(id);
  }
}
