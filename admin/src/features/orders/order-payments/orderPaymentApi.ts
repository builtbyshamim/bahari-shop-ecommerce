import { baseApi } from '../../../redux/api/baseApi';
import { tagTypes } from '../../../redux/tag-types';

const URL = '/order-payments';

const clean = (p: Record<string, any>) =>
  Object.fromEntries(Object.entries(p).filter(([, v]) => v !== '' && v != null));

export const orderPaymentApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Search by invoice / order number → returns { order, payments, totalPaid, due }
    getPaymentsByInvoice: build.query({
      query: (orderNumber: string) => ({ url: `${URL}/by-invoice/${encodeURIComponent(orderNumber)}` }),
      providesTags: [tagTypes.orderPayment],
    }),

    // By order UUID
    getPaymentsByOrderId: build.query({
      query: (orderId: string) => ({ url: `${URL}/by-order/${orderId}` }),
      providesTags: [tagTypes.orderPayment],
    }),

    // All payments list
    getAllOrderPayments: build.query({
      query: (params: Record<string, any>) => ({ url: URL, params: clean(params) }),
      providesTags: [tagTypes.orderPayment],
    }),

    // Create
    createOrderPayment: build.mutation({
      query: (data) => ({ url: URL, method: 'POST', data }),
      invalidatesTags: [tagTypes.orderPayment, tagTypes.order],
    }),

    // Delete
    deleteOrderPayment: build.mutation({
      query: (id: string) => ({ url: `${URL}/${id}`, method: 'DELETE' }),
      invalidatesTags: [tagTypes.orderPayment, tagTypes.order],
    }),
  }),
});

export const {
  useGetPaymentsByInvoiceQuery,
  useLazyGetPaymentsByInvoiceQuery,
  useGetPaymentsByOrderIdQuery,
  useGetAllOrderPaymentsQuery,
  useCreateOrderPaymentMutation,
  useDeleteOrderPaymentMutation,
} = orderPaymentApi;
