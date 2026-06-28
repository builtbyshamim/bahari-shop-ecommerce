import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
export class AssignCourierBaseDto {
  @IsString()
  @IsNotEmpty()
  order_id: string;

  @IsInt()
  courier_service_token_id: number;

  // pre-filled from order.address but editable
  @IsString()
  @IsNotEmpty()
  recipient_name: string;

  @IsString()
  @IsNotEmpty()
  recipient_phone: string;

  @IsString()
  @IsNotEmpty()
  recipient_address: string;

  @IsOptional()
  @IsString()
  recipient_email?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  cod_amount: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  item_description?: string;
}

// ── Steadfast ──────────────────────────────────────────────────────────────

export class AssignSteadfastDto extends AssignCourierBaseDto {
  @IsOptional()
  @IsString()
  alternative_phone?: string;

  @IsOptional()
  @IsInt()
  delivery_type?: number; // 0 = regular

  @IsOptional()
  @IsInt()
  total_lot?: number;
}

// ── Pathao ─────────────────────────────────────────────────────────────────

export class AssignPathaoDto extends AssignCourierBaseDto {
  @IsInt()
  store_id: number;

  @IsOptional()
  @IsInt()
  delivery_type?: number; // 48 = next day

  @IsOptional()
  @IsInt()
  item_type?: number; // 2 = parcel

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  item_weight?: number;

  @IsOptional()
  @IsInt()
  item_quantity?: number;

  @IsOptional()
  @IsString()
  special_instruction?: string;
}