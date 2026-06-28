'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar, Clock, Tag, ChevronRight, ArrowLeft,
  Facebook, Twitter, Share2,
} from 'lucide-react';
import { useGetBlogBySlugQuery, useGetAllBlogsQuery } from '@/redux/api/blogApi';
import BlogCard from './BlogCard';

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function readingTime(content?: string | null) {
  if (!content) return 1;
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function ShareButtons({ title }: { title: string }) {
  const url = typeof window !== 'undefined' ? window.location.href : '';

  const copyLink = () => {
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mr-1">Share</span>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-500 transition-all"
      >
        <Facebook size={14} />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-sky-500 hover:text-white text-gray-500 transition-all"
      >
        <Twitter size={14} />
      </a>
      <button
        onClick={copyLink}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-primary-500 hover:text-white text-gray-500 transition-all"
        title="Copy link"
      >
        <Share2 size={14} />
      </button>
    </div>
  );
}

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: blogRes, isLoading, isError } = useGetBlogBySlugQuery(slug);
  const blog = blogRes?.data ?? blogRes;

  const { data: relatedRes } = useGetAllBlogsQuery(
    { blogCategoryId: blog?.blogCategoryId, limit: 3 },
    { skip: !blog?.blogCategoryId },
  );
  const relatedBlogs: any[] = (relatedRes?.data?.data ?? relatedRes?.data ?? []).filter(
    (b: any) => b.slug !== slug,
  ).slice(0, 3);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6]">
        <div className="container py-12 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-48 mb-8" />
          <div className="h-96 bg-gray-200 rounded-2xl mb-8" />
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="space-y-3 mt-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-3.5 bg-gray-200 rounded" style={{ width: `${85 + Math.random() * 15}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !blog) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-6xl font-black text-gray-200 mb-4">404</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Article Not Found</h2>
          <p className="text-gray-500 text-sm mb-6">This article doesn&apos;t exist or has been removed.</p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white text-[13px] font-semibold rounded-full hover:bg-primary-600 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const mins = readingTime(blog.content);

  return (
    <div className="min-h-screen bg-[#FAF9F6]">

      {/* ── Hero Image ─────────────────────────────────────── */}
      {blog.thumbnail && (
        <div className="w-full h-[45vh] md:h-[55vh] max-h-[600px] relative overflow-hidden bg-gray-900">
          <img
            src={blog.thumbnail}
            alt={blog.title}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Title overlay on image */}
          <div className="absolute bottom-0 left-0 right-0 container pb-10">
            {blog.blogCategory && (
              <span className="inline-block bg-primary-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 mb-4">
                {blog.blogCategory.name}
              </span>
            )}
            <h1
              className="text-white font-bold text-2xl md:text-4xl lg:text-5xl leading-tight max-w-4xl"
              style={{ letterSpacing: '-0.03em' }}
            >
              {blog.title}
            </h1>
          </div>
        </div>
      )}

      {/* ── Article ────────────────────────────────────────── */}
      <div className="container py-10 md:py-14">
        <div className="max-w-3xl mx-auto">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-6">
            <Link href="/" className="hover:text-primary-500 transition-colors">Home</Link>
            <ChevronRight size={11} />
            <Link href="/blog" className="hover:text-primary-500 transition-colors">Blog</Link>
            <ChevronRight size={11} />
            <span className="text-gray-600 line-clamp-1">{blog.title}</span>
          </nav>

          {/* Title (shown when no hero image) */}
          {!blog.thumbnail && (
            <h1
              className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-6"
              style={{ letterSpacing: '-0.03em' }}
            >
              {blog.title}
            </h1>
          )}

          {/* Meta bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-gray-200 mb-8">
            <div className="flex flex-wrap items-center gap-4 text-[12px] text-gray-500">
              <span className="flex items-center gap-1.5">
                <Calendar size={12} className="text-primary-400" />
                {formatDate(blog.createdAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={12} className="text-primary-400" />
                {mins} min read
              </span>
              {blog.blogCategory && (
                <span className="flex items-center gap-1.5">
                  <Tag size={12} className="text-primary-400" />
                  {blog.blogCategory.name}
                </span>
              )}
            </div>
            <ShareButtons title={blog.title} />
          </div>

          {/* Short description lead */}
          {blog.shortDescription && (
            <p className="text-[16px] text-gray-600 leading-relaxed font-medium mb-8 border-l-4 border-primary-500 pl-5 italic">
              {blog.shortDescription}
            </p>
          )}

          {/* Related product */}
          {blog.product && (
            <Link
              href={`/product-details/${blog.product.category?.slug || 'product'}/${blog.product.slug}`}
              className="flex items-center gap-4 p-4 bg-white border border-primary-100 rounded-xl mb-8 hover:border-primary-300 transition-colors group"
            >
              {blog.product.images?.[0]?.url && (
                <img
                  src={blog.product.images[0].url}
                  alt={blog.product.name}
                  className="w-16 h-16 object-cover rounded-lg shrink-0"
                />
              )}
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-primary-500 mb-0.5">Featured Product</p>
                <p className="font-semibold text-gray-900 text-sm group-hover:text-primary-500 transition-colors truncate">
                  {blog.product.name}
                </p>
                {blog.product.basePrice && (
                  <p className="text-[12px] text-gray-500 mt-0.5">৳{Number(blog.product.basePrice).toLocaleString()}</p>
                )}
              </div>
              <div className="ml-auto shrink-0 text-primary-500 font-semibold text-[12px]">Shop Now →</div>
            </Link>
          )}

          {/* Main HTML content */}
          {blog.content ? (
            <div
              className="blog-prose"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          ) : (
            <p className="text-gray-400 italic text-center py-12">No content available for this article.</p>
          )}

          {/* Bottom share + back */}
          <div className="flex items-center justify-between pt-8 mt-10 border-t border-gray-200">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-[12px] font-semibold text-gray-500 hover:text-primary-500 transition-colors"
            >
              <ArrowLeft size={14} />
              All Articles
            </Link>
            <ShareButtons title={blog.title} />
          </div>
        </div>
      </div>

      {/* ── Related Posts ───────────────────────────────────── */}
      {relatedBlogs.length > 0 && (
        <div className="bg-white border-t border-gray-100 py-12 md:py-16">
          <div className="container">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-px bg-primary-500/60" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500">More Articles</span>
              <span className="w-6 h-px bg-primary-500/60" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8" style={{ letterSpacing: '-0.03em' }}>
              Related Reads
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedBlogs.map((b: any) => (
                <BlogCard key={b.id} {...b} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
