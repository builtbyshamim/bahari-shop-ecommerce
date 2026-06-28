import { baseApi } from '../../redux/api/baseApi';
import { tagTypes } from '../../redux/tag-types';

export const customerRankApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ========== LEVELS ==========
    getAllLevels: builder.query({
      query: () => ({
        url: '/customer-rank/levels',
      }),
      providesTags: [tagTypes.CustomerLevel],
    }),

    getSingleLevel: builder.query({
      query: (id: string) => `/customer-rank/levels/${id}`,
      providesTags: [tagTypes.CustomerLevel],
    }),

    createLevel: builder.mutation({
      query: (data) => ({
        url: '/customer-rank/levels',
        method: 'POST',
        data: data,
      }),
      invalidatesTags: [tagTypes.CustomerLevel],
    }),

    getRankStats: builder.query({
      query: () => ({
        url: '/customer-rank/stats',
      }),
      providesTags: [tagTypes.CustomerRank],
    }),

    updateLevel: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/customer-rank/levels/${id}`,
        method: 'PATCH',
        data: data,
      }),
      invalidatesTags: [tagTypes.CustomerLevel],
    }),

    deleteLevel: builder.mutation({
      query: (id: string) => ({
        url: `/customer-rank/levels/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [tagTypes.CustomerLevel],
    }),

    // ========== RANKS ==========
    getAllRanks: builder.query({
      query: (params) => ({
        url: '/customer-rank',
        params: params || {},
      }),
      providesTags: [tagTypes.CustomerRank],
    }),

    getSingleRank: builder.query({
      query: (id: string) => `/customer-rank/${id}`,
      providesTags: [tagTypes.CustomerRank],
    }),

    getUserRank: builder.query({
      query: (userId: string) => ({
        url: `/customer-rank/user/${userId}`,
      }),
      providesTags: [tagTypes.CustomerRank],
    }),

    getLeaderboard: builder.query({
      query: (params) => {
        const { limit = 10, page = 1, ...rest } = params || {};
        return {
          url: '/customer-rank/leaderboard',
          params: { limit, page, ...rest },
        };
      },
      providesTags: [tagTypes.CustomerRank],
    }),

    recalculateRanks: builder.mutation({
      query: (data) => ({
        url: '/customer-rank/recalculate',
        method: 'POST',
        data: data || {},
      }),
      invalidatesTags: [tagTypes.CustomerRank, tagTypes.CustomerLevel],
    }),

    // ========== ADDITIONAL USEFUL ENDPOINTS ==========
    getCustomerRankHistory: builder.query({
      query: ({ userId, params }) =>
        `/customer-rank/history/${userId}?${new URLSearchParams(params)}`,
      providesTags: [tagTypes.CustomerRank],
    }),

    updateCustomerRank: builder.mutation({
      query: ({ userId, ...data }) => ({
        url: `/customer-rank/${userId}`,
        method: 'PATCH',
        data: data,
      }),
      invalidatesTags: [tagTypes.CustomerRank],
    }),

    bulkUpdateRanks: builder.mutation({
      query: (data) => ({
        url: '/customer-rank/bulk-update',
        method: 'POST',
        data: data,
      }),
      invalidatesTags: [tagTypes.CustomerRank],
    }),
  }),
  overrideExisting: false,
});

// Export all hooks
export const {
  // Level hooks
  useGetAllLevelsQuery,
  useGetSingleLevelQuery,
  useCreateLevelMutation,
  useUpdateLevelMutation,
  useDeleteLevelMutation,

  // Rank hooks
  useGetAllRanksQuery,
  useGetSingleRankQuery,
  useGetUserRankQuery,
  useGetLeaderboardQuery,
  useRecalculateRanksMutation,

  // Additional hooks
  useGetCustomerRankHistoryQuery,
  useGetRankStatsQuery,
  useUpdateCustomerRankMutation,
  useBulkUpdateRanksMutation,
} = customerRankApi;
