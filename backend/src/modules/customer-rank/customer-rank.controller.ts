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
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CustomerRankService } from './customer-rank.service';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';
// import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
// import { RolesGuard } from 'src/common/guards/roles.guard';
// import { Roles } from 'src/common/decorators/roles.decorator';
// import { UserRole } from 'src/common/shared/enums/user-role.enum';

@ApiTags('Customer Ranking')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard, RolesGuard)
@Controller('customer-rank')
export class CustomerRankController {
  constructor(private readonly rankService: CustomerRankService) { }

  // ── Level endpoints ────────────────────────────────────────────────────

  @Post('levels')
  // @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new customer level (Admin)' })
  createLevel(@Body() dto: CreateLevelDto) {
    return this.rankService.createLevel(dto);
  }

  @Get('levels')
  @ApiOperation({ summary: 'Get all customer levels (paginated)' })

  getAllLevels() {
    return this.rankService.getAllLevels()
  }

  @Get('levels/:id')
  @ApiOperation({ summary: 'Get a single customer level by ID' })
  getLevelById(@Param('id') id: string) {
    return this.rankService.getLevelById(id);
  }

  @Patch('levels/:id')
  // @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a customer level (Admin)' })
  updateLevel(@Param('id') id: string, @Body() dto: UpdateLevelDto) {
    return this.rankService.updateLevel(id, dto);
  }

  @Delete('levels/:id')
  // @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a customer level (Admin)' })
  deleteLevel(@Param('id') id: string) {
    return this.rankService.deleteLevel(id);
  }

  // ── Rank endpoints ─────────────────────────────────────────────────────

  @Get('user/:userId')
  @ApiOperation({ summary: "Get a specific customer's current rank" })
  getUserRank(@Param('userId') userId: string) {
    return this.rankService.getUserRank(userId);
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Top spending customers leaderboard' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'levelId', required: false })
  getLeaderboard(
    @Query('limit') limit?: string,
    @Query('page') page?: string,
    @Query('levelId') levelId?: string,
  ) {
    return this.rankService.getLeaderboard({
      limit: limit ? Number(limit) : 10,
      page: page ? Number(page) : 1,
      levelId,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Summary stats: total customers, revenue, level breakdown' })
  getRankStats() {
    return this.rankService.getRankStats();
  }

  @Post('recalculate')
  // @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Manually trigger rank recalculation for all customers (Admin)' })
  async recalculateAll() {
    const result = await this.rankService.recalculateAllRanks();
    return {
      success: true,
      message: `Rank recalculation complete. Updated: ${result.updated}, Failed: ${result.failed}`,
      ...result,
    };
  }

  @Post('recalculate/:userId')
  // @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Recalculate rank for a single customer (Admin)' })
  async recalculateForUser(@Param('userId') userId: string) {
    const rank = await this.rankService.recalculateRankForUser(userId);
    return { success: true, message: 'Rank recalculated', data: rank };
  }
}