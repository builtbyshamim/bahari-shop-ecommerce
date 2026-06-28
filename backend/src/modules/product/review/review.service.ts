// review.service.ts
import {
  Injectable, NotFoundException,
  BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReviewDto } from './dto/create-review.dto';
import { QueryReviewDto } from './dto/query-review.dto';
import {  Review, ReviewStatus } from './entities/review.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
  ) {}

  // ── User: review দেওয়া ────────────────────────────────────────
  async create(userId: string, dto: CreateReviewDto) {
    const existing = await this.reviewRepo.findOne({
      where: { user_id: userId, product_id: dto.product_id },
    });
    if (existing) {
      throw new BadRequestException('You have already reviewed this product');
    }

    const review = this.reviewRepo.create({
      user_id: userId,
      product_id: dto.product_id,
      rating: dto.rating,
      comment: dto.comment,
      status: ReviewStatus.PENDING,
    });

    return this.reviewRepo.save(review);
  }

  // ── Public: approved review গুলো দেখা ─────────────────────────
  async getApprovedByProduct(productId: string) {
    const [reviews, total] = await this.reviewRepo.findAndCount({
      where: { product_id: productId, status: ReviewStatus.APPROVED },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });

    // Rating summary
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;

    reviews.forEach((r) => {
      ratingCounts[r.rating] = (ratingCounts[r.rating] || 0) + 1;
      totalRating += r.rating;
    });

    const avgRating = total > 0 ? +(totalRating / total).toFixed(1) : 0;

    return {
      summary: { avgRating, totalReviews: total, ratingCounts },
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        helpful_count: r.helpful_count,
        created_at: r.created_at,
        user: { name: r.user?.name, id: r.user?.id },
      })),
    };
  }

  // ── Helpful vote ───────────────────────────────────────────────
  async markHelpful(reviewId: string) {
    await this.reviewRepo.increment({ id: reviewId }, 'helpful_count', 1);
    return { message: 'Marked as helpful' };
  }

  // ── User: নিজের review দেখা ────────────────────────────────────
  async getMyReview(userId: string, productId: string) {
    return this.reviewRepo.findOne({
      where: { user_id: userId, product_id: productId },
    });
  }

  // ── Admin: সব review (pending filter সহ) ──────────────────────
  async findAll(query: QueryReviewDto) {
    const { status, page = 1, limit = 10 } = query;
    const where: any = {};
    if (status) where.status = status;

    const [data, total] = await this.reviewRepo.findAndCount({
      where,
      relations: ['user', 'product'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: data.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        status: r.status,
        helpful_count: r.helpful_count,
        created_at: r.created_at,
        user: { id: r.user?.id, name: r.user?.name },
        product: { id: r.product?.id, name: r.product?.name },
      })),
      meta: { totalItems: total, totalPages: Math.ceil(total / limit), page, limit },
    };
  }

  // ── Admin: approve / reject ────────────────────────────────────
  async updateStatus(reviewId: string, status: ReviewStatus) {
    const review = await this.reviewRepo.findOne({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Review not found');
    await this.reviewRepo.update(reviewId, { status });
    return { message: `Review ${status}` };
  }

  // ── Admin: delete ──────────────────────────────────────────────
  async remove(reviewId: string) {
    const review = await this.reviewRepo.findOne({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Review not found');
    await this.reviewRepo.remove(review);
    return { message: 'Review deleted' };
  }
}