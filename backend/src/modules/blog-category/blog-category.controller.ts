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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BlogCategoryService } from './blog-category.service';
import { CreateBlogCategoryDto } from './dto/create-blog-category.dto';
import { UpdateBlogCategoryDto } from './dto/update-blog-category.dto';
import { PublicRoute } from 'src/common/decorators/public.decorator';

@ApiTags('Blog Categories')
@ApiBearerAuth()
@Controller('blog-categories')
export class BlogCategoryController {
  constructor(private readonly service: BlogCategoryService) {}

  @Post()
  create(@Body() dto: CreateBlogCategoryDto) {
    return this.service.create(dto);
  }

  @Get()
  @PublicRoute()
  findAll(@Query() query: { search?: string; page?: number; limit?: number }) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @PublicRoute()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateBlogCategoryDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
