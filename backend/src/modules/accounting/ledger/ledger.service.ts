import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionEntity, TransactionType } from '../transaction/entities/transaction.entity';
import { AccountEntity } from '../account/entities/account.entity';

export interface LedgerRow {
  id: string;
  date: string;
  description: string;
  category: string;
  type: TransactionType;
  debit: number;   // expense
  credit: number;  // income
  balance: number; // running balance
  note: string;
}

export interface LedgerResult {
  account: AccountEntity;
  opening_balance: number;
  closing_balance: number;
  total_income: number;
  total_expense: number;
  net: number;
  entries: LedgerRow[];
}

@Injectable()
export class LedgerService {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepo: Repository<AccountEntity>,

    @InjectRepository(TransactionEntity)
    private readonly txRepo: Repository<TransactionEntity>,
  ) {}

  async getLedger(
    accountId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<LedgerResult> {
    // 1. Load account
    const account = await this.accountRepo.findOne({
      where: { id: accountId },
    });
    if (!account) throw new NotFoundException(`Account ${accountId} not found`);

    // 2. Calculate opening balance for date-filtered ledger
    //    If startDate is given, opening = opening_balance + net of transactions BEFORE startDate
    let opening_balance = Number(account.opening_balance);

    if (startDate) {
      const beforeStart = await this.txRepo
        .createQueryBuilder('tx')
        .select([
          `SUM(CASE WHEN tx.type = 'income' THEN tx.amount ELSE 0 END) AS income`,
          `SUM(CASE WHEN tx.type = 'expense' THEN tx.amount ELSE 0 END) AS expense`,
        ])
        .where('tx.account_id = :accountId', { accountId })
        .andWhere('tx.date < :startDate', { startDate })
        .getRawOne();

      opening_balance +=
        Number(beforeStart?.income ?? 0) - Number(beforeStart?.expense ?? 0);
    }

    // 3. Fetch transactions in date range, sorted ASC for running balance
    const qb = this.txRepo
      .createQueryBuilder('tx')
      .leftJoinAndSelect('tx.category', 'category')
      .where('tx.account_id = :accountId', { accountId })
      .orderBy('tx.date', 'ASC')
      .addOrderBy('tx.created_at', 'ASC');

    if (startDate) qb.andWhere('tx.date >= :startDate', { startDate });
    if (endDate) qb.andWhere('tx.date <= :endDate', { endDate });

    const transactions = await qb.getMany();

    // 4. Build ledger rows with running balance
    let runningBalance = opening_balance;
    let total_income = 0;
    let total_expense = 0;

    const entries: LedgerRow[] = transactions.map((tx) => {
      const amount = Number(tx.amount);
      let debit = 0;
      let credit = 0;

      if (tx.type === TransactionType.INCOME) {
        credit = amount;
        runningBalance += amount;
        total_income += amount;
      } else {
        debit = amount;
        runningBalance -= amount;
        total_expense += amount;
      }

      return {
        id: tx.id,
        date: tx.date,
        description: tx.note || '',
        category: tx.category?.name || 'Uncategorized',
        type: tx.type,
        debit,
        credit,
        balance: +runningBalance.toFixed(2),
        note: tx.note || '',
      };
    });

    return {
      account,
      opening_balance: +opening_balance.toFixed(2),
      closing_balance: +runningBalance.toFixed(2),
      total_income: +total_income.toFixed(2),
      total_expense: +total_expense.toFixed(2),
      net: +(total_income - total_expense).toFixed(2),
      entries,
    };
  }
}