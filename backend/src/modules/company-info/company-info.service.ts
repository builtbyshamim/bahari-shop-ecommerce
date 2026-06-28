import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyInfo } from './entities/company-info.entity';
import { UpdateCompanyInfoDto } from './dto/update-company-info.dto';
import { ImageKitService } from '../image-upload/imagekit.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class CompanyInfoService {
  constructor(
    @InjectRepository(CompanyInfo)
    private readonly repo: Repository<CompanyInfo>,
    private readonly uploadService: ImageKitService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}
  private readonly COMPANY_INFO_CACHE_KEY = 'company_info';

  async get(): Promise<CompanyInfo> {
    // 1. check redis cache
    const cached = await this.cacheManager.get<CompanyInfo>(
      this.COMPANY_INFO_CACHE_KEY,
    );
    if (cached) {
      return cached;
    }

    // 2. get from database
    let info = await this.repo.findOne({ where: {} });

    // 3. create default if not exists
    if (!info) {
      info = this.repo.create({
        name: 'KCommerce',
      });

      await this.repo.save(info);
    }

    // 4. save into redis cache
    await this.cacheManager.set(
      this.COMPANY_INFO_CACHE_KEY,
      info,
      60 * 60 * 1000, // 1 hour
    );

    return info;
  }

  async upsert(
    dto: UpdateCompanyInfoDto,
    logoFile?: Express.Multer.File,
    faviconFile?: Express.Multer.File,
  ): Promise<CompanyInfo> {
    try {
      let info = await this.repo.findOne({ where: {} });
      if (!info) {
        info = this.repo.create({ name: 'KCommerce' });
      }

      if (logoFile) {
        if (info.logoFileId) {
          await this.uploadService
            .deleteImage(info.logoFileId)
            .catch(() => null);
        }
        const uploaded = await this.uploadService.optimizeAndUpload(
          logoFile,
          { width: 400, height: 200, quality: 90, format: 'webp' },
          { folder: '/company', tags: ['company-logo'] },
        );
        dto.logoUrl = uploaded.url;
        dto.logoFileId = uploaded.fileId;
      }

      if (faviconFile) {
        if (info.faviconFileId) {
          await this.uploadService
            .deleteImage(info.faviconFileId)
            .catch(() => null);
        }
        const uploaded = await this.uploadService.optimizeAndUpload(
          faviconFile,
          { width: 64, height: 64, quality: 90, format: 'webp' },
          { folder: '/company', tags: ['company-favicon'] },
        );
        dto.faviconUrl = uploaded.url;
        dto.faviconFileId = uploaded.fileId;
      }

      if (dto.socialLinks && typeof dto.socialLinks === 'string') {
        try {
          dto.socialLinks = JSON.parse(dto.socialLinks as unknown as string);
        } catch {
          dto.socialLinks = undefined;
        }
      }

      Object.assign(info, dto);
      const saved = await this.repo.save(info);
      await this.cacheManager.del(this.COMPANY_INFO_CACHE_KEY);
      return saved;
    } catch (error) {
      console.log('Error upserting company info:', error);
      throw new InternalServerErrorException('Failed to upsert company info');
    }
  }
}
