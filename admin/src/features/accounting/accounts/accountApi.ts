import { baseApi } from '../../../redux/api/baseApi';
import { tagTypes } from '../../../redux/tag-types';
const COMMON_URL = '/accounts';
export const accountApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // ✅ GET ALL
    getAllAccounts: build.query({
      query: (params) => ({
        url: COMMON_URL,
        method: 'GET',
        params,
      }),
      providesTags: [tagTypes.account],
    }),

    // ✅ GET SINGLE
    getSingleAccount: build.query({
      query: (id: string) => ({
        url: `${COMMON_URL}/${id}`,
        method: 'GET',
      }),
      providesTags: [tagTypes.account],
    }),

    // ✅ CREATE
    createAccount: build.mutation({
      query: (data) => ({
        url: COMMON_URL,
        method: 'POST',
        data,
      }),
      invalidatesTags: [tagTypes.account],
    }),

    // ✅ UPDATE
    updateAccount: build.mutation({
      query: ({ id, data }: { id: string; data: any }) => ({
        url: `${COMMON_URL}/${id}`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: [tagTypes.account],
    }),

    // ✅ DELETE
    deleteAccount: build.mutation({
      query: (id: string) => ({
        url: `${COMMON_URL}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [tagTypes.account],
    }),
  }),
});

export const {
  useGetAllAccountsQuery,
  useGetSingleAccountQuery,
  useCreateAccountMutation,
  useUpdateAccountMutation,
  useDeleteAccountMutation,
} = accountApi;
