import { baseApi } from '../../../redux/api/baseApi';
import { tagTypes } from '../../../redux/tag-types';

const URL = '/hrm/employees';

const clean = (params: Record<string, any>) => {
  const r: Record<string, any> = {};
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== '' && v !== null && v !== undefined) r[k] = v;
  });
  return r;
};

export const employeeApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllEmployees: build.query({
      query: (params) => ({ url: URL, method: 'GET', params: clean(params) }),
      providesTags: [tagTypes.employee],
    }),

    getEmployeeStats: build.query({
      query: () => ({ url: `${URL}/stats`, method: 'GET' }),
      providesTags: [tagTypes.employee],
    }),

    getSingleEmployee: build.query({
      query: (id: string) => ({ url: `${URL}/${id}`, method: 'GET' }),
      providesTags: [tagTypes.employee],
    }),

    createEmployee: build.mutation({
      query: (data) => ({ url: URL, method: 'POST', data }),
      invalidatesTags: [tagTypes.employee],
    }),

    updateEmployee: build.mutation({
      query: ({ id, data }: { id: string; data: any }) => ({
        url: `${URL}/${id}`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: [tagTypes.employee],
    }),

    deleteEmployee: build.mutation({
      query: (id: string) => ({ url: `${URL}/${id}`, method: 'DELETE' }),
      invalidatesTags: [tagTypes.employee],
    }),
  }),
});

export const {
  useGetAllEmployeesQuery,
  useGetEmployeeStatsQuery,
  useGetSingleEmployeeQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} = employeeApi;
