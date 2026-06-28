import { baseApi } from '../../../redux/api/baseApi';
import { tagTypes } from '../../../redux/tag-types';

const URL = '/hrm/designations';

export const designationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllDesignations: build.query({
      query: (params) => ({ url: URL, method: 'GET', params }),
      providesTags: [tagTypes.designation],
    }),

    getSingleDesignation: build.query({
      query: (id: string) => ({ url: `${URL}/${id}`, method: 'GET' }),
      providesTags: [tagTypes.designation],
    }),

    createDesignation: build.mutation({
      query: (data) => ({ url: URL, method: 'POST', data }),
      invalidatesTags: [tagTypes.designation],
    }),

    updateDesignation: build.mutation({
      query: ({ id, data }: { id: string; data: any }) => ({
        url: `${URL}/${id}`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: [tagTypes.designation],
    }),

    deleteDesignation: build.mutation({
      query: (id: string) => ({ url: `${URL}/${id}`, method: 'DELETE' }),
      invalidatesTags: [tagTypes.designation],
    }),
  }),
});

export const {
  useGetAllDesignationsQuery,
  useGetSingleDesignationQuery,
  useCreateDesignationMutation,
  useUpdateDesignationMutation,
  useDeleteDesignationMutation,
} = designationApi;
