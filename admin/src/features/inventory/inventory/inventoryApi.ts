import { baseApi } from '../../../redux/api/baseApi';
import { tagTypes } from '../../../redux/tag-types';

const URL = '/inventory';

export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllInventory: build.query({
      query: (params) => ({ url: URL, method: 'GET', params }),
      providesTags: [tagTypes.inventory],
    }),
    getSingleInventory: build.query({
      query: (id: string) => ({ url: `${URL}/${id}`, method: 'GET' }),
      providesTags: [tagTypes.inventory],
    }),
    getInventoryMovements: build.query({
      query: ({ id, ...params }: { id: string; page?: number; limit?: number }) => ({
        url: `${URL}/${id}/movements`,
        method: 'GET',
        params,
      }),
      providesTags: [tagTypes.inventory],
    }),
    getProfitReport: build.query({
      query: (id: string) => ({ url: `${URL}/${id}/profit`, method: 'GET' }),
      providesTags: [tagTypes.inventory],
    }),
    createInventory: build.mutation({
      query: (data) => ({ url: URL, method: 'POST', data }),
      invalidatesTags: [tagTypes.inventory],
    }),
    stockIn: build.mutation({
      query: ({
        id,
        ...data
      }: {
        id: string;
        quantity: number;
        unit_cost_price: number;
        note?: string;
      }) => ({
        url: `${URL}/${id}/stock-in`,
        method: 'POST',
        data,
      }),
      invalidatesTags: [tagTypes.inventory],
    }),
    adjustStock: build.mutation({
      query: ({
        id,
        ...data
      }: {
        id: string;
        quantity: number;
        type: 'in' | 'out';
        note: string;
      }) => ({
        url: `${URL}/${id}/adjust`,
        method: 'POST',
        data,
      }),
      invalidatesTags: [tagTypes.inventory],
    }),
    reserveStock: build.mutation({
      query: ({ id, ...data }: { id: string; order_id: string; quantity: number }) => ({
        url: `${URL}/${id}/reserve`,
        method: 'POST',
        data,
      }),
      invalidatesTags: [tagTypes.inventory],
    }),
    updateInventorySettings: build.mutation({
      query: ({ id, ...body }) => ({
        url: `/inventory/${id}/settings`,
        method: 'PATCH',
        data: body,
      }),
      invalidatesTags: [tagTypes.inventory],
    }),
  }),
});

export const {
  useGetAllInventoryQuery,
  useGetSingleInventoryQuery,
  useGetInventoryMovementsQuery,
  useGetProfitReportQuery,
  useCreateInventoryMutation,
  useStockInMutation,
  useAdjustStockMutation,
  useReserveStockMutation,
  useUpdateInventorySettingsMutation,
} = inventoryApi;
