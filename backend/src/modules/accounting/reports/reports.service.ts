import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  TransactionEntity,
  TransactionType,
} from '../transaction/entities/transaction.entity';
import { AccountEntity } from '../account/entities/account.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly txRepo: Repository<TransactionEntity>,

    @InjectRepository(AccountEntity)
    private readonly accountRepo: Repository<AccountEntity>,
  ) {}

  // ─── Summary Report ───────────────────────────────────────────────────────
  async getSummary(filter: {
    startDate?: string;
    endDate?: string;
    account_id?: string;
    category_id?: string;
  }) {
    const qb = this.txRepo
      .createQueryBuilder('tx')
      .select([
        `SUM(CASE WHEN tx.type = 'income' THEN tx.amount ELSE 0 END) AS total_income`,
        `SUM(CASE WHEN tx.type = 'expense' THEN tx.amount ELSE 0 END) AS total_expense`,
        `COUNT(*) AS total_transactions`,
      ]);

    this.applyFilters(qb, filter);

    const raw = await qb.getRawOne();

    const total_income = Number(raw?.total_income ?? 0);
    const total_expense = Number(raw?.total_expense ?? 0);
    const profit_loss = total_income - total_expense;

    // Total current balance across all accounts
    const balanceRaw = await this.accountRepo
      .createQueryBuilder('acc')
      .select('SUM(acc.current_balance)', 'total')
      .getRawOne();

    return {
      total_income: +total_income.toFixed(2),
      total_expense: +total_expense.toFixed(2),
      profit_loss: +profit_loss.toFixed(2),
      total_transactions: Number(raw?.total_transactions ?? 0),
      total_account_balance: +(Number(balanceRaw?.total ?? 0)).toFixed(2),
    };
  }

  // ─── Income vs Expense by Category ────────────────────────────────────────
  async getByCategory(filter: {
    startDate?: string;
    endDate?: string;
    account_id?: string;
    type?: TransactionType;
  }) {
    const qb = this.txRepo
      .createQueryBuilder('tx')
      .leftJoin('tx.category', 'category')
      .select([
        'category.id AS category_id',
        'category.name AS category_name',
        'tx.type AS type',
        'SUM(tx.amount) AS total',
        'COUNT(*) AS count',
      ])
      .groupBy('category.id')
      .addGroupBy('category.name')
      .addGroupBy('tx.type')
      .orderBy('total', 'DESC');

    this.applyFilters(qb, filter);

    if (filter.type) {
      qb.andWhere('tx.type = :type', { type: filter.type });
    }

    const rows = await qb.getRawMany();
    return rows.map((r) => ({
      category_id: r.category_id,
      category_name: r.category_name,
      type: r.type,
      total: +Number(r.total).toFixed(2),
      count: Number(r.count),
    }));
  }

  // ─── Daily / Monthly breakdown ────────────────────────────────────────────
  async getTimeSeries(
    filter: {
      startDate?: string;
      endDate?: string;
      account_id?: string;
    },
    groupBy: 'day' | 'month' = 'day',
  ) {
    const dateTrunc = groupBy === 'month' ? 'month' : 'day';

    const qb = this.txRepo
      .createQueryBuilder('tx')
      .select([
        `DATE_TRUNC('${dateTrunc}', tx.date::timestamp) AS period`,
        `SUM(CASE WHEN tx.type = 'income' THEN tx.amount ELSE 0 END) AS income`,
        `SUM(CASE WHEN tx.type = 'expense' THEN tx.amount ELSE 0 END) AS expense`,
      ])
      .groupBy('period')
      .orderBy('period', 'ASC');

    this.applyFilters(qb, filter);

    const rows = await qb.getRawMany();
    return rows.map((r) => ({
      period: r.period,
      income: +Number(r.income).toFixed(2),
      expense: +Number(r.expense).toFixed(2),
      net: +(Number(r.income) - Number(r.expense)).toFixed(2),
    }));
  }

  // ─── Account-wise Balance ─────────────────────────────────────────────────
  async getAccountBalances() {
    const accounts = await this.accountRepo.find({
      order: { account_name: 'ASC' },
    });

    return accounts.map((a) => ({
      id: a.id,
      account_name: a.account_name,
      account_type: a.account_type,
      mobile_provider: a.mobile_provider,
      opening_balance: +Number(a.opening_balance).toFixed(2),
      current_balance: +Number(a.current_balance).toFixed(2),
    }));
  }

  // ─── Private helper: attach common WHERE clauses ──────────────────────────
  private applyFilters(
    qb: any,
    filter: {
      startDate?: string;
      endDate?: string;
      account_id?: string;
      category_id?: string;
    },
  ) {
    if (filter.startDate) {
      qb.andWhere('tx.date >= :startDate', { startDate: filter.startDate });
    }
    if (filter.endDate) {
      qb.andWhere('tx.date <= :endDate', { endDate: filter.endDate });
    }
    if (filter.account_id) {
      qb.andWhere('tx.account_id = :account_id', {
        account_id: filter.account_id,
      });
    }
    if (filter.category_id) {
      qb.andWhere('tx.category_id = :category_id', {
        category_id: filter.category_id,
      });
    }
  }
}