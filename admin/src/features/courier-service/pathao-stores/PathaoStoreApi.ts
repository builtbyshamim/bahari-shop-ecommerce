import { baseApi } from '../../../redux/api/baseApi';
import { tagTypes } from '../../../redux/tag-types';

const URL = '/courier/pathao-stores';

const clean = (params: Record<string, any>) => {
  const r: Record<string, any> = {};
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== '' && v !== null && v !== undefined) r[k] = v;
  });
  return r;
};

export const pathaoStoreApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllPathaoStores: build.query({
      query: (params) => ({ url: URL, method: 'GET', params: clean(params) }),
      providesTags: [tagTypes.pathaoStore],
    }),

    getSinglePathaoStore: build.query({
      query: (id: string) => ({ url: `${URL}/${id}`, method: 'GET' }),
      providesTags: [tagTypes.pathaoStore],
    }),

    createPathaoStore: build.mutation({
      query: (data) => ({ url: URL, method: 'POST', data }),
      invalidatesTags: [tagTypes.pathaoStore],
    }),

    updatePathaoStore: build.mutation({
      query: ({ id, data }: { id: string; data: any }) => ({
        url: `${URL}/${id}`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: [tagTypes.pathaoStore],
    }),

    deletePathaoStore: build.mutation({
      query: (id: string) => ({ url: `${URL}/${id}`, method: 'DELETE' }),
      invalidatesTags: [tagTypes.pathaoStore],
    }),
  }),
});

export const {
  useGetAllPathaoStoresQuery,
  useGetSinglePathaoStoreQuery,
  useCreatePathaoStoreMutation,
  useUpdatePathaoStoreMutation,
  useDeletePathaoStoreMutation,
} = pathaoStoreApi;
