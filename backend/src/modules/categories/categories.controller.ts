import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PublicRoute } from 'src/common/decorators/public.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserEntity } from '../users/entities/user.entity';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { ReorderCategoryDto } from './dto/reorder-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private service: CategoriesService) { }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @CurrentUser() user: UserEntity,
    @Body() dto: CreateCategoryDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.create(user, dto, file);
  }

  @Get()
  @PublicRoute()
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  // ✅ Tree endpoint — /categories/tree
  // ⚠️ findAll এর আগে রাখতে হবে, না হলে 'tree' কে :id হিসেবে match করবে
  @Get('tree')
  @PublicRoute()
  findTree() {
    return this.service.findTree();
  }

  @Get('view-tree')
  @PublicRoute()
  findViewTree() {
    return this.service.findTree();
  }

  // ✅ Descendants endpoint — /categories/descendants/:id
  @Get('descendants/:id')
  @PublicRoute()
  findDescendants(@Param('id') id: string) {
    return this.service.findDescendantIds(id);
  }

  // ✅ Filter with descendants — /categories/filter?categoryId=xxx&search=yyy&page=1&limit=10
  @Get('filter')
  @PublicRoute()
  findWithDescendants(
    @Query() query: PaginationQueryDto & { categoryId?: string },
  ) {
    return this.service.findAllWithDescendants(query);
  }

  @Get(':id')
  @PublicRoute()
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @PublicRoute()
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.service.update(id, dto, file);
  }

  @Patch('position/reorder')
  reorder(@Body() body: ReorderCategoryDto) {
    return this.service.reorder(body.items);
  }


  @Delete(':id')
  @PublicRoute()
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}