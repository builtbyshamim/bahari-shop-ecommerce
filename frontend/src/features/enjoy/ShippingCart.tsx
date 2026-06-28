'use client';

import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ArrowLeft,
  Tag,
  ChevronRight,
  Star,
  Flame,
  Search,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { removeFromCart, updateQuantity, clearCart } from '@/redux/features/cartSlice';
import { addToCart } from '@/redux/features/cartSlice';
import Image from 'next/image';
import { useGetShopProductsQuery } from '@/redux/api/productApi';
import { useState, useEffect, useRef, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Product {
  product_id: string;
  name: string;
  image?: string;
  sale_price: number;
  without_discount_price: number;
  quantity: number;
  assigned_variant_price_id?: string;
  selected_variant_options?: Record<string, string>;
}

const FALLBACK_IMAGE =
  'https://foodwithsunnah.com/wp-content/uploads/2025/02/Sukkari-Mufattal-1KG-247x247.jpeg';

// ─── Star Rating ─────────────────────────────────────────────────────────────
const Stars = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        size={11}
        className={s <= Math.round(rating) ? 'fill-primary-400 text-primary-400' : 'text-black-300'}
      />
    ))}
  </div>
);

// ─── Variant Badges ───────────────────────────────────────────────────────────
const VariantBadges = ({ options }: { options?: Record<string, string> }) => {
  if (!options || Object.keys(options).length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {Object.entries(options).map(([key, value]) => {
        const isColor = key.toLowerCase() === 'color';
        return (
          <span
            key={key}
            className="inline-flex items-center gap-1 text-[10px] font-medium text-black-600 bg-black-100 border border-black-200 rounded-md px-1.5 py-0.5"
          >
            {isColor && (
              <span
                className="w-2.5 h-2.5 rounded-full border border-black-300 flex-shrink-0"
                style={{ backgroundColor: value.toLowerCase() }}
              />
            )}
            <span className="text-black-400">{key}:</span>
            <span className="text-black-700">{value}</span>
          </span>
        );
      })}
    </div>
  );
};

