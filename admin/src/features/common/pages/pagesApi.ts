import { baseApi } from '../../../redux/api/baseApi';

export const pagesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllPages: build.query({
      query: () => ({ url: '/pages', method: 'GET' }),
      providesTags: ['Pages'],
    }),
    getPageById: build.query({
      query: (id: string) => ({ url: `/pages/${id}`, method: 'GET' }),
      providesTags: ['Pages'],
    }),
    createPage: build.mutation({
      query: (body) => ({ url: '/pages', method: 'POST', data: body }),
      invalidatesTags: ['Pages'],
    }),
    updatePage: build.mutation({
      query: ({ id, ...body }) => ({ url: `/pages/${id}`, method: 'PATCH', data: body }),
      invalidatesTags: ['Pages'],
    }),
    deletePage: build.mutation({
      query: (id: string) => ({ url: `/pages/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Pages'],
    }),
  }),
});

export const {
  useGetAllPagesQuery,
  useGetPageByIdQuery,
  useCreatePageMutation,
  useUpdatePageMutation,
  useDeletePageMutation,
} = pagesApi;
