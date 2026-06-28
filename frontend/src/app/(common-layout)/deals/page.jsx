import DealsOfferCard from '@/components/ui/card/DealsOfferCard';
import { FiTag } from 'react-icons/fi';

async function fetchAllDealsProducts(page = 1, limit = 50) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const res = await fetch(
    `${baseUrl}/api/v1/deals/all-deals-products?page=${page}&limit=${limit}`,
    { next: { revalidate: 300 } },
  );
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const json = await res.json();
  return json.data ?? { data: [], meta: {} };
}

export default async function DealsPage() {
  let deals = [];
  let total = 0;
  let error = '';

  try {
    const result = await fetchAllDealsProducts();
    deals = result.data ?? [];
    total = result.meta?.totalItems ?? deals.length;
  } catch (err) {
    error = err instanceof Error ? err.message : 'Something went wrong';
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-400 text-white py-7 md:py-10">
        <div className="container">
          <div className="flex items-center gap-2 md:gap-3 mb-1">
            <FiTag className="w-5 h-5 md:w-7 md:h-7" />
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">All Deals</h1>
          </div>
          <p className="text-white/80 text-sm mt-1">
            Score the lowest prices on Bahari Shop —{' '}
            <span className="font-semibold">{total} deals</span> available
          </p>
        </div>
      </div>

      <div className="container py-8">
        {error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">😕</div>
            <h3 className="text-lg font-semibold text-black-800 mb-2">Deals could not be loaded</h3>
            <p className="text-black-500 text-sm">{error}</p>
          </div>
        ) : deals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <FiTag className="w-14 h-14 text-black-200 mb-4" />
            <h3 className="text-lg font-semibold text-black-700 mb-1">No deals available</h3>
            <p className="text-black-400 text-sm">There are no active deals right now</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
            {deals.map((deal) => (
              <DealsOfferCard key={deal.dealId} product={deal} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
