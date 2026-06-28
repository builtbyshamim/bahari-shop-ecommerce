import { baseApi } from '../../redux/api/baseApi';
import { tagTypes } from '../../redux/tag-types';

const URL = '/blogs';

export const blogApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllBlogs: build.query({
      query: (params?: {
        search?: string;
        blogCategoryId?: string;
        page?: number;
        limit?: number;
      }) => ({
        url: URL,
        method: 'GET',
        params,
      }),
      providesTags: [tagTypes.blog],
    }),

    getBlogById: build.query({
      query: (id: string) => ({ url: `${URL}/${id}`, method: 'GET' }),
      providesTags: [tagTypes.blog],
    }),

    createBlog: build.mutation({
      query: (formData: FormData) => ({
        url: URL,
        method: 'POST',
        data: formData,
        contentType: 'multipart/form-data',
      }),
      invalidatesTags: [tagTypes.blog],
    }),

    updateBlog: build.mutation({
      query: ({ id, data }: { id: string; data: FormData }) => ({
        url: `${URL}/${id}`,
        method: 'PATCH',
        data,
        contentType: 'multipart/form-data',
      }),
      invalidatesTags: [tagTypes.blog],
    }),

    deleteBlog: build.mutation({
      query: (id: string) => ({ url: `${URL}/${id}`, method: 'DELETE' }),
      invalidatesTags: [tagTypes.blog],
    }),
  }),
});

export const {
  useGetAllBlogsQuery,
  useGetBlogByIdQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
} = blogApi;
