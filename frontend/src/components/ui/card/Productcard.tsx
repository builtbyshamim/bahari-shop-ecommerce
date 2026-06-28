'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';
import { FaHeart, FaCheck } from 'react-icons/fa';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { HiViewfinderCircle } from 'react-icons/hi2';
import { Product } from '@/types/product';
import { useAppDispatch } from '@/redux/hooks';
import { addToCart } from '@/redux/features/cartSlice';
import { cartMenuToggle } from '@/redux/features/toggleSlice';
import { toggleWishlist } from '@/redux/features/wishlistSlice';
import { useSelector } from 'react-redux';

const FALLBACK_IMAGE =
  'https://foodwithsunnah.com/wp-content/uploads/2025/02/Sukkari-Mufattal-1KG-247x247.jpeg';

const ProductCard = ({ product }: { product: Product }) => {
  const { name, slug, price, compareAtPrice, discountPercent, category, thumbnail } = product;
  const dispatch = useAppDispatch();
  const [cartState, setCartState] = useState<'idle' | 'adding' | 'added'>('idle');

  const { items } = useSelector((state: any) => state.wishlist);
  const isInWishlist = items?.some((item: any) => item.id === product.id);

  const handleAddToCart = () => {
    if (cartState !== 'idle') return;

    const payload = {
      product_id: product.id,
      name: product.name,
      image: product.thumbnail?.url || FALLBACK_IMAGE,
      sale_price: product.price ?? undefined,
      without_discount_price: (product.compareAtPrice || product.price) ?? undefined,
      quantity: 1,
    };

    setCartState('adding');
    dispatch(addToCart(payload));

    setTimeout(() => {
      setCartState('added');
      dispatch(cartMenuToggle());
      setTimeout(() => setCartState('idle'), 1800);
    }, 900);
  };

  const addWishlist = () => {
    const payload = {
      id: product.id,
      name: product.name,
      image: product.thumbnail?.url || FALLBACK_IMAGE,
      sale_price: Number(product.price),
      without_discount_price: Number(product.compareAtPrice || product.price),
      quantity: 1,
      category,
      slug,
      rating: product.rating ?? undefined,
    };
    dispatch(toggleWishlist(payload));
  };

  const buttonContent = {
    idle: (
      <>
        <FiShoppingCart className="w-3 sm:w-4 h-3 sm:h-4" />
        Add To Cart
      </>
    ),
    adding: (
      <>
        <AiOutlineLoading3Quarters className="w-3 sm:w-4 h-3 sm:h-4 animate-spin" />
        Adding...
      </>
    ),
    added: (
      <>
        <FaCheck className="w-3 sm:w-4 h-3 sm:h-4" />
        Added!
      </>
    ),
  };

  const buttonStyles = {
    idle: 'border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white group-hover:bg-primary-500 group-hover:text-white hover:shadow-md active:scale-95',
    adding: 'bg-primary-500 text-white border-primary-500 cursor-not-allowed opacity-90',
    added: 'bg-green-600 text-white border-green-600 cursor-not-allowed',
  };

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-primary-300 hover:shadow-xl transition-all duration-500 ease-out flex flex-col h-full">
      {/* Discount Badge */}
      {discountPercent && (
        <div className="absolute top-3 left-3 z-10 bg-green-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
          Save {discountPercent}%
        </div>
      )}

      {/* Wishlist + Quick View */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 translate-x-8 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 ease-out">
        <button
          onClick={addWishlist}
          className="bg-white rounded-full p-1.5 shadow-md text-gray-400 hover:text-primary-500 hover:scale-110 active:scale-95 transition-all duration-200"
        >
          {isInWishlist ? (
            <FaHeart className="w-4 h-4 text-primary-500" />
          ) : (
            <FiHeart className="w-4 h-4" />
          )}
        </button>
        <Link
          href={`/product-details/${category?.slug || 'default'}/${slug}`}
          style={{ transitionDelay: '50ms' }}
          className="bg-white rounded-full p-1.5 shadow-md text-gray-400 hover:text-primary-500 hover:scale-110 active:scale-95 transition-all duration-200"
        >
          <HiViewfinderCircle className="w-4 h-4" />
        </Link>
      </div>

      {/* Image */}
      <Link
        href={`/product-details/${category?.slug || 'default'}/${slug}`}
        className="flex items-center justify-center overflow-hidden px-6 pt-8 pb-4 h-45 md:h-60"
      >
        <Image
          width={240}
          height={240}
          src={thumbnail?.url || FALLBACK_IMAGE}
          alt={thumbnail?.altText || name}
          className="object-contain h-full w-full group-hover:scale-105 transition-transform duration-500 ease-out"
        />
      </Link>

      {/* Info */}
      <div className="flex flex-col px-1.5 sm:px-3 md:px-4 pt-3 pb-4 flex-grow">
        <div className="flex-grow">
          <Link href={`/product-details/${category?.slug || 'default'}/${slug}`}>
            <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug hover:text-primary-500 transition-colors duration-200 h-10">
              {name}
            </h3>
          </Link>
        </div>

        <div className="mt-auto">
          <div className="flex items-center gap-2 mb-2">
            {price ? (
              <span className="text-base font-bold text-primary-500">
                ৳{price.toLocaleString('en-US')}
              </span>
            ) : (
              <span className="text-sm text-gray-400">No price</span>
            )}
            {compareAtPrice ? (
              <span className="text-xs text-gray-400 line-through">
                ৳{compareAtPrice.toLocaleString('en-US')}
              </span>
            ) : null}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={cartState !== 'idle'}
            className={`w-full flex items-center justify-center gap-2 border text-[11px] ms:text-sm font-semibold py-2 rounded-lg transition-all duration-300 ease-out ${buttonStyles[cartState]}`}
          >
            {buttonContent[cartState]}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
