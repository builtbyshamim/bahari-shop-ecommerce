import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus, PaymentStatus } from './entities/order.entity';
import { PublicRoute } from 'src/common/decorators/public.decorator';
import { UserRole } from 'src/common/shared/enums/user-role.enum';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserEntity } from '../users/entities/user.entity';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // POST /orders — storefront customer order (public)
  @Post()
  @PublicRoute()
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  // POST /orders/admin-create — admin / employee places order on behalf of customer
  @Post('admin-create')
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @ApiOperation({
    summary: 'Admin/Employee creates order on behalf of customer',
  })
  adminCreate(@Body() dto: CreateOrderDto, @CurrentUser() user: UserEntity) {
    return this.ordersService.create(dto, user.id);
  }

  // GET /orders — admin/employee order list with optional filters
  @Get()
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'createdById', required: false })
  @ApiQuery({ name: 'status', required: false, enum: OrderStatus })
  @ApiQuery({
    name: 'from',
    required: false,
    description: 'Start date YYYY-MM-DD',
  })
  @ApiQuery({ name: 'to', required: false, description: 'End date YYYY-MM-DD' })
  findAll(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('createdById') createdById?: string,
    @Query('status') status?: OrderStatus,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.ordersService.findAll({
      search,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      createdById,
      status,
      from,
      to,
    });
  }

  // GET /orders/my-orders — authenticated customer's own orders
  @Get('my-orders')
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.EMPLOYEE)
  getMyOrders(@CurrentUser() user: UserEntity) {
    return this.ordersService.findByUserId(user.id);
  }

  // GET /orders/search/phone/:phone — look up all orders by customer phone
  @Get('search/phone/:phone')
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Find all orders by customer phone number' })
  findByPhone(@Param('phone') phone: string) {
    return this.ordersService.findByPhone(phone);
  }

  // GET /orders/number/:orderNumber
  @Get('number/:orderNumber')
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  findByOrderNumber(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.findByOrderNumber(orderNumber);
  }

  // GET /orders/public/track/:orderNumber — public order tracking by invoice/order number
  @Get('public/track/:orderNumber')
  @PublicRoute()
  @ApiOperation({ summary: 'Public order tracking by order number' })
  trackByOrderNumber(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.findByOrderNumberPublic(orderNumber);
  }

  // GET /orders/public/id/:id — public order view by UUID (for thanks-massage page)
  @Get('public/id/:id')
  @PublicRoute()
  @ApiOperation({ summary: 'Public order view by UUID' })
  getPublicById(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findByOrderNumberPublic_ById(id);
  }

  // GET /orders/:id
  @Get(':id')
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.EMPLOYEE)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(id);
  }

  // PATCH /orders/:id/status
  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: OrderStatus,
  ) {
    return this.ordersService.updateStatus(id, status);
  }

  // PATCH /orders/:id/payment-status
  @Patch(':id/payment-status')
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  updatePaymentStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('paymentStatus') paymentStatus: PaymentStatus,
  ) {
    return this.ordersService.updatePaymentStatus(id, paymentStatus);
  }

  // PATCH /orders/:id/cancel
  @Patch(':id/cancel')
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  cancel(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.cancel(id);
  }
}
