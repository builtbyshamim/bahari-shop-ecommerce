import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FeaturedSectionsService } from './featured-sections.service';
import { CreateFeaturedSectionDto } from './dto/create-featured-section.dto';
import { UpdateFeaturedSectionDto } from './dto/update-featured-section.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { PublicRoute } from 'src/common/decorators/public.decorator';

@ApiTags('Featured Sections')
@ApiBearerAuth()
@Controller('featured-sections')
export class FeaturedSectionsController {
  constructor(private readonly service: FeaturedSectionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a featured section' })
  create(@Body() dto: CreateFeaturedSectionDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all featured sections (admin)' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get('active')
  @PublicRoute()
  @ApiOperation({ summary: 'Get active sections with products (public)' })
  getActiveSections() {
    return this.service.getActiveSections();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single featured section' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update featured section' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFeaturedSectionDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete featured section' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
