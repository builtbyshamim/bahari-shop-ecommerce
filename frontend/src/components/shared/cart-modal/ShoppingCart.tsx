'use client';

import { X, ShoppingBag, Trash2, ChevronRight, Tag, Minus, Plus } from 'lucide-react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { cartMenuToggle } from '@/redux/features/toggleSlice';
import { removeFromCart, updateQuantity } from '@/redux/features/cartSlice';

// ── VariantBadges ─────────────────────────────────────────────────────────────
const VariantBadges = ({ options }: { options?: Record<string, string> }) => {
  if (!options || Object.keys(options).length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {Object.entries(options).map(([key, value]) => {
        const isColor = key.toLowerCase() === 'color';

        return (
          <span
            key={key}
            className="inline-flex items-center gap-1 text-[10px] font-medium text-black-600 bg-black-100 border border-black-200 rounded-md px-1.5 py-0.5"
          >
            {/* Color swatch */}
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

// ── ProductCartItem ──────────────────────────────────────────────────────────
const ProductCartItem = ({ product, index }: { product: any; index: number }) => {
  const dispatch = useAppDispatch();
  const savingPerItem = product.without_discount_price - product.sale_price;

  return (
    <div className="flex gap-3 bg-white rounded-2xl p-3 border border-black-200 hover:border-primary-300 hover:shadow-sm transition-all duration-200">
      {/* Image */}
      <div className="w-20 h-20 rounded-xl overflow-hidden bg-black-100 border border-black-200 flex-shrink-0">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-black-400">
            <ShoppingBag size={22} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <p className="text-sm font-medium text-black-800 truncate leading-tight">{product.name}</p>

        {/* Variant option badges — e.g. Color: Maroon  Size: S */}
        <VariantBadges options={product.selected_variant_options} />

        {/* Price row */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-black-900">৳{product.sale_price}</span>
          {savingPerItem > 0 && (
            <span className="text-xs text-black-400 line-through">
              ৳{product.without_discount_price}
            </span>
          )}
          {savingPerItem > 0 && (
            <span className="text-[10px] font-medium text-green-700 bg-green-50 rounded px-1.5 py-0.5">
              −৳{savingPerItem}
            </span>
          )}
        </div>

        {/* Actions row */}
        <div className="flex items-center justify-between mt-auto">
          {/* Qty control */}
          <div className="flex items-center border border-black-200 rounded-lg overflow-hidden bg-black-100">
            <button
              onClick={() => dispatch(updateQuantity({ index, quantity: product.quantity - 1 }))}
              className="w-7 h-7 flex items-center justify-center text-black-600 hover:bg-primary-100 hover:text-primary-600 transition-colors"
            >
              <Minus size={12} />
            </button>
            <span className="w-8 text-center text-sm font-medium text-black-800">
              {product.quantity}
            </span>
            <button
              onClick={() => dispatch(updateQuantity({ index, quantity: product.quantity + 1 }))}
              className="w-7 h-7 flex items-center justify-center text-black-600 hover:bg-primary-100 hover:text-primary-600 transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* Line total */}
          <span className="text-xs font-semibold text-black-700">
            ৳{(product.sale_price * product.quantity).toFixed(0)}
          </span>

          {/* Remove */}
          <button
            onClick={() => dispatch(removeFromCart({ index }))}
            className="w-7 h-7 rounded-lg border border-black-200 flex items-center justify-center text-black-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ── ShoppingCart ─────────────────────────────────────────────────────────────
const ShoppingCart = () => {
  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.sidebarToggle.cartValue);
  const products = useAppSelector((store) => store.cart.products);
  const totalPrice = useAppSelector((store) => store.cart.totalPrice);
  const subTotal = useAppSelector((store) => store.cart.subTotal);
  const discount = useAppSelector((store) => store.cart.discount);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => dispatch(cartMenuToggle())}
        className={`fixed inset-0 z-60 bg-black-900/60 backdrop-blur-sm transition-all duration-300 ${
          open ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[400px] max-w-full bg-black-100 z-[100] flex flex-col transform transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] shadow-2xl ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-black-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center">
              <ShoppingBag size={17} className="text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-black-900 text-base leading-tight">My Cart</h2>
              <p className="text-[11px] text-black-400 leading-tight">
                {products.length} item{products.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => dispatch(cartMenuToggle())}
            className="w-8 h-8 rounded-full border border-black-200 flex items-center justify-center text-black-500 hover:bg-black-100 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Items */}
        {products.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
              <ShoppingBag size={32} className="text-primary-500" />
            </div>
            <div>
              <p className="font-medium text-black-700 text-sm">Your cart is empty</p>
              <p className="text-xs text-black-400 mt-1">Add products to get started</p>
            </div>
            <button
              onClick={() => dispatch(cartMenuToggle())}
              className="mt-2 px-5 py-2 text-sm font-medium bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 [scrollbar-width:thin]">
            {products.map((product: any, index: number) => (
              <ProductCartItem key={index} product={product} index={index} />
            ))}
          </div>
        )}

        {/* Summary Footer */}
        {products.length > 0 && (
          <div className="bg-white border-t border-black-200 px-5 pt-4 pb-5">
            <div className="flex flex-col gap-2.5 mb-4">
              <div className="flex justify-between items-center text-sm text-black-500">
                <span>Subtotal</span>
                <span>৳{subTotal.toFixed(0)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-black-500">Discount</span>
                  <span className="text-green-700 font-medium">−৳{discount.toFixed(0)}</span>
                </div>
              )}
              <div className="border-t border-dashed border-black-200 pt-2.5 flex justify-between items-center">
                <span className="font-semibold text-black-800 text-sm">Total</span>
                <span className="font-bold text-primary-500 text-xl">৳{totalPrice.toFixed(0)}</span>
              </div>
            </div>

            {/* Coupon row */}
            <button className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-primary-300 bg-primary-100/50 text-primary-600 text-xs font-medium hover:bg-primary-100 transition-colors mb-3">
              <Tag size={13} />
              <span>Have a coupon code? Apply here</span>
            </button>

            {/* Checkout */}
            <Link href="/enjoy/checkout">
              <button
                onClick={() => dispatch(cartMenuToggle())}
                className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 active:scale-[.98] text-white text-sm font-semibold py-3.5 rounded-xl transition-all duration-200"
              >
                Proceed to Checkout
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <ChevronRight size={14} />
                </span>
              </button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default ShoppingCart;
