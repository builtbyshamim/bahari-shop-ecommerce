// dto/query-review.dto.ts
import { IsEnum, IsOptional, IsInt, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ReviewStatus } from '../entities/review.entity';

export class QueryReviewDto {
    @IsOptional()
    @IsEnum(ReviewStatus)
    status?: ReviewStatus;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    page?: number = 1;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    limit?: number = 10;
}