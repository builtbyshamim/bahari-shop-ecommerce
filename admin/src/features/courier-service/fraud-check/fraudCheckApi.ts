import { baseApi } from '../../../redux/api/baseApi';

export const fraudCheckApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    checkFraud: build.query({
      query: (phone: string) => ({
        url: `/courier/fraud-check?phone=${encodeURIComponent(phone)}`,
        method: 'GET',
      }),
    }),
  }),
});

export const { useLazyCheckFraudQuery } = fraudCheckApi;
