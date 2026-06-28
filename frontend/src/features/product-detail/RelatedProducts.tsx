'use client';

import RelatedProductCard from '@/components/ui/card/RelatedProductCard';
import { useGetRelatedProductByProductSlugQuery } from '@/redux/api/productApi';

const RelatedProducts = ({ slug, category }: any) => {
  const { data, isLoading } = useGetRelatedProductByProductSlugQuery(slug, {
    skip: !slug,
  });

  const relatedProducts = data?.data?.data || [];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!relatedProducts || relatedProducts.length === 0) {
    return null; // data na thakle kichui show korbe na
  }

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-black-800">You might also like</h2>
        <a
          href={`/shop?category=${category}`}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          View all
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
        {relatedProducts.map((product: any, index: number) => (
          <RelatedProductCard key={index} product={product} />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
