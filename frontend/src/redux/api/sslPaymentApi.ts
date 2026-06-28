import { baseApi } from '../baseApi';

export const sslPaymentApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    initiateSslPayment: build.mutation({
      query: (data: { orderId: string }) => ({
        url: '/ssl-payment/initiate',
        method: 'POST',
        data,
      }),
    }),
  }),
});

export const { useInitiateSslPaymentMutation } = sslPaymentApi;
