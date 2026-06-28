'use client';
import { useState } from 'react';
import { Star, ThumbsUp, Loader2, Send } from 'lucide-react';
import {
  useGetProductReviewsQuery,
  useGetMyReviewQuery,
  useSubmitReviewMutation,
  useMarkHelpfulMutation,
} from '@/redux/api/reviewApi';
import { useGetProfileQuery } from '@/redux/api/userApi';

const AVATAR_FALLBACK = 'https://api.dicebear.com/7.x/initials/svg?seed=';

// ── Rating bar ───────────────────────────────────────────────────
const RatingBar = ({ star, count, total }: { star: number; count: number; total: number }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <span className="w-4 text-right">{star}</span>
      <Star size={11} className="text-amber-400 fill-amber-400 shrink-0" />
      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-right">{count}</span>
    </div>
  );
};

// ── Write review form ────────────────────────────────────────────
const WriteReview = ({ productId }: { productId: string }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [submitReview, { isLoading }] = useSubmitReviewMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return;
    try {
      await submitReview({ product_id: productId, rating, comment }).unwrap();
      setRating(0);
      setComment('');
    } catch {
      // error toast handled by global interceptor
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-50 rounded-xl p-4 border border-dashed border-gray-200 space-y-3"
    >
      <p className="text-sm font-semibold text-gray-700">Write a Review</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(i)}
          >
            <Star
              size={20}
              className={i <= (hover || rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
            />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience..."
        rows={3}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-400"
      />
      <button
        type="submit"
        disabled={isLoading || !rating}
        className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        Submit Review
      </button>
    </form>
  );
};

// ── Main tabs component ───────────────────────────────────────────
const ProductTabs = ({
  description,
  specifications,
  productId,
}: {
  description?: string;
  specifications?: string;
  productId?: string;
}) => {
  const [activeTab, setActiveTab] = useState('description');

  const { data: reviewData, isLoading: loadingReviews } = useGetProductReviewsQuery(productId!, {
    skip: !productId || activeTab !== 'reviews',
  });
  const { data: profileData } = useGetProfileQuery(undefined, { skip: activeTab !== 'reviews' });
  const { data: myReviewData } = useGetMyReviewQuery(productId!, {
    skip: !productId || !profileData?.data || activeTab !== 'reviews',
  });
  const [markHelpful] = useMarkHelpfulMutation();

  const summary = reviewData?.data?.summary;
  const reviews: any[] = reviewData?.data?.reviews || [];
  const isLoggedIn = !!profileData?.data;
  const myReview = myReviewData?.data;

  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'specifications', label: 'Specifications' },
    { id: 'reviews', label: `Reviews${summary ? ` (${summary.totalReviews})` : ''}` },
  ];

  return (
    <div>
      {/* Tab headers */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-all relative ${
              activeTab === tab.id ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-[200px]">
        {/* Description */}
        {activeTab === 'description' && (
          <div>
            {description ? (
              <div
                className="prose prose-sm max-w-none text-gray-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            ) : (
              <p className="text-gray-400 text-sm">No description available.</p>
            )}
          </div>
        )}

        {/* Specifications */}
        {activeTab === 'specifications' && (
          <div>
            {specifications ? (
              <div
                className="prose prose-sm max-w-none text-gray-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: specifications }}
              />
            ) : (
              <p className="text-gray-400 text-sm">No specifications available.</p>
            )}
          </div>
        )}

        {/* Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {/* Summary */}
            {summary && summary.totalReviews > 0 && (
              <div className="flex flex-col sm:flex-row gap-6 p-5 bg-amber-50 rounded-xl border border-amber-100">
                <div className="text-center shrink-0">
                  <p className="text-5xl font-bold text-amber-500">
                    {Number(summary.avgRating).toFixed(1)}
                  </p>
                  <div className="flex justify-center gap-0.5 mt-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i <= Math.round(summary.avgRating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-300'
                        }
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{summary.totalReviews} reviews</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <RatingBar
                      key={star}
                      star={star}
                      count={summary.ratingCounts?.[star] ?? 0}
                      total={summary.totalReviews}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Write Review */}
            {isLoggedIn ? (
              myReview ? (
                <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-700 flex items-center gap-2">
                  <Star size={15} className="text-green-500 fill-green-500" />
                  You already reviewed this product.
                  {myReview.status === 'PENDING' && (
                    <span className="ml-1 text-amber-600">(Pending approval)</span>
                  )}
                </div>
              ) : (
                <WriteReview productId={productId!} />
              )
            ) : (
              <div className="bg-gray-50 rounded-xl p-5 text-center border border-dashed border-gray-200">
                <p className="text-sm text-gray-500">
                  <a href="/login" className="text-primary-600 font-medium hover:underline">
                    Login
                  </a>{' '}
                  to write a review
                </p>
              </div>
            )}

            {/* Reviews list */}
            {loadingReviews ? (
              <div className="flex justify-center py-8">
                <Loader2 size={24} className="animate-spin text-gray-300" />
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">
                No reviews yet. Be the first!
              </p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review: any) => (
                  <div key={review.id} className="border-b border-gray-100 pb-5 last:border-0">
                    <div className="flex items-start gap-3">
                      <img
                        src={`${AVATAR_FALLBACK}${encodeURIComponent(review.user?.name || 'U')}`}
                        alt={review.user?.name}
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <p className="text-sm font-semibold text-gray-800">
                            {review.user?.name || 'Anonymous'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(review.created_at).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                        <div className="flex gap-0.5 mt-0.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              size={12}
                              className={
                                i <= review.rating
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-gray-200'
                              }
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                          {review.comment}
                        </p>
                        <button
                          onClick={() => markHelpful(review.id)}
                          className="mt-2 flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary-600 transition-colors cursor-pointer"
                        >
                          <ThumbsUp size={12} />
                          Helpful ({review.helpful_count})
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTabs;
