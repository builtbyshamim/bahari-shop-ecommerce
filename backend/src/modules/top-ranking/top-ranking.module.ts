import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TopRankingService } from './top-ranking.service';
import { TopRankingController } from './top-ranking.controller';
import { TopRanking } from './entities/top-ranking.entity';
import { FeatureType } from '../feature-types/entities/feature-type.entity';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TopRanking, FeatureType]),
    ProductModule,
  ],
  controllers: [TopRankingController],
  providers: [TopRankingService],
})
export class TopRankingModule {}
