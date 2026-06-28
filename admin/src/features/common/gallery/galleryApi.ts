import { baseApi } from '../../../redux/api/baseApi';
import { tagTypes } from '../../../redux/tag-types';

const URL = '/gallery';

export const galleryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllGalleryItems: build.query({
      query: () => ({ url: URL, method: 'GET' }),
      providesTags: [tagTypes.gallery],
    }),
    createGalleryItem: build.mutation({
      query: (formData: FormData) => ({
        url: URL,
        method: 'POST',
        data: formData,
      }),
      invalidatesTags: [tagTypes.gallery],
    }),
    updateGalleryItem: build.mutation({
      query: ({ id, data }: { id: string; data: FormData }) => ({
        url: `${URL}/${id}`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: [tagTypes.gallery],
    }),
    deleteGalleryItem: build.mutation({
      query: (id: string) => ({ url: `${URL}/${id}`, method: 'DELETE' }),
      invalidatesTags: [tagTypes.gallery],
    }),
  }),
});

export const {
  useGetAllGalleryItemsQuery,
  useCreateGalleryItemMutation,
  useUpdateGalleryItemMutation,
  useDeleteGalleryItemMutation,
} = galleryApi;
