import { baseApi } from '../baseApi';

export const dealApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDealByProductId: build.query<any, string>({
      query: (productId) => ({
        url: `/deals/product/${productId}`,
        method: 'GET',
      }),
    }),
  }),
});

export const { useGetDealByProductIdQuery } = dealApi;
