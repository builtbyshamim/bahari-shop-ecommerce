import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DeliveryChargesService } from './delivery-charges.service';
import { CreateDeliveryChargeDto } from './dto/create-delivery-charge.dto';
import { UpdateDeliveryChargeDto } from './dto/update-delivery-charge.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserEntity } from '../users/entities/user.entity';
import { PublicRoute } from 'src/common/decorators/public.decorator';

@ApiTags('Delivery Charges')
@ApiBearerAuth()
@Controller('delivery-charges')
export class DeliveryChargesController {
  constructor(
    private readonly deliveryChargesService: DeliveryChargesService,
  ) { }

  @Post()
  @ApiOperation({ summary: 'Create a new delivery charge' })
  @ApiResponse({ status: 201, description: 'Delivery charge created successfully' })
  @ApiResponse({ status: 409, description: 'Delivery charge name already exists' })
  create(
    @Body() createDeliveryChargeDto: CreateDeliveryChargeDto,
    @CurrentUser() user: UserEntity,
  ) {
    const userId = user.id;
    return this.deliveryChargesService.create(createDeliveryChargeDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all delivery charges' })
  @ApiResponse({ status: 200, description: 'Returns all delivery charges' })
  findAll() {
    return this.deliveryChargesService.findAll();
  }

  @Get('active')
  @PublicRoute()
  @ApiOperation({ summary: 'Get all active delivery charges' })
  @ApiResponse({ status: 200, description: 'Returns all active delivery charges' })
  findAllActive() {
    return this.deliveryChargesService.findAllActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a delivery charge by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Returns the delivery charge' })
  @ApiResponse({ status: 404, description: 'Delivery charge not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.deliveryChargesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a delivery charge' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Delivery charge updated successfully' })
  @ApiResponse({ status: 404, description: 'Delivery charge not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,

    @Body() updateDeliveryChargeDto: UpdateDeliveryChargeDto,
  ) {
    
    return this.deliveryChargesService.update(id, updateDeliveryChargeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a delivery charge' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Delivery charge deleted successfully' })
  @ApiResponse({ status: 404, description: 'Delivery charge not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.deliveryChargesService.remove(id);
  }
}