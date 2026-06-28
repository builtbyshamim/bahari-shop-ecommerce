// components/sections/ProductsGrid.tsx
import ProductsGridSkeleton from '@/components/ui/skeleton/ProductsGridSkeleton';
import { ProductsResponse } from '@/types/product';
import Link from 'next/link';
import { Suspense } from 'react';
import { RiArrowRightLine } from 'react-icons/ri';
import ProductsListClient from './ProductsListClient';

// ── Data fetching function ─────────────────────────────────
async function fetchProducts(page = 1, limit = 10): Promise<ProductsResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const res = await fetch(
    `${baseUrl}/api/v1/product-views?page=${page}&limit=${limit}`,
    { next: { revalidate: 300 } }, // ISR — 5 minutes
  );

  if (!res.ok) {
    throw new Error(`Products fetch failed: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  if (!json.success) throw new Error('API returned unsuccessful response');

  return json.data as ProductsResponse;
}

// ── Initial Products Loader (Server Component) ─────────────
async function ProductsList({ page }: { page: number }) {
  let response: ProductsResponse;

  try {
    response = await fetchProducts(page);
  } catch (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-5xl mb-4">😕</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Products could not be loaded</h3>
        <p className="text-gray-500 text-sm">
          {error instanceof Error ? error.message : 'Something went wrong'}
        </p>
      </div>
    );
  }

  if (response.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-5xl mb-4">📦</div>
        <h3 className="text-lg font-semibold text-gray-800">No products found</h3>
      </div>
    );
  }

  // Client component কে initial data দিয়ে দাও —
  // বাকি Load More গুলো সে নিজেই handle করবে
  return <ProductsListClient initialData={response} />;
}

// ── Main Component ─────────────────────────────────────────
const ProductsGrid = ({ page = 1 }: { page?: number }) => {
  return (
    <div className="container">
      {/* Section Header */}
      <div className="flex justify-between items-center border-b border-[#D5D5D5] pb-2 mb-3">
        <h2 className="text-base sm:text-xl md:text-2xl text-black-900 font-semibold uppercase tracking-tight">
          Only for you
        </h2>
        <Link
          href="/shop"
          className="underline text-primary-600 duration-200 font-semibold flex items-center gap-1 text-xs"
        >
          <span>View all</span>
          <RiArrowRightLine className="text-sm" />
        </Link>
      </div>

      <Suspense fallback={<ProductsGridSkeleton />}>
        <ProductsList page={page} />
      </Suspense>
    </div>
  );
};

export default ProductsGrid;
