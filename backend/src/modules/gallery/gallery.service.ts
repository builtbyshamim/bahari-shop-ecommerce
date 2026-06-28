import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GalleryItem, GalleryMediaType } from './entities/gallery-item.entity';
import { CreateGalleryItemDto } from './dto/create-gallery-item.dto';
import { UpdateGalleryItemDto } from './dto/update-gallery-item.dto';
import { ImageKitService } from '../image-upload/imagekit.service';

@Injectable()
export class GalleryService {
  constructor(
    @InjectRepository(GalleryItem)
    private readonly repo: Repository<GalleryItem>,
    private readonly uploadService: ImageKitService,
  ) {}

  async create(dto: CreateGalleryItemDto, imageFile?: Express.Multer.File): Promise<GalleryItem> {
    if (imageFile) {
      const uploaded = await this.uploadService.optimizeAndUpload(
        imageFile,
        { width: 800, height: 800, quality: 85, format: 'webp' },
        { folder: '/gallery', tags: ['gallery'] },
      );
      dto.imageUrl = uploaded.url;
      dto.imageFileId = uploaded.fileId;
    }

    const item = this.repo.create({
      title: dto.title ?? null,
      mediaType: dto.mediaType ?? GalleryMediaType.IMAGE,
      imageUrl: dto.imageUrl ?? '',
      imageFileId: dto.imageFileId ?? null,
      videoUrl: dto.videoUrl ?? null,
      link: dto.link ?? null,
      sortOrder: dto.sortOrder ?? 0,
      isActive: dto.isActive ?? true,
    });

    return this.repo.save(item);
  }

  async findAll(): Promise<GalleryItem[]> {
    return this.repo.find({ order: { sortOrder: 'ASC', createdAt: 'DESC' } });
  }

  async findPublic(): Promise<GalleryItem[]> {
    return this.repo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<GalleryItem> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Gallery item "${id}" not found`);
    return item;
  }

  async update(id: string, dto: UpdateGalleryItemDto, imageFile?: Express.Multer.File): Promise<GalleryItem> {
    const item = await this.findOne(id);

    if (imageFile) {
      const uploaded = await this.uploadService.optimizeAndUpload(
        imageFile,
        { width: 800, height: 800, quality: 85, format: 'webp' },
        { folder: '/gallery', tags: ['gallery'] },
      );
      if (item.imageFileId) {
        await this.uploadService.deleteImage(item.imageFileId).catch(() => null);
      }
      dto.imageUrl = uploaded.url;
      dto.imageFileId = uploaded.fileId;
    }

    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async remove(id: string): Promise<{ message: string }> {
    const item = await this.findOne(id);
    if (item.imageFileId) {
      await this.uploadService.deleteImage(item.imageFileId).catch(() => null);
    }
    await this.repo.remove(item);
    return { message: 'Gallery item deleted successfully' };
  }
}
