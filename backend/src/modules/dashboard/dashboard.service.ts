import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { UserEntity } from '../users/entities/user.entity';
import { UserRole } from 'src/common/shared/enums/user-role.enum';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,

    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async getSummary(startDate?: Date, endDate?: Date) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const hasFilter = !!(startDate && endDate);

    // ── Count helper ──────────────────────────────────────────
    const countWhere = (extra: Record<string, any> = {}) => {
      if (!hasFilter) return extra;
      return { ...extra, createdAt: Between(startDate!, endDate!) };
    };

    // ── Order counts ───────────────────────────────────────────
    const [
      totalOrders,
      todayOrders,
      pendingOrders,
      confirmedOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
    ] = await Promise.all([
      this.orderRepo.count({ where: countWhere() }),
      this.orderRepo.count({
        where: { createdAt: Between(todayStart, todayEnd) },
      }),
      this.orderRepo.count({
        where: countWhere({ status: OrderStatus.PENDING }),
      }),
      this.orderRepo.count({
        where: countWhere({ status: OrderStatus.CONFIRMED }),
      }),
      this.orderRepo.count({
        where: countWhere({ status: OrderStatus.PROCESSING }),
      }),
      this.orderRepo.count({
        where: countWhere({ status: OrderStatus.SHIPPED }),
      }),
      this.orderRepo.count({
        where: countWhere({ status: OrderStatus.DELIVERED }),
      }),
      this.orderRepo.count({
        where: countWhere({ status: OrderStatus.CANCELLED }),
      }),
    ]);

    // ── Revenue ────────────────────────────────────────────────
    const revenueQb = this.orderRepo
      .createQueryBuilder('o')
      .select('COALESCE(SUM(o.totalPrice), 0)', 'total')
      .where('o.status != :cancelled', { cancelled: OrderStatus.CANCELLED });

    if (hasFilter) {
      revenueQb
        .andWhere('o.createdAt >= :startDate', { startDate })
        .andWhere('o.createdAt <= :endDate', { endDate });
    }
    const revenueResult = await revenueQb.getRawOne();

    const todayRevenueResult = await this.orderRepo
      .createQueryBuilder('o')
      .select('COALESCE(SUM(o.totalPrice), 0)', 'total')
      .where('o.createdAt >= :todayStart', { todayStart })
      .andWhere('o.createdAt <= :todayEnd', { todayEnd })
      .andWhere('o.status != :cancelled', { cancelled: OrderStatus.CANCELLED })
      .getRawOne();

    // ── Customer count (no date filter — always total) ─────────
    const totalCustomers = await this.userRepo.count({
      where: { role: UserRole.CUSTOMER },
    });

    // ── Order status breakdown ─────────────────────────────────
    const statusBreakdown = [
      { status: 'Pending', count: pendingOrders, color: '#f59e0b' },
      { status: 'Confirmed', count: confirmedOrders, color: '#3b82f6' },
      { status: 'Processing', count: processingOrders, color: '#8b5cf6' },
      { status: 'Shipped', count: shippedOrders, color: '#06b6d4' },
      { status: 'Delivered', count: deliveredOrders, color: '#10b981' },
      { status: 'Cancelled', count: cancelledOrders, color: '#ef4444' },
    ];

    // ── Monthly revenue ────────────────────────────────────────
    const monthlyQb = this.orderRepo
      .createQueryBuilder('o')
      .select([
        "TO_CHAR(o.createdAt, 'YYYY-MM') AS month",
        'COALESCE(SUM(o.totalPrice), 0) AS revenue',
        'COUNT(o.id) AS orders',
      ])
      .where('o.status != :cancelled', { cancelled: OrderStatus.CANCELLED });

    if (hasFilter) {
      monthlyQb
        .andWhere('o.createdAt >= :startDate', { startDate })
        .andWhere('o.createdAt <= :endDate', { endDate });
    } else {
      monthlyQb.andWhere("o.createdAt >= NOW() - INTERVAL '12 months'");
    }

    const monthlyData = await monthlyQb
      .groupBy("TO_CHAR(o.createdAt, 'YYYY-MM')")
      .orderBy("TO_CHAR(o.createdAt, 'YYYY-MM')", 'ASC')
      .getRawMany();

    const monthlyRevenue = this.buildMonthlyRevenue(
      monthlyData,
      startDate,
      endDate,
    );

    // ── Recent 6 orders (always latest, no date filter) ───────
    const recentOrders = await this.orderRepo
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.customer', 'customer')
      .select([
        'o.id',
        'o.orderNumber',
        'o.totalPrice',
        'o.status',
        'o.paymentStatus',
        'o.createdAt',
        'customer.name',
        'customer.email',
        'customer.phone',
      ])
      .orderBy('o.createdAt', 'DESC')
      .limit(6)
      .getMany();

    return {
      stats: {
        totalOrders,
        todayOrders,
        totalRevenue: Number(revenueResult?.total ?? 0),
        todayRevenue: Number(todayRevenueResult?.total ?? 0),
        totalCustomers,
        pendingOrders,
        deliveredOrders,
        cancelledOrders,
      },
      statusBreakdown,
      monthlyRevenue,
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customer
          ? (o.customer.name ?? '').trim() ||
            o.customer.email ||
            o.customer.phone ||
            'Guest'
          : 'Guest',
        totalPrice: Number(o.totalPrice),
        status: o.status,
        paymentStatus: o.paymentStatus,
        createdAt: o.createdAt,
      })),
    };
  }

  // ── Build monthly revenue array, filling gaps with 0 ──────
  private buildMonthlyRevenue(
    raw: { month: string; revenue: string; orders: string }[],
    startDate?: Date,
    endDate?: Date,
  ) {
    const map = new Map(raw.map((r) => [r.month, r]));
    const result: { month: string; revenue: number; orders: number }[] = [];

    const now = new Date();
    const rangeStart = startDate
      ? new Date(startDate.getFullYear(), startDate.getMonth(), 1)
      : new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const rangeEnd = endDate
      ? new Date(endDate.getFullYear(), endDate.getMonth(), 1)
      : new Date(now.getFullYear(), now.getMonth(), 1);

    const cur = new Date(rangeStart);
    while (cur <= rangeEnd) {
      const key = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}`;
      const label = cur.toLocaleString('en', { month: 'short' });
      const entry = map.get(key);
      result.push({
        month: label,
        revenue: entry ? Number(entry.revenue) : 0,
        orders: entry ? Number(entry.orders) : 0,
      });
      cur.setMonth(cur.getMonth() + 1);
    }
    return result;
  }
}
