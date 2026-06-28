import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountingCategoryController } from './category.controller';
import { AccountingCategoryEntity } from './entities/category.entity';
import { AccountingCategoryService } from './category.service';
@Module({
 imports: [TypeOrmModule.forFeature([AccountingCategoryEntity])],
  controllers: [AccountingCategoryController],
  providers: [AccountingCategoryService],
  exports: [AccountingCategoryService],
})
export class CategoryModule {}
