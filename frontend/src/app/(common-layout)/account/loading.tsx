const Shimmer = ({ className = '' }: { className?: string }) => (
  <div className={`relative overflow-hidden bg-gray-100 rounded-lg ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
  </div>
);

export default function AccountLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>

      <div className="container py-6 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-3">
            {/* Profile card */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 space-y-3">
              <div className="flex flex-col items-center gap-3">
                <Shimmer className="w-20 h-20 rounded-full" />
                <Shimmer className="h-5 w-32 rounded-lg" />
                <Shimmer className="h-3.5 w-44 rounded-full" />
              </div>
            </div>

            {/* Menu items */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 last:border-0">
                  <Shimmer className="w-5 h-5 rounded" />
                  <Shimmer className="h-4 flex-1 rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Main content */}
          <div className="md:col-span-3 space-y-4">
            {/* Header */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <Shimmer className="h-6 w-48 rounded-lg mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Shimmer className="h-3.5 w-24 rounded-full" />
                    <Shimmer className="h-10 w-full rounded-xl" />
                  </div>
                ))}
              </div>
              <Shimmer className="h-10 w-32 rounded-xl mt-5" />
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 space-y-2">
                  <Shimmer className="w-10 h-10 rounded-xl" />
                  <Shimmer className="h-6 w-12 rounded-lg" />
                  <Shimmer className="h-3.5 w-20 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
