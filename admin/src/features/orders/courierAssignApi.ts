import { baseApi } from '../../redux/api/baseApi';
import { tagTypes } from '../../redux/tag-types';

const URL = '/courier-assign';
export const courierAssignApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    assignSteadfast: build.mutation({
      query: (data) => ({ url: `${URL}/steadfast`, method: 'POST', data }),
      invalidatesTags: [tagTypes.order],
    }),

    assignPathao: build.mutation({
      query: (data) => ({ url: `${URL}/pathao`, method: 'POST', data }),
      invalidatesTags: [tagTypes.order],
    }),
  }),
});

export const { useAssignSteadfastMutation, useAssignPathaoMutation } = courierAssignApi;
