import { baseApi } from '../baseApi';

export const pagesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPageBySlug: build.query<any, string>({
      query: (slug) => ({
        url: `/pages/public/${slug}`,
        method: 'GET',
      }),
    }),
  }),
});

export const { useGetPageBySlugQuery } = pagesApi;
