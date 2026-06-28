import { baseApi } from '../baseApi';

export const companyApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCompanyInfo: build.query<any, void>({
      query: () => ({ url: '/company-info', method: 'GET' }),
    }),
  }),
});

export const { useGetCompanyInfoQuery } = companyApi;
