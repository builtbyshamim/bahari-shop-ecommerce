'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, RefreshCw, ArrowLeft, AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const router = useRouter();

  return (
    <div className="min-h-[80vh] bg-gradient-to-br from-black-50 via-white to-red-50/20 flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full mx-auto text-center">

        {/* Icon */}
        <div className="relative mb-8 flex justify-center select-none">
          <div className="absolute w-40 h-40 rounded-full bg-red-100/60 blur-3xl" />
          <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center shadow-2xl shadow-red-300/40">
            <AlertTriangle className="w-12 h-12 text-white" strokeWidth={1.5} />
          </div>
        </div>

        {/* Number + Text */}
        <p className="text-[100px] md:text-[130px] font-black leading-none tracking-tighter bg-gradient-to-br from-red-400 to-orange-400 bg-clip-text text-transparent mb-4">
          500
        </p>

        <div className="mb-8 space-y-3">
          <h1 className="text-2xl md:text-3xl font-extrabold text-black-900">
            Something went wrong
          </h1>
          <p className="text-sm md:text-base text-black-500 leading-relaxed max-w-sm mx-auto">
            An unexpected server error occurred. Please reload the page or go back to the home page.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-500 to-orange-400 text-white text-sm font-bold hover:from-red-600 hover:to-red-500 active:scale-95 transition-all shadow-lg shadow-red-300/40"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white border-2 border-black-200 text-black-700 text-sm font-bold hover:border-black-300 hover:bg-black-50 active:scale-95 transition-all shadow-sm"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>

          <button
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white border-2 border-black-200 text-black-500 text-sm font-bold hover:border-black-300 hover:bg-black-50 active:scale-95 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
