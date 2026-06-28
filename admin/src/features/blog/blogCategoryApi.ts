import { baseApi } from '../../redux/api/baseApi';
import { tagTypes } from '../../redux/tag-types';

const URL = '/blog-categories';

export const blogCategoryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllBlogCategories: build.query({
      query: (params?: { search?: string; page?: number; limit?: number }) => ({
        url: URL,
        method: 'GET',
        params,
      }),
      providesTags: [tagTypes.blogCategory],
    }),

    getBlogCategoryById: build.query({
      query: (id: string) => ({ url: `${URL}/${id}`, method: 'GET' }),
      providesTags: [tagTypes.blogCategory],
    }),

    createBlogCategory: build.mutation({
      query: (body) => ({ url: URL, method: 'POST', data: body }),
      invalidatesTags: [tagTypes.blogCategory],
    }),

    updateBlogCategory: build.mutation({
      query: ({ id, ...body }) => ({ url: `${URL}/${id}`, method: 'PATCH', data: body }),
      invalidatesTags: [tagTypes.blogCategory],
    }),

    deleteBlogCategory: build.mutation({
      query: (id: string) => ({ url: `${URL}/${id}`, method: 'DELETE' }),
      invalidatesTags: [tagTypes.blogCategory],
    }),
  }),
});

export const {
  useGetAllBlogCategoriesQuery,
  useGetBlogCategoryByIdQuery,
  useCreateBlogCategoryMutation,
  useUpdateBlogCategoryMutation,
  useDeleteBlogCategoryMutation,
} = blogCategoryApi;
