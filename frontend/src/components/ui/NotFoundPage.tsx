'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, ShoppingBag, ArrowLeft, Search, PackageX } from 'lucide-react';

interface NotFoundPageProps {
  title?: string;
  message?: string;
  showSearch?: boolean;
}

export default function NotFoundPage({
  title = 'Page Not Found',
  message = 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.',
  showSearch = true,
}: NotFoundPageProps) {
  const router = useRouter();

  return (
    <div className="min-h-[80vh] bg-gradient-to-br from-black-50 via-white to-primary-50/30 flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full mx-auto text-center">
        {/* Animated 404 number */}
        <div className="relative mb-8 select-none">
          {/* Background glow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 rounded-full bg-primary-100/60 blur-3xl" />
          </div>

          {/* Icon */}
          <div className="relative flex justify-center mb-4">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-500 to-orange-400 flex items-center justify-center shadow-2xl shadow-primary-300/40">
              <PackageX className="w-12 h-12 text-white" strokeWidth={1.5} />
            </div>
          </div>

          {/* 404 */}
          <div className="relative">
            <p className="text-[120px] md:text-[160px] font-black leading-none tracking-tighter bg-gradient-to-br from-primary-500 via-primary-400 to-orange-400 bg-clip-text text-transparent">
              404
            </p>
            {/* Decorative dots */}
            <span className="absolute top-4 -left-2 w-4 h-4 rounded-full bg-primary-200 opacity-60" />
            <span className="absolute bottom-4 -right-2 w-6 h-6 rounded-full bg-orange-200 opacity-60" />
            <span className="absolute top-1/2 -right-6 w-3 h-3 rounded-full bg-primary-300 opacity-50" />
          </div>
        </div>

        {/* Text */}
        <div className="mb-8 space-y-3">
          <h1 className="text-2xl md:text-3xl font-extrabold text-black-900 tracking-tight">
            {title}
          </h1>
          <p className="text-sm md:text-base text-black-500 leading-relaxed max-w-sm mx-auto">
            {message}
          </p>
        </div>

        {/* Search bar */}
        {showSearch && (
          <div className="mb-8">
            <Link
              href="/shop"
              className="group flex items-center gap-3 w-full bg-white border-2 border-black-200 hover:border-primary-400 rounded-2xl px-4 py-3.5 text-sm text-black-400 font-medium transition-all shadow-sm hover:shadow-md hover:shadow-primary-100/40"
            >
              <Search className="w-4 h-4 text-black-300 group-hover:text-primary-400 transition-colors flex-shrink-0" />
              <span className="group-hover:text-primary-400 transition-colors">
                Search for products...
              </span>
            </Link>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-primary-500 to-orange-400 text-white text-sm font-bold hover:from-primary-600 hover:to-primary-500 active:scale-95 transition-all shadow-lg shadow-primary-300/40 hover:shadow-primary-300/60"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>

          <Link
            href="/shop"
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white border-2 border-black-200 text-black-700 text-sm font-bold hover:border-black-300 hover:bg-black-50 active:scale-95 transition-all shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            Shop Now
          </Link>

          <button
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white border-2 border-black-200 text-black-500 text-sm font-bold hover:border-black-300 hover:bg-black-50 active:scale-95 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

        {/* Help text */}
        <p className="mt-8 text-xs text-black-400">
          Need help?{' '}
          <Link href="/contact" className="text-primary-500 font-semibold hover:underline">
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
}
