import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DesignationEntity } from './entities/degignation.entity';
import { DesignationController } from './degignation.controller';
import { DesignationService } from './degignation.service';

@Module({
    imports: [TypeOrmModule.forFeature([DesignationEntity])],
  controllers: [DesignationController],
  providers: [DesignationService],
  exports: [DesignationService],
})
export class DegignationModule {}
