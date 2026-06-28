import Link from 'next/link';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

interface BlogCardProps {
  slug: string;
  title: string;
  shortDescription?: string | null;
  thumbnail?: string | null;
  blogCategory?: { name: string; slug?: string } | null;
  createdAt: string;
  content?: string | null;
  featured?: boolean;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function readingTime(content?: string | null) {
  if (!content) return 1;
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default function BlogCard({
  slug,
  title,
  shortDescription,
  thumbnail,
  blogCategory,
  createdAt,
  content,
  featured = false,
}: BlogCardProps) {
  const mins = readingTime(content);

  return (
    <Link
      href={`/blog/${slug}`}
      className="group flex flex-col bg-white overflow-hidden border border-gray-100 hover:border-primary-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-2xl"
    >
      {/* Thumbnail */}
      <div className={`relative overflow-hidden bg-gray-100 shrink-0 ${featured ? 'aspect-[16/10]' : 'aspect-video'}`}>
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

        {/* Category badge */}
        {blogCategory && (
          <span className="absolute top-3 left-3 bg-primary-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1">
            {blogCategory.name}
          </span>
        )}
      </div>

      {/* Body */}
      <div className={`flex flex-col flex-1 ${featured ? 'p-6' : 'p-5'}`}>
        {/* Meta */}
        <div className="flex items-center gap-3 text-[11px] text-gray-400 mb-3">
          <span className="flex items-center gap-1.5">
            <Calendar size={10} />
            {formatDate(createdAt)}
          </span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span className="flex items-center gap-1.5">
            <Clock size={10} />
            {mins} min read
          </span>
        </div>

        {/* Title */}
        <h3
          className={`font-bold text-gray-900 leading-snug mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors ${
            featured ? 'text-[1.2rem]' : 'text-[15px]'
          }`}
        >
          {title}
        </h3>

        {/* Description */}
        {shortDescription && (
          <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-3 flex-1 mb-4">
            {shortDescription}
          </p>
        )}

        {/* CTA */}
        <div className="mt-auto flex items-center gap-1.5 text-[12px] font-semibold text-primary-500 group-hover:gap-3 transition-all duration-200">
          Read Article
          <ArrowRight size={13} />
        </div>
      </div>
    </Link>
  );
}
