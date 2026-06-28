import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateCourierServiceTokenDto } from './dto/create-courier-service-token.dto';
import { DataSource, Repository } from 'typeorm';
import { CourierServiceToken } from './entities/courier-service-token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes, randomUUID } from 'crypto';
@Injectable()
export class CourierServiceTokenService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(CourierServiceToken)
    private readonly courierServiceTokenRepository: Repository<CourierServiceToken>,
  ) {}

  async create(
    performedBy: string,
    createCourierServiceTokenDto: CreateCourierServiceTokenDto,
  ) {
    if (!performedBy) {
      throw new BadRequestException('You have to sign in!');
    }

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 🔥 existing token check
      const existingToken = await queryRunner.manager.findOne(
        CourierServiceToken,
        {
          where: {
            courier_service_id: createCourierServiceTokenDto.courier_service_id,
          },
        },
      );

      let result;
      if (existingToken) {
        // ✅ UPDATE
        Object.assign(existingToken, {
          ...createCourierServiceTokenDto,
          added_by: performedBy,
        });

        result = await queryRunner.manager.save(
          CourierServiceToken,
          existingToken,
        );
      } else {
        // ✅ CREATE

        let serverToken = '';

        // generate unique token
        const generateToken = async () => {
          let token = '';

          do {
            if (createCourierServiceTokenDto.courier_service_id === 1) {
              token = randomUUID(); // uuid token
            } else if (
              createCourierServiceTokenDto.courier_service_id === 2 ||
              createCourierServiceTokenDto.courier_service_id === 3
            ) {
              token = randomBytes(256).toString('hex'); // long secure token
            }
          } while (
            await queryRunner.manager.exists(CourierServiceToken, {
              where: { server_generation_token: token },
            })
          );

          return token;
        };

        serverToken = await generateToken();

        const newToken = queryRunner.manager.create(CourierServiceToken, {
          ...createCourierServiceTokenDto,
          server_generation_token: serverToken,
          added_by: performedBy,
        });

        result = await queryRunner.manager.save(CourierServiceToken, newToken);
      }

      await queryRunner.commitTransaction();

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        error?.driverError?.detail ??
          error?.response?.message ??
          'Failed to save courier token!',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findOne( id: string) {
    try {
      const token = await this.courierServiceTokenRepository.findOne({
        where: { courier_service_id: +id, },
      });

      if (!token) {
        throw new BadRequestException('Courier token not found!');
      }
      return token;
    } catch (error) {
      throw new InternalServerErrorException(
        error?.driverError?.detail ??
          error?.response?.message ??
          'Failed to get courier token!',
      );
    }
  }

  async myCourierservice() {
    try {
      const token = await this.courierServiceTokenRepository
        .createQueryBuilder('token')
        .leftJoinAndSelect('token.courier_service', 'courier_service')
        .getMany();

      return token;
    } catch (error) {
      throw new InternalServerErrorException(
        error?.driverError?.detail ??
          error?.response?.message ??
          'Failed to get courier token!',
      );
    }
  }
}
