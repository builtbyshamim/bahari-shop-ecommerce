import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, LessThan, Repository } from 'typeorm';
import { StockReservation, ReservationStatus } from './entities/stock-reservation.entity';
import { Inventory } from './entities/inventory.entity';

@Injectable()
export class InventoryCleanupCronService {
  private readonly logger = new Logger(InventoryCleanupCronService.name);

  constructor(
    @InjectRepository(StockReservation)
    private readonly reservationRepo: Repository<StockReservation>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Every 5 minutes: find PENDING reservations whose expires_at has passed
   * and release the held stock back to available.
   * These are created by the manual /inventory/:id/reserve endpoint (cart holds),
   * not by order creation (which uses CONFIRMED with no expiry).
   */
  @Cron(CronExpression.EVERY_5_MINUTES, {
    name: 'release-expired-reservations',
    timeZone: 'Asia/Dhaka',
  })
  async releaseExpiredReservations(): Promise<void> {
    const expired = await this.reservationRepo.find({
      where: {
        status: ReservationStatus.PENDING,
        expires_at: LessThan(new Date()),
      },
    });

    if (expired.length === 0) return;

    this.logger.log(`Releasing ${expired.length} expired reservation(s)`);

    let released = 0;
    let failed = 0;

    for (const reservation of expired) {
      try {
        await this.dataSource.transaction(async (em) => {
          const lockedInv = await em.findOne(Inventory, {
            where: { id: reservation.inventory_id },
            lock: { mode: 'pessimistic_write' },
          });
          if (!lockedInv) return;

          await em.update(StockReservation, reservation.id, {
            status: ReservationStatus.RELEASED,
          });

          await em.update(Inventory, lockedInv.id, {
            qty_reserved: Math.max(0, lockedInv.qty_reserved - reservation.quantity),
            qty_available: lockedInv.qty_available + reservation.quantity,
          });
        });
        released++;
      } catch (err: any) {
        failed++;
        this.logger.error(
          `Failed to release reservation ${reservation.id}: ${err.message}`,
        );
      }
    }

    this.logger.log(`Expired reservation sweep: released=${released}, failed=${failed}`);
  }
}
