import { baseApi } from '../../../redux/api/baseApi';
import { tagTypes } from '../../../redux/tag-types';
const COMMON_URL = '/categories';
export const categoryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // ✅ GET ALL
    getAllCategory: build.query({
      query: (params) => ({
        url: COMMON_URL,
        method: 'GET',
        params,
      }),
      providesTags: [tagTypes.category],
    }),
    // ✅ Tree endpoint
    getCategoryTree: build.query({
      query: (params) => ({
        url: '/categories/tree',
        method: 'GET',
        params,
      }),
      providesTags: [tagTypes.category],
    }),

    // ✅ GET SINGLE
    getSingleCategory: build.query({
      query: (id: string) => ({
        url: `${COMMON_URL}/${id}`,
        method: 'GET',
      }),
      providesTags: [tagTypes.category],
    }),

    // ✅ CREATE
    createCategory: build.mutation({
      query: (formData: FormData) => ({
        url: COMMON_URL,
        method: 'POST',
        data: formData,
        contentType: 'multipart/form-data',
      }),
      invalidatesTags: [{ type: tagTypes.category, id: 'LIST' }],
    }),

    // ✅ UPDATE
    updateCategory: build.mutation({
      query: ({ id, data }: { id: string; data: FormData }) => ({
        url: `${COMMON_URL}/${id}`,
        method: 'PATCH',
        data,
        contentType: 'multipart/form-data',
      }),
      invalidatesTags: [tagTypes.category],
    }),
    reorderCategory: build.mutation({
      query: (data) => ({
        url: `${COMMON_URL}/position/reorder`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: [tagTypes.category],
    }),

    // ✅ DELETE
    deleteCategory: build.mutation({
      query: (id: string) => ({
        url: `${COMMON_URL}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [tagTypes.category],
    }),
  }),
});

export const {
  useGetAllCategoryQuery,
  useGetSingleCategoryQuery,
  useGetCategoryTreeQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useReorderCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;
