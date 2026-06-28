import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccountService } from './account.service';
import { CreateAccountDto, UpdateAccountDto } from './dto/create-account.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@ApiTags('Accounts')
@ApiBearerAuth()
@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  async create(@Body() dto: CreateAccountDto, @CurrentUser() user: any) {
    const data = await this.accountService.create(dto, user);
    return { success: true, message: 'Account created successfully', data };
  }

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const data = await this.accountService.findAll({ search, page, limit });
    return { success: true, data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.accountService.findOne(id);
    return { success: true, data };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateAccountDto) {
    const data = await this.accountService.update(id, dto);
    return { success: true, message: 'Account updated successfully', data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.accountService.remove(id);
    return { success: true, ...data };
  }
}