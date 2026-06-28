import { baseApi } from '../baseApi';
import { tagTypes } from '../tag-types';

const URL = '/feature-types';

export const featureTypeApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getActiveFeatureTypesWithProducts: build.query({
      query: () => ({ url: `${URL}/active-with-products`, method: 'GET' }),
      providesTags: [tagTypes.featureType],
    }),
  }),
});

export const { useGetActiveFeatureTypesWithProductsQuery } = featureTypeApi;
