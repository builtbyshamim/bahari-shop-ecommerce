import { Module } from '@nestjs/common';
import { BrandService } from './brand.service';
import { BrandController } from './brand.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brand } from './entities/brand.entity';

@Module({
  controllers: [BrandController],
  imports:[TypeOrmModule.forFeature([Brand])],
  providers: [BrandService],
})
export class BrandModule {}
