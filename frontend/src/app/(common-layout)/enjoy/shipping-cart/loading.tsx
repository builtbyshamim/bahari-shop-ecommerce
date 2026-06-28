const Shimmer = ({ className = '' }: { className?: string }) => (
  <div className={`relative overflow-hidden bg-gray-100 rounded-lg ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
  </div>
);

const CartItemSkeleton = () => (
  <div className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0">
    <Shimmer className="w-20 h-20 rounded-xl shrink-0" />
    <div className="flex-1 min-w-0 space-y-2">
      <Shimmer className="h-4 w-4/5 rounded-full" />
      <Shimmer className="h-3.5 w-1/3 rounded-full" />
      <div className="flex items-center gap-3 mt-2">
        <Shimmer className="h-8 w-24 rounded-xl" />
        <Shimmer className="h-5 w-16 rounded-full" />
      </div>
    </div>
    <div className="flex flex-col items-end gap-2 shrink-0">
      <Shimmer className="h-5 w-20 rounded-full" />
      <Shimmer className="h-7 w-7 rounded-lg" />
    </div>
  </div>
);

export default function CartLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`@keyframes shimmer { 100% { transform: translateX(100%); } }`}</style>

      <div className="container py-6 md:py-10">
        <Shimmer className="h-7 w-40 rounded-lg mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Cart items */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Shimmer className="h-5 w-32 rounded-lg" />
              <Shimmer className="h-4 w-20 rounded-full" />
            </div>
            {[...Array(4)].map((_, i) => (
              <CartItemSkeleton key={i} />
            ))}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
              <Shimmer className="h-5 w-36 rounded-lg" />
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Shimmer className="h-4 w-24 rounded-full" />
                  <Shimmer className="h-4 w-16 rounded-full" />
                </div>
              ))}
              <Shimmer className="h-px w-full rounded-full" />
              <div className="flex items-center justify-between">
                <Shimmer className="h-5 w-16 rounded-full" />
                <Shimmer className="h-6 w-24 rounded-lg" />
              </div>
              <Shimmer className="h-12 w-full rounded-xl" />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex gap-2">
                <Shimmer className="h-11 flex-1 rounded-xl" />
                <Shimmer className="h-11 w-20 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
