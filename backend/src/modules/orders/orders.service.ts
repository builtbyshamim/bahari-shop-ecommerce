import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { Order, OrderStatus, PaymentStatus } from './entities/order.entity';
import { CreateOrderDto, OrderItemDto } from './dto/create-order.dto';
import { UserEntity } from '../users/entities/user.entity';
import { OrderItem } from './entities/order.item.entity';
import { UserRole } from 'src/common/shared/enums/user-role.enum';
import { OrderAddress } from './entities/order-address.entity';
import { Deal, DiscountType } from '../deals/entities/deal.entity';
import { Product } from '../product/entities/product.entity';
import { ProductVariant } from '../product/entities/product-variant.entity';
import { Address } from '../users/entities/customer-address.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import {
  StockReservation,
  ReservationStatus,
} from '../inventory/entities/stock-reservation.entity';
import {
  StockMovement,
  MovementType,
} from '../inventory/entities/stock-movement.entity';
import { NotificationService } from '../notifications/notification.service';
import { CouponsService } from '../coupons/coupons.service';
import { OrderSource } from '../order-sources/entities/order-source.entity';
import { TrackingService } from '../tracking/tracking.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly itemRepo: Repository<OrderItem>,

    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,

    @InjectRepository(Deal)
    private readonly dealRepo: Repository<Deal>,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,

    private readonly dataSource: DataSource,
    private readonly notificationService: NotificationService,
    private readonly couponsService: CouponsService,
    private readonly trackingService: TrackingService,
  ) {}

  // ─── Generate order number (collision-safe, no DB query needed) ───
  private generateOrderNumber(): string {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const uniquePart = randomUUID()
      .replace(/-/g, '')
      .substring(0, 8)
      .toUpperCase();
    return `ORD-${datePart}-${uniquePart}`;
  }

  // ─── Verify pricing integrity ──────────────────────────────────────
  private verifyPricing(dto: CreateOrderDto): void {
    const calculatedSubTotal = dto.items.reduce(
      (sum, item) => sum + item.without_discount_price * item.quantity,
      0,
    );
    const calculatedItemTotal = dto.items.reduce(
      (sum, item) => sum + item.sale_price * item.quantity,
      0,
    );
    const calculatedTotal =
      calculatedItemTotal -
      (dto.couponDiscount ?? 0) +
      (dto.deliveryCharge ?? 0);

    const tolerance = 1;

    if (Math.abs(calculatedSubTotal - dto.subTotal) > tolerance) {
      throw new BadRequestException('Subtotal mismatch. Please refresh cart.');
    }
    if (Math.abs(calculatedTotal - dto.totalPrice) > tolerance) {
      throw new BadRequestException(
        'Total price mismatch. Please refresh cart.',
      );
    }
  }

  // ─── Verify deal prices for items that have active deals ──────────
  private async verifyDealPricing(items: OrderItemDto[]): Promise<void> {
    const now = new Date();
    const productIds = [...new Set(items.map((i) => i.product_id))];

    const deals = await this.dealRepo
      .createQueryBuilder('deal')
      .where('deal.productId IN (:...productIds)', { productIds })
      .andWhere('deal.isActive = true')
      .andWhere('deal.startAt <= :now', { now })
      .andWhere('deal.endAt >= :now', { now })
      .getMany();

    if (deals.length === 0) return;

    const dealMap = new Map(deals.map((d) => [d.productId, d]));
    const dealProductIds = [...dealMap.keys()];

    const variantIds = items
      .filter((i) => i.assigned_variant_price_id)
      .map((i) => i.assigned_variant_price_id!);

    const [products, variants] = await Promise.all([
      this.productRepo.findBy({ id: In(dealProductIds) }),
      variantIds.length
        ? this.variantRepo.findBy({ id: In(variantIds) })
        : Promise.resolve([]),
    ]);

    const productMap = new Map(products.map((p) => [p.id, p]));
    const variantMap = new Map(variants.map((v) => [v.id, v]));

    for (const item of items) {
      const deal = dealMap.get(item.product_id);
      if (!deal) continue;

      const product = productMap.get(item.product_id);
      if (!product) continue;

      let basePrice: number;
      if (product.hasVariants) {
        if (!item.assigned_variant_price_id) continue;
        const variant = variantMap.get(item.assigned_variant_price_id);
        if (!variant) continue;
        basePrice = Number(variant.price);
      } else {
        basePrice = Number(product.basePrice);
      }

      const discountValue = Number(deal.discountValue);
      const expectedPrice =
        deal.discountType === DiscountType.PERCENT
          ? Math.max(0, basePrice - (basePrice * discountValue) / 100)
          : Math.max(0, basePrice - discountValue);

      const rounded = Math.round(expectedPrice * 100) / 100;

      if (Math.abs(item.sale_price - rounded) > 1) {
        throw new BadRequestException(
          `Deal price mismatch for "${item.name}". Expected ৳${rounded.toFixed(2)}, received ৳${item.sale_price.toFixed(2)}. Please refresh your cart.`,
        );
      }
    }
  }

  // ─── Find inventory by product + variant ──────────────────────────
  private async findInventoryForItem(
    em: any,
    productId: string,
    variantId: string | null,
  ): Promise<Inventory | null> {
    return em.findOne(Inventory, {
      where: { product_id: productId, variant_id: variantId ?? null },
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // CREATE ORDER
  // ─────────────────────────────────────────────────────────────────
  async create(dto: CreateOrderDto, createdById?: string): Promise<Order> {
    if (!dto.items?.length) {
      throw new BadRequestException('Order must have at least one item.');
    }

    if (dto.couponCode && (dto.couponDiscount ?? 0) > 0) {
      const cartItemTotal = dto.items.reduce(
        (sum, item) => sum + item.sale_price * item.quantity,
        0,
      );
      const { discount } = await this.couponsService.validate(
        dto.couponCode,
        cartItemTotal,
      );
      const tolerance = 1;
      if (Math.abs(discount - (dto.couponDiscount ?? 0)) > tolerance) {
        throw new BadRequestException(
          'Coupon discount mismatch. Please reapply the coupon.',
        );
      }
    }

    this.verifyPricing(dto);
    await this.verifyDealPricing(dto.items);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const em = queryRunner.manager;
      const userRepo = em.getRepository(UserEntity);
      const orderRepo = em.getRepository(Order);
      const itemRepo = em.getRepository(OrderItem);
      const addressRepo = em.getRepository(OrderAddress);
      const defaultRepo = em.getRepository(Address);

      const ordersSourceRepo = em.getRepository(OrderSource);

      // 1. Resolve or create customer
      let customer = await userRepo.findOne({
        where: [{ phone: dto.customer.phone }, { email: dto.customer.email }],
      });

      if (customer) {
        customer.name = dto.customer.fullName || customer.name;
        customer.address = dto.customer.address || customer.address;
        if (dto.customer.email && !customer.email) {
          customer.email = dto.customer.email;
        }
        customer = await userRepo.save(customer);
      } else {
        const newUser = userRepo.create();
        newUser.name = dto.customer.fullName || 'Guest';
        newUser.phone = dto.customer.phone;
        newUser.email = dto.customer.email ?? null;
        newUser.address = dto.customer.address;
        newUser.role = UserRole.CUSTOMER;
        customer = await userRepo.save(newUser);
      }

      const defaultAddress = await defaultRepo.findOne({
        where: { user: { id: customer.id }, isDefault: true },
      });

      let orderSource = await ordersSourceRepo.findOne({
        where: { name: 'ecommerce', status: true },
      });
      if (!orderSource) {
        const newSource = ordersSourceRepo.create({
          name: 'ecommerce',
          status: true,
        });
        orderSource = await ordersSourceRepo.save(newSource);
      }

      if (!defaultAddress) {
        const addr = defaultRepo.create({
          fullName: dto.customer.fullName || 'Guest',
          phone: dto.customer.phone,
          email: dto.customer.email,
          fullAddress: dto.customer.address,
          isDefault: true,
        });
        await defaultRepo.save(addr);
      }

      // 2. Pre-check availability (fast read — real enforcement happens under lock below)
      for (const item of dto.items) {
        const variantId = item.assigned_variant_price_id ?? null;
        const inventory = await this.findInventoryForItem(
          em,
          item.product_id,
          variantId,
        );
        if (!inventory || !inventory.is_tracked) continue;

        if (
          !inventory.allow_backorder &&
          inventory.qty_available < item.quantity
        ) {
          throw new BadRequestException(
            `"${item.name}" has insufficient stock. Available: ${inventory.qty_available}, Requested: ${item.quantity}`,
          );
        }
      }

      // 3. Build order items
      const items: OrderItem[] = dto.items.map((item) => {
        const orderItem = itemRepo.create();
        orderItem.productId = item.product_id;
        orderItem.assignedVariantPriceId =
          item.assigned_variant_price_id ?? null;
        orderItem.name = item.name;
        orderItem.image = item.image ?? null;
        orderItem.salePrice = item.sale_price;
        orderItem.withoutDiscountPrice = item.without_discount_price;
        orderItem.quantity = item.quantity;
        orderItem.lineTotal = item.sale_price * item.quantity;
        orderItem.selectedVariantOptions =
          item.selected_variant_options ?? null;
        return orderItem;
      });

      // 4. Save order
      const order = orderRepo.create();
      order.orderNumber = this.generateOrderNumber();
      order.status = OrderStatus.PENDING;
      order.paymentStatus = PaymentStatus.UNPAID;
      order.paymentMethod = dto.paymentMethod ?? null;
      order.subTotal = dto.subTotal;
      order.discount = dto.discount;
      order.couponDiscount = dto.couponDiscount ?? 0;
      order.deliveryCharge = dto.deliveryCharge ?? 0;
      order.totalPrice = dto.totalPrice;
      order.deliveryMethodId = dto.deliveryMethodId ?? null;
      order.deliveryMethodName = dto.deliveryMethodName ?? null;
      order.couponCode = dto.couponCode ?? null;
      order.orderNote = dto.orderNote ?? null;
      order.orderSourceId = orderSource?.id ?? null;
      order.createdById = createdById ?? null;
      order.utmSource = dto.utmSource ?? null;
      order.utmMedium = dto.utmMedium ?? null;
      order.utmCampaign = dto.utmCampaign ?? null;
      order.utmContent = dto.utmContent ?? null;
      order.utmTerm = dto.utmTerm ?? null;
      order.clickId = dto.clickId ?? null;
      order.fbp = dto.fbp ?? null;
      order.fbc = dto.fbc ?? null;
      order.customer = customer;
      order.items = items;

      const address = addressRepo.create({
        fullName: dto.customer.fullName || 'Guest',
        phone: dto.customer.phone,
        email: dto.customer.email,
        fullAddress: dto.customer.address,
      });
      order.address = address;

      const savedOrder = await orderRepo.save(order);

      // 5. Reserve stock under pessimistic lock (re-validates availability after lock)
      for (const item of dto.items) {
        const variantId = item.assigned_variant_price_id ?? null;
        const inventory = await this.findInventoryForItem(
          em,
          item.product_id,
          variantId,
        );

        if (!inventory || !inventory.is_tracked) continue;

        // Acquire exclusive lock on this inventory row
        const lockedInv = await em.findOne(Inventory, {
          where: { id: inventory.id },
          lock: { mode: 'pessimistic_write' },
        });

        if (!lockedInv) {
          throw new BadRequestException(
            `Inventory record missing for "${item.name}"`,
          );
        }

        // Re-validate after lock — prevents overselling under concurrent load
        if (
          !lockedInv.allow_backorder &&
          lockedInv.qty_available < item.quantity
        ) {
          throw new BadRequestException(
            `"${item.name}" stock just sold out. Available: ${lockedInv.qty_available}, Requested: ${item.quantity}`,
          );
        }

        await em.save(StockReservation, {
          inventory_id: lockedInv.id,
          order_id: savedOrder.id,
          quantity: item.quantity,
          status: ReservationStatus.CONFIRMED,
          expires_at: null,
        });

        await em.update(Inventory, lockedInv.id, {
          qty_reserved: lockedInv.qty_reserved + item.quantity,
          qty_available: lockedInv.qty_available - item.quantity,
        });
      }

      await queryRunner.commitTransaction();

      if (dto.couponCode && (dto.couponDiscount ?? 0) > 0) {
        void this.couponsService.incrementUsage(dto.couponCode);
      }

      void this.sendOrderNotifications(savedOrder, customer);
      void this.trackingService.enqueueTrackingJob(savedOrder);

      return savedOrder;
    } catch (error) {
      console.log(error, 'errorerrorerror');
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async sendOrderNotifications(
    order: Order,
    customer: UserEntity,
  ): Promise<void> {
    try {
      const orderData = { orderId: order.id, orderNumber: order.orderNumber };
      await this.notificationService.notifyAdmins(
        'New Order Received',
        `#${order.orderNumber} — ${customer.name || customer.phone} | ৳${Number(order.totalPrice).toLocaleString()}`,
        orderData,
      );
    } catch (err: any) {
      console.error('Order notification error:', err?.message);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // UPDATE STATUS
  // ─────────────────────────────────────────────────────────────────
  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.findOne(id);
    const prevStatus = order.status;

    const allowedTransitions: Partial<Record<OrderStatus, OrderStatus[]>> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [
        OrderStatus.PROCESSING,
        OrderStatus.SHIPPED,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.REFUNDED]: [],
    };

    if (!allowedTransitions[prevStatus]?.includes(status)) {
      throw new BadRequestException(
        `Cannot transition order from "${prevStatus}" to "${status}"`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const em = queryRunner.manager;

      await em.update(Order, id, { status });

      switch (status) {
        case OrderStatus.SHIPPED:
          await this.fulfillOrderStock(order, em);
          break;
        case OrderStatus.CANCELLED:
          await this.releaseOrderStock(order, em);
          break;
        case OrderStatus.REFUNDED:
          await this.refundOrderStock(order, em);
          break;
      }

      await queryRunner.commitTransaction();

      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ─── Fulfill: SHIPPED — deduct physical stock, mark reservations FULFILLED ──
  private async fulfillOrderStock(order: Order, em: any): Promise<void> {
    // Query all CONFIRMED reservations for this order at once.
    // This avoids per-item product/variant lookups and handles edge cases
    // where the same inventory record is referenced by multiple line items.
    const reservations = await em.find(StockReservation, {
      where: { order_id: order.id, status: ReservationStatus.CONFIRMED },
    });

    for (const reservation of reservations) {
      const lockedInv = await em.findOne(Inventory, {
        where: { id: reservation.inventory_id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!lockedInv) continue;

      const newQtyOnHand = lockedInv.qty_on_hand - reservation.quantity;
      if (newQtyOnHand < 0) {
        throw new BadRequestException(
          `Physical stock insufficient for fulfillment (inventory ${lockedInv.id}). ` +
            `On hand: ${lockedInv.qty_on_hand}, Reserved: ${reservation.quantity}`,
        );
      }

      // Best-effort: match to an order item for sale price recording
      const matchingItem = order.items.find(
        (i) =>
          i.productId === lockedInv.product_id &&
          (i.assignedVariantPriceId ?? null) === (lockedInv.variant_id ?? null),
      );

      await em.save(StockMovement, {
        inventory_id: lockedInv.id,
        movement_type: MovementType.SALE_OUT,
        quantity: reservation.quantity,
        qty_before: lockedInv.qty_on_hand,
        qty_after: newQtyOnHand,
        unit_cost_price: Number(lockedInv.avg_cost_price),
        unit_sale_price: matchingItem ? Number(matchingItem.salePrice) : null,
        reference_id: order.id,
        reference_type: 'order',
        performed_by: order.customer?.id ?? 'system',
        note: `Order ${order.orderNumber} shipped`,
      });

      await em.update(StockReservation, reservation.id, {
        status: ReservationStatus.FULFILLED,
      });

      await em.update(Inventory, lockedInv.id, {
        qty_on_hand: newQtyOnHand,
        qty_reserved: lockedInv.qty_reserved - reservation.quantity,
        total_cost_value: newQtyOnHand * Number(lockedInv.avg_cost_price),
      });
    }
  }

  // ─── Release: CANCELLED — restore available stock, mark reservations RELEASED ──
  private async releaseOrderStock(order: Order, em: any): Promise<void> {
    const reservations = await em.find(StockReservation, {
      where: { order_id: order.id, status: ReservationStatus.CONFIRMED },
    });

    for (const reservation of reservations) {
      const lockedInv = await em.findOne(Inventory, {
        where: { id: reservation.inventory_id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!lockedInv) continue;

      await em.update(StockReservation, reservation.id, {
        status: ReservationStatus.RELEASED,
      });

      await em.update(Inventory, lockedInv.id, {
        qty_reserved: lockedInv.qty_reserved - reservation.quantity,
        qty_available: lockedInv.qty_available + reservation.quantity,
      });
    }
  }

  // ─── Refund: REFUNDED — return physical stock, log RETURN_IN movement ──
  private async refundOrderStock(order: Order, em: any): Promise<void> {
    // By the time we refund, the order went SHIPPED→DELIVERED→REFUNDED,
    // so reservations are already FULFILLED and qty_on_hand was decremented at SHIPPED.
    const reservations = await em.find(StockReservation, {
      where: { order_id: order.id, status: ReservationStatus.FULFILLED },
    });

    for (const reservation of reservations) {
      const lockedInv = await em.findOne(Inventory, {
        where: { id: reservation.inventory_id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!lockedInv) continue;

      const newQtyOnHand = lockedInv.qty_on_hand + reservation.quantity;

      const matchingItem = order.items.find(
        (i) =>
          i.productId === lockedInv.product_id &&
          (i.assignedVariantPriceId ?? null) === (lockedInv.variant_id ?? null),
      );

      await em.save(StockMovement, {
        inventory_id: lockedInv.id,
        movement_type: MovementType.RETURN_IN,
        quantity: reservation.quantity,
        qty_before: lockedInv.qty_on_hand,
        qty_after: newQtyOnHand,
        unit_cost_price: Number(lockedInv.avg_cost_price),
        unit_sale_price: matchingItem ? Number(matchingItem.salePrice) : null,
        reference_id: order.id,
        reference_type: 'order',
        performed_by: order.customer?.id ?? 'system',
        note: `Order ${order.orderNumber} refunded`,
      });

      await em.update(Inventory, lockedInv.id, {
        qty_on_hand: newQtyOnHand,
        qty_available: lockedInv.qty_available + reservation.quantity,
        total_cost_value: newQtyOnHand * Number(lockedInv.avg_cost_price),
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // CANCEL
  // ─────────────────────────────────────────────────────────────────
  async cancel(id: string): Promise<Order> {
    return this.updateStatus(id, OrderStatus.CANCELLED);
  }

  // ─────────────────────────────────────────────────────────────────
  // READ
  // ─────────────────────────────────────────────────────────────────
  async findAll(query: {
    search?: string;
    page?: number;
    limit?: number;
    createdById?: string;
    status?: OrderStatus;
    from?: string;
    to?: string;
  }) {
    const {
      search = '',
      page = 1,
      limit = 10,
      createdById,
      status,
      from,
      to,
    } = query;

    const qb = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('order.address', 'address')
      .leftJoinAndSelect('order.orderSource', 'orderSource')
      .leftJoinAndSelect('order.createdBy', 'createdBy')
      .orderBy('order.createdAt', 'DESC');

    const conditions: string[] = [];
    const params: Record<string, any> = {};

    if (search) {
      conditions.push(
        '(order.orderNumber ILIKE :search OR customer.phone ILIKE :search OR customer.name ILIKE :search)',
      );
      params.search = `%${search}%`;
    }

    if (createdById) {
      conditions.push('order.created_by_id = :createdById');
      params.createdById = createdById;
    }

    if (status) {
      conditions.push('order.status = :status');
      params.status = status;
    }

    if (from) {
      conditions.push('order.createdAt >= :from');
      params.from = new Date(from);
    }

    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      conditions.push('order.createdAt <= :to');
      params.to = toDate;
    }

    if (conditions.length) {
      qb.where(conditions.join(' AND '), params);
    }

    const totalItems = await qb.getCount();
    const data = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data,
      meta: { totalItems, totalPages: Math.ceil(totalItems / limit) },
    };
  }

  async findByUserId(userId: string): Promise<Order[]> {
    console.log('Finding orders for user ID:', userId);
    return this.orderRepo.find({
      where: { customerId: userId },
      relations: ['items', 'address'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['customer', 'items', 'address', 'orderSource', 'createdBy'],
    });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }

  async findByOrderNumber(orderNumber: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { orderNumber },
      relations: ['customer', 'items', 'address'],
    });
    if (!order) throw new NotFoundException(`Order ${orderNumber} not found`);
    return order;
  }

  private publicOrderShape(order: Order): Partial<Order> {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      subTotal: order.subTotal,
      discount: order.discount,
      couponDiscount: order.couponDiscount,
      couponCode: order.couponCode,
      deliveryCharge: order.deliveryCharge,
      totalPrice: order.totalPrice,
      deliveryMethodName: order.deliveryMethodName,
      orderNote: order.orderNote,
      createdAt: order.createdAt,
      items: order.items,
      address: order.address,
    };
  }

  async findByOrderNumberPublic(orderNumber: string): Promise<Partial<Order>> {
    const order = await this.orderRepo.findOne({
      where: { orderNumber },
      relations: ['items', 'address'],
    });
    if (!order) throw new NotFoundException(`Order not found`);
    return this.publicOrderShape(order);
  }

  async findByOrderNumberPublic_ById(id: string): Promise<Partial<Order>> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['items', 'address'],
    });
    if (!order) throw new NotFoundException(`Order not found`);
    return this.publicOrderShape(order);
  }

  async findByPhone(phone: string): Promise<Order[]> {
    const user = await this.userRepo.findOne({ where: { phone } });
    if (!user) return [];
    return this.orderRepo.find({
      where: { customer: { id: user.id } },
      relations: ['items', 'address'],
      order: { createdAt: 'DESC' },
    });
  }

  async updatePaymentStatus(
    id: string,
    paymentStatus: PaymentStatus,
  ): Promise<Order> {
    const order = await this.findOne(id);
    order.paymentStatus = paymentStatus;
    return this.orderRepo.save(order);
  }
}
