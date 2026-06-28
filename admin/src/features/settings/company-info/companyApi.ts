import { baseApi } from '../../../redux/api/baseApi';
import { tagTypes } from '../../../redux/tag-types';

const URL = '/company-info';

export const companyApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCompanyInfo: build.query({
      query: () => ({ url: URL, method: 'GET' }),
      providesTags: [tagTypes.companyInfo],
    }),

    updateCompanyInfo: build.mutation({
      query: (formData: FormData) => ({
        url: URL,
        method: 'PATCH',
        data: formData,
      }),
      invalidatesTags: [tagTypes.companyInfo],
    }),
  }),
});

export const { useGetCompanyInfoQuery, useUpdateCompanyInfoMutation } = companyApi;
