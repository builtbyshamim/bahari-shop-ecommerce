
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class GetProductsViewDto extends PaginationQueryDto {

    @ApiPropertyOptional({ example: 'cat-uuid-here' })
    @IsOptional()
    @Transform(({ value }) => value === '' ? null : value)
    @IsString()
    categoryId?: string;

    @ApiPropertyOptional({ example: 'brand-uuid-here' })
    @IsOptional()
    @Transform(({ value }) => value === '' ? null : value)
    @IsString()
    brandId?: string;
}