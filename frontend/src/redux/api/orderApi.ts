import { baseApi } from "../baseApi";
import { tagTypes } from "../tag-types";

export const orderApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMyOrders: build.query({
      query: () => ({
        url: `/orders/my-orders`,
        method: 'GET',
      }),
      providesTags: [tagTypes.order],
    }),
    getOrderById: build.query({
      query: (id: string) => ({
        url: `/orders/${id}`,
        method: 'GET',
      }),
      providesTags: [tagTypes.order],
    }),
    trackOrderByNumber: build.query({
      query: (orderNumber: string) => ({
        url: `/orders/public/track/${encodeURIComponent(orderNumber)}`,
        method: 'GET',
      }),
    }),
    getOrderByIdPublic: build.query({
      query: (id: string) => ({
        url: `/orders/public/id/${id}`,
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useGetMyOrdersQuery,
  useGetOrderByIdQuery,
  useTrackOrderByNumberQuery,
  useLazyTrackOrderByNumberQuery,
  useGetOrderByIdPublicQuery,
} = orderApi;