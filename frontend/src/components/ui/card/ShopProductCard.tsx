'use client';
import Image from 'next/image';
import Link from 'next/link';
import { FiShoppingCart, FiHeart, FiStar } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { HiViewfinderCircle } from 'react-icons/hi2';
import { motion } from 'framer-motion';
import { useAppDispatch } from '@/redux/hooks';
import { cartMenuToggle } from '@/redux/features/toggleSlice';
import { addToCart } from '@/redux/features/cartSlice';
import { toggleWishlist } from '@/redux/features/wishlistSlice';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

const FALLBACK_IMAGE =
  'https://foodwithsunnah.com/wp-content/uploads/2025/02/Sukkari-Mufattal-1KG-247x247.jpeg';

interface ProductCardProps {
  product: any;
  listView?: boolean;
}

const ShopProductCard = ({ product, listView = false }: ProductCardProps) => {
  const {
    price,
    discountPercent,
    name,
    category,
    slug,
    compareAtPrice,
    vendor,
    rating,
    reviews,
    thumbnail,
    inStock = true,
  } = product;

  const dispatch = useAppDispatch();
  const { items } = useSelector((state: RootState) => state.wishlist);
  const isInWishlist = items?.some((item: { id: string | number }) => item.id === product.id);

  const handleAddToCart = () => {
    const payload = {
      product_id: product.id,
      name: product.name,
      image: product.thumbnail?.url || FALLBACK_IMAGE,
      sale_price: product.price ?? undefined,
      without_discount_price: (product.compareAtPrice || product.price) ?? undefined,
      quantity: 1,
    };
    dispatch(addToCart(payload));
    dispatch(cartMenuToggle());
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

  // ─── LIST VIEW ───────────────────────────────────────────────
  if (listView) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="group bg-white rounded-2xl overflow-hidden border border-black-200 hover:border-black-300 transition-all duration-300 flex flex-col sm:flex-row"
      >
        {/* Image */}
        <div className="relative w-full sm:w-36 sm:min-w-36 bg-black-100 flex items-center justify-center shrink-0 overflow-hidden">
          <Link
            href={`/product-details/${category?.slug || 'default'}/${slug}`}
            className="relative w-full h-44 sm:h-36"
          >
            <Image
              fill
              src={thumbnail?.url || FALLBACK_IMAGE}
              alt={name}
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, 144px"
            />
          </Link>
          {discountPercent && (
            <span className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
              Save {discountPercent}%
            </span>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 p-3 sm:p-4 flex flex-col gap-1.5 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-primary-500 mb-1">
                {category?.name || 'Uncategorized'}
              </p>
              <Link href={`/product-details/${category?.slug || 'default'}/${slug}`}>
                <h3 className="text-sm font-medium text-black-800 leading-snug line-clamp-2 sm:line-clamp-1 hover:text-primary-500 transition-colors">
                  {name}
                </h3>
              </Link>
              {vendor && <p className="text-xs text-black-500 mt-0.5">By: {vendor}</p>}
            </div>
            <button
              onClick={addWishlist}
              className="w-8 h-8 rounded-full border border-black-200 flex items-center justify-center shrink-0 text-black-400 hover:border-primary-400 hover:text-primary-500 transition-colors"
            >
              {isInWishlist ? (
                <FaHeart className="w-3.5 h-3.5 text-red-500" />
              ) : (
                <FiHeart className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {rating && (
            <div className="flex items-center gap-1.5">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-black-200 fill-black-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-black-400">({reviews})</span>
            </div>
          )}

          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 mt-auto pt-3 border-t border-black-100">
            <div className="flex items-baseline gap-2">
              {compareAtPrice && (
                <span className="text-xs text-black-400 line-through">
                  ৳{compareAtPrice.toLocaleString('en-US')}
                </span>
              )}
              <span className="text-lg font-semibold text-primary-500">
                ৳{price?.toLocaleString('en-US')}
              </span>
            </div>

            <div className="flex items-center gap-2 w-full xs:w-auto">
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className="flex-1 xs:flex-none flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 border border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white text-xs font-semibold rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FiShoppingCart className="w-3.5 h-3.5 shrink-0" />
                <span>Add to cart</span>
              </button>
              <Link
                href={`/product-details/${category?.slug || 'default'}/${slug}`}
                className="w-9 h-9 shrink-0 border border-black-200 rounded-lg flex items-center justify-center text-black-400 hover:border-primary-400 hover:text-primary-500 transition-colors"
              >
                <HiViewfinderCircle className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {!inStock && <p className="text-[10px] font-medium text-danger-base">Out of stock</p>}
        </div>
      </motion.div>
    );
  }

  // ─── GRID VIEW ───────────────────────────────────────────────
  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-primary-300 hover:shadow-lg transition-all duration-300 flex flex-col">
      {/* Discount Badge */}
      {discountPercent && (
        <div className="absolute top-3 left-3 z-10 bg-green-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
          Save {discountPercent}%
        </div>
      )}

      {/* Wishlist + Quick View */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={addWishlist}
          className="bg-white rounded-full p-1.5 shadow text-gray-400 hover:text-red-500 transition-colors"
        >
          {isInWishlist ? (
            <FaHeart className="w-4 h-4 text-red-500" />
          ) : (
            <FiHeart className="w-4 h-4" />
          )}
        </button>
        <Link
          href={`/product-details/${category?.slug || 'default'}/${slug}`}
          className="bg-white rounded-full p-1.5 shadow text-gray-400 hover:text-primary-500 transition-colors"
        >
          <HiViewfinderCircle className="w-4 h-4" />
        </Link>
      </div>

      {/* Image */}
      <Link
        href={`/product-details/${category?.slug || 'default'}/${slug}`}
        className="flex items-center justify-center overflow-hidden px-6 pt-8 pb-4 max-h-45 md:max-h-60"
      >
        <Image
          width={240}
          height={240}
          src={thumbnail?.url || FALLBACK_IMAGE}
          alt={thumbnail?.altText || name}
          className="object-contain h-45 md:h-60 w-full group-hover:scale-105 transition-transform duration-300"
        />
      </Link>

      {/* Info */}
      <div className="flex flex-col gap-2 px-4 pt-3 pb-4 flex-1">
        <Link href={`/product-details/${category?.slug || 'default'}/${slug}`}>
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug hover:text-primary-500 transition-colors min-h-[2.5rem]">
            {name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-2 mt-1">
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

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className="mt-2 w-full flex items-center justify-center gap-2 border border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white text-[12px] ms:text-sm font-semibold py-2 rounded-lg transition-all duration-200 group-hover:bg-primary-500 group-hover:text-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <FiShoppingCart className="w-4 h-4" />
          Add To Cart
        </button>

        {!inStock && (
          <p className="text-[10px] font-medium text-danger-base text-center">Out of stock</p>
        )}
      </div>
    </div>
  );
};

export default ShopProductCard;
