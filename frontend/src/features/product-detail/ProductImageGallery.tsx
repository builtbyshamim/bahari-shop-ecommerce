import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react';
import Image from 'next/image';

const ProductImageGallery = ({ images, video }: any) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const nextImage = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
    setShowVideo(false);
  };

  const prevImage = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
    setShowVideo(false);
  };

  return (
    <div className="relative">
      {/* Main Image/Video Container */}
      <div className="relative aspect-square bg-black-100 rounded-xl overflow-hidden mb-4 group max-h-112.5 w-full">
        {!showVideo ? (
          <>
            <Image
              src={images[activeIndex]?.url}
              alt={images[activeIndex]?.alt}
              className={`w-full h-full object-cover transition-transform duration-300 ${
                isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
              }`}
              width={400}
              height={400}
              onClick={() => setIsZoomed(!isZoomed)}
            />

            {/* Navigation Arrows */}
            {images.length > 1 && !isZoomed && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                >
                  <ChevronLeft size={20} className="text-black-800" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                >
                  <ChevronRight size={20} className="text-black-800" />
                </button>
              </>
            )}

            {/* Video Button */}
            {video && !isZoomed && (
              <button
                onClick={() => setShowVideo(true)}
                className="absolute bottom-4 left-4 bg-black-800/90 hover:bg-primary-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
              >
                <Play size={18} />
                <span className="text-sm font-medium">Watch Demo</span>
              </button>
            )}
          </>
        ) : (
          <div className="relative w-full h-full bg-black-900">
            <video
              controls
              autoPlay
              className="w-full h-full object-contain"
              onEnded={() => setShowVideo(false)}
            >
              <source src={video} type="video/mp4" />
            </video>
            <button
              onClick={() => setShowVideo(false)}
              className="absolute top-4 right-4 bg-black-800/90 hover:bg-primary-500 text-white p-2 rounded-full transition-all"
            >
              <X size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {images.map((image: any, index: number) => (
          <button
            key={image.id}
            onClick={() => {
              setActiveIndex(index);
              setShowVideo(false);
              setIsZoomed(false);
            }}
            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
              index === activeIndex && !showVideo
                ? 'border-primary-500 shadow-md'
                : 'border-transparent hover:border-primary-300'
            }`}
          >
            <Image
              width={400}
              height={400}
              src={image.url}
              alt={image.alt}
              className="w-full h-full object-cover"
            />
          </button>
        ))}

        {video && (
          <button
            onClick={() => setShowVideo(true)}
            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 bg-black-100 flex items-center justify-center transition-all ${
              showVideo ? 'border-primary-500' : 'border-transparent hover:border-primary-300'
            }`}
          >
            <Play size={24} className="text-primary-500" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductImageGallery;
