import { Body, Controller, Get, Post, Query, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/shared/enums/user-role.enum';
import { SendMessageDto } from '../dto/send-message.dto';
import { MessagingService } from '../services/messaging.service';

@ApiTags('Messaging')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@Controller('messaging')
export class MessagingController {
  constructor(private readonly service: MessagingService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send a custom message to customers' })
  send(@Body() dto: SendMessageDto, @Request() req: any) {
    return this.service.send(dto, req.user?.sub);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get message send history' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async history(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const [data, total] = await this.service.getLogs(+page, +limit);
    return { data, total, page: +page, limit: +limit };
  }
}
