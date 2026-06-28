import { baseApi } from '@/redux/baseApi';
import { tagTypes } from '@/redux/tag-types';

export const blogApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllBlogs: build.query({
      query: (params?: {
        search?: string;
        blogCategoryId?: string;
        page?: number;
        limit?: number;
      }) => ({
        url: '/blogs',
        method: 'GET',
        params,
      }),
      providesTags: [tagTypes.blog],
    }),

    getBlogBySlug: build.query({
      query: (slug: string) => ({
        url: `/blogs/public/${slug}`,
        method: 'GET',
      }),
      providesTags: [tagTypes.blog],
    }),

    getAllBlogCategories: build.query({
      query: () => ({
        url: '/blog-categories',
        method: 'GET',
        params: { limit: 100 },
      }),
      providesTags: [tagTypes.blogCategory],
    }),
  }),
});

export const {
  useGetAllBlogsQuery,
  useGetBlogBySlugQuery,
  useGetAllBlogCategoriesQuery,
} = blogApi;
