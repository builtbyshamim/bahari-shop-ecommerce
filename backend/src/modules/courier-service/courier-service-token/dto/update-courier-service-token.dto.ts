import { PartialType } from '@nestjs/swagger';
import { CreateCourierServiceTokenDto } from './create-courier-service-token.dto';

export class UpdateCourierServiceTokenDto extends PartialType(CreateCourierServiceTokenDto) {}
