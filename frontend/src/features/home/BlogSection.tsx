'use client';
import Link from 'next/link';
import { ArrowRight, Calendar, UtensilsCrossed } from 'lucide-react';
import { useGetAllBlogsQuery } from '@/redux/api/blogApi';

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function readingTime(content?: string | null) {
  if (!content) return 1;
  return Math.max(
    1,
    Math.ceil(
      content
        .replace(/<[^>]*>/g, '')
        .split(/\s+/)
        .filter(Boolean).length / 200,
    ),
  );
}

const FOOD_PLACEHOLDERS = ['🍜', '🍕', '🥘', '🍱', '🫕', '🍛'];

const BlogCard = ({ blog, index }: { blog: any; index: number }) => (
  <Link
    href={`/blog/${blog.slug}`}
    className="group flex flex-col rounded-2xl overflow-hidden border border-orange-100/60 hover:border-orange-200/80 hover:-translate-y-1.5 transition-all duration-300"
    style={{
      background: 'linear-gradient(180deg, #fffcf7 0%, #ffffff 100%)',
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    }}
  >
    {/* Image */}
    <div className="relative aspect-[16/10] overflow-hidden">
      {blog.thumbnail ? (
        <img
          src={blog.thumbnail}
          alt={blog.title}
          className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #fff4e6 0%, #ffe8cc 100%)' }}
        >
          <span className="text-6xl select-none">
            {FOOD_PLACEHOLDERS[index % FOOD_PLACEHOLDERS.length]}
          </span>
        </div>
      )}

      {/* Bottom fade */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

      {/* Category badge */}
      {blog.blogCategory && (
        <span
          className="absolute top-3.5 left-3.5 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
          style={{
            background: 'linear-gradient(135deg, #ea5d0b 0%, #f97316 100%)',
            boxShadow: '0 2px 8px rgba(234,93,11,0.35)',
          }}
        >
          {blog.blogCategory.name}
        </span>
      )}

      {/* Bottom progress bar on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 via-primary-500 to-orange-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
    </div>

    {/* Content */}
    <div className="p-5 flex flex-col flex-1">
      {/* Meta */}
      <div className="flex items-center gap-3 text-[11px] text-gray-400 mb-3">
        <span className="flex items-center gap-1.5">
          <Calendar size={10} className="text-primary-400" />
          {formatDate(blog.createdAt)}
        </span>
        <span className="w-1 h-1 rounded-full bg-orange-200" />
        <span className="flex items-center gap-1.5">
          <UtensilsCrossed size={10} className="text-primary-400" />
          {readingTime(blog.content)} min read
        </span>
      </div>

      {/* Title */}
      <h3 className="text-[15px] font-bold text-gray-900 leading-snug mb-2.5 line-clamp-2 group-hover:text-primary-500 transition-colors duration-200">
        {blog.title}
      </h3>

      {/* Excerpt */}
      {blog.shortDescription && (
        <p className="text-[12.5px] text-gray-500 leading-relaxed line-clamp-2 mb-4 flex-1">
          {blog.shortDescription}
        </p>
      )}

      {/* CTA */}
      <div className="flex items-center gap-1.5 mt-auto pt-3 border-t border-orange-50">
        <span className="text-[12px] font-bold text-primary-500 group-hover:text-primary-600 transition-colors">
          Explore Story
        </span>
        <ArrowRight
          size={13}
          className="text-primary-500 group-hover:translate-x-1.5 transition-transform duration-200"
        />
      </div>
    </div>
  </Link>
);

const BlogSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="rounded-2xl overflow-hidden border border-orange-100/40 animate-pulse"
        style={{ background: 'linear-gradient(180deg, #fffcf7 0%, #fff 100%)' }}
      >
        <div className="aspect-[16/10] bg-orange-50" />
        <div className="p-5 space-y-3">
          <div className="h-2.5 bg-orange-50 rounded-full w-24" />
          <div className="h-4 bg-orange-50 rounded w-3/4" />
          <div className="h-3.5 bg-orange-50 rounded w-full" />
          <div className="h-3.5 bg-orange-50 rounded w-4/5" />
          <div className="h-3 bg-orange-50 rounded w-1/3 mt-3" />
        </div>
      </div>
    ))}
  </div>
);

export default function BlogSection() {
  const { data, isLoading } = useGetAllBlogsQuery({ limit: 3, page: 1 });
  const blogs: any[] = data?.data?.data ?? data?.data ?? [];

  if (!isLoading && blogs.length === 0) return null;

  return (
    <section
      className="w-full py-14 md:py-20"
      style={{ background: 'linear-gradient(180deg, #fdf8f2 0%, #FAF9F6 100%)' }}
    >
      <div className="container">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-10 gap-4">
          <div className="shrink-0">
            {/* Label chip */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center text-base"
                style={{ background: 'linear-gradient(135deg, #fff4e6 0%, #ffe0c2 100%)' }}
              >
                🍳
              </span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-primary-500">
                Food Stories
              </span>
            </div>

            <h2
              className="text-xl sm:text-2xl md:text-[38px] font-medium text-[#0f0f0d] leading-none"
              style={{ letterSpacing: '-0.04em' }}
            >
              Bahari Shop Blogs
            </h2>
          </div>

          <div className="hidden md:block w-full h-px bg-gradient-to-r from-orange-200 to-transparent mx-6" />

          <Link
            href="/blog"
            className="shrink-0 flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-primary-500 hover:text-[#0f0f0d] transition-colors group"
          >
            View All
            <ArrowRight
              size={13}
              className="group-hover:translate-x-1 transition-transform duration-200"
            />
          </Link>
        </div>

        {isLoading ? (
          <BlogSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.slice(0, 3).map((blog: any, i: number) => (
              <BlogCard key={blog.id} blog={blog} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
