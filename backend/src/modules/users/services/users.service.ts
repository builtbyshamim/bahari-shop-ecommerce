import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource, Repository, FindOptionsWhere } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { AuthService } from 'src/modules/auth/services/auth.service';
import { GetCustomerDto } from '../dto/get-customer.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { Address } from '../entities/customer-address.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    
    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,

    private readonly authService: AuthService,
    private readonly dataSource: DataSource, // TypeORM data source for transactions
  ) { }

  /**
   * Create a new user
   * 1. Starts a transaction using QueryRunner.
   * 2. Checks if the email is already registered.
   * 3. If not, sends OTP via MailService.
   * 4. Rolls back transaction if any error occurs.
   * @param registerUserDto - DTO containing user registration info
   * @returns Result of OTP sending process
   */

  async create(registerUserDto: RegisterUserDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { email, phone, password, ...rest } = registerUserDto;

      if (!email && !phone) {
        throw new BadRequestException('Either email or phone number is required');
      }

      // Explicitly type the whereConditions array
      const whereConditions: FindOptionsWhere<UserEntity>[] = [];

      if (email) whereConditions.push({ email });
      if (phone) whereConditions.push({ phone });

      // Check if email or phone already exists
      const existingUser = await queryRunner.manager.findOne(UserEntity, {
        where: whereConditions,
      });

      if (existingUser) {
        if (email && existingUser.email === email) {
          throw new ConflictException('Email already exists');
        }
        if (phone && existingUser.phone === phone) {
          throw new ConflictException('Phone number already exists');
        }
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = queryRunner.manager.create(UserEntity, {
        email,
        phone,
        password: hashedPassword,
        ...rest,
      });

      await queryRunner.manager.save(UserEntity, user);

      await queryRunner.commitTransaction();

      const tokens = await this.authService.generateTokens(user);
      return {
        message: 'User registered successfully',
        userId: user.id,
        tokens,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(getAllUsersDto: GetCustomerDto) {
    try {
      const { page = 1, limit = 10, search, role } = getAllUsersDto;
      const skip = (page - 1) * limit;

      const queryBuilder = this.userRepository
        .createQueryBuilder('user')
        .select([
          'user.id',
          'user.email',
          'user.phone',
          'user.address',
          'user.name',
          'user.isBanned',
          'user.role',
          'user.createdAt',
        ]);

      if (search) {
        queryBuilder.where(
          'user.email ILIKE :search OR user.phone LIKE :search',
          { search: `%${search}%` },
        );
      }

      if (role) {
        queryBuilder.andWhere('user.role = :role', { role });
      }

      const [data, total] = await queryBuilder
        .orderBy('user.createdAt', 'DESC')
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      return {
        data,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.log(error, 'error')
      throw new InternalServerErrorException(
        'Failed to fetch customers. Please try again later.',
      );
    }
  }

  /**
   * Find a user by email
   * @param email - Email to search
   * @returns UserEntity or null
   */
  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }


  async findById(id: string) {
    return this.userRepository.findOne({ where: { id } });
  }

  async customerDetailsFindById(id: string) {
    return this.userRepository.findOne({ where: { id } });
  }

  // services/users.service.ts এ এই দুটো method update করো

  async getProfile(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: [
        'id', 'name', 'email', 'phone',
        'address', 'avatar', 'role',
        'is_verified', 'isBanned', 'createdAt',
      ],
    });

    if (!user) throw new NotFoundException('User not found');
    return { data: user };
  }

  async updateProfile(userRequest: { id: string }, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: { id: userRequest.id },
    });
    if (!user) throw new NotFoundException('User not found');

    if (updateUserDto.name) {
      user.name = updateUserDto.name;
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const exists = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (exists) throw new ConflictException('Email already in use');
      user.email = updateUserDto.email;
    }

    if (updateUserDto.phone && updateUserDto.phone !== user.phone) {
      const exists = await this.userRepository.findOne({
        where: { phone: updateUserDto.phone },
      });
      if (exists) throw new ConflictException('Phone already in use');
      user.phone = updateUserDto.phone;
    }

    if (updateUserDto.address) {
      user.address = updateUserDto.address;
    }

    if (updateUserDto.password) {
      user.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    await this.userRepository.save(user);

    // password ছাড়া return করো
    const { password, ...result } = user as any;
    return { message: 'Profile updated successfully', data: result };
  }

  // users.service.ts এ এই method যোগ করো

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch) throw new BadRequestException('Current password is incorrect');

    user.password = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepository.save(user);

    return { message: 'Password changed successfully' };
  }

  async setDefaultAddress(userId: string, addressId: string) {
    const repo = this.addressRepo;

    // 1. সব address false
    await repo.update({ user: { id: userId } }, { isDefault: false });

    // 2. selected address true
    await repo.update({ id: addressId }, { isDefault: true });

    return { message: 'Default address updated' };
  }
  async getDefaultAddress(userId: string) {
    return this.addressRepo.findOne({
      where: {
        user: { id: userId },
        isDefault: true,
      },
    });
  }

}
