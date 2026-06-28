// dto/reorder-category.dto.ts
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsUUID, ValidateNested } from 'class-validator';

class ReorderItemDto {
  @IsUUID()
  id: string;

  @IsNumber()
  position: number;
}

export class ReorderCategoryDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  items: ReorderItemDto[];
}