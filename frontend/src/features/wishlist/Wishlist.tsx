'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { toggleWishlist } from '@/redux/features/wishlistSlice';
import { addToCart } from '@/redux/features/cartSlice';
import { cartMenuToggle } from '@/redux/features/toggleSlice';

const FALLBACK_IMAGE =
  'https://foodwithsunnah.com/wp-content/uploads/2025/02/Sukkari-Mufattal-1KG-247x247.jpeg';

const WishlistPublicPage = () => {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state: any) => state.wishlist.items);

  const handleRemoveFromWishlist = (item: any) => {
    dispatch(toggleWishlist(item)); // toggleWishlist will remove if already present
  };

  const handleAddToCart = (item: any) => {
    const payload = {
      product_id: item.id,
      name: item.name,
      image: item.image || FALLBACK_IMAGE,
      sale_price: item.sale_price,
      without_discount_price: item.without_discount_price,
      quantity: 1,
    };
    dispatch(addToCart(payload));
    dispatch(cartMenuToggle());
  };

  const getDiscountPercent = (salePrice: number, originalPrice: number) => {
    if (originalPrice && originalPrice > salePrice) {
      return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
    }
    return null;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">My Wishlist</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Your curated collection of favorite items. Add them to cart or remove them anytime.
        </p>
      </div>

      {wishlistItems && wishlistItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-6">
          {wishlistItems.map((item: any) => {
            const discountPercent = getDiscountPercent(
              item.sale_price,
              item.without_discount_price,
            );

            // Build the product detail URL
            const productDetailUrl = item.category?.slug
              ? `/product-details/${item.category.slug}/${item.slug}`
              : `/product/${item.id}`; // fallback

            return (
              <div
                key={item.id}
                className="group relative bg-white rounded-lg overflow-hidden shadow hover:shadow-md transition-all duration-300 border border-gray-100"
              >
                {/* Discount Badge */}
                {discountPercent && (
                  <div className="absolute top-3 left-3 z-10 bg-black text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xs md:text-sm">
                    -{discountPercent}%
                  </div>
                )}

                {/* Image Container */}
                <div className="relative overflow-hidden bg-gray-50 aspect-square">
                  <Image
                    width={250}
                    height={250}
                    src={item.image || FALLBACK_IMAGE}
                    alt={item.name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                  />

                  {/* Action Icons */}
                  <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => handleRemoveFromWishlist(item)}
                      className="bg-white cursor-pointer rounded-full p-2 shadow-md text-red-500 transition-colors duration-300 hover:bg-red-50"
                      aria-label="Remove from wishlist"
                    >
                      <FaHeart className="w-5 h-5" />
                    </button>
                    <Link
                      href={productDetailUrl}
                      className="bg-white cursor-pointer rounded-full p-2 shadow-md text-primary-500 transition-colors duration-300 hover:bg-gray-100"
                      aria-label="View product details"
                    >
                      <FiHeart className="w-5 h-5" /> {/* Replace with appropriate icon */}
                    </Link>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="absolute bg-primary-500 text-white hover:bg-primary-600 bottom-0 left-0 right-0 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 translate-y-0 sm:translate-y-full sm:group-hover:translate-y-0"
                  >
                    <FiShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-2 md:p-4 space-y-2">
                  {/* Category */}
                  {item.category?.name && (
                    <div className="text-xs text-primary-400 text-center font-medium tracking-wider uppercase">
                      {item.category.name}
                    </div>
                  )}

                  {/* Title with Link */}
                  <Link href={productDetailUrl}>
                    <h3 className="text-xs md:text-sm font-medium text-center text-gray-800 line-clamp-2 min-h-10 leading-relaxed hover:text-black transition-colors cursor-pointer">
                      {item.name}
                    </h3>
                  </Link>

                  {/* Price */}
                  <div className="flex items-center justify-center gap-2">
                    {item.without_discount_price && (
                      <span className="text-xs md:text-sm text-gray-400 line-through">
                        ৳ {item.without_discount_price.toLocaleString('en-US')}
                      </span>
                    )}
                    <span className="text-base md:text-lg font-bold text-gray-900">
                      ৳ {item.sale_price.toLocaleString('en-US')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <FaHeart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Your wishlist is empty</h3>
          <p className="text-gray-500 mb-6">Start adding your favourite items to the wishlist!</p>
          <Link
            href="/shop"
            className="inline-flex items-center px-6 py-3 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      )}
    </div>
  );
};

export default WishlistPublicPage;
