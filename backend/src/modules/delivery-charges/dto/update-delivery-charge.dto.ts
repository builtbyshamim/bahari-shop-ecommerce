import { PartialType } from '@nestjs/swagger';
import { CreateDeliveryChargeDto } from './create-delivery-charge.dto';

export class UpdateDeliveryChargeDto extends PartialType(CreateDeliveryChargeDto) {}
