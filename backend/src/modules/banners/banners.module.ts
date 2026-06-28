import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BannersController } from './banners.controller';
import { BannersService } from './banners.service';
import { Banner } from './entities/banner.entity';
import { ImageUploadModule } from '../image-upload/image-upload.module';

@Module({
  imports: [TypeOrmModule.forFeature([Banner]), ImageUploadModule],
  controllers: [BannersController],
  providers: [BannersService],
  exports: [BannersService],
})
export class BannersModule {}
