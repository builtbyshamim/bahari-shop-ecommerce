import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FeatureTypesService } from './feature-types.service';
import { CreateFeatureTypeDto } from './dto/create-feature-type.dto';
import { UpdateFeatureTypeDto } from './dto/update-feature-type.dto';
import { PublicRoute } from 'src/common/decorators/public.decorator';

@ApiTags('Feature Types')
@ApiBearerAuth()
@Controller('feature-types')
export class FeatureTypesController {
  constructor(private readonly service: FeatureTypesService) {}

  @Post()
  @ApiOperation({ summary: 'Create feature type' })
  create(@Body() dto: CreateFeatureTypeDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all feature types (admin)' })
  findAll() {
    return this.service.findAll();
  }

  @Get('active')
  @PublicRoute()
  @ApiOperation({ summary: 'Get active feature types (public)' })
  findAllActive() {
    return this.service.findAllActive();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFeatureTypeDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
