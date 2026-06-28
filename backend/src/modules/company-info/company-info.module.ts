import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyInfo } from './entities/company-info.entity';
import { CompanyInfoService } from './company-info.service';
import { CompanyInfoController } from './company-info.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyInfo])],
  providers: [CompanyInfoService],
  controllers: [CompanyInfoController],
  exports: [CompanyInfoService],
})
export class CompanyInfoModule {}
