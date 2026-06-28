import {
  Body, Controller, Delete, Get, Param,
  ParseUUIDPipe, Post, Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrderPaymentsService } from './order-payments.service';
import { CreateOrderPaymentDto, OrderPaymentFilterDto } from './dto/create-order-payment.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/shared/enums/user-role.enum';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@ApiTags('Order Payments')
@Controller('order-payments')
@Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
export class OrderPaymentsController {
  constructor(private readonly service: OrderPaymentsService) {}

  // POST /order-payments
  @Post()
  @ApiOperation({ summary: 'Record a payment for an order' })
  create(@Body() dto: CreateOrderPaymentDto, @CurrentUser() user: any) {
    return this.service.create(dto, user?.id ?? null);
  }

  // GET /order-payments
  @Get()
  @ApiOperation({ summary: 'List all order payments with filters' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('orderId') orderId?: string,
    @Query('orderNumber') orderNumber?: string,
    @Query('accountId') accountId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const filter: OrderPaymentFilterDto = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      orderId,
      orderNumber,
      accountId,
      from,
      to,
    };
    return this.service.findAll(filter);
  }

  // GET /order-payments/by-invoice/:orderNumber
  @Get('by-invoice/:orderNumber')
  @ApiOperation({ summary: 'Get order + payment ledger by invoice number' })
  findByInvoice(@Param('orderNumber') orderNumber: string) {
    return this.service.findByOrderNumber(orderNumber);
  }

  // GET /order-payments/by-order/:orderId
  @Get('by-order/:orderId')
  @ApiOperation({ summary: 'Get payment ledger for a specific order UUID' })
  findByOrder(@Param('orderId', ParseUUIDPipe) orderId: string) {
    return this.service.findByOrder(orderId);
  }

  // GET /order-payments/:id
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  // DELETE /order-payments/:id
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
