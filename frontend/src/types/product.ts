// types/product.ts
export interface ProductThumbnail {
  url: string;
  altText: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number | null;
  rating: number | null;
  compareAtPrice: number | null;
  discountPercent: number | null;
  category: ProductCategory | null;
  thumbnail: ProductThumbnail | null;
}

export interface ProductMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface ProductsResponse {
  data: Product[];
  meta: ProductMeta;
}
