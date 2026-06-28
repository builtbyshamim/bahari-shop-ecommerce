import { baseApi } from '../../redux/api/baseApi';
import { tagTypes } from '../../redux/tag-types';

const CUSTOMER_URL = '/customers';

export const customerApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // ✅ GET all Customer
    getAllCustomer: build.query({
      query: (params) => ({
        url: '/users/customers',
        method: 'GET',
        params,
      }),
      providesTags: [tagTypes.customer],
    }),

    getSingeCustomerDetails: build.query({
      query: (id) => ({
        url: `/users/customers/details/${id}`,
        method: 'GET',
      }),
      providesTags: [tagTypes.customer],
    }),

    // ✅ CREATE a new Customer
    createCustomer: build.mutation({
      query: (formData) => ({
        url: CUSTOMER_URL,
        method: 'POST',
        data: formData,
      }),
      invalidatesTags: [tagTypes.customer],
    }),

    // ✅ DELETE a Customer
    deleteCustomer: build.mutation({
      query: (id) => ({
        url: `${CUSTOMER_URL}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [tagTypes.customer],
    }),

    // ✅ UPDATE a Customer
    updateCustomer: build.mutation({
      query: ({ id, ...data }) => ({
        url: `${CUSTOMER_URL}/${id}`,
        method: 'PATCH',
        data: data,
      }),
      invalidatesTags: [tagTypes.customer, tagTypes.order],
    }),
  }),
});

export const {
  useGetAllCustomerQuery,
  useCreateCustomerMutation,
  useDeleteCustomerMutation,
  useUpdateCustomerMutation,
  useGetSingeCustomerDetailsQuery,
} = customerApi;
