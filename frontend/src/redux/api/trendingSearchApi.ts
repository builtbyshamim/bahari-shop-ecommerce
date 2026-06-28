import { baseApi } from '../baseApi';
import { tagTypes } from '../tag-types';

export const trendingSearchApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getActiveTrendingSearches: build.query<{ id: string; name: string }[], void>({
      query: () => ({ url: '/trending-searches/active', method: 'GET' }),
      providesTags: [tagTypes.trendingSearch],
    }),
  }),
});

export const { useGetActiveTrendingSearchesQuery } = trendingSearchApi;
