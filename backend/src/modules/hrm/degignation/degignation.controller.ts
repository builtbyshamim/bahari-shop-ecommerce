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
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { DesignationService } from './degignation.service';
import { CreateDesignationDto, UpdateDesignationDto } from './dto/create-degignation.dto';

@ApiTags('HRM - Designations')
@ApiBearerAuth()
@Controller('hrm/designations')
export class DesignationController {
  constructor(private readonly service: DesignationService) {}

  @Post()
  async create(@Body() dto: CreateDesignationDto) {
    const data = await this.service.create(dto);
    return { success: true, message: 'Designation created successfully', data };
  }

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const data = await this.service.findAll({ search, page, limit });
    return { success: true, data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.service.findOne(id);
    return { success: true, data };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateDesignationDto) {
    const data = await this.service.update(id, dto);
    return { success: true, message: 'Designation updated successfully', data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.service.remove(id);
    return { success: true, ...data };
  }
}