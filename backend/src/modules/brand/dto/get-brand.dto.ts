import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { BrandStatus } from '../entities/brand.entity';

export class GetBrandDto extends PaginationQueryDto {
    @ApiPropertyOptional({
        description: 'Filter by product status',
        enum: BrandStatus,
        example: BrandStatus.ACTIVE,
    })
    @IsOptional()
    @IsEnum(BrandStatus)
    status?: BrandStatus;
}