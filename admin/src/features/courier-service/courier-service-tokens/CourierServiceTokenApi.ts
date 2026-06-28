import { baseApi } from '../../../redux/api/baseApi';
import { tagTypes } from '../../../redux/tag-types';

const URL = '/courier-service-token';

export const courierServiceTokenApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllCourierTokens: build.query({
      query: () => ({ url: URL, method: 'GET' }),
      providesTags: [tagTypes.courierServiceToken],
    }),

    getSingleCourierToken: build.query({
      query: (id: string) => ({ url: `${URL}/${id}`, method: 'GET' }),
      providesTags: [tagTypes.courierServiceToken],
    }),

    createOrUpdateCourierToken: build.mutation({
      query: (data) => ({ url: URL, method: 'POST', data }),
      invalidatesTags: [tagTypes.courierServiceToken],
    }),
  }),
});

export const {
  useGetAllCourierTokensQuery,
  useGetSingleCourierTokenQuery,
  useCreateOrUpdateCourierTokenMutation,
} = courierServiceTokenApi;
