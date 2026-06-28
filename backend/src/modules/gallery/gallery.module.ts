import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GalleryController } from './gallery.controller';
import { GalleryService } from './gallery.service';
import { GalleryItem } from './entities/gallery-item.entity';
import { ImageUploadModule } from '../image-upload/image-upload.module';

@Module({
  imports: [TypeOrmModule.forFeature([GalleryItem]), ImageUploadModule],
  controllers: [GalleryController],
  providers: [GalleryService],
  exports: [GalleryService],
})
export class GalleryModule {}
