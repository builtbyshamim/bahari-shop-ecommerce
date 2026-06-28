import TopDealsCard from '@/components/ui/card/DealProductCard';
import ProductsGridSkeleton from '@/components/ui/skeleton/ProductsGridSkeleton';
import Link from 'next/link';
import { Suspense } from 'react';
import { RiArrowRightLine } from 'react-icons/ri';
async function fetchProducts() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const res = await fetch(`${baseUrl}/api/v1/deals/get-top-deals-products`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Products fetch failed: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  if (!json.success) {
    throw new Error('API returned unsuccessful response');
  }

  return json.data?.data;
}
const TopDeals = async () => {
  let response = [];

  try {
    response = await fetchProducts();
  } catch (error) {
    console.error('Error fetching top deals:', error);
    return null;
  }

  if (!response?.length) return null;

  return (
    <div className="container">
      <div className="my-6">
        <div className="flex justify-between items-center border-b border-[#D5D5D5] pb-2 mb-3">
          <h2 className="text-base sm:text-xl md:text-2xl text-black-900 font-semibold uppercase tracking-tight">
            Top Deals
          </h2>
          <Link
            href={`/deals`}
            className=" underline text-primary-600 duration-200 font-semibold flex items-center gap-1 text-xs"
          >
            <span>View all</span>
            <RiArrowRightLine className="text-sm" />
          </Link>
        </div>

        <Suspense fallback={<ProductsGridSkeleton />}>
          <div className="py-3">
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 md:gap-4 xl:gap-6">
              {response?.slice(0, 4)?.map((product: any) => (
                <TopDealsCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </Suspense>
      </div>
    </div>
  );
};

export default TopDeals;
