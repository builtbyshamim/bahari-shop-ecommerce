import { PartialType } from '@nestjs/swagger';
import { CreateTopRankingDto } from './create-top-ranking.dto';

export class UpdateTopRankingDto extends PartialType(CreateTopRankingDto) {}
