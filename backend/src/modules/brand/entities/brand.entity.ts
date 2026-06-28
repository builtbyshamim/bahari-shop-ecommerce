import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum BrandStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('brands')
@Index(['slug'], { unique: true })
@Index(['status'])
@Index(['isVerified'])
export class Brand {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  logo: string; // CDN URL


  @Column({ length: 100, nullable: true })
  logoFileId?: string;

  @Column({ nullable: true })
  bannerImage: string; // brand page banner

  @Column({ length: 100, nullable: true })
  bannerImageFileId?: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  countryOfOrigin: string; // "Bangladesh", "China", "USA"

  @Column({
    type: 'enum',
    enum: BrandStatus,
    default: BrandStatus.ACTIVE,
  })
  status: BrandStatus;

  @Column({ default: true })
  isVerified: boolean; // admin verified badge ✓

  @Column({ type: 'jsonb', nullable: true })
  seoMeta: {
    title: string;
    description: string;
    keywords: string[];
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}