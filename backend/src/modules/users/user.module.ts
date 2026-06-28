import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './services/users.service';
import { AuthModule } from '../auth/auth.module';
import { RefreshTokenEntity } from '../auth/entities/refresh-token.entity';
import { Address } from './entities/customer-address.entity';
import { AddressController } from './controllers/addess.controller';
import { AddressService } from './services/address.service';

@Module({
  controllers: [UsersController, AddressController],
  providers: [UsersService, AddressService],
  imports: [
    TypeOrmModule.forFeature([UserEntity, RefreshTokenEntity, Address]),
    forwardRef(() => AuthModule),
  ],
  exports: [UsersService, TypeOrmModule, AddressService],
})
export class UserModule { }
