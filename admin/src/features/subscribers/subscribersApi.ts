import { baseApi } from '../../redux/api/baseApi';
import { tagTypes } from '../../redux/tag-types';

const URL = '/subscribers';

export const subscribersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllSubscribers: build.query({
      query: (params) => ({ url: URL, method: 'GET', params }),
      providesTags: [tagTypes.subscriber],
    }),

    addSubscriber: build.mutation({
      query: (data) => ({ url: `${URL}/admin`, method: 'POST', data }),
      invalidatesTags: [tagTypes.subscriber],
    }),

    toggleSubscriber: build.mutation({
      query: (id: string) => ({ url: `${URL}/${id}/toggle`, method: 'PATCH' }),
      invalidatesTags: [tagTypes.subscriber],
    }),

    deleteSubscriber: build.mutation({
      query: (id: string) => ({ url: `${URL}/${id}`, method: 'DELETE' }),
      invalidatesTags: [tagTypes.subscriber],
    }),
  }),
});

export const {
  useGetAllSubscribersQuery,
  useAddSubscriberMutation,
  useToggleSubscriberMutation,
  useDeleteSubscriberMutation,
} = subscribersApi;
