import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TrendingSearchService } from './trending-search.service';
import { CreateTrendingSearchDto } from './dto/create-trending-search.dto';
import { UpdateTrendingSearchDto } from './dto/update-trending-search.dto';
import { PublicRoute } from 'src/common/decorators/public.decorator';

@ApiTags('Trending Searches')
@ApiBearerAuth()
@Controller('trending-searches')
export class TrendingSearchController {
  constructor(private readonly service: TrendingSearchService) {}

  @Post()
  @ApiOperation({ summary: 'Create trending search (admin)' })
  create(@Body() dto: CreateTrendingSearchDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all trending searches (admin)' })
  findAll() {
    return this.service.findAll();
  }

  @Get('active')
  @PublicRoute()
  @ApiOperation({ summary: 'Get active trending searches (public)' })
  findAllActive() {
    return this.service.findAllActive();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update trending search (admin)' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTrendingSearchDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete trending search (admin)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
