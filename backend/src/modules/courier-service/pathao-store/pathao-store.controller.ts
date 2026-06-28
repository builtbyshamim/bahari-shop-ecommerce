import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PathaoStoreService } from './pathao-store.service';
import {
  CreatePathaoStoreDto,
  PathaoStoreFilterDto,
  UpdatePathaoStoreDto,
} from './dto/pathao-store.dto';

@ApiTags('Courier - Pathao Stores')
@ApiBearerAuth()
@Controller('courier/pathao-stores')
export class PathaoStoreController {
  constructor(private readonly service: PathaoStoreService) {}

  @Post()
  async create(@Body() dto: CreatePathaoStoreDto) {
    const data = await this.service.create(dto);
    return { success: true, message: 'Pathao store created successfully', data };
  }

  @Get()
  async findAll(@Query() filter: PathaoStoreFilterDto) {
    const data = await this.service.findAll(filter);
    return { success: true, data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.service.findOne(id);
    return { success: true, data };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePathaoStoreDto) {
    const data = await this.service.update(id, dto);
    return { success: true, message: 'Pathao store updated successfully', data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.service.remove(id);
    return { success: true, ...data };
  }
}