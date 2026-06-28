import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import slugify from 'slugify';
import { BlogPost } from './entities/blog-post.entity';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { ImageKitService } from '../image-upload/imagekit.service';

@Injectable()
export class BlogPostService {
  constructor(
    @InjectRepository(BlogPost)
    private readonly repo: Repository<BlogPost>,
    private readonly uploadService: ImageKitService,
  ) {}

  async create(dto: CreateBlogPostDto, file?: Express.Multer.File): Promise<BlogPost> {
    const slug = dto.slug || slugify(dto.title, { lower: true, strict: true });
    const exists = await this.repo.findOne({ where: { slug } });
    if (exists) throw new ConflictException(`Blog slug "${slug}" already exists`);

    let uploadedFile: any = null;
    try {
      if (file) {
        uploadedFile = await this.uploadService.optimizeAndUpload(
          file,
          { width: 800, quality: 85, format: 'webp' },
          { folder: '/blog', fileName: 'blog-thumb.webp', tags: ['blog'] },
        );
        dto.thumbnail = uploadedFile.url;
        dto.thumbnailFileId = uploadedFile.fileId;
      }

      const post = this.repo.create({ ...dto, slug });
      return this.repo.save(post);
    } catch (error) {
      if (uploadedFile?.fileId) await this.uploadService.deleteImage(uploadedFile.fileId);
      throw error;
    }
  }

  async findAll(query: {
    search?: string;
    blogCategoryId?: string;
    page?: number;
    limit?: number;
  }) {
    const { search = '', blogCategoryId, page = 1, limit = 15 } = query;
    const skip = (page - 1) * limit;

    const qb = this.repo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.blogCategory', 'blogCategory')
      .leftJoinAndSelect('post.product', 'product')
      .orderBy('post.sortOrder', 'ASC')
      .addOrderBy('post.createdAt', 'DESC')
      .take(limit)
      .skip(skip);

    if (search) {
      qb.where('post.title LIKE :search', { search: `%${search}%` });
    }
    if (blogCategoryId) {
      qb.andWhere('post.blogCategoryId = :blogCategoryId', { blogCategoryId });
    }

    const [data, total] = await qb.getManyAndCount();
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

  async findOne(id: string): Promise<BlogPost> {
    const post = await this.repo.findOne({
      where: { id },
      relations: ['blogCategory', 'product'],
    });
    if (!post) throw new NotFoundException(`Blog post "${id}" not found`);
    return post;
  }

  async findBySlug(slug: string): Promise<BlogPost> {
    const post = await this.repo.findOne({
      where: { slug, isPublished: true },
      relations: ['blogCategory', 'product'],
    });
    if (!post) throw new NotFoundException(`Blog post "${slug}" not found`);
    return post;
  }

  async update(id: string, dto: UpdateBlogPostDto, file?: Express.Multer.File): Promise<BlogPost> {
    const post = await this.findOne(id);

    if (dto.slug && dto.slug !== post.slug) {
      const exists = await this.repo.findOne({ where: { slug: dto.slug } });
      if (exists) throw new ConflictException(`Slug "${dto.slug}" already taken`);
    }

    let uploadedFile: any = null;
    try {
      if (file) {
        uploadedFile = await this.uploadService.optimizeAndUpload(
          file,
          { width: 800, quality: 85, format: 'webp' },
          { folder: '/blog', fileName: 'blog-thumb.webp', tags: ['blog'] },
        );
        const oldFileId = post.thumbnailFileId;
        dto.thumbnail = uploadedFile.url;
        dto.thumbnailFileId = uploadedFile.fileId;
        if (oldFileId) await this.uploadService.deleteImage(oldFileId);
      }

      Object.assign(post, dto);
      return this.repo.save(post);
    } catch (error) {
      if (uploadedFile?.fileId) await this.uploadService.deleteImage(uploadedFile.fileId);
      throw error;
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    const post = await this.findOne(id);
    if (post.thumbnailFileId) await this.uploadService.deleteImage(post.thumbnailFileId);
    await this.repo.remove(post);
    return { message: 'Blog post deleted successfully' };
  }
}
