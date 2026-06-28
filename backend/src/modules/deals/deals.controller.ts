// deals.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DealsService } from './deals.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserEntity } from '../users/entities/user.entity';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { PublicRoute } from 'src/common/decorators/public.decorator';

@ApiTags('Deals')
@ApiBearerAuth()
@Controller('deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new deal' })
  create(@CurrentUser() user: UserEntity, @Body() dto: CreateDealDto) {
    return this.dealsService.create(user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all deals' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.dealsService.findAll(query);
  }

  @Get('get-top-deals-products')
  @PublicRoute()
  @ApiOperation({ summary: 'Get top deals products' })
  getTopDealsProduct() {
    return this.dealsService.getTopDealsProduct();
  }

  @Get('all-deals-products')
  @PublicRoute()
  @ApiOperation({
    summary: 'Get all active deals with product and deal details',
  })
  getAllDealsProducts(@Query() query: PaginationQueryDto) {
    return this.dealsService.getAllDealsProducts(query);
  }

  @Get('product/:productId')
  @PublicRoute()
  @ApiOperation({ summary: 'Get active deal for a specific product (null if none)' })
  getActiveDealForProduct(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.dealsService.getActiveDealForProduct(productId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a deal by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.dealsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a deal' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateDealDto) {
    return this.dealsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a deal' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.dealsService.remove(id);
  }
}
