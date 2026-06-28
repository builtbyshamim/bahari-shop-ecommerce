import { baseApi } from "../baseApi";

export const reviewApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProductReviews: build.query({
      query: (productId: string) => ({ url: `/reviews/product/${productId}`, method: 'GET' }),
      providesTags: ['Review'],
    }),
    getMyReview: build.query({
      query: (productId: string) => ({ url: `/reviews/my/${productId}`, method: 'GET' }),
      providesTags: ['Review'],
    }),
    submitReview: build.mutation({
      query: (data) => ({ url: '/reviews', method: 'POST', data }),
      invalidatesTags: ['Review'],
    }),
    markHelpful: build.mutation({
      query: (id: string) => ({ url: `/reviews/${id}/helpful`, method: 'PATCH' }),
      invalidatesTags: ['Review'],
    }),
    // Admin
    getAllReviews: build.query({
      query: (params) => ({ url: '/reviews/admin/all', method: 'GET', params }),
      providesTags: ['Review'],
    }),
    updateReviewStatus: build.mutation({
      query: ({ id, status }: { id: string; status: string }) => ({
        url: `/reviews/admin/${id}/status`,
        method: 'PATCH',
        data: { status },
      }),
      invalidatesTags: ['Review'],
    }),
    deleteReview: build.mutation({
      query: (id: string) => ({ url: `/reviews/admin/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Review'],
    }),
  }),
});

export const {
  useGetProductReviewsQuery,
  useGetMyReviewQuery,
  useSubmitReviewMutation,
  useMarkHelpfulMutation,
  useGetAllReviewsQuery,
  useUpdateReviewStatusMutation,
  useDeleteReviewMutation,
} = reviewApi;
