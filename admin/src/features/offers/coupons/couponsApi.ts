import { baseApi } from '../../../redux/api/baseApi';
import { tagTypes } from '../../../redux/tag-types';

const COMMON_URL = '/coupons';

export const couponsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllCoupons: build.query({
      query: (params) => ({
        url: COMMON_URL,
        method: 'GET',
        params,
      }),
      providesTags: [tagTypes.product],
    }),

    getSingleCoupon: build.query({
      query: (id: string) => ({
        url: `${COMMON_URL}/${id}`,
        method: 'GET',
      }),
      providesTags: [tagTypes.product],
    }),

    createCoupon: build.mutation({
      query: (data) => ({
        url: COMMON_URL,
        method: 'POST',
        data,
      }),
      invalidatesTags: [{ type: tagTypes.coupon, id: 'LIST' }],
    }),

    updateCoupon: build.mutation({
      query: ({ id, data }: { id: string; data: any }) => ({
        url: `${COMMON_URL}/${id}`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: [tagTypes.product],
    }),

    deleteCoupon: build.mutation({
      query: (id: string) => ({
        url: `${COMMON_URL}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [tagTypes.product],
    }),
  }),
});

export const {
  useGetAllCouponsQuery,
  useGetSingleCouponQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} = couponsApi;
