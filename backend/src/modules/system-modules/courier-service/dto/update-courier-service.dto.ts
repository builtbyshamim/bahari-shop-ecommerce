import { PartialType } from '@nestjs/swagger';
import { CreateCourierServiceDto } from './create-courier-service.dto';

export class UpdateCourierServiceDto extends PartialType(CreateCourierServiceDto) {}
