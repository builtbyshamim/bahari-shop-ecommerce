import { baseApi } from '../../redux/api/baseApi';
import { tagTypes } from '../../redux/tag-types';

export const messagingApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Templates
    getAllTemplates: build.query({
      query: () => ({ url: '/messaging/templates', method: 'GET' }),
      providesTags: [tagTypes.messageTemplate],
    }),

    createTemplate: build.mutation({
      query: (body: object) => ({ url: '/messaging/templates', method: 'POST', data: body }),
      invalidatesTags: [tagTypes.messageTemplate],
    }),

    updateTemplate: build.mutation({
      query: ({ id, ...body }: { id: string; [k: string]: any }) => ({
        url: `/messaging/templates/${id}`,
        method: 'PATCH',
        data: body,
      }),
      invalidatesTags: [tagTypes.messageTemplate],
    }),

    deleteTemplate: build.mutation({
      query: (id: string) => ({ url: `/messaging/templates/${id}`, method: 'DELETE' }),
      invalidatesTags: [tagTypes.messageTemplate],
    }),

    // Send message
    sendMessage: build.mutation({
      query: (body: object) => ({ url: '/messaging/send', method: 'POST', data: body }),
      invalidatesTags: [tagTypes.messageLog],
    }),

    // History
    getMessageHistory: build.query({
      query: ({ page = 1, limit = 20 }: { page?: number; limit?: number }) => ({
        url: `/messaging/history?page=${page}&limit=${limit}`,
        method: 'GET',
      }),
      providesTags: [tagTypes.messageLog],
    }),
  }),
});

export const {
  useGetAllTemplatesQuery,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useDeleteTemplateMutation,
  useSendMessageMutation,
  useGetMessageHistoryQuery,
} = messagingApi;
