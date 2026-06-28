import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { GetBrandDto } from './dto/get-brand.dto';

import { PublicRoute } from 'src/common/decorators/public.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserEntity } from '../users/entities/user.entity';
import { BrandStatus } from './entities/brand.entity';

@Controller('brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) { }

  // ✅ Create Brand (Logo + Banner Upload)
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logo', maxCount: 1 },
      { name: 'banner', maxCount: 1 },
    ]),
  )
  create(
    @CurrentUser() user: UserEntity,
    @Body() dto: CreateBrandDto,
    @UploadedFiles()
    files: {
      logo?: Express.Multer.File[];
      banner?: Express.Multer.File[];
    },
  ) {
    return this.brandService.create(
      user,
      dto,
      files?.logo?.[0],
      files?.banner?.[0],
    );
  }

  // ✅ Get All (Pagination + Search + Status)
  @Get()
  @PublicRoute()
  findAll(@Query() query: GetBrandDto) {
    return this.brandService.findAll(query);
  }

  @Get('public')
  @PublicRoute()
  findAllPublic(@Query() query: GetBrandDto) {
    return this.brandService.findAll({ ...query, status: BrandStatus.ACTIVE });
  }
  // ✅ Get Single
  @Get(':id')
  @PublicRoute()
  findOne(@Param('id') id: string) {
    return this.brandService.findOne(id);
  }

  // ✅ Update Brand
  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logo', maxCount: 1 },
      { name: 'banner', maxCount: 1 },
    ]),
  )
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBrandDto,
    @UploadedFiles()
    files: {
      logo?: Express.Multer.File[];
      banner?: Express.Multer.File[];
    },
  ) {
    return this.brandService.update(
      id,
      dto,
      files?.logo?.[0],
      files?.banner?.[0],
    );
  }

  // ✅ Soft Delete
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.brandService.remove(id);
  }

  // ✅ Hard Delete
  @Delete(':id/hard')
  hardDelete(@Param('id') id: string) {
    return this.brandService.hardDelete(id);
  }

}