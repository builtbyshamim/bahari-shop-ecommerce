import { baseApi } from '../baseApi';

export const testimonialsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPublicTestimonials: build.query<any, void>({
      query: () => ({
        url: '/testimonials/public',
        method: 'GET',
      }),
    }),
  }),
});

export const { useGetPublicTestimonialsQuery } = testimonialsApi;
