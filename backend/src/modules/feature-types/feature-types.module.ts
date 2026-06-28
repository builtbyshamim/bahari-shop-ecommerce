import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeatureType } from './entities/feature-type.entity';
import { FeatureTypesController } from './feature-types.controller';
import { FeatureTypesService } from './feature-types.service';

@Module({
  imports: [TypeOrmModule.forFeature([FeatureType])],
  controllers: [FeatureTypesController],
  providers: [FeatureTypesService],
  exports: [FeatureTypesService, TypeOrmModule],
})
export class FeatureTypesModule {}
