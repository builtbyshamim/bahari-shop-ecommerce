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
import { EmployeeService } from './employee.service';
import {
  CreateEmployeeDto,
  EmployeeFilterDto,
  UpdateEmployeeDto,
} from './dto/employee.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('HRM - Employees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('hrm/employees')
export class EmployeeController {
  constructor(private readonly service: EmployeeService) {}

  @Post()
  async create(@Body() dto: CreateEmployeeDto) {
    const data = await this.service.create(dto);
    return { success: true, message: 'Employee created successfully', data };
  }

  @Get()
  async findAll(@Query() filter: EmployeeFilterDto) {
    const data = await this.service.findAll(filter);
    return { success: true, data };
  }

  @Get('stats')
  async getStats() {
    const data = await this.service.getStats();
    return { success: true, data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.service.findOne(id);
    return { success: true, data };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
    const data = await this.service.update(id, dto);
    return { success: true, message: 'Employee updated successfully', data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.service.remove(id);
    return { success: true, ...data };
  }
}