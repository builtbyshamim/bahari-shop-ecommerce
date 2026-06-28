import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductImage } from './entities/product-image.entity';
import { ImageKitService } from '../image-upload/imagekit.service';


@Injectable()
export class ProductImagesService {
  constructor(
    @InjectRepository(ProductImage)
    private readonly imageRepo: Repository<ProductImage>,
    private readonly uploadService: ImageKitService,
  ) { }

  async uploadImages(
    productId: string,
    files: Express.Multer.File[],
  ): Promise<ProductImage[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const uploadedImages: ProductImage[] = [];
    const uploadedFileIds: string[] = [];

    try {
      // Get current max sortOrder for this product
      const existing = await this.imageRepo.find({
        where: { productId: productId },
        order: { sortOrder: 'DESC' },
        take: 1,
      });
      let sortOrder = existing.length > 0 ? existing[0].sortOrder + 1 : 0;

      // Check if this product has any images (to set first as thumbnail)
      const existingCount = await this.imageRepo.count({
        where: { productId: productId },
      });

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Upload to ImageKit with optimization
        const uploaded = await this.uploadService.optimizeAndUpload(
          file,
          { width: 800, quality: 85, format: 'webp' },
          {
            folder: '/products',
            fileName: `product-${productId}-${Date.now()}.webp`,
            tags: ['product', productId],
          },
        );

        uploadedFileIds.push(uploaded.fileId);

        const image = this.imageRepo.create({
          productId: productId,
          url: uploaded.url,
          altText: `Product image ${sortOrder + 1}`,
          isThumbnail: existingCount === 0 && i === 0,
          sortOrder: sortOrder++,
          fileId: uploaded.fileId,
        });

        const saved = await this.imageRepo.save(image);
        uploadedImages.push(saved);
      }

      return uploadedImages;
    } catch (error) {
      // Rollback: delete any successfully uploaded files
      for (const fileId of uploadedFileIds) {
        await this.uploadService.deleteImage(fileId).catch(() => { });
      }
      throw error;
    }
  }

  async getProductImages(productId: string): Promise<ProductImage[]> {
    return this.imageRepo.find({
      where: { productId: productId },
      order: { sortOrder: 'ASC' },
    });
  }

  async deleteImage(imageId: string): Promise<{ message: string }> {
    const image = await this.imageRepo.findOne({ where: { id: imageId } });
    if (!image) throw new NotFoundException('Image not found');

    // Delete from ImageKit
    if (image['fileId']) {
      await this.uploadService.deleteImage(image['fileId']).catch(() => { });
    }

    await this.imageRepo.remove(image);

    // If deleted image was thumbnail, set next image as thumbnail
    if (image.isThumbnail) {
      const nextImage = await this.imageRepo.findOne({
        where: { productId: image.productId },
        order: { sortOrder: 'ASC' },
      });
      if (nextImage) {
        nextImage.isThumbnail = true;
        await this.imageRepo.save(nextImage);
      }
    }

    return { message: 'Image deleted successfully' };
  }

  async setThumbnail(
    productId: string,
    imageId: string,
  ): Promise<ProductImage> {
    // Remove current thumbnail
    await this.imageRepo.update(
      { productId: productId, isThumbnail: true },
      { isThumbnail: false },
    );

    // Set new thumbnail
    const image = await this.imageRepo.findOne({ where: { id: imageId } });
    if (!image) throw new NotFoundException('Image not found');

    image.isThumbnail = true;
    return this.imageRepo.save(image);
  }

  async reorderImages(
    productId: string,
    orderedIds: string[],
  ): Promise<{ message: string }> {
    for (let i = 0; i < orderedIds.length; i++) {
      await this.imageRepo.update(
        { id: orderedIds[i], productId: productId },
        { sortOrder: i },
      );
    }
    return { message: 'Images reordered successfully' };
  }
}