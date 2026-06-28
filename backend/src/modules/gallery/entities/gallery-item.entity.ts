import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum GalleryMediaType {
  IMAGE = 'image',
  VIDEO = 'video',
}

@Entity('gallery_items')
export class GalleryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  title: string | null;

  @Column({ type: 'enum', enum: GalleryMediaType, default: GalleryMediaType.IMAGE })
  mediaType: GalleryMediaType;

  @Column({ type: 'varchar' })
  imageUrl: string;

  @Column({ type: 'varchar', nullable: true })
  imageFileId: string | null;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  videoUrl: string | null;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  link: string | null;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
