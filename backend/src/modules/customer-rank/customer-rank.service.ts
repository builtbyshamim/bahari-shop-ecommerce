import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CustomerRank } from './entities/customer-rank.entity';
import { CustomerLevel } from './entities/customer-level.entity';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { UserRole } from 'src/common/shared/enums/user-role.enum';
import { Order, OrderStatus } from 'src/modules/orders/entities/order.entity';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';

@Injectable()
export class CustomerRankService implements OnModuleInit {
  private readonly logger = new Logger(CustomerRankService.name);

  constructor(
    @InjectRepository(CustomerRank)
    private readonly rankRepo: Repository<CustomerRank>,
    @InjectRepository(CustomerLevel)
    private readonly levelRepo: Repository<CustomerLevel>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    private readonly dataSource: DataSource,
  ) { }

  // ── Seed default levels if table empty ─────────────────────────────────
  async onModuleInit() {
    const count = await this.levelRepo.count();
    if (count === 0) {
      await this.seedDefaultLevels();
    }
  }

  async seedDefaultLevels(): Promise<void> {
    const defaults: CreateLevelDto[] = [
      {
        name: 'Bronze',
        badge: '🥉',
        minAmount: 0,
        maxAmount: 4999,
        discountPercent: 0,
        isDefault: true,
        sortOrder: 1,
      },
      {
        name: 'Silver',
        badge: '🥈',
        minAmount: 5000,
        maxAmount: 14999,
        discountPercent: 5,
        isDefault: false,
        sortOrder: 2,
      },
      {
        name: 'Gold',
        badge: '🥇',
        minAmount: 15000,
        maxAmount: 29999,
        discountPercent: 10,
        isDefault: false,
        sortOrder: 3,
      },
      {
        name: 'Platinum',
        badge: '💎',
        minAmount: 30000,
        maxAmount: 100000000,
        discountPercent: 15,
        isDefault: false,
        sortOrder: 4,
      },
    ];
    await this.levelRepo.save(this.levelRepo.create(defaults));
    this.logger.log('Default customer levels seeded ✅');
  }

  // ── Level CRUD ──────────────────────────────────────────────────────────

  async createLevel(dto: CreateLevelDto): Promise<CustomerLevel> {
    // If new level is set as default, unset previous default
    if (dto.isDefault) {
      await this.levelRepo.update({ isDefault: true }, { isDefault: false });
    }
    const level = this.levelRepo.create(dto);
    return this.levelRepo.save(level);
  }

  async getAllLevels(): Promise<CustomerLevel[]> {
    return this.levelRepo.find({
      order: {
        sortOrder: 'ASC',
      },
    });
  }

  async getLevelById(id: string): Promise<CustomerLevel> {
    const level = await this.levelRepo.findOne({ where: { id } });
    if (!level) throw new NotFoundException(`Level with id ${id} not found`);
    return level;
  }

  async updateLevel(id: string, dto: UpdateLevelDto): Promise<CustomerLevel> {
    const level = await this.getLevelById(id);

    // If this level is being set as default, unset all others
    if (dto.isDefault && !level.isDefault) {
      await this.levelRepo.update({ isDefault: true }, { isDefault: false });
    }

    Object.assign(level, dto);
    const saved = await this.levelRepo.save(level);
    return saved;
  }

  async deleteLevel(id: string): Promise<{ success: boolean; message: string }> {
    const level = await this.getLevelById(id);

    if (level.isDefault) {
      throw new BadRequestException('Cannot delete the default level. Set another level as default first.');
    }

    // Check if any ranks reference this level
    const rankCount = await this.rankRepo.count({ where: { levelId: id } });
    if (rankCount > 0) {
      throw new BadRequestException(
        `Cannot delete level — ${rankCount} customer(s) are assigned to it. Recalculate ranks first.`,
      );
    }

    await this.levelRepo.delete(id);
    return { success: true, message: `Level "${level.name}" deleted successfully` };
  }

  // ── Resolve which level a spend amount belongs to ───────────────────────

  async resolveLevel(totalSpent: number): Promise<CustomerLevel> {
    const levels = await this.levelRepo.find({ order: { sortOrder: 'DESC' } });

    for (const level of levels) {
      if (totalSpent >= Number(level.minAmount)) {
        return level;
      }
    }

    const defaultLevel = await this.levelRepo.findOne({ where: { isDefault: true } });
    if (!defaultLevel) throw new BadGatewayException('Default level not found');
    return defaultLevel;
  }

  // ── Get or create rank for a user ──────────────────────────────────────

  async getOrCreateRank(userId: string): Promise<CustomerRank> {
    let rank = await this.rankRepo.findOne({
      where: { userId },
      relations: ['level'],
    });

    if (!rank) {
      const defaultLevel = await this.levelRepo.findOne({ where: { isDefault: true } });
      if (!defaultLevel) throw new BadGatewayException('Default level not found');

      rank = this.rankRepo.create({
        userId,
        levelId: defaultLevel.id,
        totalSpent: 0,
      });
      rank = await this.rankRepo.save(rank);
      rank.level = defaultLevel;
    }

    return rank;
  }

