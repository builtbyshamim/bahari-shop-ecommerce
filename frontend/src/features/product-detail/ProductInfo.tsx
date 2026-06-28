import React, { useState, useEffect, useRef } from 'react';
import {
  Star,
  ShoppingCart,
  Heart,
  Share2,
  TrendingUp,
  Check,
  Truck,
  Shield,
  Zap,
  Copy,
  CheckCheck,
  Package,
  Flame,
  Tag,
} from 'lucide-react';
import { simplePricePreview } from '@/helpers/CommonMethod';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '@/redux/features/cartSlice';
import { toggleWishlist } from '@/redux/features/wishlistSlice';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { cartMenuToggle } from '@/redux/features/toggleSlice';
import { useGetDealByProductIdQuery } from '@/redux/api/dealApi';

const ProductInfo = ({ product, productDetails, onVariantChange, onLiveChartClick }: any) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [copied, setCopied] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  const wishlistItems = useSelector((state: any) => state.wishlist?.items ?? []);
  const isWishlisted = wishlistItems.some((item: any) => item.id === productDetails?.id);

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!productDetails?.options?.length) return;
    const initial: Record<string, string> = {};
    productDetails.options.forEach((opt: any) => {
      if (opt.values?.length) initial[opt.id] = opt.values[0].id;
    });
    setSelectedOptions(initial);
  }, [productDetails]);

  const matchedVariant = React.useMemo(() => {
    if (!productDetails?.variants?.length) return null;
    const selectedValueIds = Object.values(selectedOptions);
    if (!selectedValueIds.length) return null;
    return (
      productDetails.variants.find((variant: any) => {
        const variantValueIds = variant.variantOptionValues.map((v: any) => v.option_value_id);
        return (
          selectedValueIds.length === variantValueIds.length &&
          selectedValueIds.every((id) => variantValueIds.includes(id))
        );
      }) ?? null
    );
  }, [selectedOptions, productDetails]);

  useEffect(() => {
    onVariantChange?.(matchedVariant ?? null);
  }, [matchedVariant]);

  useEffect(() => {
    const el = actionsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const activePrice = matchedVariant?.price ?? productDetails?.basePrice ?? 0;
  const activeComparePrice = matchedVariant?.compareAtPrice ?? productDetails?.compareAtPrice;

  const discountPercent = simplePricePreview({
    price: parseFloat(activePrice),
    comparePrice: activeComparePrice ? parseFloat(activeComparePrice) : undefined,
  });

  // ── Deal pricing ────────────────────────────────────────────────
  const { data: dealData } = useGetDealByProductIdQuery(productDetails?.id, {
    skip: !productDetails?.id,
  });

  const dealInfo = dealData?.data;
  const rawPrice = parseFloat(String(activePrice));

  let effectiveSalePrice: number;
  let effectiveOriginalPrice: number | null;
  let dealDiscountPercent: number | null = null;

  if (dealInfo) {
    const dv = Number(dealInfo.discountValue);
    effectiveSalePrice =
      dealInfo.discountType === 'percent'
        ? Math.max(0, rawPrice - (rawPrice * dv) / 100)
        : Math.max(0, rawPrice - dv);
    effectiveSalePrice = Math.round(effectiveSalePrice * 100) / 100;
    effectiveOriginalPrice = rawPrice;
    dealDiscountPercent =
      dealInfo.discountType === 'percent'
        ? dv
        : Math.round(((rawPrice - effectiveSalePrice) / rawPrice) * 100);
  } else {
    effectiveSalePrice = rawPrice;
    effectiveOriginalPrice = activeComparePrice ? parseFloat(String(activeComparePrice)) : null;
  }

  const handleOptionSelect = (optionId: string, valueId: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionId]: valueId }));
  };

  const getValueStatus = (
    optionId: string,
    valueId: string,
  ): 'inStock' | 'outOfStock' | 'noVariant' => {
    const hypothetical = { ...selectedOptions, [optionId]: valueId };
    const hypotheticalValueIds = Object.values(hypothetical);
    const matched = productDetails.variants?.find((variant: any) => {
      const variantValueIds = variant.variantOptionValues.map((v: any) => v.option_value_id);
      return (
        hypotheticalValueIds.length === variantValueIds.length &&
        hypotheticalValueIds.every((id) => variantValueIds.includes(id))
      );
    });
    if (!matched) return 'noVariant';
    return matched.stock > 0 ? 'inStock' : 'outOfStock';
  };

  const buildSelectedVariantOptions = (): Record<string, string> => {
    if (!productDetails?.options?.length) return {};
    return productDetails.options.reduce((acc: Record<string, string>, option: any) => {
      const selectedValueId = selectedOptions[option.id];
      if (!selectedValueId) return acc;
      const matched = option.values.find((v: any) => v.id === selectedValueId);
      if (matched) acc[option.name] = matched.value;
      return acc;
    }, {});
  };

  const buildCartPayload = () => ({
    product_id: productDetails.id,
    image: productDetails.images?.[0]?.url,
    assigned_variant_price_id: matchedVariant?.id || '',
    name: productDetails?.name,
    sale_price: effectiveSalePrice,
    without_discount_price: effectiveOriginalPrice ?? effectiveSalePrice,
    quantity,
    selected_variant_options: buildSelectedVariantOptions(),
  });

  const handleAddToCart = () => {
    try {
      dispatch(addToCart(buildCartPayload()));
      toast.success('Added to cart!');
      dispatch(cartMenuToggle());
    } catch (error) {
      console.log(error);
    }
  };

  const handleBuyNow = () => {
    try {
      dispatch(addToCart(buildCartPayload()));
      router.push('/enjoy/checkout');
    } catch (error) {
      console.log(error);
    }
  };

  const handleWishlist = () => {
    dispatch(
      toggleWishlist({
        id: productDetails.id,
        name: productDetails.name,
        sale_price: effectiveSalePrice,
        without_discount_price: effectiveOriginalPrice ?? effectiveSalePrice,
        image: productDetails.images?.[0]?.url,
        slug: productDetails.slug,
        category: productDetails.category,
      }),
    );
    toast.success(isWishlisted ? 'Removed from saved items' : 'Saved to wishlist!');
  };

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try {
        await navigator.share({ title: productDetails?.name, url });
      } catch {}
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        toast.success('Link copied!');
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const isOutOfStock = matchedVariant ? matchedVariant.stock <= 0 : false;

  return (
    <div className="space-y-5">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="space-y-2">
        <h1 className="text-2xl lg:text-3xl font-bold text-black-800 leading-tight">
          {productDetails?.name}
        </h1>
        <div className="flex items-center gap-3 flex-wrap text-sm">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={15}
                  className={
                    i < Math.floor(product.vendorRating ?? 0)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-black-300 fill-black-200'
                  }
                />
              ))}
            </div>
            <span className="text-black-500 font-medium">
              {product.vendorRating ?? '0'}{' '}
              <span className="font-normal text-black-400">
                ({product.vendor?.totalReviews ?? 0} reviews)
              </span>
            </span>
          </div>

          {productDetails?.sku && (
            <span className="text-black-400">
              SKU:{' '}
              <span className="text-black-600">{matchedVariant?.sku || productDetails.sku}</span>
            </span>
          )}

          {productDetails?.brand && (
            <span className="bg-primary-100 text-primary-700 px-2.5 py-0.5 rounded-full font-medium text-xs">
              {productDetails.brand.name}
            </span>
          )}
        </div>
      </div>

      {/* ─── Deal Badge ─────────────────────────────────────────── */}
      {dealInfo && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            {dealInfo.dealType == 'top' ? <Flame size={11} /> : <Tag size={11} />}
            {dealInfo.dealType == 'top'
              ? 'TOP DEAL'
              : dealInfo.dealType == 'flash'
                ? 'FLASH SALE'
                : 'CAMPAIGN'}
            &nbsp;·&nbsp;
            {dealInfo.discountType == 'percent'
              ? `${dealInfo.discountValue}% OFF`
              : `৳${dealInfo.discountValue} OFF`}
          </span>
          {dealInfo.endAt && (
            <span className="text-xs text-red-500 font-medium">
              Ends{' '}
              {new Date(dealInfo.endAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
              })}
            </span>
          )}
        </div>
      )}

      {/* ─── Price ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-end gap-3 flex-wrap">
          <span className={`text-3xl font-bold ${dealInfo ? 'text-red-600' : 'text-black-900'}`}>
            ৳{effectiveSalePrice.toFixed(2)}
          </span>
          {effectiveOriginalPrice !== null && (
            <span className="text-lg text-black-400 line-through">
              ৳{effectiveOriginalPrice.toFixed(2)}
            </span>
          )}
          {dealDiscountPercent !== null && (
            <span className="bg-red-100 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full text-sm font-semibold">
              {dealDiscountPercent}% OFF
            </span>
          )}
          {!dealInfo && discountPercent !== null && (
            <span className="bg-green-100 text-green-700 border border-green-200 px-2.5 py-0.5 rounded-full text-sm font-semibold">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {productDetails?.bulkPricingTiers?.length > 0 && (
          <button
            onClick={onLiveChartClick}
            className="flex items-center gap-1.5 text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
          >
            <TrendingUp size={16} />
            Bulk pricing
          </button>
        )}
      </div>

      {/* ─── Stock status ────────────────────────────────────────── */}
      {matchedVariant && (
        <div className="flex items-center gap-2">
          {matchedVariant.stock > 0 ? (
            <>
              <span className="inline-flex items-center gap-1.5 text-green-600 text-sm font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                In Stock
              </span>
              {matchedVariant.stock <= 10 && (
                <span className="text-orange-500 text-xs">(Only {matchedVariant.stock} left)</span>
              )}
            </>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-red-500 text-sm font-medium">
              <span className="w-2 h-2 bg-red-500 rounded-full" />
              Out of Stock
            </span>
          )}
        </div>
      )}

      {/* ─── Options ─────────────────────────────────────────────── */}
      {productDetails?.options?.length > 0 && (
        <div className="space-y-4">
          {productDetails.options.map((option: any) => {
            const isColor = option.name.toLowerCase() === 'color';
            const selectedLabel = option.values.find(
              (v: any) => v.id === selectedOptions[option.id],
            )?.value;

            return (
              <div key={option.id}>
                <p className="text-sm font-semibold text-black-700 mb-2">
                  {option.name}
                  {selectedLabel && (
                    <span className="ml-1.5 font-normal text-black-500">— {selectedLabel}</span>
                  )}
                </p>

                <div className="flex flex-wrap gap-2">
                  {option.values.map((val: any) => {
                    const isSelected = selectedOptions[option.id] === val.id;
                    const status = getValueStatus(option.id, val.id);
                    const unavailable = status === 'noVariant' || status === 'outOfStock';

                    if (isColor) {
                      return (
                        <button
                          key={val.id}
                          onClick={() => handleOptionSelect(option.id, val.id)}
                          title={val.value}
                          className={`relative w-9 h-9 rounded-full border-2 transition-all ${
                            isSelected
                              ? 'border-primary-500 ring-2 ring-primary-200 scale-110'
                              : unavailable
                                ? 'border-black-200 opacity-40 cursor-not-allowed'
                                : 'border-black-200 hover:border-primary-400 hover:scale-105'
                          }`}
                        >
                          <span
                            className="absolute inset-1 rounded-full"
                            style={{ backgroundColor: val.colorHex || val.value.toLowerCase() }}
                          />
                          {isSelected && (
                            <span className="absolute inset-0 flex items-center justify-center">
                              <Check size={14} className="text-white drop-shadow" />
                            </span>
                          )}
                          {unavailable && (
                            <span className="absolute inset-0 flex items-center justify-center rounded-full overflow-hidden">
                              <span className="absolute w-full h-px bg-black-400 rotate-45" />
                            </span>
                          )}
                        </button>
                      );
                    }

                    return (
                      <button
                        key={val.id}
                        onClick={() => !unavailable && handleOptionSelect(option.id, val.id)}
                        title={
                          status === 'outOfStock'
                            ? 'Out of stock'
                            : status === 'noVariant'
                              ? 'Not available'
                              : val.value
                        }
                        className={`relative px-4 py-1.5 rounded-lg border-2 text-sm font-medium transition-all select-none
                          ${
                            isSelected
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : unavailable
                                ? 'border-black-200 text-black-300 cursor-not-allowed line-through'
                                : 'border-black-200 text-black-600 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50/50'
                          }`}
                      >
                        {val.value}
                        {isSelected && (
                          <span className="absolute -top-1.5 -right-1.5 bg-primary-500 rounded-full w-4 h-4 flex items-center justify-center">
                            <Check size={9} className="text-white" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Short Description ───────────────────────────────────── */}
      {productDetails?.shortDescription && (
        <div
          dangerouslySetInnerHTML={{ __html: productDetails.shortDescription }}
          className="text-sm text-black-600 bg-black-50 border border-black-100 rounded-xl p-4 leading-relaxed"
        />
      )}

      {/* ─── Quantity + Actions ───────────────────────────────────── */}
      <div ref={actionsRef} className="space-y-3">
        {/* Quantity row */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-black-600 shrink-0">Qty:</span>
          <div className="flex items-center border-2 border-black-200 rounded-xl overflow-hidden h-10">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="w-10 h-full text-lg text-black-600 hover:bg-black-100 disabled:opacity-40 transition-colors font-medium"
            >
              −
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              className="w-12 h-full text-center border-x-2 border-black-200 text-sm font-semibold focus:outline-none bg-white"
            />
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-10 h-full text-lg text-black-600 hover:bg-black-100 transition-colors font-medium"
            >
              +
            </button>
          </div>
        </div>

        {/* Main action buttons */}
        <div className="flex gap-2.5">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="flex-1 h-10 sm:h-12 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl  font-normal text-sm md:text-base sm:font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <ShoppingCart size={19} />
            Add to Cart
          </button>

          <button
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className="flex-1 h-10 sm:h-12 bg-black-900 hover:bg-black-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-normal text-sm md:text-base sm:font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Zap size={19} />
            Buy Now
          </button>
        </div>

        {/* Secondary actions */}
        <div className="flex gap-2.5">
          <button
            onClick={handleWishlist}
            className={`flex-1 h-10 sm:h-11 rounded-xl border-2 font-medium text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
              isWishlisted
                ? 'border-primary-500 bg-red-50 text-primary-500'
                : 'border-black-200 text-black-600 hover:border-primary-500 hover:bg-red-50 hover:text-primary-500'
            }`}
          >
            <Heart
              size={18}
              fill={isWishlisted ? 'currentColor' : 'none'}
              className="transition-all"
            />
            {isWishlisted ? 'Saved' : 'Wishlist'}
          </button>

          <button
            onClick={handleShare}
            className="flex-1 h-10 sm:h-11 rounded-xl border-2 border-black-200 text-black-600 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600 font-medium text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            {copied ? <CheckCheck size={18} className="text-green-500" /> : <Share2 size={18} />}
            {copied ? 'Copied!' : 'Share'}
          </button>
        </div>
      </div>

      {/* ─── Trust badges ────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-black-100">
        {[
          { icon: Truck, label: 'Fast Delivery' },
          { icon: Shield, label: 'Secure Payment' },
          { icon: Package, label: 'Easy Returns' },
        ].map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-black-50 text-center"
          >
            <Icon size={18} className="text-primary-500" />
            <span className="text-xs text-black-600 font-medium leading-tight">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductInfo;
