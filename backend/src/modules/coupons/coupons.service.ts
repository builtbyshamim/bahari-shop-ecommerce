import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon, CouponDiscountType } from './entities/coupon.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { UserEntity } from '../users/entities/user.entity';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepo: Repository<Coupon>,
  ) {}

  async create(dto: CreateCouponDto, user: UserEntity): Promise<Coupon> {
    const existing = await this.couponRepo.findOne({
      where: { code: dto.code.toUpperCase() },
    });
    if (existing) {
      throw new BadRequestException(`Coupon code "${dto.code}" already exists`);
    }

    const coupon = this.couponRepo.create({
      ...dto,
      code: dto.code.toUpperCase(),
      isActive: dto.isActive ?? true,
      createdBy: user.id,
    });
    return this.couponRepo.save(coupon);
  }

  async findAll(query: { search?: string; page?: number; limit?: number }) {
    const { search = '', page = 1, limit = 10 } = query;
    const qb = this.couponRepo
      .createQueryBuilder('coupon')
      .orderBy('coupon.createdAt', 'DESC');

    if (search) {
      qb.where(
        '(coupon.code ILIKE :search OR coupon.description ILIKE :search)',
        { search: `%${search}%` },
      );
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

  async findOne(id: string): Promise<Coupon> {
    const coupon = await this.couponRepo.findOne({ where: { id } });
    if (!coupon) throw new NotFoundException(`Coupon not found`);
    return coupon;
  }

  async update(id: string, dto: UpdateCouponDto): Promise<Coupon> {
    const coupon = await this.findOne(id);

    if (dto.code && dto.code.toUpperCase() !== coupon.code) {
      const existing = await this.couponRepo.findOne({
        where: { code: dto.code.toUpperCase() },
      });
      if (existing) {
        throw new BadRequestException(
          `Coupon code "${dto.code}" already exists`,
        );
      }
      dto.code = dto.code.toUpperCase();
    }

    Object.assign(coupon, dto);
    return this.couponRepo.save(coupon);
  }

  async remove(id: string): Promise<void> {
    const coupon = await this.findOne(id);
    await this.couponRepo.remove(coupon);
  }

  // ── Used by the validate endpoint & order service ──────────────────
  async validate(
    code: string,
    cartTotal: number,
  ): Promise<{ discount: number; coupon: Coupon }> {
    const coupon = await this.couponRepo.findOne({
      where: { code: code.toUpperCase(), isActive: true },
    });

    if (!coupon) {
      throw new BadRequestException('Invalid or inactive coupon code');
    }

    const now = new Date();

    if (coupon.validFrom && new Date(coupon.validFrom) > now) {
      throw new BadRequestException('Coupon is not valid yet');
    }

    if (coupon.validUntil && new Date(coupon.validUntil) < now) {
      throw new BadRequestException('Coupon has expired');
    }

    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      throw new BadRequestException('Coupon usage limit has been reached');
    }

    if (coupon.minPurchase !== null && cartTotal < Number(coupon.minPurchase)) {
      throw new BadRequestException(
        `Minimum purchase of ৳${coupon.minPurchase} required for this coupon`,
      );
    }

    let discount = 0;
    if (coupon.discountType === CouponDiscountType.PERCENT) {
      discount = (cartTotal * Number(coupon.discountValue)) / 100;
    } else {
      discount = Number(coupon.discountValue);
    }

    // Discount cannot exceed cart total
    discount = Math.min(discount, cartTotal);

    return { discount: Math.round(discount * 100) / 100, coupon };
  }

  // ── Called by OrdersService after successful order creation ────────
  async incrementUsage(couponCode: string): Promise<void> {
    await this.couponRepo
      .createQueryBuilder()
      .update(Coupon)
      .set({ usedCount: () => '"usedCount" + 1' })
      .where('code = :code', { code: couponCode.toUpperCase() })
      .execute();
  }
}
