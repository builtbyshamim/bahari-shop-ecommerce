import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CustomerRankService } from './customer-rank.service';

@Injectable()
export class RankingCronService {
  private readonly logger = new Logger(RankingCronService.name);

  constructor(private readonly rankService: CustomerRankService) {}

  /**
   * Every day at midnight Bangladesh Standard Time (UTC+6)
   * CronExpression.EVERY_DAY_AT_MIDNIGHT = '0 0 * * *'
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'daily-rank-recalculation',
    timeZone: 'Asia/Dhaka',
  })
  async handleDailyRankRecalculation() {
    this.logger.log('🌙 Daily rank cron triggered at midnight (BST)');
    try {
      const result = await this.rankService.recalculateAllRanks();
      this.logger.log(
        `✅ Cron done — Updated: ${result.updated}, Failed: ${result.failed}`,
      );
    } catch (err) {
      this.logger.error(`❌ Daily rank cron failed: ${err.message}`, err.stack);
    }
  }

  /**
   * Optional: weekly full resync every Sunday at 2 AM BST
   */
  @Cron('0 2 * * 0', {
    name: 'weekly-rank-resync',
    timeZone: 'Asia/Dhaka',
  })
  async handleWeeklyResync() {
    this.logger.log('📅 Weekly rank resync triggered');
    try {
      const result = await this.rankService.recalculateAllRanks();
      this.logger.log(
        `✅ Weekly resync done — Updated: ${result.updated}, Failed: ${result.failed}`,
      );
    } catch (err) {
      this.logger.error(`❌ Weekly rank resync failed: ${err.message}`, err.stack);
    }
  }
}