import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Testimonial } from './entities/testimonial.entity';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { ImageKitService } from '../image-upload/imagekit.service';

@Injectable()
export class TestimonialsService {
  constructor(
    @InjectRepository(Testimonial)
    private readonly repo: Repository<Testimonial>,
    private readonly uploadService: ImageKitService,
  ) {}

  private buildInitials(name: string): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('');
  }

  async create(
    dto: CreateTestimonialDto,
    imageFile?: Express.Multer.File,
  ): Promise<Testimonial> {
    if (imageFile) {
      const uploaded = await this.uploadService.optimizeAndUpload(
        imageFile,
        { width: 200, height: 200, quality: 85, format: 'webp' },
        { folder: '/testimonials', tags: ['testimonial', 'avatar'] },
      );
      dto.avatarUrl = uploaded.url;
      dto.avatarFileId = uploaded.fileId;
    }

    const testimonial = this.repo.create({
      name: dto.name,
      location: dto.location ?? null,
      avatarInitials: dto.avatarInitials ?? this.buildInitials(dto.name),
      avatarUrl: dto.avatarUrl ?? null,
      avatarFileId: dto.avatarFileId ?? null,
      rating: dto.rating ?? 5,
      review: dto.review,
      productLabel: dto.productLabel ?? null,
      colorIndex: dto.colorIndex ?? 0,
      isActive: dto.isActive ?? true,
      sortOrder: dto.sortOrder ?? 0,
    });

    return this.repo.save(testimonial);
  }

  async findAll(): Promise<Testimonial[]> {
    return this.repo.find({
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async findPublic(): Promise<Testimonial[]> {
    return this.repo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Testimonial> {
    const t = await this.repo.findOne({ where: { id } });
    if (!t) throw new NotFoundException(`Testimonial with ID "${id}" not found`);
    return t;
  }

  async update(
    id: string,
    dto: UpdateTestimonialDto,
    imageFile?: Express.Multer.File,
  ): Promise<Testimonial> {
    const testimonial = await this.findOne(id);

    if (imageFile) {
      const uploaded = await this.uploadService.optimizeAndUpload(
        imageFile,
        { width: 200, height: 200, quality: 85, format: 'webp' },
        { folder: '/testimonials', tags: ['testimonial', 'avatar'] },
      );
      if (testimonial.avatarFileId) {
        await this.uploadService.deleteImage(testimonial.avatarFileId).catch(() => null);
      }
      dto.avatarUrl = uploaded.url;
      dto.avatarFileId = uploaded.fileId;
    }

    Object.assign(testimonial, dto);
    return this.repo.save(testimonial);
  }

  async remove(id: string): Promise<{ message: string }> {
    const testimonial = await this.findOne(id);
    if (testimonial.avatarFileId) {
      await this.uploadService.deleteImage(testimonial.avatarFileId).catch(() => null);
    }
    await this.repo.remove(testimonial);
    return { message: 'Testimonial deleted successfully' };
  }
}
