import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TopRankingService } from './top-ranking.service';
import { CreateTopRankingDto } from './dto/create-top-ranking.dto';
import { UpdateTopRankingDto } from './dto/update-top-ranking.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { PublicRoute } from 'src/common/decorators/public.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserEntity } from '../users/entities/user.entity';

@ApiTags('Top Rankings')
@ApiBearerAuth()
@Controller('top-rankings')
export class TopRankingController {
  constructor(private readonly service: TopRankingService) {}

  @Post()
  @ApiOperation({ summary: 'Create ranking' })
  create(@CurrentUser() user: UserEntity, @Body() dto: CreateTopRankingDto) {
    return this.service.create(user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all rankings (admin)' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get('active-sections')
  @PublicRoute()
  @ApiOperation({ summary: 'Get all active feature-type sections with ranked products (public)' })
  getActiveSections() {
    return this.service.getActiveSections();
  }

  @Get('products/:slug')
  @PublicRoute()
  @ApiOperation({ summary: 'Get ranked products by feature type slug (public)' })
  getProductsByFeatureType(@Param('slug') slug: string) {
    return this.service.getRankingProducts(slug);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTopRankingDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
