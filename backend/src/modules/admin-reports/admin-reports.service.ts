import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus, PaymentStatus } from '../orders/entities/order.entity';
import {
  TransactionEntity,
  TransactionType,
} from '../accounting/transaction/entities/transaction.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import {
  StockMovement,
  MovementType,
} from '../inventory/entities/stock-movement.entity';

@Injectable()
export class AdminReportsService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,

    @InjectRepository(TransactionEntity)
    private readonly txRepo: Repository<TransactionEntity>,

    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,

    @InjectRepository(StockMovement)
    private readonly movementRepo: Repository<StockMovement>,
  ) {}

  // ─── ORDERS REPORT ────────────────────────────────────────────
  async getOrdersReport(
    startDate?: string,
    endDate?: string,
    status?: string,
  ) {
    const qb = this.orderRepo
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.customer', 'customer')
      .leftJoinAndSelect('o.items', 'items')
      .leftJoinAndSelect('o.orderSource', 'orderSource')
      .leftJoinAndSelect('o.createdBy', 'createdBy')
      .orderBy('o.createdAt', 'DESC');

    if (startDate)
      qb.andWhere('o.createdAt >= :startDate', {
        startDate: startDate + 'T00:00:00.000Z',
      });
    if (endDate)
      qb.andWhere('o.createdAt <= :endDate', {
        endDate: endDate + 'T23:59:59.999Z',
      });
    if (status) qb.andWhere('o.status = :status', { status });

    const orders = await qb.getMany();

    const totalRevenue = orders.reduce((s, o) => s + Number(o.totalPrice), 0);
    const totalDiscount = orders.reduce(
      (s, o) => s + Number(o.discount) + Number(o.couponDiscount),
      0,
    );
    const totalDelivery = orders.reduce(
      (s, o) => s + Number(o.deliveryCharge),
      0,
    );
    const totalItems = orders.reduce(
      (s, o) => s + (o.items?.length ?? 0),
      0,
    );

    const byStatus = Object.entries(
      orders.reduce(
        (acc, o) => {
          if (!acc[o.status]) acc[o.status] = { count: 0, revenue: 0 };
          acc[o.status].count++;
          acc[o.status].revenue += Number(o.totalPrice);
          return acc;
        },
        {} as Record<string, { count: number; revenue: number }>,
      ),
    ).map(([status, data]) => ({ status, ...data }));

    const byPaymentMethod = Object.entries(
      orders.reduce(
        (acc, o) => {
          const pm = o.paymentMethod || 'Unknown';
          if (!acc[pm]) acc[pm] = { count: 0, revenue: 0 };
          acc[pm].count++;
          acc[pm].revenue += Number(o.totalPrice);
          return acc;
        },
        {} as Record<string, { count: number; revenue: number }>,
      ),
    ).map(([method, data]) => ({ method, ...data }));

    return {
      summary: {
        totalOrders: orders.length,
        totalRevenue,
        totalDiscount,
        totalDelivery,
        totalItems,
        avgOrderValue: orders.length ? totalRevenue / orders.length : 0,
        byStatus,
        byPaymentMethod,
      },
      rows: orders.map((o) => ({
        orderNumber: o.orderNumber,
        customer: o.customer?.name || 'Guest',
        phone: o.customer?.phone || '',
        email: o.customer?.email || '',
        items: o.items?.length ?? 0,
        subTotal: Number(o.subTotal),
        discount: Number(o.discount) + Number(o.couponDiscount),
        deliveryCharge: Number(o.deliveryCharge),
        totalPrice: Number(o.totalPrice),
        paymentMethod: o.paymentMethod || '',
        paymentStatus: o.paymentStatus,
        status: o.status,
        source: o.orderSource?.name || '',
        createdBy: o.createdBy?.name || '',
        date: o.createdAt,
      })),
    };
  }

  // ─── TRANSACTIONS REPORT ──────────────────────────────────────
  async getTransactionsReport(
    startDate?: string,
    endDate?: string,
    type?: TransactionType,
  ) {
    const qb = this.txRepo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.account', 'account')
      .leftJoinAndSelect('t.category', 'category')
      .leftJoinAndSelect('t.user', 'user')
      .orderBy('t.date', 'DESC');

    if (startDate) qb.andWhere('t.date >= :startDate', { startDate });
    if (endDate) qb.andWhere('t.date <= :endDate', { endDate });
    if (type) qb.andWhere('t.type = :type', { type });

    const transactions = await qb.getMany();

    const totalIncome = transactions
      .filter((t) => t.type === TransactionType.INCOME)
      .reduce((s, t) => s + Number(t.amount), 0);
    const totalExpense = transactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((s, t) => s + Number(t.amount), 0);

    const byCategoryIncome = Object.entries(
      transactions
        .filter((t) => t.type === TransactionType.INCOME)
        .reduce(
          (acc, t) => {
            const k = t.category?.name || 'Uncategorized';
            if (!acc[k]) acc[k] = 0;
            acc[k] += Number(t.amount);
            return acc;
          },
          {} as Record<string, number>,
        ),
    ).map(([category, total]) => ({ category, total }));

    const byCategoryExpense = Object.entries(
      transactions
        .filter((t) => t.type === TransactionType.EXPENSE)
        .reduce(
          (acc, t) => {
            const k = t.category?.name || 'Uncategorized';
            if (!acc[k]) acc[k] = 0;
            acc[k] += Number(t.amount);
            return acc;
          },
          {} as Record<string, number>,
        ),
    ).map(([category, total]) => ({ category, total }));

    return {
      summary: {
        totalIncome,
        totalExpense,
        netProfit: totalIncome - totalExpense,
        count: transactions.length,
        byCategoryIncome,
        byCategoryExpense,
      },
      rows: transactions.map((t) => ({
        date: t.date,
        type: t.type,
        category: t.category?.name || '',
        account: t.account?.account_name || '',
        amount: Number(t.amount),
        note: t.note || '',
        recordedBy: t.user?.name || '',
      })),
    };
  }

  // ─── INVENTORY REPORT ─────────────────────────────────────────
  async getInventoryReport() {
    const inventory = await this.inventoryRepo
      .createQueryBuilder('inv')
      .leftJoinAndSelect('inv.product', 'product')
      .leftJoinAndSelect('inv.variant', 'variant')
      .orderBy('product.name', 'ASC')
      .getMany();

    const totalValue = inventory.reduce(
      (s, i) => s + Number(i.total_cost_value),
      0,
    );
    const lowStock = inventory.filter(
      (i) => i.is_tracked && i.qty_available > 0 && i.qty_available <= i.low_stock_threshold,
    ).length;
    const outOfStock = inventory.filter(
      (i) => i.is_tracked && i.qty_available <= 0,
    ).length;

    return {
      summary: {
        totalProducts: inventory.length,
        totalStockValue: totalValue,
        lowStockItems: lowStock,
        outOfStockItems: outOfStock,
        trackedItems: inventory.filter((i) => i.is_tracked).length,
      },
      rows: inventory.map((i) => ({
        product: i.product?.name || '',
        sku: i.variant?.sku || `PRD-${i.product_id?.slice(-6)}`,
        variantId: i.variant_id || '',
        qtyOnHand: i.qty_on_hand,
        qtyReserved: i.qty_reserved,
        qtyAvailable: i.qty_available,
        lowStockThreshold: i.low_stock_threshold,
        avgCostPrice: Number(i.avg_cost_price),
        totalValue: Number(i.total_cost_value),
        isTracked: i.is_tracked,
        allowBackorder: i.allow_backorder,
        status:
          !i.is_tracked
            ? 'Untracked'
            : i.qty_available <= 0
              ? 'Out of Stock'
              : i.qty_available <= i.low_stock_threshold
                ? 'Low Stock'
                : 'In Stock',
      })),
    };
  }

  // ─── STOCK MOVEMENTS REPORT ───────────────────────────────────
  async getStockMovementsReport(
    startDate?: string,
    endDate?: string,
    movementType?: MovementType,
  ) {
    const qb = this.movementRepo
      .createQueryBuilder('sm')
      .leftJoinAndSelect('sm.inventory', 'inventory')
      .leftJoinAndSelect('inventory.product', 'product')
      .leftJoinAndSelect('inventory.variant', 'variant')
      .orderBy('sm.created_at', 'DESC');

    if (startDate)
      qb.andWhere('sm.created_at >= :startDate', {
        startDate: startDate + 'T00:00:00.000Z',
      });
    if (endDate)
      qb.andWhere('sm.created_at <= :endDate', {
        endDate: endDate + 'T23:59:59.999Z',
      });
    if (movementType)
      qb.andWhere('sm.movement_type = :movementType', { movementType });

    const movements = await qb.getMany();

    const inTypes = [
      MovementType.INITIAL,
      MovementType.PURCHASE_IN,
      MovementType.RETURN_IN,
      MovementType.ADJUSTMENT_IN,
      MovementType.TRANSFER_IN,
    ];

    const totalIn = movements
      .filter((m) => inTypes.includes(m.movement_type))
      .reduce((s, m) => s + m.quantity, 0);

    const totalOut = movements
      .filter((m) => !inTypes.includes(m.movement_type))
      .reduce((s, m) => s + m.quantity, 0);

    const purchaseValue = movements
      .filter((m) => m.movement_type === MovementType.PURCHASE_IN)
      .reduce((s, m) => s + m.quantity * Number(m.unit_cost_price || 0), 0);

    const salesValue = movements
      .filter((m) => m.movement_type === MovementType.SALE_OUT)
      .reduce((s, m) => s + m.quantity * Number(m.unit_sale_price || 0), 0);

    return {
      summary: {
        total: movements.length,
        totalIn,
        totalOut,
        purchaseValue,
        salesValue,
      },
      rows: movements.map((m) => ({
        date: m.created_at,
        product: m.inventory?.product?.name || '',
        sku: m.inventory?.variant?.sku || '',
        movementType: m.movement_type,
        quantity: m.quantity,
        qtyBefore: m.qty_before,
        qtyAfter: m.qty_after,
        unitCostPrice: Number(m.unit_cost_price || 0),
        unitSalePrice: Number(m.unit_sale_price || 0),
        totalValue:
          m.movement_type === MovementType.PURCHASE_IN
            ? m.quantity * Number(m.unit_cost_price || 0)
            : m.quantity * Number(m.unit_sale_price || 0),
        referenceType: m.reference_type || '',
        note: m.note || '',
      })),
    };
  }

  // ─── CAMPAIGN ATTRIBUTION REPORT ─────────────────────────────
  async getCampaignReport(startDate?: string, endDate?: string) {
    const qb = this.orderRepo
      .createQueryBuilder('o')
      .select([
        'o.id',
        'o.utmSource',
        'o.utmMedium',
        'o.utmCampaign',
        'o.totalPrice',
        'o.paymentStatus',
      ])
      .orderBy('o.createdAt', 'DESC');

    if (startDate)
      qb.andWhere('o.createdAt >= :startDate', {
        startDate: startDate + 'T00:00:00.000Z',
      });
    if (endDate)
      qb.andWhere('o.createdAt <= :endDate', {
        endDate: endDate + 'T23:59:59.999Z',
      });

    const orders = await qb.getMany();

    const groups: Record<
      string,
      {
        utmSource: string;
        utmMedium: string;
        utmCampaign: string;
        orders: number;
        revenue: number;
        paidOrders: number;
      }
    > = {};

    for (const order of orders) {
      const source = order.utmSource || 'Direct';
      const medium = order.utmMedium || '—';
      const campaign = order.utmCampaign || '—';
      const key = `${source}||${medium}||${campaign}`;

      if (!groups[key]) {
        groups[key] = {
          utmSource: source,
          utmMedium: medium,
          utmCampaign: campaign,
          orders: 0,
          revenue: 0,
          paidOrders: 0,
        };
      }
      groups[key].orders++;
      groups[key].revenue += Number(order.totalPrice);
      if (order.paymentStatus === PaymentStatus.PAID) groups[key].paidOrders++;
    }

    const rows = Object.values(groups)
      .map((g) => ({
        ...g,
        avgOrderValue: g.orders > 0 ? g.revenue / g.orders : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
    const totalOrders = rows.reduce((s, r) => s + r.orders, 0);

    return {
      summary: {
        totalRevenue,
        totalOrders,
        uniqueSources: new Set(
          rows.filter((r) => r.utmSource !== 'Direct').map((r) => r.utmSource),
        ).size,
        uniqueCampaigns: rows.filter((r) => r.utmCampaign !== '—').length,
      },
      rows: rows.map((r) => ({
        ...r,
        revenueShare:
          totalRevenue > 0
            ? Math.round((r.revenue / totalRevenue) * 1000) / 10
            : 0,
      })),
    };
  }

  // ─── COMPREHENSIVE SUMMARY ────────────────────────────────────
  async getComprehensiveSummary(startDate?: string, endDate?: string) {
    const [ordersResult, txResult, inventoryResult] = await Promise.all([
      this.getOrdersReport(startDate, endDate),
      this.getTransactionsReport(startDate, endDate),
      this.getInventoryReport(),
    ]);

    return {
      sales: ordersResult.summary,
      accounting: txResult.summary,
      inventory: inventoryResult.summary,
    };
  }
}
