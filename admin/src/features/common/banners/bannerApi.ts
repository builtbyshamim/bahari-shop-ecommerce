import { baseApi } from '../../../redux/api/baseApi';
import { tagTypes } from '../../../redux/tag-types';

const URL = '/banners';

export const bannerApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllBanners: build.query({
      query: () => ({ url: URL, method: 'GET' }),
      providesTags: [tagTypes.banner],
    }),

    createBanner: build.mutation({
      query: (formData: FormData) => ({
        url: URL,
        method: 'POST',
        data: formData,
        contentType: 'multipart/form-data',
      }),
      invalidatesTags: [tagTypes.banner],
    }),

    updateBanner: build.mutation({
      query: ({ id, data }: { id: string; data: FormData }) => ({
        url: `${URL}/${id}`,
        method: 'PATCH',
        data,
        contentType: 'multipart/form-data',
      }),
      invalidatesTags: [tagTypes.banner],
    }),

    deleteBanner: build.mutation({
      query: (id: string) => ({ url: `${URL}/${id}`, method: 'DELETE' }),
      invalidatesTags: [tagTypes.banner],
    }),
  }),
});

export const {
  useGetAllBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
} = bannerApi;
