import { UserEntity } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  DeleteDateColumn,
  TreeChildren,
  TreeParent,
  Tree,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Index(['slug'], { unique: true })
@Index(['name'])
@Entity('categories')
@Tree('materialized-path')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;


  @Column({ type: 'int', default: 0 })
  position: number;

  @Column({ length: 120 })
  name: string;

  @Column({ length: 150 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  /**
   * Store main image URL
   */
  @Column({ length: 255, nullable: true })
  image?: string;

  @Column({ length: 100, nullable: true })
  imageFileId?: string;

  @Column({ type: 'json', nullable: true })
  gallery?: { url: string; fileId: string; alt?: string }[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ length: 150, nullable: true })
  metaTitle?: string;

  @Column({ type: 'text', nullable: true })
  metaDescription?: string;

  @TreeChildren() // Ei category-r niche thaka sub-categories
  children: Category[];

  @TreeParent() // Ei category-r upore thaka parent category
  parent: Category;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdBy' })
  createdBy: UserEntity;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'updatedBy' })
  updatedBy: UserEntity;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  /**
   * Soft delete
   */
  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt?: Date;
}
