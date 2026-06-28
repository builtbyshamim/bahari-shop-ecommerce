import { baseApi } from '../baseApi';

export const couponApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    validateCoupon: build.mutation({
      query: (data) => ({
        url: '/coupons/validate',
        method: 'POST',
        data,
      }),
    }),
  }),
});

export const { useValidateCouponMutation } = couponApi;
