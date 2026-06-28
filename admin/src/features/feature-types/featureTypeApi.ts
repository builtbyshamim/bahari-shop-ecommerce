import { baseApi } from '../../redux/api/baseApi';
import { tagTypes } from '../../redux/tag-types';

const URL = '/feature-types';

export const featureTypeApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllFeatureTypes: build.query({
      query: () => ({ url: URL, method: 'GET' }),
      providesTags: [tagTypes.featureType],
    }),

    createFeatureType: build.mutation({
      query: (data) => ({ url: URL, method: 'POST', data }),
      invalidatesTags: [tagTypes.featureType],
    }),

    updateFeatureType: build.mutation({
      query: ({ id, data }) => ({ url: `${URL}/${id}`, method: 'PATCH', data }),
      invalidatesTags: [tagTypes.featureType],
    }),

    deleteFeatureType: build.mutation({
      query: (id: string) => ({ url: `${URL}/${id}`, method: 'DELETE' }),
      invalidatesTags: [tagTypes.featureType],
    }),
  }),
});

export const {
  useGetAllFeatureTypesQuery,
  useCreateFeatureTypeMutation,
  useUpdateFeatureTypeMutation,
  useDeleteFeatureTypeMutation,
} = featureTypeApi;
