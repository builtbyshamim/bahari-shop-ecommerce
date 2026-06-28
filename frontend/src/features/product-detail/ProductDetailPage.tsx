'use client';
import React, { useState } from 'react';
import ProductImageGallery from './ProductImageGallery';
import ProductInfo from './ProductInfo';
import ProductTabs from './ProductTabs';
import RelatedProducts from './RelatedProducts';
import RelatedSearches from './RelatedSearche';
import Link from 'next/link';
import QuickAddToCart from './QuickAddToCart';

const ProductDetailPage = ({ slug, productDetails }: any) => {
  const productCategory = productDetails?.category;
  const [selectedVariant, setSelectedVariant] = useState(null);

  if (!productDetails) {
    return <ProductNotFound />;
  }

  return (
    <div className=" min-h-screen py-4 md:py-8">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs md:text-sm mb-4 md:mb-6 text-black-500 overflow-hidden">
          <Link href="/" className="hover:text-primary-500 transition-colors shrink-0">
            Home
          </Link>
          <span className="shrink-0">/</span>
          <Link
            href={`/product-details/${productCategory?.slug}`}
            className="hover:text-primary-500 transition-colors shrink-0 hidden sm:inline"
          >
            {productCategory?.name || 'uncategorized'}
          </Link>
          <span className="shrink-0 hidden sm:inline">/</span>
          <span className="text-black-800 font-medium truncate">{productDetails?.name}</span>
        </nav>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6 mb-4 md:mb-6">
          <div className="bg-white rounded-xl p-3 md:p-4 shadow-sm">
            <ProductImageGallery images={productDetails.images} video={null} />
          </div>

          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
            <ProductInfo
              product={productDetails}
              productDetails={productDetails}
              onVariantChange={(v: any) => setSelectedVariant(v)}
              onLiveChartClick={() => {}}
            />
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm mb-4 md:mb-6">
          <ProductTabs
            description={productDetails?.description}
            specifications={productDetails?.specifications}
            productId={productDetails?.id}
          />
        </div>

        {/* Related Searches */}
        {productDetails?.seoMeta?.keywords?.length > 0 && (
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm mb-4 md:mb-6">
            <RelatedSearches
              searches={productDetails.seoMeta.keywords}
              category={productDetails.category}
            />
          </div>
        )}

        {/* Related Products */}
        <RelatedProducts
          slug={slug}
          category={productDetails?.category?.slug}
          vendor={productDetails?.vendor_id}
        />
        <div className="mt-6">
          <QuickAddToCart product={productDetails} />
        </div>
      </div>
    </div>
  );
};

// Not Found Component
const ProductNotFound = () => {
  return (
    <div className="bg-black-100 min-h-screen flex items-center justify-center">
      <div className="text-center bg-white p-12 rounded-2xl shadow-sm max-w-md">
        <div className="text-primary-500 text-7xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-black-800 mb-2">Product Not Found</h2>
        <p className="text-black-500 mb-6">
          The product you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/categories"
            className="border border-black-300 text-black-700 px-6 py-3 rounded-lg hover:bg-black-100 transition-colors"
          >
            Browse
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
