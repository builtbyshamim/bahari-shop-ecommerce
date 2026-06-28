import { baseApi } from '../../../redux/api/baseApi';
import { tagTypes } from '../../../redux/tag-types';

// ─── Ledger API ───────────────────────────────────────────────────────────────
export const ledgerApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /**
     * GET /ledger/:accountId?startDate=&endDate=
     * Returns: opening balance, entries with running balance, closing balance
     */
    getLedger: build.query({
      query: ({
        accountId,
        startDate,
        endDate,
      }: {
        accountId: string;
        startDate?: string;
        endDate?: string;
      }) => ({
        url: `/ledger/${accountId}`,
        method: 'GET',
        params: { startDate, endDate },
      }),
      providesTags: [tagTypes.ledger],
    }),
  }),
});

// ─── Reports API ──────────────────────────────────────────────────────────────
export const reportsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /**
     * GET /reports/summary
     * Total income, expense, profit/loss, account balance
     */
    getReportSummary: build.query({
      query: (params?: {
        startDate?: string;
        endDate?: string;
        account_id?: string;
        category_id?: string;
      }) => ({
        url: '/reports/summary',
        method: 'GET',
        params,
      }),
      providesTags: [{ type: tagTypes.report, id: 'SUMMARY' }],
    }),

    /**
     * GET /reports/by-category
     */
    getReportByCategory: build.query({
      query: (params?: {
        startDate?: string;
        endDate?: string;
        account_id?: string;
        type?: string;
      }) => ({
        url: '/reports/by-category',
        method: 'GET',
        params,
      }),
      providesTags: [{ type: tagTypes.report, id: 'CATEGORY' }],
    }),

    /**
     * GET /reports/time-series?groupBy=day|month
     */
    getReportTimeSeries: build.query({
      query: (params?: {
        startDate?: string;
        endDate?: string;
        account_id?: string;
        groupBy?: 'day' | 'month';
      }) => ({
        url: '/reports/time-series',
        method: 'GET',
        params,
      }),
      providesTags: [{ type: tagTypes.report, id: 'TIME_SERIES' }],
    }),

    /**
     * GET /reports/account-balances
     */
    getAccountBalances: build.query({
      query: () => ({
        url: '/reports/account-balances',
        method: 'GET',
      }),
      providesTags: [{ type: tagTypes.report, id: 'BALANCES' }],
    }),
  }),
});

export const { useGetLedgerQuery } = ledgerApi;

export const {
  useGetReportSummaryQuery,
  useGetReportByCategoryQuery,
  useGetReportTimeSeriesQuery,
  useGetAccountBalancesQuery,
} = reportsApi;
