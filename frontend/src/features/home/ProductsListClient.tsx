'use client';

import ProductCard from '@/components/ui/card/Productcard';
import { Product, ProductsResponse } from '@/types/product';
import { useCallback, useState, useTransition } from 'react';

interface ProductsListClientProps {
  initialData: ProductsResponse;
}

async function fetchMoreProducts(page: number, limit = 10): Promise<ProductsResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const res = await fetch(
    `${baseUrl}/api/v1/product-views?page=${page}&limit=${limit}`,
    { cache: 'no-store' }, // Load More always fresh data
  );

  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

  const json = await res.json();
  if (!json.success) throw new Error('API returned unsuccessful response');

  return json.data as ProductsResponse;
}

export default function ProductsListClient({ initialData }: ProductsListClientProps) {
  const [products, setProducts] = useState<Product[]>(initialData.data);
  const [meta, setMeta] = useState(initialData.meta);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadMore = useCallback(() => {
    const nextPage = meta.currentPage + 1;

    startTransition(async () => {
      try {
        setError(null);
        const response = await fetchMoreProducts(nextPage);
        setProducts((prev) => [...prev, ...response.data]);
        setMeta(response.meta);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      }
    });
  }, [meta.currentPage]);

  const remaining = meta.totalItems - products.length;
  const hasMore = meta.currentPage < meta.totalPages;

  return (
    <>
      <div className="grid py-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4">
        {products.map((product: Product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Error state */}
      {error && <p className="text-center text-sm text-red-500 my-4">{error}</p>}

      {/* Load More button */}
      {hasMore && (
        <div className="flex justify-center py-6">
          <button
            onClick={loadMore}
            disabled={isPending}
            className={`
        relative flex items-center gap-2.5 px-8 py-3 rounded-xl font-semibold text-sm
        border-2 border-primary-500 overflow-hidden
        transition-all duration-300 ease-out
        active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${
          isPending
            ? 'bg-primary-500 text-white cursor-not-allowed'
            : 'bg-white text-primary-600 hover:bg-primary-500 hover:text-white hover:shadow-lg hover:shadow-primary-100 cursor-pointer'
        }
      `}
          >
            {isPending ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Loading...
              </>
            ) : (
              <>
                Load More
                <span className="bg-primary-100 text-primary-600 group-hover:bg-white/20 group-hover:text-white text-xs font-bold px-2 py-0.5 rounded-full transition-colors duration-300">
                  {remaining}
                </span>
              </>
            )}
          </button>
        </div>
      )}
    </>
  );
}
