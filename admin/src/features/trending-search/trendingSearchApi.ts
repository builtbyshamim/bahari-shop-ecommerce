import { baseApi } from '../../redux/api/baseApi';
import { tagTypes } from '../../redux/tag-types';

const URL = '/trending-searches';

export const trendingSearchApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllTrendingSearches: build.query({
      query: () => ({ url: URL, method: 'GET' }),
      providesTags: [tagTypes.trendingSearch],
    }),

    createTrendingSearch: build.mutation({
      query: (data) => ({ url: URL, method: 'POST', data }),
      invalidatesTags: [tagTypes.trendingSearch],
    }),

    updateTrendingSearch: build.mutation({
      query: ({ id, data }) => ({ url: `${URL}/${id}`, method: 'PATCH', data }),
      invalidatesTags: [tagTypes.trendingSearch],
    }),

    deleteTrendingSearch: build.mutation({
      query: (id: string) => ({ url: `${URL}/${id}`, method: 'DELETE' }),
      invalidatesTags: [tagTypes.trendingSearch],
    }),
  }),
});

export const {
  useGetAllTrendingSearchesQuery,
  useCreateTrendingSearchMutation,
  useUpdateTrendingSearchMutation,
  useDeleteTrendingSearchMutation,
} = trendingSearchApi;
