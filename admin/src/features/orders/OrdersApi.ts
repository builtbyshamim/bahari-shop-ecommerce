import { baseApi } from "../../redux/api/baseApi";
import { tagTypes } from "../../redux/tag-types";

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllOrders: builder.query({
      query: (arg) => ({
        url: "/orders",
        params: arg,
      }),
      providesTags: [tagTypes.order],
    }),
    getOrderById: builder.query({
      query: (id: string) => ({ url: `/orders/${id}` }),
      providesTags: [tagTypes.order],
    }),

    updateOrderStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/orders/${id}/status`,
        method: "PATCH",
        data: { status },
      }),
      invalidatesTags: [tagTypes.order],
    }),

    updatePaymentStatus: builder.mutation({
      query: ({ id, paymentStatus }) => ({
        url: `/orders/${id}/payment-status`,
        method: "PATCH",
        data: { paymentStatus },
      }),
      invalidatesTags: [tagTypes.order],
    }),

    cancelOrder: builder.mutation({
      query: (id: string) => ({
        url: `/orders/${id}/cancel`,
        method: "PATCH",
      }),
      invalidatesTags: [tagTypes.order],
    }),

    createOrder: builder.mutation({
      query: (dto: any) => ({
        url: '/orders',
        method: 'POST',
        data: dto,
      }),
      invalidatesTags: [tagTypes.order],
    }),

    // Admin/Employee creates order — sends auth token, records createdBy
    adminCreateOrder: builder.mutation({
      query: (dto: any) => ({
        url: '/orders/admin-create',
        method: 'POST',
        data: dto,
      }),
      invalidatesTags: [tagTypes.order],
    }),
  }),
});

export const {
  useGetAllOrdersQuery,
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
  useUpdatePaymentStatusMutation,
  useCancelOrderMutation,
  useCreateOrderMutation,
  useAdminCreateOrderMutation,
} = orderApi;
