'use client';

import { addToCart } from '@/redux/features/cartSlice';
import { cartMenuToggle } from '@/redux/features/toggleSlice';
import { useAppDispatch } from '@/redux/hooks';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiShoppingCart } from 'react-icons/fi';
import { HiOutlineShoppingBag } from 'react-icons/hi2';

const FALLBACK_IMAGE =
  'https://foodwithsunnah.com/wp-content/uploads/2025/02/Sukkari-Mufattal-1KG-247x247.jpeg';

const DEAL_TYPE_LABEL: Record<string, string> = {
  top: 'Top Deal',
  flash: 'Flash Sale',
  campaign: 'Campaign',
};

const TopDealsCard = ({ product }: any) => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { name, slug, price, category, thumbnail, dealType, discountType, discountValue } = product;
  console.log(category, 'category'); // Debug log for category

  // ======================
  // PRICE CALCULATION
  // ======================

  let oldPrice = Number(price) || 0;
  let newPrice = oldPrice;

  if (discountType === 'fixed') {
    newPrice = oldPrice - Number(discountValue || 0);
  }

  if (discountType === 'percent') {
    newPrice = oldPrice - (oldPrice * Number(discountValue || 0)) / 100;
  }

  if (newPrice < 0) {
    newPrice = 0;
  }

  const saveAmount = oldPrice - newPrice;

  const discountBadge =
    discountType === 'percent' ? `${discountValue}% OFF` : `৳${discountValue} OFF`;

  const dealLabel = dealType ? DEAL_TYPE_LABEL[dealType] : null;

  const buildCartPayload = () => ({
    product_id: product.id,
    name: product.name,
    image: thumbnail?.url || FALLBACK_IMAGE,
    sale_price: newPrice,
    without_discount_price: oldPrice,
    quantity: 1,
    slug,
  });

  const handleAddToCart = () => {
    dispatch(addToCart(buildCartPayload()));
    dispatch(cartMenuToggle());
  };

  const handleBuyNow = () => {
    dispatch(addToCart(buildCartPayload()));
    router.push('/enjoy/checkout');
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-primary-100 bg-white shadow-sm transition-all  hover:border-primary-200 hover:shadow-md">
      {/* Gradient Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/0 via-orange-50/0 to-primary-100/20 opacity-0 transition duration-500 group-hover:opacity-100" />

      {/* Deal Badge */}
      {dealLabel && (
        <div className="absolute hidden md:block left-0 top-0 z-20">
          <div
            className={`rounded-br-2xl px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white sm:px-4 sm:text-xs ${
              dealType === 'flash'
                ? 'bg-red-500'
                : dealType === 'campaign'
                  ? 'bg-emerald-500'
                  : 'bg-orange-500'
            }`}
          >
            {dealLabel}
          </div>
        </div>
      )}

      {/* Discount Badge */}
      <div className="absolute right-2 top-2 z-20">
        <div className="rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-extrabold text-white shadow-md sm:px-3 sm:text-xs">
          {discountBadge}
        </div>
      </div>

      <div className="flex h-full flex-col sm:flex-row">
        {/* IMAGE SECTION */}
        <div className="relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-50 p-4 sm:w-[42%]">
          {/* Decorative Blur */}
          <div className="absolute h-24 w-24 rounded-full bg-orange-200/30 blur-3xl" />
          <Link
            href={`/product-details/${category?.slug || 'default'}/${slug}`}
            className="relative block h-40 w-full sm:h-52"
          >
            <Image
              src={thumbnail?.url || FALLBACK_IMAGE}
              alt={name}
              fill
              className="object-contain transition-transform duration-500 group-hover:scale-110"
            />
          </Link>
        </div>

        {/* CONTENT */}
        <div className="flex flex-1 flex-col justify-between p-3 sm:p-4 md:p-5">
          <div>
            {/* Category */}
            <p className="mb-2 text-[10px] font-medium md:font-semibold uppercase tracking-[2px] text-orange-500 sm:text-xs">
              {category?.name || 'Organic'}
            </p>

            {/* Product Name */}
            <Link href={`/product-details/${category?.slug || 'default'}/${slug}`}>
              <h3 className="line-clamp-2 text-sm sm:text-base font-semibold leading-snug text-gray-900 transition-colors duration-300 hover:text-orange-500 md:text-xl">
                {name}
              </h3>
            </Link>

            {/* Price */}
            <div className="mt-1 md:mt-3 flex flex-wrap items-center gap-2">
              <span className="text-base md:text-2xl font-extrabold text-orange-500 sm:text-3xl">
                ৳{newPrice}
              </span>

              {saveAmount > 0 && (
                <span className="text-xs sm:text-sm font-medium text-gray-400 line-through md:text-base pt-2">
                  ৳{oldPrice}
                </span>
              )}
            </div>

            {/* Save Badge */}
            {saveAmount > 0 && (
              <div className="mt-1 md:mt-5">
                <span className="inline-flex items-center rounded-full  bg-green-100 px-3 py-1 text-[11px] font-bold text-green-600 sm:text-xs">
                  Save ৳{saveAmount}
                </span>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="mt-2 md:mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {/* Add To Cart */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex h-8 sm:h-11 cursor-pointer flex-1 items-center justify-center gap-2 rounded-xl border border-orange-500 bg-white text-sm font-bold text-orange-500 transition-all duration-300 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50 z-10"
            >
              <FiShoppingCart className="h-4 w-4" />
              <span className="hidden sm:block">Add To Cart</span>
            </button>

            {/* Buy Now */}
            <button
              type="button"
              onClick={handleBuyNow}
              className="flex h-8 sm:h-11 z-10 cursor-pointer flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 text-[12px] sm:text-sm font-bold text-white shadow-lg shadow-orange-200 transition-all duration-300 hover:bg-orange-600 active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <HiOutlineShoppingBag className="h-4 w-4" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopDealsCard;
