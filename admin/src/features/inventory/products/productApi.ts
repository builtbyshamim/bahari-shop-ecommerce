import { baseApi } from '../../../redux/api/baseApi';
import { tagTypes } from '../../../redux/tag-types';

const COMMON_URL = '/products';

export const productApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // ✅ GET ALL PRODUCTS
    getAllProducts: build.query({
      query: (params) => ({
        url: COMMON_URL,
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result?.data?.data
          ? [
              { type: tagTypes.product, id: 'LIST' },
              ...result.data.data.map((item: any) => ({
                type: tagTypes.product,
                id: item.id,
              })),
            ]
          : [{ type: tagTypes.product, id: 'LIST' }],
    }),

    // ✅ GET SINGLE PRODUCT
    getSingleProduct: build.query({
      query: (id: string) => ({
        url: `${COMMON_URL}/${id}`,
        method: 'GET',
      }),
      providesTags: [tagTypes.product],
    }),

    // ✅ CREATE PRODUCT
    createProduct: build.mutation({
      query: (formData: any) => ({
        url: COMMON_URL,
        method: 'POST',
        data: formData,
      }),
      invalidatesTags: [{ type: tagTypes.product, id: 'LIST' }],
    }),

    // ✅ UPDATE PRODUCT
    updateProduct: build.mutation({
      query: ({ id, data }: { id: string; data: any }) => ({
        url: `${COMMON_URL}/${id}`,
        method: 'PATCH',
        data: data,
      }),
      invalidatesTags: [tagTypes.product],
    }),

    // ✅ DELETE PRODUCT
    deleteProduct: build.mutation({
      query: (id: string) => ({
        url: `${COMMON_URL}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [tagTypes.product],
    }),

    // GET /products/:productId/images
    getProductImages: build.query({
      query: (id) => ({
        url: `/products/images/${id}`,
        method: 'GET',
      }),
      providesTags: [tagTypes.productImage],
    }),

    // POST /products/images/:productId  (multipart/form-data)
    uploadProductImages: build.mutation({
      query: ({ productId, formData }) => ({
        url: `/products/images/${productId}`,
        method: 'POST',
        data: formData,
      }),
      invalidatesTags: [tagTypes.product],
    }),

    // DELETE /products/:productId/images/:imageId
    deleteProductImage: build.mutation({
      query: ({ imageId }) => ({
        url: `/products/images/${imageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [tagTypes.product],
    }),

    // PATCH /products/:productId/images/:imageId/thumbnail
    setThumbnail: build.mutation({
      query: ({ productId, imageId }) => ({
        url: `/products/images/${imageId}/thumbnail/${productId}`,
        method: 'PATCH',
      }),
      invalidatesTags: [tagTypes.product],
    }),

    reorderImages: build.mutation({
      query: ({ productId, orderedIds }: any) => ({
        url: `/products/images/reorder/${productId}`,
        method: 'PATCH',
        data: { orderedIds },
      }),
    }),
  }),
});

export const {
  useGetAllProductsQuery,
  useGetSingleProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetProductImagesQuery,
  useUploadProductImagesMutation,
  useDeleteProductImageMutation,
  useSetThumbnailMutation,
  useReorderImagesMutation,
} = productApi;
