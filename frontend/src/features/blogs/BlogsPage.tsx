'use client';
import { useState } from 'react';
import { Search, BookOpen, SlidersHorizontal } from 'lucide-react';
import { useGetAllBlogsQuery, useGetAllBlogCategoriesQuery } from '@/redux/api/blogApi';
import BlogCard from './BlogCard';

export default function BlogsPage() {
  const [search, setSearch] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState('');
  const [page, setPage] = useState(1);
  const LIMIT = 9;

  const { data: blogsData, isFetching } = useGetAllBlogsQuery({
    search: search || undefined,
    blogCategoryId: activeCategoryId || undefined,
    page,
    limit: LIMIT,
  });

  const { data: categoriesData } = useGetAllBlogCategoriesQuery(undefined);

  const blogs: any[] = blogsData?.data?.data ?? blogsData?.data ?? [];
  const meta = blogsData?.data?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const categories: any[] = categoriesData?.data ?? [];

  const handleCategoryChange = (id: string) => {
    setActiveCategoryId(id);
    setPage(1);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* ── Hero Header ─────────────────────────────────── */}
      <div className="relative bg-[#0f0f0d] py-16 md:py-24 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(233,91,12,0.14) 0%, transparent 70%)',
          }}
        />
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary-500" />

        <div className="relative container text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-8 h-px bg-primary-500/50" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-400">
              Natural Foods • Healthy Living • Nutrition Tips
            </span>
            <span className="w-8 h-px bg-primary-500/50" />
          </div>

          <h1
            className="text-4xl md:text-[3.2rem] font-bold text-white leading-none mb-4"
            style={{ letterSpacing: '-0.04em' }}
          >
            Healthy Living & <span className="text-primary-500">Natural Food Blog</span>
          </h1>

          <p className="text-[14px] text-gray-400 max-w-lg mx-auto leading-relaxed mb-8">
            Discover healthy recipes, nutrition tips, natural food benefits, and expert advice to
            help you and your family live a healthier lifestyle.
          </p>

          {/* Search bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search healthy articles..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white/8 text-white placeholder-gray-500 text-[13px] border border-white/10 rounded-full focus:outline-none focus:border-primary-500/60 focus:ring-2 focus:ring-primary-500/15 transition-all"
            />
          </div>
        </div>
      </div>

      {/* ── Category Filter ──────────────────────────────── */}
      {categories.length > 0 && (
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
          <div className="container">
            <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
              <SlidersHorizontal size={14} className="text-gray-400 shrink-0 mr-1" />
              <button
                onClick={() => handleCategoryChange('')}
                className={`shrink-0 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-full transition-all ${
                  activeCategoryId === ''
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {categories.map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`shrink-0 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-full transition-all ${
                    activeCategoryId === cat.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Blog Grid ────────────────────────────────────── */}
      <div className="container py-10 md:py-14">
        {isFetching ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse"
              >
                <div className="aspect-video bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-2.5 bg-gray-200 rounded-full w-24" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-5/6" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 mb-5">
              <BookOpen className="w-7 h-7 text-gray-400" />
            </div>
            <h3 className="text-gray-700 font-semibold text-xl mb-2">No articles found</h3>
            <p className="text-gray-400 text-sm mb-5">
              {search ? `No results for "${search}"` : 'No blog posts published yet.'}
            </p>
            {(search || activeCategoryId) && (
              <button
                onClick={() => {
                  setSearch('');
                  setActiveCategoryId('');
                }}
                className="px-6 py-2 bg-primary-500 text-white text-[12px] font-semibold rounded-full hover:bg-primary-600 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog: any, i: number) => (
                <BlogCard
                  key={blog.id}
                  {...blog}
                  featured={i === 0 && page === 1 && !search && !activeCategoryId}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-14">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-5 py-2 text-[12px] font-semibold border border-gray-200 rounded-full disabled:opacity-30 hover:border-primary-400 hover:text-primary-500 transition-colors"
                >
                  ← Prev
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-full text-[12px] font-semibold transition-all ${
                        p === page
                          ? 'bg-primary-500 text-white shadow-md shadow-primary-200'
                          : 'border border-gray-200 hover:border-primary-400 hover:text-primary-500'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-5 py-2 text-[12px] font-semibold border border-gray-200 rounded-full disabled:opacity-30 hover:border-primary-400 hover:text-primary-500 transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
