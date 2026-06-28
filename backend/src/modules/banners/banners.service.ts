import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner, BannerType } from './entities/banner.entity';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { ImageKitService } from '../image-upload/imagekit.service';

@Injectable()
export class BannersService {
  constructor(
    @InjectRepository(Banner)
    private readonly repo: Repository<Banner>,
    private readonly uploadService: ImageKitService,
  ) {}

  async create(dto: CreateBannerDto, imageFile?: Express.Multer.File): Promise<Banner> {
    let uploadedImage: any = null;

    if (imageFile) {
      uploadedImage = await this.uploadService.optimizeAndUpload(
        imageFile,
        { width: 1920, height: 700, quality: 85, format: 'webp' },
        { folder: '/banners', tags: ['banner'] },
      );
      dto.imageUrl = uploadedImage.url;
      dto.imageFileId = uploadedImage.fileId;
    }

    const banner = this.repo.create({
      imageUrl: dto.imageUrl ?? '',
      imageFileId: dto.imageFileId ?? null,
      link: dto.link ?? null,
      title: dto.title ?? null,
      bannerType: dto.bannerType ?? BannerType.SLIDER,
      sortOrder: dto.sortOrder ?? 0,
      isActive: dto.isActive ?? true,
    });

    return this.repo.save(banner);
  }

  async findAll(): Promise<Banner[]> {
    return this.repo.find({ order: { sortOrder: 'ASC', createdAt: 'DESC' } });
  }

  async findPublic(): Promise<{ sliders: Banner[]; side: Banner | null }> {
    const all = await this.repo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });

    const sliders = all.filter((b) => b.bannerType === BannerType.SLIDER);
    const side = all.find((b) => b.bannerType === BannerType.SIDE) ?? null;

    return { sliders, side };
  }

  async findOne(id: string): Promise<Banner> {
    const banner = await this.repo.findOne({ where: { id } });
    if (!banner) throw new NotFoundException(`Banner with ID "${id}" not found`);
    return banner;
  }

  async update(id: string, dto: UpdateBannerDto, imageFile?: Express.Multer.File): Promise<Banner> {
    const banner = await this.findOne(id);

    if (imageFile) {
      const uploaded = await this.uploadService.optimizeAndUpload(
        imageFile,
        { width: 1920, height: 700, quality: 85, format: 'webp' },
        { folder: '/banners', tags: ['banner'] },
      );

      if (banner.imageFileId) {
        await this.uploadService.deleteImage(banner.imageFileId).catch(() => null);
      }

      dto.imageUrl = uploaded.url;
      dto.imageFileId = uploaded.fileId;
    }

    Object.assign(banner, dto);
    return this.repo.save(banner);
  }

  async remove(id: string): Promise<{ message: string }> {
    const banner = await this.findOne(id);

    if (banner.imageFileId) {
      await this.uploadService.deleteImage(banner.imageFileId).catch(() => null);
    }

    await this.repo.remove(banner);
    return { message: 'Banner deleted successfully' };
  }
}
