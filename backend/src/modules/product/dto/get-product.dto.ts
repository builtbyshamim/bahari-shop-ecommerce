import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { ProductStatus } from '../entities/product.entity';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class GetProductsDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by product status',
    enum: ProductStatus,
    example: ProductStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;
}