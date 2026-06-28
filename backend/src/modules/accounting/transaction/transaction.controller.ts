import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto, TransactionFilterDto, UpdateTransactionDto } from './dto/create-transaction.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@ApiTags('Transactions')
@ApiBearerAuth()
@Controller('accounting-transactions')
export class TransactionController {
  constructor(private readonly service: TransactionService) {}

  @Post()
  async create(@Body() dto: CreateTransactionDto, @CurrentUser() user: any) {
    const data = await this.service.create(dto, user);
    return {
      success: true,
      message: 'Transaction recorded successfully',
      data,
    };
  }

  @Get()
  async findAll(@Query() filter: TransactionFilterDto) {
    const data = await this.service.findAll(filter);
    return { success: true, data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.service.findOne(id);
    return { success: true, data };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTransactionDto) {
    const data = await this.service.update(id, dto);
    return {
      success: true,
      message: 'Transaction updated successfully',
      data,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.service.remove(id);
    return { success: true, ...data };
  }
}