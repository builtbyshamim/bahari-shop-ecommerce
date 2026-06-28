import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeaturedSectionsController } from './featured-sections.controller';
import { FeaturedSectionsService } from './featured-sections.service';
import { FeaturedSection } from './entities/featured-section.entity';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [TypeOrmModule.forFeature([FeaturedSection]), ProductModule],
  controllers: [FeaturedSectionsController],
  providers: [FeaturedSectionsService],
})
export class FeaturedSectionsModule {}
