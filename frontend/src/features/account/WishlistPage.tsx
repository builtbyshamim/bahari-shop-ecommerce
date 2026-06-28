'use client';

import { useState } from 'react';
import { Heart, Star, X } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import AccountLayout from './AccountLayout';
import { toggleWishlist } from '@/redux/features/wishlistSlice';
import { addToCart } from '@/redux/features/cartSlice';
import { cartMenuToggle } from '@/redux/features/toggleSlice';
import Image from 'next/image';

const FALLBACK_IMAGE =
  'https://foodwithsunnah.com/wp-content/uploads/2025/02/Sukkari-Mufattal-1KG-247x247.jpeg';

const Stars = ({ r }: { r: number }) => (
  <span className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        size={10}
        className={s <= Math.round(r) ? 'fill-primary-400 text-primary-400' : 'text-gray-300'}
      />
    ))}
  </span>
);

export default function WishlistPage() {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state: any) => state.wishlist.items);

  const handleRemoveFromWishlist = (item: any) => {
    dispatch(toggleWishlist(item)); // toggles again to remove
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
    <AccountLayout activeTab="wishlist">
      {!wishlistItems || wishlistItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 py-20 flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
            <Heart size={28} className="text-primary-400" />
          </div>
          <p className="text-sm font-bold text-gray-700">Your wishlist is empty</p>
          <p className="text-xs text-gray-400">Save products you love!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {wishlistItems.map((item: any) => {
            const discountPercent = getDiscountPercent(
              item.sale_price,
              item.without_discount_price,
            );
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-primary-200 hover:shadow-md transition-all group"
              >
                {/* Image */}
                <div className="relative h-36 bg-primary-50 overflow-hidden">
                  <Image
                    width={250}
                    height={250}
                    src={item.image || FALLBACK_IMAGE}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {discountPercent && (
                    <span className="absolute top-2 left-2 bg-primary-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      -{discountPercent}%
                    </span>
                  )}
                  <button
                    onClick={() => handleRemoveFromWishlist(item)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-500 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <X size={12} />
                  </button>
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="text-xs font-semibold text-gray-800 truncate leading-snug mb-1">
                    {item.name}
                  </p>
                  {item.rating ? <Stars r={item.rating} /> : null}
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-sm font-bold text-gray-900">
                      ৳{item.sale_price.toLocaleString('en-US')}
                    </span>
                    {item.without_discount_price && (
                      <span className="text-[11px] text-gray-400 line-through">
                        ৳{item.without_discount_price.toLocaleString('en-US')}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="mt-2.5 w-full py-2 bg-primary-500 hover:bg-primary-600 text-white text-[11px] font-bold rounded-xl transition-colors active:scale-95"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AccountLayout>
  );
}
