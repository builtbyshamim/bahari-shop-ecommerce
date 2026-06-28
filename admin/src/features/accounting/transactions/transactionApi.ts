import { baseApi } from '../../../redux/api/baseApi';
import { tagTypes } from '../../../redux/tag-types';

const COMMON_URL = '/accounting-transactions';
const cleanParams = (params: Record<string, any>) => {
  const result: Record<string, any> = {};
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      result[key] = value;
    }
  });
  return result;
};
export const transactionApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // ✅ GET ALL (with filters)
    getAllTransactions: build.query({
      query: (params) => ({
        url: COMMON_URL,
        method: 'GET',
        params: cleanParams(params),
      }),
      providesTags: [tagTypes.transaction],
    }),

    // ✅ GET SINGLE
    getSingleTransaction: build.query({
      query: (id: string) => ({
        url: `${COMMON_URL}/${id}`,
        method: 'GET',
      }),
      providesTags: [tagTypes.transaction],
    }),

    // ✅ CREATE
    createTransaction: build.mutation({
      query: (data) => ({
        url: COMMON_URL,
        method: 'POST',
        data,
      }),
      invalidatesTags: [tagTypes.transaction, tagTypes.account],
    }),

    // ✅ UPDATE
    updateTransaction: build.mutation({
      query: ({ id, data }: { id: string; data: any }) => ({
        url: `${COMMON_URL}/${id}`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: [tagTypes.transaction, tagTypes.account],
    }),

    // ✅ DELETE
    deleteTransaction: build.mutation({
      query: (id: string) => ({
        url: `${COMMON_URL}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [tagTypes.transaction, tagTypes.account],
    }),
  }),
});

export const {
  useGetAllTransactionsQuery,
  useGetSingleTransactionQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
} = transactionApi;
