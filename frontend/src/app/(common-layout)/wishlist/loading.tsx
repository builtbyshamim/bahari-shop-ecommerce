const Shimmer = ({ className = '' }: { className?: string }) => (
  <div className={`relative overflow-hidden bg-gray-100 rounded-lg ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
  </div>
);

export default function WishlistLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`@keyframes shimmer { 100% { transform: translateX(100%); } }`}</style>

      <div className="container py-6 md:py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Shimmer className="h-7 w-7 rounded-xl" />
            <Shimmer className="h-6 w-32 rounded-lg" />
            <Shimmer className="h-5 w-10 rounded-full" />
          </div>
          <Shimmer className="h-9 w-28 rounded-xl" />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm">
              <div className="relative">
                <Shimmer className="aspect-square w-full rounded-none" />
                <Shimmer className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full" />
              </div>
              <div className="p-3 space-y-2.5">
                <Shimmer className="h-3 w-2/3 mx-auto rounded-full" />
                <Shimmer className="h-4 w-full rounded-full" />
                <div className="flex items-center justify-center gap-2">
                  <Shimmer className="h-5 w-16 rounded-full" />
                  <Shimmer className="h-4 w-12 rounded-full" />
                </div>
                <Shimmer className="h-8 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
