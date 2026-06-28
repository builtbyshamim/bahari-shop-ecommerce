// dto/create-review.dto.ts
import { IsInt, IsString, IsUUID, Max, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReviewDto {
  @IsUUID()
  product_id: string;

  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  rating: number;

  @IsString()
  @MinLength(10, { message: 'Review must be at least 10 characters' })
  comment: string;
}