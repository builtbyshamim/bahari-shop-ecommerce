import { baseApi } from '../../../redux/api/baseApi';
import { tagTypes } from '../../../redux/tag-types';

const URL = '/order-sources';

export const orderSourceApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllOrderSources: build.query({
      query: (params) => ({ url: URL, method: 'GET', params }),
      providesTags: [tagTypes.orderSource],
    }),

    createOrderSource: build.mutation({
      query: (data) => ({ url: URL, method: 'POST', data }),
      invalidatesTags: [tagTypes.orderSource],
    }),

    updateOrderSource: build.mutation({
      query: ({ id, data }: { id: string; data: any }) => ({
        url: `${URL}/${id}`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: [tagTypes.orderSource],
    }),

    deleteOrderSource: build.mutation({
      query: (id: string) => ({ url: `${URL}/${id}`, method: 'DELETE' }),
      invalidatesTags: [tagTypes.orderSource],
    }),
  }),
});

export const {
  useGetAllOrderSourcesQuery,
  useCreateOrderSourceMutation,
  useUpdateOrderSourceMutation,
  useDeleteOrderSourceMutation,
} = orderSourceApi;
