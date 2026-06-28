const Shimmer = ({ className = '' }: { className?: string }) => (
  <div className={`relative overflow-hidden bg-gray-100 rounded-lg ${className}`}>
    <div
      className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent"
      style={{ animation: 'shimmer 1.5s infinite' }}
    />
    <style>{`@keyframes shimmer { 100% { transform: translateX(100%); } }`}</style>
  </div>
);

export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm">
    <Shimmer className="aspect-square w-full rounded-none" />
    <div className="p-3 space-y-2.5">
      <Shimmer className="h-3 w-2/3 mx-auto rounded-full" />
      <Shimmer className="h-4 w-full rounded-full" />
      <Shimmer className="h-4 w-4/5 mx-auto rounded-full" />
      <div className="flex items-center justify-center gap-2 pt-1">
        <Shimmer className="h-5 w-16 rounded-full" />
        <Shimmer className="h-4 w-12 rounded-full" />
      </div>
      <Shimmer className="h-8 w-full rounded-lg" />
    </div>
  </div>
);

const ProductsGridSkeleton = ({ count = 10 }: { count?: number }) => (
  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 md:gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

export default ProductsGridSkeleton;
