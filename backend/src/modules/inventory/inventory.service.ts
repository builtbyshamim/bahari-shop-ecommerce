// inventory.service.ts
import {
  Injectable, NotFoundException,
  BadRequestException, InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Inventory } from './entities/inventory.entity';
import { StockMovement, MovementType } from './entities/stock-movement.entity';
import { StockReservation, ReservationStatus } from './entities/stock-reservation.entity';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { StockInDto } from './dto/stock-in.dto';
import { StockAdjustmentDto } from './dto/stock-adjustment.dto';
import { ReserveStockDto } from './dto/reserve-stock.dto';
import { FulfillStockDto } from './dto/fulfill-stock.dto';
import { QueryInventoryDto } from './dto/query-inventory.dto';
import { UpdateInventorySettingsDto } from './dto/update-inventory-settings.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
    @InjectRepository(StockMovement)
    private readonly movementRepo: Repository<StockMovement>,
    @InjectRepository(StockReservation)
    private readonly reservationRepo: Repository<StockReservation>,
    private readonly dataSource: DataSource,
  ) { }

  // ── 1. Opening Stock তৈরি ──────────────────────────────────────
  async create(dto: CreateInventoryDto, performedBy: string) {
    const existing = await this.inventoryRepo.findOne({
      where: { product_id: dto.product_id, variant_id: dto.variant_id },
    });
    if (existing) {
      throw new BadRequestException('Inventory already exists for this product/variant');
    }

    return this.dataSource.transaction(async (em) => {
      const inventory = em.create(Inventory, {
        ...dto,
        variant_id: dto.variant_id ?? null,
        qty_on_hand: dto.qty_on_hand,
        qty_reserved: 0,
        vendor_id: performedBy,
        qty_available: dto.qty_on_hand,
        avg_cost_price: dto.avg_cost_price ?? 0,
        total_cost_value: dto.qty_on_hand * (dto.avg_cost_price ?? 0),
      });
      const saved = await em.save(inventory);

      // Opening stock movement log
      if (dto.qty_on_hand > 0) {
        await em.save(StockMovement, {
          inventory_id: saved.id,
          movement_type: MovementType.INITIAL,
          quantity: dto.qty_on_hand,
          qty_before: 0,
          qty_after: dto.qty_on_hand,
          unit_cost_price: dto.avg_cost_price ?? 0,
          reference_type: 'manual',
          note: 'Opening stock',
          performed_by: performedBy,
        });
      }

      return saved;
    });
  }

  // ── 2. Stock In (Purchase) ─────────────────────────────────────
  async stockIn(inventoryId: string, dto: StockInDto, performedBy: string) {
    return this.dataSource.transaction(async (em) => {
      const inv = await em.findOne(Inventory, {
        where: { id: inventoryId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!inv) throw new NotFoundException('Inventory not found');

      // WAC recalculate
      const oldTotal = inv.qty_on_hand * Number(inv.avg_cost_price);
      const newTotal = dto.quantity * dto.unit_cost_price;
      const newQtyOnHand = inv.qty_on_hand + dto.quantity;
      const newAvgCost = newQtyOnHand > 0
        ? (oldTotal + newTotal) / newQtyOnHand
        : dto.unit_cost_price;

      await em.save(StockMovement, {
        inventory_id: inventoryId,
        movement_type: MovementType.PURCHASE_IN,
        quantity: dto.quantity,
        qty_before: inv.qty_on_hand,
        qty_after: newQtyOnHand,
        unit_cost_price: dto.unit_cost_price,
        reference_id: dto.reference_id ?? null,
        reference_type: dto.reference_id ? 'purchase_order' : 'manual',
        note: dto.note ?? null,
        performed_by: performedBy,
      });

      await em.update(Inventory, inventoryId, {
        qty_on_hand: newQtyOnHand,
        qty_available: newQtyOnHand - inv.qty_reserved,
        avg_cost_price: newAvgCost,
        total_cost_value: newQtyOnHand * newAvgCost,
      });

      return { message: 'Stock added successfully', qty_on_hand: newQtyOnHand };
    });
  }

  // ── 3. Manual Adjustment ───────────────────────────────────────
  async adjust(inventoryId: string, dto: StockAdjustmentDto, performedBy: string) {
    return this.dataSource.transaction(async (em) => {
      const inv = await em.findOne(Inventory, {
        where: { id: inventoryId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!inv) throw new NotFoundException('Inventory not found');

      const isIn = dto.type === 'in';
      const newQtyOnHand = isIn
        ? inv.qty_on_hand + dto.quantity
        : inv.qty_on_hand - dto.quantity;

      if (newQtyOnHand < 0) {
        throw new BadRequestException('Stock cannot go below 0');
      }

      await em.save(StockMovement, {
        inventory_id: inventoryId,
        movement_type: isIn ? MovementType.ADJUSTMENT_IN : MovementType.ADJUSTMENT_OUT,
        quantity: dto.quantity,
        qty_before: inv.qty_on_hand,
        qty_after: newQtyOnHand,
        unit_cost_price: Number(inv.avg_cost_price),
        reference_type: 'manual',
        note: dto.note,
        performed_by: performedBy,
      });

      await em.update(Inventory, inventoryId, {
        qty_on_hand: newQtyOnHand,
        qty_available: newQtyOnHand - inv.qty_reserved,
        total_cost_value: newQtyOnHand * Number(inv.avg_cost_price),
      });

      return { message: 'Adjustment done', qty_on_hand: newQtyOnHand };
    });
  }

  // ── 4. Reserve (Order Place) ───────────────────────────────────
  async reserve(inventoryId: string, dto: ReserveStockDto, performedBy: string) {
    return this.dataSource.transaction(async (em) => {
      const inv = await em.findOne(Inventory, {
        where: { id: inventoryId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!inv) throw new NotFoundException('Inventory not found');

      if (!inv.allow_backorder && inv.qty_available < dto.quantity) {
        throw new BadRequestException(
          `Insufficient stock. Available: ${inv.qty_available}`,
        );
      }

      await em.save(StockReservation, {
        inventory_id: inventoryId,
        order_id: dto.order_id,
        quantity: dto.quantity,
        status: ReservationStatus.PENDING,
        expires_at: new Date(Date.now() + 15 * 60 * 1000), // 15 min
      });

      await em.update(Inventory, inventoryId, {
        qty_reserved: inv.qty_reserved + dto.quantity,
        qty_available: inv.qty_available - dto.quantity,
      });

      return { message: 'Stock reserved' };
    });
  }

  // ── 5. Fulfill (Ship) ──────────────────────────────────────────
  async fulfill(inventoryId: string, dto: FulfillStockDto, performedBy: string) {
    return this.dataSource.transaction(async (em) => {
      const inv = await em.findOne(Inventory, {
        where: { id: inventoryId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!inv) throw new NotFoundException('Inventory not found');

      const reservation = await em.findOne(StockReservation, {
        where: { inventory_id: inventoryId, order_id: dto.order_id, status: ReservationStatus.CONFIRMED },
      });
      if (!reservation) throw new NotFoundException('Confirmed reservation not found');

      const newQtyOnHand = inv.qty_on_hand - dto.quantity;

      await em.save(StockMovement, {
        inventory_id: inventoryId,
        movement_type: MovementType.SALE_OUT,
        quantity: dto.quantity,
        qty_before: inv.qty_on_hand,
        qty_after: newQtyOnHand,
        unit_cost_price: Number(inv.avg_cost_price),
        unit_sale_price: dto.unit_sale_price,
        reference_id: dto.order_id,
        reference_type: 'order',
        performed_by: performedBy,
      });

      await em.update(StockReservation, reservation.id, {
        status: ReservationStatus.FULFILLED,
      });

      await em.update(Inventory, inventoryId, {
        qty_on_hand: newQtyOnHand,
        qty_reserved: inv.qty_reserved - dto.quantity,
        total_cost_value: newQtyOnHand * Number(inv.avg_cost_price),
      });

      return { message: 'Stock fulfilled' };
    });
  }

  // ── 6. Release Reservation (Cancel/Expire) ─────────────────────
  async release(inventoryId: string, orderId: string) {
    return this.dataSource.transaction(async (em) => {
      const inv = await em.findOne(Inventory, {
        where: { id: inventoryId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!inv) throw new NotFoundException('Inventory not found');

      // Accept both PENDING (manual cart holds) and CONFIRMED (order reservations)
      const reservation = await em.findOne(StockReservation, {
        where: {
          inventory_id: inventoryId,
          order_id: orderId,
          status: In([ReservationStatus.PENDING, ReservationStatus.CONFIRMED]),
        },
      });
      if (!reservation) throw new NotFoundException('Active reservation not found');

      await em.update(StockReservation, reservation.id, {
        status: ReservationStatus.RELEASED,
      });

      await em.update(Inventory, inventoryId, {
        qty_reserved: inv.qty_reserved - reservation.quantity,
        qty_available: inv.qty_available + reservation.quantity,
      });

      return { message: 'Reservation released' };
    });
  }

  // ── 7. Get All (List) ──────────────────────────────────────────
  async findAll(query: QueryInventoryDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const qb = this.inventoryRepo
      .createQueryBuilder('inv')
      .leftJoinAndSelect('inv.product', 'product')
      .leftJoinAndSelect('inv.variant', 'variant')
      .orderBy('inv.updated_at', 'DESC')
      .skip(skip)
      .take(limit);

    if (search) {
      qb.where('product.name ILIKE :search', { search: `%${search}%` });
    }

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        page,
        limit,
      },
    };
  }

  // ── 8. Get Single with movement history ───────────────────────
  async findOne(id: string) {
    const inv = await this.inventoryRepo.findOne({
      where: { id },
      relations: ['product', 'variant', 'movements', 'reservations'],
      order: { movements: { created_at: 'DESC' } },
    });
    if (!inv) throw new NotFoundException('Inventory not found');
    return inv;
  }

  // ── 9. Movement History ────────────────────────────────────────
  async getMovements(inventoryId: string, query: QueryInventoryDto) {
    const { page = 1, limit = 20 } = query;
    const [data, total] = await this.movementRepo.findAndCount({
      where: { inventory_id: inventoryId },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, meta: { totalItems: total, totalPages: Math.ceil(total / limit) } };
  }

  // ── 10. Profit Report ──────────────────────────────────────────
  async getProfitReport(inventoryId: string) {
    const result = await this.movementRepo
      .createQueryBuilder('m')
      .select('SUM(m.quantity * m.unit_sale_price)', 'total_revenue')
      .addSelect('SUM(m.quantity * m.unit_cost_price)', 'total_cost')
      .addSelect(
        'SUM(m.quantity * (m.unit_sale_price - m.unit_cost_price))',
        'total_profit',
      )
      .addSelect('SUM(m.quantity)', 'total_units_sold')
      .where('m.inventory_id = :inventoryId', { inventoryId })
      .andWhere('m.movement_type = :type', { type: MovementType.SALE_OUT })
      .getRawOne();

    return result;
  }

  // ── 11. Update Settings ────────────────────────────────────────
async updateSettings(inventoryId: string, dto: UpdateInventorySettingsDto, performedBy: string) {
  const inv = await this.inventoryRepo.findOne({ where: { id: inventoryId } });
  if (!inv) throw new NotFoundException('Inventory not found');

  await this.inventoryRepo.update(inventoryId, {
    is_tracked: dto.is_tracked ?? inv.is_tracked,
    allow_backorder: dto.allow_backorder ?? inv.allow_backorder,
    low_stock_threshold: dto.low_stock_threshold ?? inv.low_stock_threshold,
  });

  return { message: 'Inventory settings updated successfully' };
}
}