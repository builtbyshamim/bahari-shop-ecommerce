import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OrderSourcesService } from './order-sources.service';
import { CreateOrderSourceDto } from './dto/create-order-source.dto';
import { UpdateOrderSourceDto } from './dto/update-order-source.dto';
import { PublicRoute } from 'src/common/decorators/public.decorator';

@ApiTags('Order Sources')
@ApiBearerAuth()
@Controller('order-sources')
export class OrderSourcesController {
  constructor(private readonly orderSourcesService: OrderSourcesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order source' })
  @ApiResponse({ status: 201, description: 'Order source created successfully' })
  @ApiResponse({ status: 409, description: 'Order source name already exists' })
  create(@Body() dto: CreateOrderSourceDto) {
    return this.orderSourcesService.create(dto);
  }

  @Get()
  @PublicRoute()
  @ApiOperation({ summary: 'Get all order sources' })
  @ApiResponse({ status: 200, description: 'Returns all order sources' })
  findAll() {
    return this.orderSourcesService.findAll();
  }

  @Get(':id')
  @PublicRoute()
  @ApiOperation({ summary: 'Get order source by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Returns the order source' })
  @ApiResponse({ status: 404, description: 'Order source not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.orderSourcesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an order source' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Order source updated successfully' })
  @ApiResponse({ status: 404, description: 'Order source not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderSourceDto,
  ) {
    return this.orderSourcesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an order source' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Order source deleted successfully' })
  @ApiResponse({ status: 404, description: 'Order source not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.orderSourcesService.remove(id);
  }
}
