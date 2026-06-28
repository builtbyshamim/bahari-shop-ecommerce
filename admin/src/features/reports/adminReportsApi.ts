import { baseApi } from '../../redux/api/baseApi';
import { tagTypes } from '../../redux/tag-types';

const BASE = '/admin-reports';

export const adminReportsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAdminSalesReportSummary: build.query<any, { startDate?: string; endDate?: string }>({
      query: (p) => ({ url: `${BASE}/summary`, params: p }),
      providesTags: [tagTypes.order],
    }),
    getOrdersReport: build.query<any, { startDate?: string; endDate?: string; status?: string }>({
      query: (p) => ({ url: `${BASE}/orders`, params: p }),
      providesTags: [tagTypes.order],
    }),
    getTransactionsReport: build.query<
      any,
      { startDate?: string; endDate?: string; type?: string }
    >({
      query: (p) => ({ url: `${BASE}/transactions`, params: p }),
      providesTags: [tagTypes.order],
    }),
    getInventoryReport: build.query<any, void>({
      query: () => ({ url: `${BASE}/inventory` }),
      providesTags: [tagTypes.order],
    }),
    getStockMovementsReport: build.query<
      any,
      { startDate?: string; endDate?: string; movementType?: string }
    >({
      query: (p) => ({ url: `${BASE}/stock-movements`, params: p }),
      providesTags: [tagTypes.order],
    }),
    getCampaignReport: build.query<any, { startDate?: string; endDate?: string }>({
      query: (p) => ({ url: `${BASE}/campaigns`, params: p }),
      providesTags: [tagTypes.order],
    }),
  }),
});

export const {
  useGetAdminSalesReportSummaryQuery,
  useGetOrdersReportQuery,
  useGetTransactionsReportQuery,
  useGetInventoryReportQuery,
  useGetStockMovementsReportQuery,
  useGetCampaignReportQuery,
} = adminReportsApi;
