import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/shared/enums/user-role.enum';
import { FraudCheckService } from './fraud-check.service';

@ApiTags('Courier - Fraud Check')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@Controller('courier/fraud-check')
export class FraudCheckController {
  constructor(private readonly service: FraudCheckService) {}

  @Get()
  @ApiOperation({ summary: 'Check phone number fraud status via BD courier services' })
  @ApiQuery({ name: 'phone', required: true, description: 'Bangladeshi phone number (e.g. 01XXXXXXXXX)' })
  async check(@Query('phone') phone: string) {
    if (!phone?.trim()) throw new BadRequestException('Phone number is required');
    const clean = phone.trim().replace(/[^0-9+]/g, '');
    if (clean.length < 10) throw new BadRequestException('Invalid phone number');
    return this.service.checkPhone(clean);
  }
}
