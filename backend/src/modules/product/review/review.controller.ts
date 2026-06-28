// review.controller.ts
import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, Req,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { QueryReviewDto } from './dto/query-review.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/shared/enums/user-role.enum';
import { ReviewStatus } from './entities/review.entity';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { PublicRoute } from 'src/common/decorators/public.decorator';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) { }

  // User: review submit
  @Post()
  @Roles(UserRole.CUSTOMER)
  create(@CurrentUser() user: UserEntity, @Body() dto: CreateReviewDto) {
    return this.reviewService.create(user.id, dto);
  }



  @Get('product/:productId')
  @PublicRoute()
  getByProduct(@Param('productId') productId: string) {
    return this.reviewService.getApprovedByProduct(productId);
  }


  @Get('my/:productId')
  @Roles(UserRole.CUSTOMER)
  getMyReview(@CurrentUser() user: UserEntity, @Param('productId') productId: string) {
    return this.reviewService.getMyReview(user.id, productId);
  }

  // Helpful vote
  @Patch(':id/helpful')
  @PublicRoute()
  markHelpful(@Param('id') id: string) {
    return this.reviewService.markHelpful(id);
  }

  // Admin: all reviews
  @Get('admin/all')
  findAll(@Query() query: QueryReviewDto) {
    return this.reviewService.findAll(query);
  }

  // Admin: approve/reject
  @Patch('admin/:id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: ReviewStatus,
  ) {
    return this.reviewService.updateStatus(id, status);
  }

  // Admin: delete
  @Delete('admin/:id')
  remove(@Param('id') id: string) {
    return this.reviewService.remove(id);
  }
}