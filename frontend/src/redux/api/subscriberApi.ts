import { baseApi } from '../baseApi';

export const subscriberApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    subscribe: build.mutation({
      query: (data: { email: string; name?: string }) => ({
        url: '/subscribers',
        method: 'POST',
        data,
      }),
    }),
  }),
});

export const { useSubscribeMutation } = subscriberApi;
