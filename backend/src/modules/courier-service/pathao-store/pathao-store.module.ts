import { Module } from '@nestjs/common';
import { PathaoStoreService } from './pathao-store.service';
import { PathaoStoreController } from './pathao-store.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PathaoStoreEntity } from './entities/pathao-store.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PathaoStoreEntity])],
  controllers: [PathaoStoreController],
  providers: [PathaoStoreService],
  exports: [PathaoStoreService],
})
export class PathaoStoreModule { }
