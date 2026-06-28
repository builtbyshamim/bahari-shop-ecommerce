import type { Metadata } from 'next';
import ShopProductCard from '@/components/ui/card/ShopProductCard';
import { FiAward } from 'react-icons/fi';

async function fetchFeatureType(featureTypeId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const res = await fetch(`${baseUrl}/api/v1/feature-types/${featureTypeId}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data ?? null;
}

async function fetchRankingProducts(featureTypeId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const res = await fetch(`${baseUrl}/api/v1/top-rankings/products/${featureTypeId}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const json = await res.json();
  return json.data?.data ?? [];
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { type } = await params;
  const featureType = await fetchFeatureType(type);
  const name = featureType?.name ?? 'Products';
  return {
    title: `${name} — Products`,
    openGraph: { title: `${name} | Bahari Shop` },
  };
}

export default async function RankingPage({ params }: any) {
  const { type } = await params;

  const featureType = await fetchFeatureType(type);
  const name = featureType?.name ?? 'Products';

  let products: any[] = [];
  let fetchError = '';

  try {
    products = await fetchRankingProducts(type);
  } catch (err) {
    fetchError = err instanceof Error ? err.message : 'Something went wrong';
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-400 text-white py-10">
        <div className="container">
          <div className="flex items-center gap-3 mb-1">
            <FiAward className="w-7 h-7" />
            <h1 className="text-3xl md:text-4xl font-bold">{name}</h1>
          </div>
          <p className="text-white/80 text-sm mt-1">
            <span className="font-semibold">{products.length} products</span> in this collection
          </p>
        </div>
      </div>

      <div className="container py-8">
        {fetchError ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">😕</div>
            <h3 className="text-lg font-semibold text-black-800 mb-2">Could not load products</h3>
            <p className="text-black-500 text-sm">{fetchError}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <FiAward className="w-14 h-14 text-black-200 mb-4" />
            <h3 className="text-lg font-semibold text-black-700 mb-1">No products</h3>
            <p className="text-black-400 text-sm">No products available in this section</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {products.map((product: any) => (
              <ShopProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
