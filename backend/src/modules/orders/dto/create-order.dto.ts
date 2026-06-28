import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';
import { PaymentMethod } from '../entities/order.entity';
import { Optional } from '@nestjs/common';

// ─── Cart Item ────────────────────────────────────────────────────────────────
export class OrderItemDto {
  @IsUUID()
  @IsNotEmpty()
  product_id: string;

  @IsOptional()
  @IsString()
  assigned_variant_price_id?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsNumber()
  @Min(0)
  sale_price: number;

  @IsNumber()
  @Min(0)
  without_discount_price: number;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsObject()
  selected_variant_options?: Record<string, string>;
  // e.g. { "Color": "Maroon", "Size": "S" }
}

// ─── Customer Info ────────────────────────────────────────────────────────────
export class CustomerDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^01[3-9]\d{8}$/, { message: 'Enter a valid BD mobile number' })
  phone: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsString()
  @IsNotEmpty()
  address: string;
}

// ─── Main DTO ─────────────────────────────────────────────────────────────────
export class CreateOrderDto {
  // ── Customer ──────────────────────────────────────────────────────────────
  @ValidateNested()
  @Type(() => CustomerDto)
  customer: CustomerDto;

  // ── Cart items ────────────────────────────────────────────────────────────
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  // ── Pricing (calculated on frontend, verified on backend) ─────────────────
  @IsNumber()
  @Min(0)
  subTotal: number;

  @IsNumber()
  @Optional()
  @Min(0)
  discount: number;

  @IsNumber()
  @Optional()
  @Min(0)
  couponDiscount: number;

  @IsNumber()
  @Optional()
  @Min(0)
  deliveryCharge: number;

  @IsNumber()
  @Min(0)
  totalPrice: number;

  // ── Delivery ──────────────────────────────────────────────────────────────
  @IsOptional()
  @Optional()
  @IsString()
  deliveryMethodId?: string;

  @IsOptional()
  @Optional()
  @IsString()
  deliveryMethodName?: string;

  // ── Coupon ────────────────────────────────────────────────────────────────
  @IsOptional()
  @IsString()
  couponCode?: string;

  // ── Payment ───────────────────────────────────────────────────────────────
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  // ── Note ──────────────────────────────────────────────────────────────────
  @IsOptional()
  @IsString()
  orderNote?: string;

  // ── Order Source ──────────────────────────────────────────────────────────
  @IsOptional()
  @IsUUID()
  orderSourceId?: string;

  // ── Marketing / UTM tracking ──────────────────────────────────────────────
  @IsOptional()
  @IsString()
  utmSource?: string;

  @IsOptional()
  @IsString()
  utmMedium?: string;

  @IsOptional()
  @IsString()
  utmCampaign?: string;

  @IsOptional()
  @IsString()
  utmContent?: string;

  @IsOptional()
  @IsString()
  utmTerm?: string;

  @IsOptional()
  @IsString()
  clickId?: string;

  @IsOptional()
  @IsString()
  fbp?: string;

  @IsOptional()
  @IsString()
  fbc?: string;
}
