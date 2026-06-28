import { baseApi } from '../baseApi';
import { tagTypes } from '../tag-types';
export const checkoutApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDeliveryCharges: build.query({
      query: () => ({
        url: `/delivery-charges/active`,
        method: 'GET',
      }),
    }),
    createOrder: build.mutation({
      query: (data) => ({
        url: `/orders`,
        method: 'POST',
        data: data,
      }),
      invalidatesTags: [tagTypes.order],
    }),
  }),
});

export const { useGetDeliveryChargesQuery, useCreateOrderMutation } = checkoutApi;
