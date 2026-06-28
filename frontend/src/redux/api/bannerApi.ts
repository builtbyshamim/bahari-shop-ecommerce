import { baseApi } from '../baseApi';
import { tagTypes } from '../tag-types';

export interface Banner {
  id: string;
  imageUrl: string;
  link: string | null;
  title: string | null;
  bannerType: 'slider' | 'side';
  sortOrder: number;
  isActive: boolean;
}

export interface BannersPublicResponse {
  sliders: Banner[];
  side: Banner | null;
}

export const bannerApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPublicBanners: build.query<{ data: BannersPublicResponse }, void>({
      query: () => ({
        url: '/banners/public',
        method: 'GET',
      }),
      providesTags: [tagTypes.banner],
    }),
  }),
});

export const { useGetPublicBannersQuery } = bannerApi;
