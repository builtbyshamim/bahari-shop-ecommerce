import { PartialType } from '@nestjs/swagger';
import { CreateTrendingSearchDto } from './create-trending-search.dto';

export class UpdateTrendingSearchDto extends PartialType(CreateTrendingSearchDto) {}
