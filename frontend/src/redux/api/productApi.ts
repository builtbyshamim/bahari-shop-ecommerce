import { baseApi } from '../baseApi';
import { tagTypes } from '../tag-types';
export const productApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getRelatedProductByProductSlug: build.query({
      query: (slug) => ({
        url: `/product-views/category-wise-products/${slug}`,
        method: 'GET',
      }),
    }),
    getCategoryTree: build.query({
      query: () => ({
        url: '/categories/view-tree',
        method: 'GET',
      }),
    }),
    getShopProducts: build.query({
      query: (params) => ({
        url: '/product-views/get-shop/product-views',
        method: 'GET',
        params,
      }),
    }),
    getShopBrands: build.query({
      query: () => ({
        url: '/brands',
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useGetRelatedProductByProductSlugQuery,
  useGetCategoryTreeQuery,
  useGetShopProductsQuery,
  useGetShopBrandsQuery,
} = productApi;
