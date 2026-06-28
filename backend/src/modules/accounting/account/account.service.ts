import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountEntity } from './entities/account.entity';
import { CreateAccountDto, UpdateAccountDto } from './dto/create-account.dto';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepo: Repository<AccountEntity>,
  ) {}

  // ─── Create ───────────────────────────────────────────────────────────────
  async create(dto: CreateAccountDto, user: any): Promise<AccountEntity> {
    const exists = await this.accountRepo.findOne({
      where: { account_name: dto.account_name },
    });
    if (exists) {
      throw new BadRequestException(
        `Account "${dto.account_name}" already exists`,
      );
    }

    const account = this.accountRepo.create({
      ...dto,
      opening_balance: dto.opening_balance ?? 0,
      current_balance: dto.opening_balance ?? 0, // starts equal to opening
      createdBy: user,
    });

    return this.accountRepo.save(account);
  }

  // ─── Find All ─────────────────────────────────────────────────────────────
  async findAll(query: { search?: string; page?: number; limit?: number }) {
    const { search = '', page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const qb = this.accountRepo
      .createQueryBuilder('acc')
      .leftJoinAndSelect('acc.createdBy', 'createdBy')
      .orderBy('acc.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    if (search) {
      qb.where('acc.account_name ILIKE :search', { search: `%${search}%` });
    }

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        totalItems: total,
        itemCount: data.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }

  // ─── Find One ─────────────────────────────────────────────────────────────
  async findOne(id: string): Promise<AccountEntity> {
    const account = await this.accountRepo.findOne({
      where: { id },
      relations: ['createdBy'],
    });
    if (!account) throw new NotFoundException(`Account ${id} not found`);
    return account;
  }

  // ─── Update ───────────────────────────────────────────────────────────────
  async update(id: string, dto: UpdateAccountDto): Promise<AccountEntity> {
    const account = await this.findOne(id);
    Object.assign(account, dto);
    return this.accountRepo.save(account);
  }

  // ─── Delete ───────────────────────────────────────────────────────────────
  async remove(id: string): Promise<{ message: string }> {
    const account = await this.findOne(id);
    await this.accountRepo.remove(account);
    return { message: 'Account deleted successfully' };
  }

  // ─── Internal: adjust balance (called from TransactionService) ────────────
  async adjustBalance(
    accountId: string,
    amount: number,
    operation: 'add' | 'subtract',
    manager: any, // TypeORM EntityManager (from transaction)
  ): Promise<void> {
    const account = await manager.findOne(AccountEntity, {
      where: { id: accountId },
      lock: { mode: 'pessimistic_write' }, // row-level lock for ACID safety
    });

    if (!account) throw new NotFoundException(`Account ${accountId} not found`);

    const delta = Number(amount);
    if (operation === 'add') {
      account.current_balance = Number(account.current_balance) + delta;
    } else {
      if (Number(account.current_balance) < delta) {
        throw new BadRequestException('Insufficient account balance');
      }
      account.current_balance = Number(account.current_balance) - delta;
    }

    await manager.save(AccountEntity, account);
  }
}