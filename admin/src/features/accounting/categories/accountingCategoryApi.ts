import { baseApi } from '../../../redux/api/baseApi';
import { tagTypes } from '../../../redux/tag-types';

const COMMON_URL = '/accounting-categories';

export const accountingCategoryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // ✅ GET ALL
    getAllAccountingCategories: build.query({
      query: (params) => ({
        url: COMMON_URL,
        method: 'GET',
        params,
      }),
      providesTags: [tagTypes.accountingCategory],
    }),

    // ✅ GET SINGLE
    getSingleAccountingCategory: build.query({
      query: (id: string) => ({
        url: `${COMMON_URL}/${id}`,
        method: 'GET',
      }),
      providesTags: [tagTypes.accountingCategory],
    }),

    // ✅ CREATE
    createAccountingCategory: build.mutation({
      query: (data) => ({
        url: COMMON_URL,
        method: 'POST',
        data,
      }),
      invalidatesTags: [tagTypes.accountingCategory],
    }),

    // ✅ UPDATE
    updateAccountingCategory: build.mutation({
      query: ({ id, data }: { id: string; data: any }) => ({
        url: `${COMMON_URL}/${id}`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: [tagTypes.accountingCategory],
    }),

    // ✅ DELETE
    deleteAccountingCategory: build.mutation({
      query: (id: string) => ({
        url: `${COMMON_URL}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [tagTypes.accountingCategory],
    }),
  }),
});

export const {
  useGetAllAccountingCategoriesQuery,
  useGetSingleAccountingCategoryQuery,
  useCreateAccountingCategoryMutation,
  useUpdateAccountingCategoryMutation,
  useDeleteAccountingCategoryMutation,
} = accountingCategoryApi;
