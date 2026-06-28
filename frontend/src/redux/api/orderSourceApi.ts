import { baseApi } from '../baseApi';
import { tagTypes } from '../tag-types';

export interface OrderSource {
  id: string;
  name: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderSourcePayload {
  name: string;
  status?: boolean;
}

export interface UpdateOrderSourcePayload {
  name?: string;
  status?: boolean;
}

export const orderSourceApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getOrderSources: build.query<OrderSource[], void>({
      query: () => ({
        url: '/order-sources',
        method: 'GET',
      }),
      providesTags: [tagTypes.orderSource],
    }),

    getOrderSourceById: build.query<OrderSource, string>({
      query: (id) => ({
        url: `/order-sources/${id}`,
        method: 'GET',
      }),
      providesTags: [tagTypes.orderSource],
    }),

    createOrderSource: build.mutation<OrderSource, CreateOrderSourcePayload>({
      query: (data) => ({
        url: '/order-sources',
        method: 'POST',
        data,
      }),
      invalidatesTags: [tagTypes.orderSource],
    }),

    updateOrderSource: build.mutation<
      OrderSource,
      { id: string; data: UpdateOrderSourcePayload }
    >({
      query: ({ id, data }) => ({
        url: `/order-sources/${id}`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: [tagTypes.orderSource],
    }),

    deleteOrderSource: build.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/order-sources/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [tagTypes.orderSource],
    }),
  }),
});

export const {
  useGetOrderSourcesQuery,
  useGetOrderSourceByIdQuery,
  useCreateOrderSourceMutation,
  useUpdateOrderSourceMutation,
  useDeleteOrderSourceMutation,
} = orderSourceApi;
