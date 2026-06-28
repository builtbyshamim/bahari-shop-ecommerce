import { baseApi } from '../../../redux/api/baseApi';
import { tagTypes } from '../../../redux/tag-types';
const COMMON_URL = '/deals';
export const dealsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // ✅ GET ALL
    getAllDeals: build.query({
      query: (params) => ({
        url: COMMON_URL,
        method: 'GET',
        params,
      }),
      providesTags: [tagTypes.product],
    }),

    // ✅ GET SINGLE
    getSingleDeal: build.query({
      query: (id: string) => ({
        url: `${COMMON_URL}/${id}`,
        method: 'GET',
      }),
      providesTags: [tagTypes.deal],
    }),

    // ✅ CREATE
    createDeal: build.mutation({
      query: (formData: FormData) => ({
        url: COMMON_URL,
        method: 'POST',
        data: formData,
      }),
      invalidatesTags: [{ type: tagTypes.deal, id: 'LIST' }],
    }),

    // ✅ UPDATE
    updateDeal: build.mutation({
      query: ({ id, data }: { id: string; data: FormData }) => ({
        url: `${COMMON_URL}/${id}`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: [tagTypes.product],
    }),

    // ✅ DELETE
    deleteDeal: build.mutation({
      query: (id: string) => ({
        url: `${COMMON_URL}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [tagTypes.product],
    }),
  }),
});

export const {
  useGetAllDealsQuery,
  useGetSingleDealQuery,
  useCreateDealMutation,
  useUpdateDealMutation,
  useDeleteDealMutation,
} = dealsApi;
