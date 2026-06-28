import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Brand, BrandStatus } from './entities/brand.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, Like } from 'typeorm';
import { ImageKitService } from '../image-upload/imagekit.service';
import slugify from 'slugify';
import { UserEntity } from '../users/entities/user.entity';
import { GetBrandDto } from './dto/get-brand.dto';

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(Brand)
    private repo: Repository<Brand>,
    private readonly uploadService: ImageKitService,
    private readonly dataSource: DataSource,
  ) { }

  async create(
    user: UserEntity,
    dto: CreateBrandDto,
    logoFile?: Express.Multer.File,
    bannerFile?: Express.Multer.File,
  ) {
    const slug = slugify(dto.name, { lower: true, strict: true });

    // Check slug first
    const exists = await this.repo.findOne({ where: { slug } });
    if (exists) {
      throw new BadRequestException('Brand slug already exists');
    }

    let uploadedLogo: any = null;
    let uploadedBanner: any = null;

    try {
      // 1️⃣ Upload logo if exists
      if (logoFile) {
        uploadedLogo = await this.uploadService.optimizeAndUpload(
          logoFile,
          { width: 300, height: 300, quality: 90, format: 'png' },
          { folder: '/brands/logos', fileName: `logo-${slug}.png`, tags: ['brand', 'logo'] },
        );

        dto.logo = uploadedLogo.url;
        dto.logoFileId = uploadedLogo.fileId;
      }

      // 2️⃣ Upload banner if exists
      if (bannerFile) {
        uploadedBanner = await this.uploadService.optimizeAndUpload(
          bannerFile,
          { width: 1920, height: 400, quality: 85, format: 'webp' },
          { folder: '/brands/banners', fileName: `banner-${slug}.webp`, tags: ['brand', 'banner'] },
        );

        dto.bannerImage = uploadedBanner.url;
        dto.bannerImageFileId = uploadedBanner.fileId;
      }

      // 3️⃣ Create brand in transaction
      const brand = await this.dataSource.transaction(async (manager) => {
        const newBrand = manager.create(Brand, {
          ...dto,
          slug,
          seoMeta: {
            keywords: dto.keywords,
            description: dto.meta_description,
            title: dto.meta_title
          },
          status: dto.status || BrandStatus.ACTIVE,
          isVerified: dto.isVerified || false,
          createdBy: user,
        });

        return await manager.save(newBrand);
      });

      return brand;
    } catch (error) {
      // Rollback images if upload fails
      if (uploadedLogo?.fileId) {
        await this.uploadService.deleteImage(uploadedLogo.fileId);
      }
      if (uploadedBanner?.fileId) {
        await this.uploadService.deleteImage(uploadedBanner.fileId);
      }

      throw error;
    }
  }

  async findAll(query: GetBrandDto) {
    const { page = 1, limit = 10, status, search = '' } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.name = Like(`%${search}%`);
    }

    if (status) {
      where.status = status;
    }

    const [data, total] = await this.repo.findAndCount({
      where,
      take: limit,
      skip: skip,
    });

    return {
      data,
      meta: {
        totalItems: total,
        itemCount: data.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }

  async findOne(id: string) {
    const brand = await this.repo.findOne({
      where: { id }
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    return brand;
  }

  async findBySlug(slug: string) {
    const brand = await this.repo.findOne({
      where: { slug },
      relations: ['createdBy']
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    return brand;
  }

  async update(
    id: string,
    dto: UpdateBrandDto,
    logoFile?: Express.Multer.File,
    bannerFile?: Express.Multer.File,
  ) {
    const brand = await this.findOne(id);

    // Generate new slug if name changed
    if (dto.name && dto.name !== brand.name) {
      const newSlug = slugify(dto.name, { lower: true, strict: true });
      const exists = await this.repo.findOne({ where: { slug: newSlug } });
      if (exists && exists.id !== id) {
        throw new BadRequestException('Brand slug already exists');
      }
      dto.slug = newSlug;
    }

    let uploadedLogo: any = null;
    let uploadedBanner: any = null;

    try {
      // 1️⃣ Upload new logo if exists
      if (logoFile) {
        uploadedLogo = await this.uploadService.optimizeAndUpload(
          logoFile,
          { width: 300, height: 300, quality: 90, format: 'png' },
          { folder: '/brands/logos', fileName: `logo-${dto.slug || brand.slug}.png`, tags: ['brand', 'logo'] },
        );

        dto.logo = uploadedLogo.url;
        dto.logoFileId = uploadedLogo.fileId;
      }

      // 2️⃣ Upload new banner if exists
      if (bannerFile) {
        uploadedBanner = await this.uploadService.optimizeAndUpload(
          bannerFile,
          { width: 1920, height: 400, quality: 85, format: 'webp' },
          { folder: '/brands/banners', fileName: `banner-${dto.slug || brand.slug}.webp`, tags: ['brand', 'banner'] },
        );

        dto.bannerImage = uploadedBanner.url;
        dto.bannerImageFileId = uploadedBanner.fileId;
      }

      // 3️⃣ Delete old images if replaced
      if (logoFile && brand.logoFileId) {
        await this.uploadService.deleteImage(brand.logoFileId);
      }
      if (bannerFile && brand.bannerImageFileId) {
        await this.uploadService.deleteImage(brand.bannerImageFileId);
      }
      // 4️⃣ Update DB
      Object.assign(brand, dto);
      const saved = await this.repo.save(brand);

      return saved;
    } catch (error) {
      // Rollback uploaded images if fail
      if (uploadedLogo?.fileId) {
        await this.uploadService.deleteImage(uploadedLogo.fileId);
      }
      if (uploadedBanner?.fileId) {
        await this.uploadService.deleteImage(uploadedBanner.fileId);
      }
      throw error;
    }
  }

  async remove(id: string) {
    const brand = await this.findOne(id);

    try {
      // Soft delete - update status to INACTIVE
      brand.status = BrandStatus.INACTIVE;
      await this.repo.delete(id);

      // Optionally delete images from storage
      if (brand.logoFileId) {
        await this.uploadService.deleteImage(brand.logoFileId);
      }
      if (brand.bannerImageFileId) {
        await this.uploadService.deleteImage(brand.bannerImageFileId);
      }

      return { message: 'Brand deactivated successfully' };
    } catch (error) {
      throw error;
    }
  }

  async hardDelete(id: string) {
    const brand = await this.findOne(id);

    try {
      // Delete images first
      if (brand.logoFileId) {
        await this.uploadService.deleteImage(brand.logoFileId);
      }
      if (brand.bannerImageFileId) {
        await this.uploadService.deleteImage(brand.bannerImageFileId);
      }

      // Then delete from database
      await this.repo.remove(brand);

      return { message: 'Brand permanently deleted' };
    } catch (error) {
      throw error;
    }
  }

  async getVerifiedBrands() {
    return await this.repo.find({
      where: { isVerified: true, status: BrandStatus.ACTIVE },
      order: { name: 'ASC' }
    });
  }
}