import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
    IsDateString,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    Min,
} from "class-validator";
import { DealType, DiscountType } from "../entities/deal.entity";

export class CreateDealDto {

    @ApiProperty({ example: 'uuid', description: 'Product ID' })
    @IsUUID()
    productId: string;

    @ApiProperty({ enum: DealType, example: DealType.FLASH })
    @IsEnum(DealType)
    type: DealType;

    @ApiProperty({ enum: DiscountType, example: DiscountType.PERCENT })
    @IsEnum(DiscountType)
    discountType: DiscountType;

    @ApiProperty({ example: 10, description: 'Discount value (percent or fixed amount)' })
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    discountValue: number;

    @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
    @IsDateString()
    startAt: string;

    @ApiProperty({ example: '2024-12-31T23:59:59.000Z' })
    @IsDateString()
    endAt: string;

    @ApiPropertyOptional({ example: 1, description: 'Higher number = higher priority' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    priority?: number;

    @ApiPropertyOptional({ example: true, default: true })
    @IsOptional()
    @IsString()
    isActive?: string;
}