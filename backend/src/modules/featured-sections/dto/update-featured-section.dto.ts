import { PartialType } from '@nestjs/swagger';
import { CreateFeaturedSectionDto } from './create-featured-section.dto';

export class UpdateFeaturedSectionDto extends PartialType(CreateFeaturedSectionDto) {}
