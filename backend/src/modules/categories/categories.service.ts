import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Like, Repository, TreeRepository } from 'typeorm';
import slugify from 'slugify';

import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ImageKitService } from '../image-upload/imagekit.service';
import { UserEntity } from '../users/entities/user.entity';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private repo: Repository<Category>,

    // ✅ TreeRepository for nested operations
    @InjectRepository(Category)
    private treeRepo: TreeRepository<Category>,

    private readonly uploadService: ImageKitService,
    private readonly dataSource: DataSource,
  ) { }


  // ──────────────────────────────────────────────
  // ✅ Full Tree (for frontend tree display)
  // ──────────────────────────────────────────────
  async findTree() {
    const trees = await this.treeRepo.findTrees({
      relations: ['createdBy'],
    });

    // Recursive sort by position
    const sortByPosition = (nodes: Category[]): Category[] => {
      return nodes
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map((node) => ({
          ...node,
          children: node.children?.length
            ? sortByPosition(node.children)
            : [],
        }));
    };

    return sortByPosition(trees);
  }

  // ──────────────────────────────────────────────
  // ✅ Get all descendant IDs recursively
  // Foods → [Milk, Cow Milk, Goat Milk, ...]
  // ──────────────────────────────────────────────
  async findDescendantIds(categoryId: string): Promise<string[]> {
    const root = await this.repo.findOne({ where: { id: categoryId } });
    if (!root) return [];

    const descendants = await this.treeRepo.findDescendants(root);
    // descendants includes the root itself, so we return all ids
    return descendants.map((c) => c.id);
  }


  // ──────────────────────────────────────────────
  // ✅ Filter with descendants support
  // ──────────────────────────────────────────────
  async findAllWithDescendants(
    query: PaginationQueryDto & { categoryId?: string },
  ) {
    const { page = 1, limit = 10, search = '', categoryId } = query;
    const skip = (page - 1) * limit;

    let whereIds: string[] | null = null;

    if (categoryId) {
      whereIds = await this.findDescendantIds(categoryId);
      if (whereIds.length === 0) {
        return {
          data: [],
          meta: {
            totalItems: 0,
            itemCount: 0,
            itemsPerPage: limit,
            totalPages: 0,
            currentPage: page,
          },
        };
      }
    }

    const qb = this.repo
      .createQueryBuilder('cat')
      .leftJoinAndSelect('cat.createdBy', 'createdBy')
      .leftJoinAndSelect('cat.parent', 'parent') // ✅ parent info
      .where('cat.deletedAt IS NULL')
      .orderBy('cat.position', 'ASC')
      .take(limit)
      .skip(skip);

    if (whereIds) {
      qb.andWhere('cat.id IN (:...ids)', { ids: whereIds });
    }

    if (search) {
      qb.andWhere('cat.name LIKE :search', { search: `%${search}%` });
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

  async create(
    user: UserEntity,
    dto: CreateCategoryDto,
    file?: Express.Multer.File,
  ) {
    const slug = slugify(dto.name, { lower: true, strict: true });
    // Check slug first
    const exists = await this.repo.findOne({ where: { slug } });
    if (exists) {
      throw new Error('Category slug already exists');
    }

    let uploadedFile: any = null;

    try {
      // 1️⃣ Upload image if exists
      if (file) {
        uploadedFile = await this.uploadService.optimizeAndUpload(
          file,
          { width: 300, quality: 90, format: 'png' },
          { folder: '/category', fileName: 'category.png', tags: ['category'] },
        );

        dto.image = uploadedFile.url;
        dto.imageFileId = uploadedFile?.fileId;
      }

      // 2️⃣ Start transaction
      const category = await this.dataSource.transaction(async (manager) => {
        const newCategory = manager.create(Category, {
          ...dto,
          isActive: dto.isActive == 'true' ? true : false,
          slug,
          createdBy: user,
        });
        if (dto.parentId) {
          const parent = await manager.findOne(Category, {
            where: { id: dto.parentId },
          });
          if (parent) {
            newCategory.parent = parent;
          }
        }
        return await manager.save(newCategory);
      });

      return category;
    } catch (error) {
      // 3️⃣ Rollback image if uploaded
      if (uploadedFile?.fileId) {
        await this.uploadService.deleteImage(uploadedFile.fileId);
      }

      throw error; // re-throw for controller
    }
  }

  // category.service.ts

  // ──────────────────────────────────────────────
  // existing findAll (pagination + search only)
  // ──────────────────────────────────────────────
  async findAll(query: PaginationQueryDto) {
    return this.findAllWithDescendants(query);
  }

  async findOne(id: string) {
    const cat = await this.repo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    return cat;
  }

  async update(id: string, dto: UpdateCategoryDto, file?: Express.Multer.File) {
    const category = await this.findOne(id);

    let uploadedFile: any = null;

    try {
      // 1️⃣ Upload new image if exists
      if (file) {
        uploadedFile = await this.uploadService.optimizeAndUpload(
          file,
          { width: 300, quality: 90, format: 'png' },
          { folder: '/category', fileName: 'category.png', tags: ['category'] },
        );

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        dto.image = uploadedFile.url;
        dto.imageFileId = uploadedFile.fileId;
      }

      // 3️⃣ Delete old image if replaced
      if (file && category.imageFileId && dto.imageFileId) {
        await this.uploadService.deleteImage(category.imageFileId);
      }

      // 2️⃣ Update DB
      Object.assign(category, {
        ...dto,
        isActive: dto.isActive == 'true' ? true : false,
      });
      const saved = await this.repo.save(category);

      return saved;
    } catch (error) {
      // Rollback uploaded image if fail
      if (uploadedFile?.fileId) {
        await this.uploadService.deleteImage(uploadedFile.fileId);
      }
      throw error;
    }
  }

  async remove(id: string) {
    const category = await this.findOne(id);
    // eslint-disable-next-line no-useless-catch
    try {
      // Soft delete
      category.isActive = false;
      category.deletedAt = new Date();
      await this.repo.save(category);

      // Delete image from ImageKit
      if (category.imageFileId) {
        await this.uploadService.deleteImage(category.imageFileId);
      }

      return 'Category Delete Success';
    } catch (error) {
      throw error;
    }
  }

  // ✅ Bulk reorder — for drag & drop
  async reorder(items: { id: string; position: number }[]) {
    try {
      await this.dataSource.transaction(async (manager) => {
        await Promise.all(
          items.map(({ id, position }) =>
            manager.update(Category, { id }, { position }),
          ),
        );
      });

      return { success: true, message: 'Reordered successfully' };
    } catch (error) {
      console.log(error, 'error')
      throw error;
    }
  }

}
