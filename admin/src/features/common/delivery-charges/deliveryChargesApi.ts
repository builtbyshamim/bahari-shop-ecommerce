import { baseApi } from '../../../redux/api/baseApi';
import { tagTypes } from '../../../redux/tag-types';

const COMMON_URL = '/delivery-charges';

export const deliveryChargesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllDeliveryCharges: build.query({
      query: (params) => ({
        url: COMMON_URL,
        method: 'GET',
        params,
      }),
      providesTags: [tagTypes.deliveryCharge],
    }),

    getSingleDeliveryCharge: build.query({
      query: (id: string) => ({
        url: `${COMMON_URL}/${id}`,
        method: 'GET',
      }),
      providesTags: [tagTypes.deliveryCharge],
    }),

    createDeliveryCharge: build.mutation({
      query: (data) => ({
        url: COMMON_URL,
        method: 'POST',
        data,
      }),
      invalidatesTags: [tagTypes.deliveryCharge],
    }),

    updateDeliveryCharge: build.mutation({
      query: ({ id, data }: { id: string; data: any }) => ({
        url: `${COMMON_URL}/${id}`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: [tagTypes.deliveryCharge],
    }),

    deleteDeliveryCharge: build.mutation({
      query: (id: string) => ({
        url: `${COMMON_URL}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [tagTypes.deliveryCharge],
    }),
  }),
});

export const {
  useGetAllDeliveryChargesQuery,
  useGetSingleDeliveryChargeQuery,
  useCreateDeliveryChargeMutation,
  useUpdateDeliveryChargeMutation,
  useDeleteDeliveryChargeMutation,
} = deliveryChargesApi;
