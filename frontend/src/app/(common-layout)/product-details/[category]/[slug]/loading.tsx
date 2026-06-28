const Shimmer = ({ className = '' }: { className?: string }) => (
  <div className={`relative overflow-hidden bg-gray-100 rounded-lg ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
  </div>
);

const ImageGallerySkeleton = () => (
  <div className="flex flex-col gap-3">
    <Shimmer className="w-full aspect-square rounded-xl" />
    <div className="flex gap-2">
      {[...Array(5)].map((_, i) => (
        <Shimmer key={i} className="w-16 h-16 rounded-lg shrink-0" />
      ))}
    </div>
  </div>
);

const StarsSkeleton = () => (
  <div className="flex gap-1">
    {[...Array(5)].map((_, i) => (
      <Shimmer key={i} className="w-4 h-4 rounded" />
    ))}
  </div>
);

const ProductInfoSkeleton = () => (
  <div className="space-y-5">
    {/* Breadcrumb */}
    <div className="flex items-center gap-2">
      <Shimmer className="h-3.5 w-14 rounded-full" />
      <Shimmer className="h-3.5 w-3 rounded-full" />
      <Shimmer className="h-3.5 w-20 rounded-full" />
      <Shimmer className="h-3.5 w-3 rounded-full" />
      <Shimmer className="h-3.5 w-32 rounded-full" />
    </div>

    {/* Title */}
    <div className="space-y-2">
      <Shimmer className="h-7 w-full rounded-lg" />
      <Shimmer className="h-7 w-3/4 rounded-lg" />
    </div>

    {/* Rating + sold */}
    <div className="flex items-center gap-4">
      <StarsSkeleton />
      <Shimmer className="h-4 w-24 rounded-full" />
      <Shimmer className="h-4 w-20 rounded-full" />
    </div>

    {/* Price */}
    <div className="flex items-end gap-3">
      <Shimmer className="h-9 w-28 rounded-lg" />
      <Shimmer className="h-6 w-20 rounded-lg" />
      <Shimmer className="h-5 w-16 rounded-full" />
    </div>

    <Shimmer className="h-px w-full rounded-full" />

    {/* Variants */}
    <div className="space-y-3">
      <Shimmer className="h-4 w-16 rounded-full" />
      <div className="flex gap-2 flex-wrap">
        {[...Array(4)].map((_, i) => (
          <Shimmer key={i} className="h-9 w-20 rounded-lg" />
        ))}
      </div>
    </div>

    <div className="space-y-3">
      <Shimmer className="h-4 w-12 rounded-full" />
      <div className="flex gap-2">
        {[...Array(5)].map((_, i) => (
          <Shimmer key={i} className="w-9 h-9 rounded-full" />
        ))}
      </div>
    </div>

    {/* Quantity + Actions */}
    <div className="flex items-center gap-3">
      <Shimmer className="h-11 w-32 rounded-xl" />
      <Shimmer className="h-11 flex-1 rounded-xl" />
      <Shimmer className="h-11 w-11 rounded-xl" />
    </div>

    {/* Delivery info */}
    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Shimmer className="w-8 h-8 rounded-lg" />
          <div className="space-y-1.5 flex-1">
            <Shimmer className="h-3.5 w-24 rounded-full" />
            <Shimmer className="h-3 w-36 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const RelatedProductSkeleton = () => (
  <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
    <Shimmer className="aspect-square w-full rounded-none" />
    <div className="p-3 space-y-2">
      <Shimmer className="h-3 w-4/5 rounded-full" />
      <Shimmer className="h-4 w-1/2 rounded-full" />
    </div>
  </div>
);

export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>

      <div className="container py-5 md:py-8">
        {/* Main product layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-10">
          <ImageGallerySkeleton />
          <ProductInfoSkeleton />
        </div>

        {/* Description tabs */}
        <div className="mt-10 space-y-4">
          <div className="flex gap-1 border-b border-gray-100 pb-0">
            {[...Array(4)].map((_, i) => (
              <Shimmer key={i} className="h-10 w-28 rounded-t-lg" />
            ))}
          </div>
          <div className="py-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <Shimmer key={i} className={`h-4 rounded-full ${i === 4 ? 'w-3/5' : 'w-full'}`} />
            ))}
          </div>
        </div>

        {/* Related products */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-5">
            <Shimmer className="h-6 w-40 rounded-lg" />
            <Shimmer className="h-8 w-24 rounded-full" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {[...Array(5)].map((_, i) => (
              <RelatedProductSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
