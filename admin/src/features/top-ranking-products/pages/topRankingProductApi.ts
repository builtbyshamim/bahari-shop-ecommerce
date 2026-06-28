import { baseApi } from "../../../redux/api/baseApi";
import { tagTypes } from "../../../redux/tag-types";

const COMMON_URL = "/top-rankings";

export const topRankingApi = baseApi.injectEndpoints({
  endpoints: (build) => ({

    // ✅ GET ALL
    getAllTopRankings: build.query({
      query: (params) => ({
        url: COMMON_URL,
        method: "GET",
        params,
      }),
      providesTags:[tagTypes.topRanking],
    }),

    // ✅ GET SINGLE
    getSingleTopRanking: build.query({
      query: (id: string) => ({
        url: `${COMMON_URL}/${id}`,
        method: "GET",
      }),
      providesTags:  [tagTypes.topRanking],
    }),

    // ✅ GET PRODUCTS BY TYPE (Public API)
    getRankingProductsByType: build.query({
      query: (type: string) => ({
        url: `${COMMON_URL}/products/${type}`,
        method: "GET",
      }),
      providesTags: [tagTypes.topRanking],
    }),

    // ✅ CREATE
    createTopRanking: build.mutation({
      query: (data) => ({
        url: COMMON_URL,
        method: "POST",
        data,
      }),
      invalidatesTags: [tagTypes.topRanking],
    }),

    // ✅ UPDATE
    updateTopRanking: build.mutation({
      query: ({ id, data }) => ({
        url: `${COMMON_URL}/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags:[tagTypes.topRanking],
    }),

    // ✅ DELETE
    deleteTopRanking: build.mutation({
      query: (id: string) => ({
        url: `${COMMON_URL}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.topRanking],
    }),

  }),
});

export const {
  useGetAllTopRankingsQuery,
  useGetSingleTopRankingQuery,
  useGetRankingProductsByTypeQuery,
  useCreateTopRankingMutation,
  useUpdateTopRankingMutation,
  useDeleteTopRankingMutation,
} = topRankingApi;