import React from 'react';

const Shimmer = ({ className = '', style }: { className?: string; style?: React.CSSProperties }) => (
  <div className={`relative overflow-hidden bg-gray-100 rounded-lg ${className}`} style={style}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
  </div>
);

const ProductCardSkeleton = () => (
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

const FilterSidebarSkeleton = () => (
  <div className="space-y-5">
    {/* Price range */}
    <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
      <Shimmer className="h-4 w-24 rounded-full" />
      <Shimmer className="h-2 w-full rounded-full" />
      <div className="flex justify-between">
        <Shimmer className="h-7 w-20 rounded-lg" />
        <Shimmer className="h-7 w-20 rounded-lg" />
      </div>
    </div>

    {/* Categories */}
    <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-2.5">
      <Shimmer className="h-4 w-28 rounded-full mb-1" />
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-2.5">
          <Shimmer className="h-4 w-4 rounded" />
          <Shimmer className="h-3.5 rounded-full" style={{ width: `${60 + i * 8}px` }} />
        </div>
      ))}
    </div>

    {/* Ratings */}
    <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-2.5">
      <Shimmer className="h-4 w-20 rounded-full mb-1" />
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-2.5">
          <Shimmer className="h-4 w-4 rounded" />
          <Shimmer className="h-3.5 w-24 rounded-full" />
        </div>
      ))}
    </div>
  </div>
);

export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>

      <div className="container py-5 md:py-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Shimmer className="h-5 w-36 rounded-lg" />
            <Shimmer className="h-5 w-16 rounded-full" />
          </div>
          <div className="flex items-center gap-2">
            <Shimmer className="h-9 w-28 rounded-lg hidden sm:block" />
            <Shimmer className="h-9 w-9 rounded-lg" />
            <Shimmer className="h-9 w-9 rounded-lg" />
          </div>
        </div>

        <div className="flex gap-5">
          {/* Sidebar */}
          <div className="hidden lg:block w-60 shrink-0">
            <FilterSidebarSkeleton />
          </div>

          {/* Products */}
          <div className="flex-1 min-w-0">
            {/* Active filters */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {[...Array(3)].map((_, i) => (
                <Shimmer key={i} className="h-7 w-24 rounded-full" />
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {[...Array(12)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-2 mt-8">
              {[...Array(5)].map((_, i) => (
                <Shimmer key={i} className={`h-9 rounded-lg ${i === 1 ? 'w-9 bg-orange-100' : 'w-9'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