  // ── Get rank for a user (public API) ───────────────────────────────────

  async getUserRank(userId: string): Promise<CustomerRank> {
    return this.getOrCreateRank(userId);
  }

  // ── Recalculate ALL customer ranks ─────────────────────────────────────

  async recalculateAllRanks(): Promise<{ updated: number; failed: number }> {
    this.logger.log('⏰ Starting rank recalculation...');

    const customers = await this.userRepo.find({
      where: { role: UserRole.CUSTOMER },
      select: ['id', 'role'],
    });

    let updated = 0;
    let failed = 0;
    console.log(customers, 'customers')

    for (const customer of customers) {
      try {
        await this.recalculateRankForUser(customer.id);
        updated++;
      } catch (err) {
        this.logger.error(`Failed for user ${customer.id}: ${err.message}`);
        failed++;
      }
    }

    this.logger.log(`✅ Rank recalculation done. Updated: ${updated}, Failed: ${failed}`);
    return { updated, failed };
  }

  // ── Recalculate rank for a single user ─────────────────────────────────

  async recalculateRankForUser(userId: string): Promise<CustomerRank> {
    const result = await this.orderRepo
      .createQueryBuilder('order')
      .select('COALESCE(SUM(order.totalPrice), 0)', 'total')
      .where('order.customerId = :userId', { userId })
      .andWhere('order.status IN (:...statuses)', {
        statuses: [OrderStatus.CONFIRMED, OrderStatus.DELIVERED],
      })
      .getRawOne<{ total: string }>();

    const totalSpent = parseFloat(result?.total ?? '0');
    const newLevel = await this.resolveLevel(totalSpent);

    let rank = await this.rankRepo.findOne({ where: { userId } });

    if (rank) {
      rank.totalSpent = totalSpent;
      rank.levelId = newLevel.id;
      rank.lastEvaluatedAt = new Date();
    } else {
      rank = this.rankRepo.create({
        userId,
        levelId: newLevel.id,
        totalSpent,
        lastEvaluatedAt: new Date(),
      });
    }

    return this.rankRepo.save(rank);
  }


  // ── Leaderboard ────────────────────────────────────────────────────────

  async getLeaderboard(params?: {
    limit?: number;
    page?: number;
    levelId?: string;
  }): Promise<{ data: CustomerRank[]; meta: { totalItems: number; totalPages: number } }> {
    const limit = params?.limit ?? 10;
    const page = params?.page ?? 1;
    const skip = (page - 1) * limit;

    const qb = this.rankRepo
      .createQueryBuilder('rank')
      .leftJoinAndSelect('rank.level', 'level')
      .orderBy('rank.totalSpent', 'DESC')
      .skip(skip)
      .take(limit);

    if (params?.levelId) {
      qb.where('rank.levelId = :levelId', { levelId: params.levelId });
    }

    const [data, totalItems] = await qb.getManyAndCount();

    // Attach user info via separate query to avoid circular deps
    const userIds = data.map((r) => r.userId);
    if (userIds.length > 0) {
      const users = await this.userRepo
        .createQueryBuilder('user')
        .select(['user.id', 'user.name', 'user.email', 'user.phone'])
        .whereInIds(userIds)
        .getMany();

      const userMap = new Map(users.map((u) => [u.id, u]));
      data.forEach((rank) => {
        rank.user = userMap.get(rank.userId) ?? null;
      });
    }

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
      meta: {
        totalItems,
        totalPages
      }
    };
  }

  // ── Summary stats ──────────────────────────────────────────────────────

  async getRankStats(): Promise<{
    totalCustomers: number;
    totalRevenue: number;
    levelBreakdown: { levelName: string; badge: string; count: number }[];
  }> {
    const breakdown = await this.rankRepo
      .createQueryBuilder('rank')
      .leftJoin('rank.level', 'level')
      .select('level.name', 'levelName')
      .addSelect('level.badge', 'badge')
      .addSelect('COUNT(rank.id)', 'count')
      .groupBy('level.id')
      .getRawMany();

    const totalRevResult = await this.rankRepo
      .createQueryBuilder('rank')
      .select('COALESCE(SUM(rank.totalSpent), 0)', 'total')
      .getRawOne<{ total: string }>();

    const totalCustomers = await this.rankRepo.count();

    return {
      totalCustomers,
      totalRevenue: parseFloat(totalRevResult?.total ?? '0'),
      levelBreakdown: breakdown.map((r) => ({
        levelName: r.levelName,
        badge: r.badge,
        count: Number(r.count),
      })),
    };
  }
}