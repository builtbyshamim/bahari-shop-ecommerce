'use client';
import { addToCart } from '@/redux/features/cartSlice';
import { cartMenuToggle } from '@/redux/features/toggleSlice';
import { useAppDispatch } from '@/redux/hooks';
import Image from 'next/image';
import Link from 'next/link';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { HiViewfinderCircle } from 'react-icons/hi2';
import { FaHeart } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { toggleWishlist } from '@/redux/features/wishlistSlice';

const FALLBACK_IMAGE =
  'https://foodwithsunnah.com/wp-content/uploads/2025/02/Sukkari-Mufattal-1KG-247x247.jpeg';

function formatEndDate(endAt: string) {
  if (!endAt) return null;
  const date = new Date(endAt);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'Ending soon';
  if (diffDays === 1) return 'Ends today';
  if (diffDays <= 7) return `Ends in ${diffDays}d`;
  return `Ends ${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
}

const DealsOfferCard = ({ product }: { product: any }) => {
  const { name, slug, price, discountType, discountValue, endAt, category, thumbnail, id } =
    product;

  const dispatch = useAppDispatch();
  const { items } = useSelector((state: any) => state.wishlist);
  const isInWishlist = items?.some((item: any) => item.id === id);

  // Same discount calculation as TopDealsCard
  let oldPrice = Number(price) || 0;
  let newPrice = oldPrice;

  if (discountType === 'fixed') {
    newPrice = oldPrice - Number(discountValue || 0);
  }
  if (discountType === 'percent') {
    newPrice = oldPrice - (oldPrice * Number(discountValue || 0)) / 100;
  }
  if (newPrice < 0) newPrice = 0;

  const saveAmount = oldPrice - newPrice;

  const discountBadge = discountValue
    ? discountType === 'percent'
      ? `${discountValue}% OFF`
      : `৳${discountValue} OFF`
    : null;

  const endLabel = formatEndDate(endAt);

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        product_id: id,
        name,
        image: thumbnail?.url || FALLBACK_IMAGE,
        sale_price: newPrice, // ✅ calculated price
        without_discount_price: oldPrice, // ✅ original price
        quantity: 1,
        slug,
      }),
    );
    dispatch(cartMenuToggle());
  };

  const addWishlist = () => {
    dispatch(
      toggleWishlist({
        id,
        name,
        image: thumbnail?.url || FALLBACK_IMAGE,
        sale_price: newPrice,
        without_discount_price: oldPrice,
        category,
        slug,
      }),
    );
  };

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-primary-300 hover:shadow-lg transition-all duration-300 flex flex-col">
      {/* Discount Badge */}
      {discountBadge && (
        <div className="absolute top-3 left-3 z-10 bg-primary-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
          {discountBadge}
        </div>
      )}

      {/* Wishlist + Quick View */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={addWishlist}
          className="bg-white rounded-full p-1.5 shadow text-black-800 hover:text-primary-500 transition-colors"
        >
          {isInWishlist ? (
            <FaHeart className="w-4 h-4 text-primary-600" />
          ) : (
            <FiHeart className="w-4 h-4" />
          )}
        </button>
        <Link
          href={`/product-details/${category?.slug || 'default'}/${slug}`}
          className="bg-white rounded-full p-1.5 shadow text-black-800 hover:text-primary-500 transition-colors"
        >
          <HiViewfinderCircle className="w-4 h-4" />
        </Link>
      </div>

      {/* Image */}
      <div className="flex items-center justify-center overflow-hidden px-6 pt-8 pb-4 max-h-45 md:max-h-60">
        <Image
          width={240}
          height={240}
          src={thumbnail?.url || FALLBACK_IMAGE}
          alt={thumbnail?.altText || name}
          className="object-contain h-45 md:h-60 w-full group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Info Section */}
      <div className="flex flex-col px-4 pt-3 pb-4 flex-1 justify-between">
        <div className="flex flex-col gap-2">
          {/* Category */}
          <p className="text-[10px] font-semibold uppercase tracking-wider text-primary-500 truncate">
            {category?.name || 'Uncategorized'}
          </p>

          {/* Name */}
          <Link href={`/product-details/${category?.slug || 'default'}/${slug}`}>
            <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug hover:text-primary-500 transition-colors">
              {name}
            </h3>
          </Link>

          {/* Price — shows newPrice + oldPrice like TopDealsCard */}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-base font-bold text-primary-500">
              ৳{newPrice.toLocaleString('en-US')}
            </span>
            {saveAmount > 0 && (
              <span className="text-xs text-gray-400 line-through">
                ৳{oldPrice.toLocaleString('en-US')}
              </span>
            )}
          </div>

          {/* Save Badge — same as TopDealsCard */}
          {saveAmount > 0 && (
            <span className="inline-flex w-fit items-center rounded-full bg-green-100 px-3 py-1 text-[11px] font-bold text-green-600">
              Save ৳{saveAmount.toLocaleString('en-US')}
            </span>
          )}

          {/* End Date */}
          {endLabel && <p className="text-[10px] font-medium text-orange-500">{endLabel}</p>}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="mt-3 w-full flex items-center justify-center gap-2 border border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white text-[12px] sm:text-sm font-semibold py-2 rounded-lg transition-all duration-200 group-hover:bg-primary-500 group-hover:text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiShoppingCart className="w-4 h-4" />
          Add To Cart
        </button>
      </div>
    </div>
  );
};

export default DealsOfferCard;
