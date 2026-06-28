import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BlogCategory } from '../../blog-category/entities/blog-category.entity';
import { Product } from '../../product/entities/product.entity';

@Entity('blog_posts')
export class BlogPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 250 })
  title: string;

  @Column({ length: 260, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  shortDescription: string | null;

  @Column({ type: 'text', nullable: true })
  content: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  thumbnail: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  thumbnailFileId: string | null;

  @ManyToOne(() => BlogCategory, {
    nullable: true,
    onDelete: 'SET NULL',
    eager: false,
  })
  @JoinColumn({ name: 'blogCategoryId' })
  blogCategory: BlogCategory;

  @Column({ type: 'varchar', nullable: true })
  blogCategoryId: string | null;

  @ManyToOne(() => Product, {
    nullable: true,
    onDelete: 'SET NULL',
    eager: false,
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'varchar', nullable: true })
  productId: string | null;

  @Column({ type: 'varchar', length: 70, nullable: true })
  metaTitle: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  metaDescription: string | null;

  @Column({ type: 'text', nullable: true })
  metaKeywords: string | null;

  @Column({ default: true })
  isPublished: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
