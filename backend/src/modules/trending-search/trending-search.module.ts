import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrendingSearch } from './entities/trending-search.entity';
import { TrendingSearchController } from './trending-search.controller';
import { TrendingSearchService } from './trending-search.service';

@Module({
  imports: [TypeOrmModule.forFeature([TrendingSearch])],
  controllers: [TrendingSearchController],
  providers: [TrendingSearchService],
})
export class TrendingSearchModule {}
