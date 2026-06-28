import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SubscribersService } from './subscribers.service';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { PublicRoute } from 'src/common/decorators/public.decorator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

@ApiTags('Subscribers')
@Controller('subscribers')
export class SubscribersController {
  constructor(private readonly service: SubscribersService) {}

  @Post()
  @PublicRoute()
  @ApiOperation({ summary: 'Subscribe (public)' })
  subscribe(@Body() dto: CreateSubscriberDto) {
    return this.service.create(dto, 'website');
  }

  @Post('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add subscriber manually (admin)' })
  adminCreate(@Body() dto: CreateSubscriberDto) {
    return this.service.create(dto, 'admin');
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all subscribers (admin)' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Patch(':id/toggle')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle active status (admin)' })
  toggle(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.toggleActive(id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete subscriber (admin)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
