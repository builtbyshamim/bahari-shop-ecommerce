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
import { AccountingCategoryService } from './category.service';
import { CreateAccountingCategoryDto, UpdateAccountingCategoryDto } from './dto/create-category.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CategoryType } from './entities/category.entity';

@ApiTags('Accounting Categories')
@ApiBearerAuth()
@Controller('accounting-categories')
export class AccountingCategoryController {
  constructor(private readonly service: AccountingCategoryService) {}

  @Post()
  async create(
    @Body() dto: CreateAccountingCategoryDto,
    @CurrentUser() user: any,
  ) {
    const data = await this.service.create(dto, user);
    return { success: true, message: 'Category created successfully', data };
  }

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('type') type?: CategoryType,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const data = await this.service.findAll({ search, type, page, limit });
    return { success: true, data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.service.findOne(id);
    return { success: true, data };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAccountingCategoryDto,
  ) {
    const data = await this.service.update(id, dto);
    return { success: true, message: 'Category updated successfully', data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.service.remove(id);
    return { success: true, ...data };
  }
}