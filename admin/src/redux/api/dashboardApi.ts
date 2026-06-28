import { baseApi } from './baseApi';

export type DashboardDateParams = {
  startDate?: string;
  endDate?: string;
};

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDashboardSummary: build.query<any, DashboardDateParams | undefined>({
      query: (arg) => ({
        url: '/dashboard/summary',
        method: 'GET',
        params: arg ?? {},
      }),
    }),
  }),
});

export const { useGetDashboardSummaryQuery } = dashboardApi;
