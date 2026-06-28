'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FiShoppingCart } from 'react-icons/fi';
import { useAppDispatch } from '@/redux/hooks';
import { useSelector } from 'react-redux';
import { addToCart } from '@/redux/features/cartSlice';
import { cartMenuToggle } from '@/redux/features/toggleSlice';

const FALLBACK_IMAGE =
  'https://foodwithsunnah.com/wp-content/uploads/2025/02/Sukkari-Mufattal-1KG-247x247.jpeg';

const RelatedProductCard = ({ product }: any) => {
  const { name, slug, price, compareAtPrice, discountPercent, category, thumbnail } = product;
  const dispatch = useAppDispatch();
  const handleAddToCart = () => {
    const payload = {
      product_id: product.id,
      name: product.name,
      image: thumbnail?.url || FALLBACK_IMAGE,
      sale_price: price ?? undefined,
      without_discount_price: (compareAtPrice || price) ?? undefined,
      quantity: 1,
    };
    dispatch(addToCart(payload));
    dispatch(cartMenuToggle());
  };

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-primary-300 hover:shadow-md transition-all duration-300 flex flex-col h-full">
      {/* Discount Badge */}
      {discountPercent && (
        <div className="absolute top-2 left-2 z-10 bg-green-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
          -{discountPercent}%
        </div>
      )}

      {/* Image */}
      <Link
        href={`/product-details/${category?.slug || 'default'}/${slug}`}
        className="flex items-center justify-center overflow-hidden px-4 pt-5 pb-3 h-36 md:h-44"
      >
        <Image
          width={180}
          height={180}
          src={thumbnail?.url || FALLBACK_IMAGE}
          alt={thumbnail?.altText || name}
          className="object-contain h-full w-full group-hover:scale-105 transition-transform duration-300"
        />
      </Link>

      {/* Info */}
      <div className="flex flex-col px-2.5 pt-2 pb-3 flex-grow">
        {/* Category */}
        <span className="text-[10px] text-primary-400 font-medium uppercase tracking-wider">
          {category?.name ?? 'Uncategorized'}
        </span>

        {/* Name */}
        <div className="flex-grow mt-0.5">
          <Link href={`/product-details/${category?.slug || 'default'}/${slug}`}>
            <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug hover:text-primary-500 transition-colors h-8">
              {name}
            </h3>
          </Link>
        </div>

        {/* Price + Button */}
        <div className="mt-auto pt-2">
          <div className="flex items-center gap-1.5 mb-2">
            {price ? (
              <span className="text-sm font-bold text-primary-500">
                ৳{Number(price).toLocaleString('en-US')}
              </span>
            ) : (
              <span className="text-xs text-gray-400">No price</span>
            )}
            {compareAtPrice ? (
              <span className="text-[11px] text-gray-400 line-through">
                ৳{Number(compareAtPrice).toLocaleString('en-US')}
              </span>
            ) : null}
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center gap-1.5 border border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white text-[11px] font-semibold py-1.5 rounded-lg transition-all duration-200 group-hover:bg-primary-500 group-hover:text-white cursor-pointer"
          >
            <FiShoppingCart className="w-3 h-3" />
            Add To Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default RelatedProductCard;
