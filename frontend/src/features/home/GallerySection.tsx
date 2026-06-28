'use client';

import Link from 'next/link';
import { useGetPublicGalleryQuery } from '@/redux/api/galleryApi';
import { FaPlay } from 'react-icons/fa';
import { FiExternalLink } from 'react-icons/fi';

interface GalleryItem {
  id: string;
  title: string | null;
  mediaType: 'image' | 'video';
  imageUrl: string;
  videoUrl: string | null;
  link: string | null;
  sortOrder: number;
}

const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden bg-gray-200 animate-pulse aspect-square" />
);

const VideoCard = ({ item }: { item: GalleryItem }) => (
  <a
    href={item.videoUrl ?? '#'}
    target="_blank"
    rel="noopener noreferrer"
    className="group relative block rounded-2xl overflow-hidden aspect-square shadow-sm hover:shadow-lg transition-shadow duration-300"
  >
    <img
      src={item.imageUrl}
      alt={item.title ?? 'gallery video'}
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
    {/* Dark overlay */}
    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-300" />

    {/* Play button */}
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
        <FaPlay size={18} className="text-gray-800 ml-1" />
      </div>
    </div>

    {/* Title + external link icon at bottom */}
    {(item.title || item.videoUrl) && (
      <div className="absolute bottom-0 left-0 right-0 px-3 py-2.5 bg-gradient-to-t from-black/70 to-transparent">
        <div className="flex items-end justify-between gap-2">
          {item.title && (
            <p className="text-white text-xs font-medium leading-tight line-clamp-2">{item.title}</p>
          )}
          <FiExternalLink size={13} className="text-white/70 shrink-0" />
        </div>
      </div>
    )}
  </a>
);

const ImageCard = ({ item }: { item: GalleryItem }) => {
  const inner = (
    <div className="group relative block rounded-2xl overflow-hidden aspect-square shadow-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer">
      <img
        src={item.imageUrl}
        alt={item.title ?? 'gallery image'}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

      {/* Title at bottom on hover */}
      {item.title && (
        <div className="absolute bottom-0 left-0 right-0 px-3 py-2.5 translate-y-full group-hover:translate-y-0 bg-gradient-to-t from-black/60 to-transparent transition-transform duration-300">
          <p className="text-white text-xs font-medium leading-tight">{item.title}</p>
        </div>
      )}
    </div>
  );

  if (item.link) {
    const isExternal = item.link.startsWith('http');
    if (isExternal) {
      return (
        <a href={item.link} target="_blank" rel="noopener noreferrer">
          {inner}
        </a>
      );
    }
    return <Link href={item.link}>{inner}</Link>;
  }

  return inner;
};

const GallerySection = () => {
  const { data, isLoading } = useGetPublicGalleryQuery();
  const items: GalleryItem[] = data?.data || [];

  if (!isLoading && items.length === 0) return null;

  return (
    <section className="w-full bg-[#f9f7f4] py-10 md:py-14">
      <div className="container">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#D5D5D5] pb-2 mb-8">
          <h2 className="text-xl md:text-2xl text-black-900 font-semibold uppercase tracking-tight">
            Gallery
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {items.map((item) =>
              item.mediaType === 'video' ? (
                <VideoCard key={item.id} item={item} />
              ) : (
                <ImageCard key={item.id} item={item} />
              ),
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default GallerySection;
