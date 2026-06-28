import { baseApi } from "../baseApi";
import { tagTypes } from "../tag-types";

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  fullAddress: string;
  isDefault: boolean;
}

export interface CreateAddressDto {
  fullName: string;
  phone: string;
  email?: string;
  fullAddress: string;
  isDefault?: boolean;
}

export interface UpdateAddressDto extends Partial<CreateAddressDto> {}

export const addressApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // GET /users/addresses
    getAddresses: build.query<Address[], void>({
      query: () => ({
        url: `/users/addresses`,
        method: "GET",
      }),
      transformResponse: (res: { data: Address[] }) => res.data,
      providesTags: [tagTypes.address],
    }),

    // POST /users/addresses
    createAddress: build.mutation<Address, CreateAddressDto>({
      query: (body) => ({
        url: `/users/addresses`,
        method: "POST",
        data: body,
      }),
      transformResponse: (res: { data: Address }) => res.data,
      invalidatesTags: [tagTypes.address],
    }),

    // PATCH /users/addresses/:id
    updateAddress: build.mutation<Address, { id: string; body: UpdateAddressDto }>({
      query: ({ id, body }) => ({
        url: `/users/addresses/${id}`,
        method: "PATCH",
        data: body,
      }),
      transformResponse: (res: { data: Address }) => res.data,
      invalidatesTags: [tagTypes.address],
    }),

    // PATCH /users/addresses/:id/default
    setDefaultAddress: build.mutation<void, string>({
      query: (id) => ({
        url: `/users/addresses/${id}/default`,
        method: "PATCH",
      }),
      invalidatesTags: [tagTypes.address],
    }),

    // DELETE /users/addresses/:id
    deleteAddress: build.mutation<void, string>({
      query: (id) => ({
        url: `/users/addresses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.address],
    }),
  }),
});

export const {
  useGetAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useSetDefaultAddressMutation,
  useDeleteAddressMutation,
} = addressApi;