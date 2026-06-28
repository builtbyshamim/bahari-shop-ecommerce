import { baseApi } from '../../../redux/api/baseApi';
import { tagTypes } from '../../../redux/tag-types';

export const reviewApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllReviews: build.query({
      query: (params) => ({ url: '/reviews/admin/all', method: 'GET', params }),
      providesTags: [tagTypes.review],
    }),
    updateReviewStatus: build.mutation({
      query: ({ id, status }: { id: string; status: string }) => ({
        url: `/reviews/admin/${id}/status`,
        method: 'PATCH',
        data: { status },
      }),
      invalidatesTags: [tagTypes.review],
    }),
    deleteReview: build.mutation({
      query: (id: string) => ({ url: `/reviews/admin/${id}`, method: 'DELETE' }),
      invalidatesTags: [tagTypes.review],
    }),
  }),
});

export const { useGetAllReviewsQuery, useUpdateReviewStatusMutation, useDeleteReviewMutation } =
  reviewApi;
