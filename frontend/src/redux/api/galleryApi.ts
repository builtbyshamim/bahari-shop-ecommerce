import { baseApi } from '../baseApi';
import { tagTypes } from '../tag-types';

export const galleryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPublicGallery: build.query<any, void>({
      query: () => ({ url: '/gallery/public', method: 'GET' }),
      providesTags: [tagTypes.gallery],
    }),
  }),
});

export const { useGetPublicGalleryQuery } = galleryApi;
