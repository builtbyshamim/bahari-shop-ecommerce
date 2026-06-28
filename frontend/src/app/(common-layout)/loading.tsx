const Shimmer = ({ className = '' }: { className?: string }) => (
  <div className={`relative overflow-hidden bg-gray-100 rounded-lg ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
  </div>
);

const HeroSkeleton = () => (
  <section className="w-full bg-gray-50">
    <div className="container py-4 md:py-5">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-3">
          <Shimmer className="w-full h-[220px] sm:h-[300px] md:h-[360px] lg:h-[420px] rounded-xl" />
          <div className="flex justify-center gap-2 mt-3">
            {[...Array(4)].map((_, i) => (
              <Shimmer key={i} className={`h-2 rounded-full ${i === 0 ? 'w-6' : 'w-2'}`} />
            ))}
          </div>
        </div>
        <div className="lg:col-span-2">
          <Shimmer className="w-full h-[220px] sm:h-[300px] md:h-[360px] lg:h-[420px] rounded-xl" />
        </div>
      </div>
    </div>
  </section>
);

const CategorySkeleton = () => (
  <section className="py-6 md:py-8">
    <div className="container">
      <div className="flex items-center justify-between mb-5">
        <Shimmer className="h-6 w-36 rounded-lg" />
        <Shimmer className="h-4 w-20 rounded-full" />
      </div>
      <div className="flex gap-3 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 shrink-0">
            <Shimmer className="w-16 h-16 rounded-full" />
            <Shimmer className="h-3 w-14 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

const SectionHeaderSkeleton = () => (
  <div className="flex items-center justify-between mb-5">
    <div className="flex items-center gap-3">
      <Shimmer className="h-6 w-1.5 rounded-full" />
      <Shimmer className="h-6 w-40 rounded-lg" />
    </div>
    <Shimmer className="h-8 w-24 rounded-full" />
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

const ProductsGridSkeleton = ({ count = 10 }: { count?: number }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
    {[...Array(count)].map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

const BannerRowSkeleton = () => (
  <section className="py-4">
    <div className="container">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => (
          <Shimmer key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    </div>
  </section>
);

const TopRankingSkeleton = () => (
  <section className="py-6 md:py-8">
    <div className="container">
      <SectionHeaderSkeleton />
      <div className="flex gap-3 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="shrink-0 w-40 bg-white rounded-xl border border-gray-100 overflow-hidden">
            <Shimmer className="w-full h-32 rounded-none" />
            <div className="p-2.5 space-y-2">
              <Shimmer className="h-3 w-full rounded-full" />
              <Shimmer className="h-4 w-2/3 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>

      {/* Hero */}
      <HeroSkeleton />

      {/* Categories */}
      <CategorySkeleton />

      {/* New Arrivals */}
      <section className="py-6 md:py-8 bg-gray-50/50">
        <div className="container">
          <SectionHeaderSkeleton />
          <ProductsGridSkeleton count={10} />
        </div>
      </section>

      {/* Banner Row */}
      <BannerRowSkeleton />

      {/* Top Deals */}
      <section className="py-6 md:py-8">
        <div className="container">
          <SectionHeaderSkeleton />
          <ProductsGridSkeleton count={5} />
        </div>
      </section>

      {/* Top Rankings Slider */}
      <TopRankingSkeleton />

      {/* Testimonials */}
      <section className="py-8 bg-gray-50">
        <div className="container">
          <SectionHeaderSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 space-y-3">
                <div className="flex items-center gap-3">
                  <Shimmer className="w-10 h-10 rounded-full" />
                  <div className="space-y-1.5 flex-1">
                    <Shimmer className="h-3.5 w-24 rounded-full" />
                    <Shimmer className="h-3 w-16 rounded-full" />
                  </div>
                </div>
                <Shimmer className="h-3 w-full rounded-full" />
                <Shimmer className="h-3 w-5/6 rounded-full" />
                <Shimmer className="h-3 w-4/6 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
