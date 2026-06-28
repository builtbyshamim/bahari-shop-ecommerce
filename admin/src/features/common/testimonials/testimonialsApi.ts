import { baseApi } from '../../../redux/api/baseApi';

export const testimonialsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllTestimonials: build.query({
      query: () => ({ url: '/testimonials', method: 'GET' }),
      providesTags: ['Testimonials'],
    }),
    createTestimonial: build.mutation({
      query: (formData: FormData) => ({
        url: '/testimonials',
        method: 'POST',
        data: formData,
      }),
      invalidatesTags: ['Testimonials'],
    }),
    updateTestimonial: build.mutation({
      query: ({ id, formData }: { id: string; formData: FormData }) => ({
        url: `/testimonials/${id}`,
        method: 'PATCH',
        data: formData,
      }),
      invalidatesTags: ['Testimonials'],
    }),
    deleteTestimonial: build.mutation({
      query: (id: string) => ({ url: `/testimonials/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Testimonials'],
    }),
  }),
});

export const {
  useGetAllTestimonialsQuery,
  useCreateTestimonialMutation,
  useUpdateTestimonialMutation,
  useDeleteTestimonialMutation,
} = testimonialsApi;