// ─── Cart Row Item ────────────────────────────────────────────────────────────
const CartRow = ({ product, index }: { product: Product; index: number }) => {
  const dispatch = useAppDispatch();
  const saving = product.without_discount_price - product.sale_price;
  const discountPct = Math.round((saving / product.without_discount_price) * 100);

  return (
    <div className="flex gap-3 p-3 sm:p-4 bg-white rounded-2xl border border-black-200 hover:border-primary-200 hover:shadow-sm transition-all duration-200">
      {/* Image */}
      <div className="relative w-[72px] h-[72px] sm:w-24 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden bg-black-50 border border-black-200">
        {product.image ? (
          <Image
            width={200}
            height={200}
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-black-300">
            <ShoppingBag size={28} />
          </div>
        )}
        {discountPct > 0 && (
          <span className="absolute top-1 left-1 bg-primary-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md">
            -{discountPct}%
          </span>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        {/* Name + Delete */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-black-800 text-sm leading-snug line-clamp-2">
              {product.name}
            </p>
            <VariantBadges options={product.selected_variant_options} />
          </div>
          <button
            onClick={() => dispatch(removeFromCart({ index }))}
            className="flex-shrink-0 w-7 h-7 rounded-lg border border-black-200 flex items-center justify-center text-black-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 active:scale-95 transition-all"
          >
            <Trash2 size={13} />
          </button>
        </div>

        {/* Price row */}
        <div className="mt-1.5 flex items-center gap-2 flex-wrap">
          <span className="font-bold text-black-900 text-sm">
            ৳{product.sale_price.toLocaleString()}
          </span>
          {saving > 0 && (
            <>
              <span className="text-xs text-black-400 line-through">
                ৳{product.without_discount_price.toLocaleString()}
              </span>
              <span className="text-[10px] text-green-700 bg-green-50 border border-green-100 rounded-md px-1.5 py-0.5 font-semibold">
                −৳{saving}
              </span>
            </>
          )}
        </div>

        {/* Qty + Total */}
        <div className="mt-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center rounded-xl border border-black-200 overflow-hidden bg-black-50">
            <button
              onClick={() => dispatch(updateQuantity({ index, quantity: product.quantity - 1 }))}
              className="w-8 h-8 flex items-center justify-center text-black-500 hover:bg-primary-100 hover:text-primary-600 active:bg-primary-200 transition-colors touch-manipulation"
            >
              <Minus size={13} />
            </button>
            <span className="w-9 text-center text-sm font-bold text-black-800">
              {product.quantity}
            </span>
            <button
              onClick={() => dispatch(updateQuantity({ index, quantity: product.quantity + 1 }))}
              className="w-8 h-8 flex items-center justify-center text-black-500 hover:bg-primary-100 hover:text-primary-600 active:bg-primary-200 transition-colors touch-manipulation"
            >
              <Plus size={13} />
            </button>
          </div>

          <div className="text-right">
            <p className="text-[9px] text-black-400 uppercase tracking-wider font-medium">Total</p>
            <p className="font-bold text-primary-500 text-sm">
              ৳{(product.sale_price * product.quantity).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Recommended Card ─────────────────────────────────────────────────────────
const RecommendedCard = ({ item }: { item: any }) => {
  const dispatch = useAppDispatch();
  const price = item.price ?? 0;
  const compareAtPrice = item.compareAtPrice ?? 0;
  const discountPct =
    compareAtPrice > price ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0;
  const imgSrc = item.thumbnail?.url ?? FALLBACK_IMAGE;
  const href = `/product-details/${item.category?.slug ?? 'category'}/${item.slug}`;

  return (
    <div className="bg-white rounded-2xl border border-black-200 overflow-hidden hover:border-primary-300 hover:shadow-lg transition-all duration-200 group flex flex-col">
      <Link href={href} className="flex-1">
        {/* Image */}
        <div className="relative aspect-square bg-black-50 overflow-hidden">
          <img
            src={imgSrc}
            alt={item.name}
            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
          />
          {discountPct > 0 && (
            <span className="absolute top-2 left-2 bg-primary-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
              <Flame size={8} /> -{discountPct}%
            </span>
          )}
          {item.category?.name && (
            <span className="absolute bottom-2 right-2 text-[9px] font-semibold text-black-500 bg-white/90 backdrop-blur-sm border border-black-100 px-1.5 py-0.5 rounded-md truncate max-w-[70%]">
              {item.category.name}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-2.5 pb-1.5">
          <p className="text-[11px] font-semibold text-black-800 line-clamp-2 leading-snug">
            {item.name}
          </p>
          {item.rating > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <Stars rating={item.rating} />
              {item.reviews > 0 && (
                <span className="text-[9px] text-black-400">({item.reviews})</span>
              )}
            </div>
          )}
          <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-sm text-black-900">
              ৳{price.toLocaleString('en-US')}
            </span>
            {compareAtPrice > price && (
              <span className="text-[10px] text-black-400 line-through">
                ৳{compareAtPrice.toLocaleString('en-US')}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Add button */}
      <div className="px-2.5 pb-2.5 pt-1">
        <button
          onClick={() =>
            dispatch(
              addToCart({
                product_id: item.id,
                name: item.name,
                image: imgSrc,
                sale_price: price,
                without_discount_price: compareAtPrice || price,
                quantity: 1,
              }),
            )
          }
          className="w-full flex items-center justify-center gap-1 py-2 text-[11px] font-semibold bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-all active:scale-95 touch-manipulation"
        >
          <Plus size={11} />
          Add to Cart
        </button>
      </div>
    </div>
  );
};

// ─── Recommended Skeleton ─────────────────────────────────────────────────────
const RecommendedSkeleton = () => (
  <div className="rounded-2xl border border-black-200 overflow-hidden animate-pulse bg-white">
    <div className="aspect-square bg-black-200" />
    <div className="p-2.5 space-y-2">
      <div className="h-3 bg-black-200 rounded w-full" />
      <div className="h-3 bg-black-200 rounded w-3/4" />
      <div className="h-4 bg-black-200 rounded w-2/5 mt-0.5" />
      <div className="h-8 bg-black-200 rounded-xl w-full mt-1" />
    </div>
  </div>
);

// ─── Quick Add Search ─────────────────────────────────────────────────────────
const QuickAddSearch = () => {
  const dispatch = useAppDispatch();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [page, setPage] = useState(1);
  const [accumulated, setAccumulated] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 350);
    return () => clearTimeout(t);
  }, [query]);

  // Reset on new search
  useEffect(() => {
    setPage(1);
    setAccumulated([]);
    setHasMore(true);
  }, [debouncedQuery]);

  const { data, isFetching } = useGetShopProductsQuery(
    { search: debouncedQuery, page, limit: 10 },
    { skip: debouncedQuery.trim().length < 1 },
  );

  // Accumulate pages
  useEffect(() => {
    if (!data?.data?.data) return;
    const items: any[] = data.data.data;
    setAccumulated((prev) => (page === 1 ? items : [...prev, ...items]));
    const meta = data.data.meta;
    setHasMore(meta ? meta.currentPage < meta.totalPages : items.length === 10);
  }, [data]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      if (scrollTop + clientHeight >= scrollHeight - 15 && hasMore && !isFetching) {
        setPage((p) => p + 1);
      }
    },
    [hasMore, isFetching],
  );

  const handleAdd = (item: any) => {
    const price = item.price ?? 0;
    const compareAt = item.compareAtPrice ?? price;
    dispatch(
      addToCart({
        product_id: item.id,
        name: item.name,
        image: item.thumbnail?.url ?? undefined,
        sale_price: price,
        without_discount_price: compareAt,
        quantity: 1,
      }),
    );
  };

  const showDropdown =
    open && debouncedQuery.trim().length > 0 && (isFetching || accumulated.length > 0);

  return (
    <div className="relative mb-4" ref={dropdownRef}>
      <div className="relative flex items-center">
        <Search size={15} className="absolute left-3 text-black-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search products to add..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border border-black-200 bg-white placeholder-black-300 text-black-800 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 text-black-300 hover:text-black-500"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {showDropdown && (
        <div
          onScroll={handleScroll}
          className="absolute z-50 top-full mt-1.5 w-full bg-white border border-black-200 rounded-2xl shadow-xl max-h-72 overflow-y-auto [scrollbar-width:thin]"
        >
          {accumulated.length === 0 && isFetching ? (
            <div className="px-4 py-4 text-sm text-black-400 text-center">Searching...</div>
          ) : (
            <>
              {accumulated.map((item: any) => {
                const price = item.price ?? 0;
                const compareAt = item.compareAtPrice ?? 0;
                const discount =
                  compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : 0;
                const imgSrc = item.thumbnail?.url;
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-black-50 border-b border-black-100 last:border-0 transition-colors"
                  >
                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-black-100 flex-shrink-0 border border-black-200">
                      {imgSrc ? (
                        <img
                          src={imgSrc}
                          alt={item.name}
                          className="w-full h-full object-contain p-0.5"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-black-300">
                          <ShoppingBag size={18} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-black-800 truncate">{item.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-sm font-bold text-black-900">
                          ৳{price.toLocaleString()}
                        </span>
                        {discount > 0 && (
                          <span className="text-[10px] text-green-700 bg-green-50 rounded px-1.5 py-0.5 font-medium">
                            -{discount}%
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleAdd(item)}
                      className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold text-white bg-primary-500 hover:bg-primary-600 active:scale-95 px-3 py-1.5 rounded-lg transition-all"
                    >
                      <Plus size={12} /> Add
                    </button>
                  </div>
                );
              })}
              {isFetching && (
                <div className="px-4 py-2 text-xs text-black-400 text-center">Loading more...</div>
              )}
              {!isFetching && !hasMore && accumulated.length > 0 && (
                <div className="px-4 py-2 text-xs text-black-400 text-center border-t border-black-100">
                  All results shown
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main Cart Page ───────────────────────────────────────────────────────────
const ShippingCartPage = () => {
  const dispatch = useAppDispatch();
  const products = useAppSelector((store) => store.cart.products);
  const totalPrice = useAppSelector((store) => store.cart.totalPrice);
  const subTotal = useAppSelector((store) => store.cart.subTotal);
  const discount = useAppSelector((store) => store.cart.discount);
  const selectedItems = useAppSelector((store) => store.cart.selectedItems);

  const { data: recData, isLoading: recLoading } = useGetShopProductsQuery({
    page: 1,
    limit: 10,
    sort: 'newest',
  });
  const recommended: any[] = recData?.data?.data ?? [];

  // ── Empty State ──
  if (products.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5 px-4">
        <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center">
          <ShoppingBag size={40} className="text-primary-500" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-black-800 mb-1">Your cart is empty</h2>
          <p className="text-sm text-black-400">Looks like you haven't added anything yet.</p>
        </div>
        <Link href="/shop">
          <button className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors">
            <ArrowLeft size={16} />
            Continue Shopping
          </button>
        </Link>

        <div className="w-full max-w-xl mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Flame size={15} className="text-primary-500" />
            <p className="text-sm font-bold text-black-800">You might like these</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {recLoading
              ? Array.from({ length: 6 }).map((_, i) => <RecommendedSkeleton key={i} />)
              : recommended
                  .slice(0, 6)
                  .map((item) => <RecommendedCard key={item.id} item={item} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container py-4 md:py-10 pb-28 lg:pb-10">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div>
            <h1 className="text-lg md:text-2xl font-bold text-black-900">Shopping Cart</h1>
            <p className="text-xs text-black-400 mt-0.5">
              {selectedItems} item{selectedItems !== 1 ? 's' : ''} in your cart
            </p>
          </div>
          <Link href="/">
            <button className="flex items-center gap-1.5 text-sm text-black-500 hover:text-primary-500 transition-colors">
              <ArrowLeft size={15} />
              <span className="hidden sm:inline">Continue Shopping</span>
            </button>
          </Link>
        </div>

        {/* 2-Col Layout */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          {/* LEFT: Cart Items */}
          <div className="flex-1 w-full min-w-0 flex flex-col gap-3">
            <QuickAddSearch />

            <div className="flex items-center justify-between px-1">
              <span className="text-xs text-black-500 font-medium">
                {products.length} product{products.length !== 1 ? 's' : ''}
              </span>
              <button
                onClick={() => dispatch(clearCart())}
                className="text-xs text-black-400 hover:text-red-500 transition-colors flex items-center gap-1 touch-manipulation"
              >
                <Trash2 size={11} /> Clear all
              </button>
            </div>

            {products.map((product: any, index: number) => (
              <CartRow key={index} product={product} index={index} />
            ))}
          </div>

          {/* RIGHT: Order Summary — hidden on mobile (shown in sticky bar) */}
          <div className="hidden lg:block w-80 flex-shrink-0 lg:sticky lg:top-24">
            <div className="bg-white rounded-2xl border border-black-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-black-100">
                <h3 className="font-semibold text-black-800 text-base">Order Summary</h3>
              </div>

              <div className="px-5 py-4 flex flex-col gap-3">
                <div className="flex justify-between text-sm text-black-500">
                  <span>Subtotal ({selectedItems} items)</span>
                  <span>৳{subTotal.toFixed(0)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-black-500">Product Discount</span>
                    <span className="text-green-700 font-medium">−৳{discount.toFixed(0)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-black-500">Delivery</span>
                  <span className="text-green-700 font-medium">FREE</span>
                </div>

                <div className="flex items-center gap-2 mt-1 p-3 rounded-xl border border-dashed border-primary-300 bg-primary-100/40 cursor-pointer hover:bg-primary-100 transition-colors">
                  <Tag size={13} className="text-primary-500 flex-shrink-0" />
                  <span className="text-xs text-primary-600 font-medium">Apply coupon code</span>
                  <ChevronRight size={13} className="text-primary-400 ml-auto" />
                </div>

                <div className="border-t border-dashed border-black-200 pt-3 flex justify-between items-center">
                  <span className="font-semibold text-black-800 text-sm">Total Payable</span>
                  <span className="font-bold text-primary-500 text-xl">
                    ৳{totalPrice.toFixed(0)}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="bg-green-50 border border-green-100 rounded-xl px-3 py-2 text-center">
                    <p className="text-xs text-green-700 font-medium">
                      🎉 You're saving ৳{discount.toFixed(0)} on this order!
                    </p>
                  </div>
                )}
              </div>

              <div className="px-5 pb-5">
                <Link href="/enjoy/checkout">
                  <button className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 active:scale-[.98] text-white text-sm font-semibold py-3.5 rounded-xl transition-all duration-200">
                    Proceed to Checkout
                    <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <ChevronRight size={14} />
                    </span>
                  </button>
                </Link>
                <p className="text-center text-[11px] text-black-400 mt-3">
                  Secure checkout · Free returns
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Order Summary (above checkout bar) */}
          <div className="w-full lg:hidden bg-white rounded-2xl border border-black-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-black-100">
              <h3 className="font-semibold text-black-800 text-sm">Order Summary</h3>
            </div>
            <div className="px-4 py-3 flex flex-col gap-2.5">
              <div className="flex justify-between text-sm text-black-500">
                <span>Subtotal ({selectedItems} items)</span>
                <span className="font-medium text-black-700">৳{subTotal.toFixed(0)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-black-500">Discount</span>
                  <span className="text-green-700 font-semibold">−৳{discount.toFixed(0)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-black-500">Delivery</span>
                <span className="text-green-700 font-semibold">FREE</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-dashed border-primary-300 bg-primary-50 cursor-pointer">
                <Tag size={12} className="text-primary-500 flex-shrink-0" />
                <span className="text-xs text-primary-600 font-medium">Apply coupon code</span>
                <ChevronRight size={12} className="text-primary-400 ml-auto" />
              </div>
              <div className="border-t border-dashed border-black-200 pt-2.5 flex justify-between items-center">
                <span className="font-semibold text-black-800 text-sm">Total Payable</span>
                <span className="font-bold text-primary-500 text-lg">৳{totalPrice.toFixed(0)}</span>
              </div>
              {discount > 0 && (
                <div className="bg-green-50 border border-green-100 rounded-xl px-3 py-2 text-center">
                  <p className="text-xs text-green-700 font-semibold">
                    🎉 Saving ৳{discount.toFixed(0)} on this order!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* You might also like */}
        {(recLoading || recommended.length > 0) && (
          <div className="mt-10 md:mt-14">
            {/* Section header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary-100 flex items-center justify-center">
                  <Flame size={15} className="text-primary-500" />
                </div>
                <div>
                  <h2 className="font-bold text-black-900 text-base leading-tight">
                    You might also like
                  </h2>
                  <p className="text-[10px] text-black-400 leading-tight">
                    Hand-picked just for you
                  </p>
                </div>
              </div>
              <Link
                href="/shop"
                className="flex items-center gap-0.5 text-xs text-primary-500 hover:text-primary-600 font-semibold border border-primary-200 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-all"
              >
                See all <ChevronRight size={12} />
              </Link>
            </div>

            {/* Grid: 2 cols mobile → 3 sm → 4 md → 5 lg */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {recLoading
                ? Array.from({ length: 10 }).map((_, i) => <RecommendedSkeleton key={i} />)
                : recommended.map((item) => <RecommendedCard key={item.id} item={item} />)}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Checkout Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 backdrop-blur-md border-t border-black-200 px-4 py-3 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <div className="flex-shrink-0">
            <p className="text-[10px] text-black-400 font-medium uppercase tracking-wide">Total</p>
            <p className="text-xl font-bold text-primary-500 leading-tight">
              ৳{totalPrice.toFixed(0)}
            </p>
            {discount > 0 && (
              <p className="text-[9px] text-green-600 font-medium">−৳{discount.toFixed(0)} saved</p>
            )}
          </div>
          <Link href="/enjoy/checkout" className="flex-1">
            <button className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 active:scale-[.98] text-white text-sm font-bold py-3.5 rounded-2xl transition-all duration-200 shadow-lg shadow-primary-500/30 touch-manipulation">
              Proceed to Checkout
              <ChevronRight size={16} />
            </button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default ShippingCartPage;
