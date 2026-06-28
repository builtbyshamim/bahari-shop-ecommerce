import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { TransactionEntity, TransactionType } from './entities/transaction.entity';
import { AccountEntity } from '../account/entities/account.entity';
import {
  CreateTransactionDto,
  TransactionFilterDto,
  UpdateTransactionDto,
} from './dto/create-transaction.dto';


@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly txRepo: Repository<TransactionEntity>,

    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) { }

  // ─── Helper: load a transaction with all relations ─────────────────────────
  // Replaces leftJoinAndSelect (which fails when @Column FK + @ManyToOne coexist)
  // with explicit addSelect on joined aliases
  private baseQuery() {
    return this.txRepo
      .createQueryBuilder('tx')
      .leftJoin('tx.account', 'account')
      .leftJoin('tx.category', 'category')
      .leftJoin('tx.user', 'user')
      .addSelect([
        'account.id',
        'account.account_name',
        'account.account_type',
        'account.current_balance',
        'account.mobile_provider',
      ])
      .addSelect([
        'category.id',
        'category.name',
        'category.type',
      ])
      .addSelect([
        'user.id',
        // add your UserEntity field names below, e.g.:
        // 'user.name',
        // 'user.email',
      ]);
  }

  // ─── Create Transaction (ACID safe) ───────────────────────────────────────
  async create(dto: CreateTransactionDto, user: any): Promise<TransactionEntity> {
    const savedTx = await this.dataSource.transaction(async (manager) => {
      // 1. Lock and load the account row
      const account = await manager.findOne(AccountEntity, {
        where: { id: dto.account_id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!account) {
        throw new NotFoundException(`Account ${dto.account_id} not found`);
      }

      // 2. Adjust balance
      const amount = Number(dto.amount);
      if (dto.type === TransactionType.INCOME) {
        account.current_balance = Number(account.current_balance) + amount;
      } else {
        if (Number(account.current_balance) < amount) {
          throw new BadRequestException(
            `Insufficient balance. Available: ${account.current_balance}`,
          );
        }
        account.current_balance = Number(account.current_balance) - amount;
      }

      await manager.save(AccountEntity, account);

      // 3. Save transaction
      const transaction = manager.create(TransactionEntity, {
        amount,
        type: dto.type,
        account_id: dto.account_id,
        category_id: dto.category_id,
        note: dto.note,
        date: dto.date,
        user_id: user?.id ?? null,
      });

      return manager.save(TransactionEntity, transaction);
    });

    // 4. Re-fetch with relations so response includes account & category objects
    return this.findOne(savedTx.id);
  }

  // ─── Find All with filters ─────────────────────────────────────────────────
  async findAll(filter: TransactionFilterDto) {
    const {
      page = 1,
      limit = 10,
      search,
      startDate,
      endDate,
      account_id,
      category_id,
      type,
    } = filter;

    const skip = (page - 1) * limit;

    const qb = this.baseQuery()
      .orderBy('tx.date', 'DESC')
      .addOrderBy('tx.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    if (search) {
      qb.andWhere('tx.note ILIKE :search', { search: `%${search}%` });
    }
    if (startDate) {
      qb.andWhere('tx.date >= :startDate', { startDate });
    }
    if (endDate) {
      qb.andWhere('tx.date <= :endDate', { endDate });
    }
    if (account_id) {
      qb.andWhere('tx.account_id = :account_id', { account_id });
    }
    if (category_id) {
      qb.andWhere('tx.category_id = :category_id', { category_id });
    }
    if (type) {
      qb.andWhere('tx.type = :type', { type });
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
  async findOne(id: string): Promise<TransactionEntity> {
    const tx = await this.baseQuery()
      .where('tx.id = :id', { id })
      .getOne();

    if (!tx) throw new NotFoundException(`Transaction ${id} not found`);
    return tx;
  }

  // ─── Update (reverses old + applies new, ACID safe) ───────────────────────
  async update(id: string, dto: UpdateTransactionDto): Promise<TransactionEntity> {
    await this.dataSource.transaction(async (manager) => {
      const existing = await manager.findOne(TransactionEntity, { where: { id } });
      if (!existing) throw new NotFoundException(`Transaction ${id} not found`);

      const targetAccountId = dto.account_id ?? existing.account_id;
      const account = await manager.findOne(AccountEntity, {
        where: { id: targetAccountId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!account) throw new NotFoundException('Account not found');

      let balance = Number(account.current_balance);

      // Reverse old effect
      if (existing.type === TransactionType.INCOME) {
        balance -= Number(existing.amount);
      } else {
        balance += Number(existing.amount);
      }

      // Apply new effect
      const newAmount = Number(dto.amount ?? existing.amount);
      const newType = dto.type ?? existing.type;

      if (newType === TransactionType.INCOME) {
        balance += newAmount;
      } else {
        if (balance < newAmount) {
          throw new BadRequestException(
            `Insufficient balance after reversal. Available: ${balance}`,
          );
        }
        balance -= newAmount;
      }

      account.current_balance = balance;
      await manager.save(AccountEntity, account);

      Object.assign(existing, {
        amount: newAmount,
        type: newType,
        account_id: dto.account_id ?? existing.account_id,
        category_id: dto.category_id ?? existing.category_id,
        note: dto.note ?? existing.note,
        date: dto.date ?? existing.date,
      });

      await manager.save(TransactionEntity, existing);
    });

    // Re-fetch with relations
    return this.findOne(id);
  }

  // ─── Delete (reverses balance, ACID safe) ─────────────────────────────────
  async remove(id: string): Promise<{ message: string }> {
    return this.dataSource.transaction(async (manager) => {
      const tx = await manager.findOne(TransactionEntity, { where: { id } });
      if (!tx) throw new NotFoundException(`Transaction ${id} not found`);

      const account = await manager.findOne(AccountEntity, {
        where: { id: tx.account_id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!account) throw new NotFoundException('Account not found');

      if (tx.type === TransactionType.INCOME) {
        account.current_balance =
          Number(account.current_balance) - Number(tx.amount);
      } else {
        account.current_balance =
          Number(account.current_balance) + Number(tx.amount);
      }

      await manager.save(AccountEntity, account);
      await manager.remove(TransactionEntity, tx);

      return { message: 'Transaction deleted and balance restored' };
    });
  }
}