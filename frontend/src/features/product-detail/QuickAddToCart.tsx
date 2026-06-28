'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { simplePricePreview } from '@/helpers/CommonMethod';
import { addToCart } from '@/redux/features/cartSlice';
import { useAppDispatch } from '@/redux/hooks';
import Image from 'next/image';
import { cartMenuToggle } from '@/redux/features/toggleSlice';

const QuickAddToCart = ({ product }: any) => {
  const dispatch = useAppDispatch();

  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // ─── Initialize: auto-select first value of each option ───────────────────
  useEffect(() => {
    if (!product?.options?.length) return;
    const initial: Record<string, string> = {};
    product.options.forEach((opt: any) => {
      if (opt.values?.length) {
        initial[opt.id] = opt.values[0].id;
      }
    });
    setSelectedOptions(initial);
  }, [product]);

  // ─── Derive matched variant ────────────────────────────────────────────────
  const matchedVariant = React.useMemo(() => {
    if (!product?.variants?.length) return null;
    const selectedValueIds = Object.values(selectedOptions);
    if (!selectedValueIds.length) return null;

    return (
      product.variants.find((variant: any) => {
        const variantValueIds = variant.variantOptionValues.map((v: any) => v.option_value_id);
        return (
          selectedValueIds.length === variantValueIds.length &&
          selectedValueIds.every((id) => variantValueIds.includes(id))
        );
      }) ?? null
    );
  }, [selectedOptions, product]);

  // ─── Active price ──────────────────────────────────────────────────────────
  const activePrice = matchedVariant?.price ?? product?.basePrice ?? product?.price ?? 0;
  const activeComparePrice = matchedVariant?.compareAtPrice ?? product?.compareAtPrice;

  const discountPercent = simplePricePreview({
    price: parseFloat(activePrice),
    comparePrice: activeComparePrice ? parseFloat(activeComparePrice) : undefined,
  });

  // ─── Option value status ───────────────────────────────────────────────────
  const getValueStatus = (
    optionId: string,
    valueId: string,
  ): 'inStock' | 'outOfStock' | 'noVariant' => {
    const hypothetical = { ...selectedOptions, [optionId]: valueId };
    const hypotheticalValueIds = Object.values(hypothetical);

    const matched = product.variants.find((variant: any) => {
      const variantValueIds = variant.variantOptionValues.map((v: any) => v.option_value_id);
      return (
        hypotheticalValueIds.length === variantValueIds.length &&
        hypotheticalValueIds.every((id) => variantValueIds.includes(id))
      );
    });

    if (!matched) return 'noVariant';
    return matched.stock > 0 ? 'inStock' : 'outOfStock';
  };

  // ─── Build selected variant options label map ──────────────────────────────
  const buildSelectedVariantOptions = (): Record<string, string> => {
    if (!product?.options?.length) return {};
    return product.options.reduce((acc: Record<string, string>, option: any) => {
      const selectedValueId = selectedOptions[option.id];
      if (!selectedValueId) return acc;
      const matched = option.values.find((v: any) => v.id === selectedValueId);
      if (matched) acc[option.name] = matched.value;
      return acc;
    }, {});
  };

  // ─── Add to cart ───────────────────────────────────────────────────────────
  const handleAddToCart = () => {
    try {
      const payload = {
        product_id: product.id,
        image: product.images?.[0]?.url,
        assigned_variant_price_id: matchedVariant?.id || '',
        name: product?.name,
        sale_price: parseFloat(activePrice),
        without_discount_price: parseFloat(activeComparePrice ?? activePrice),
        quantity,
        selected_variant_options: buildSelectedVariantOptions(),
      };
      dispatch(addToCart(payload));
      dispatch(cartMenuToggle());
    } catch (error) {
      console.log(error, 'error');
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm space-y-4">
      <h3 className="text-lg font-medium text-black-800">Quick Add to Cart</h3>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* Product image + price */}
        <div className="flex items-center gap-4">
          {product?.images?.[0]?.url && (
            <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-black-100">
              <Image
                width={80}
                height={80}
                src={product.images[0].url}
                alt={product?.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div>
            <p className="text-sm text-black-500 line-clamp-2">{product?.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg font-bold text-black-800">
                {parseFloat(activePrice).toFixed(2)} ৳
              </span>
              {activeComparePrice && (
                <span className="text-sm text-black-400 line-through">
                  {parseFloat(activeComparePrice).toFixed(2)} ৳
                </span>
              )}
              {discountPercent !== null && (
                <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                  -{discountPercent}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Options */}
        {product?.options?.length > 0 && (
          <div className="space-y-3">
            {product.options.map((option: any) => (
              <div key={option.id}>
                <p className="text-xs font-semibold text-black-600 mb-1.5">
                  {option.name}
                  {selectedOptions[option.id] && (
                    <span className="ml-1.5 font-normal text-black-400">
                      : {option.values.find((v: any) => v.id === selectedOptions[option.id])?.value}
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {option.values.map((val: any) => {
                    const isSelected = selectedOptions[option.id] === val.id;
                    const status = getValueStatus(option.id, val.id);
                    const isColor = option.name.toLowerCase() === 'color';

                    return (
                      <button
                        key={val.id}
                        onClick={() =>
                          setSelectedOptions((prev) => ({ ...prev, [option.id]: val.id }))
                        }
                        disabled={status === 'noVariant'}
                        title={
                          status === 'outOfStock'
                            ? 'Out of stock'
                            : status === 'noVariant'
                              ? 'Not available'
                              : val.value
                        }
                        className={`
                        relative px-2.5 py-1 rounded-md text-xs font-medium transition-all border-2
                        ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : status === 'noVariant'
                              ? 'border border-black-200 text-black-300 cursor-not-allowed opacity-40'
                              : 'border border-black-300 text-black-600 hover:border-primary-400'
                        }
                      `}
                      >
                        {isColor && (
                          <span
                            className="inline-block w-3.5 h-3.5 rounded-full mr-1 align-middle border border-black-200"
                            style={{ backgroundColor: val.colorHex || val.value.toLowerCase() }}
                          />
                        )}
                        {val.value}
                        {isSelected && (
                          <span className="absolute -top-1.5 -right-1.5 bg-primary-500 rounded-full w-3.5 h-3.5 flex items-center justify-center">
                            <Check size={8} className="text-white" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="hidden sm:flex items-center gap-3">
          <span className="text-xs font-medium text-black-600">Qty:</span>
          <div className="flex items-center border border-black-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="px-3 py-1.5 text-black-600 hover:bg-black-100 disabled:opacity-40 transition-colors text-sm"
            >
              -
            </button>
            <span className="w-8 text-center text-sm font-medium">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="px-3 py-1.5 text-black-600 hover:bg-black-100 transition-colors text-sm"
            >
              +
            </button>
          </div>
        </div>

        {/* Add to Cart button */}
        <div className="hidden sm:block">
          <button
            onClick={handleAddToCart}
            disabled={matchedVariant !== null && matchedVariant.stock === 0}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white px-4 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <ShoppingCart size={18} />
            Add to Cart
          </button>
        </div>
        {/* Quantity */}
        <div className=" sm:hidden flex justify-between items-center gap-1">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-black-600">Qty:</span>
            <div className="flex items-center border border-black-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="px-3 py-1.5 text-black-600 hover:bg-black-100 disabled:opacity-40 transition-colors text-sm"
              >
                -
              </button>
              <span className="w-8 text-center text-sm font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-3 py-1.5 text-black-600 hover:bg-black-100 transition-colors text-sm"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart button */}
          <div>
            <button
              onClick={handleAddToCart}
              disabled={matchedVariant !== null && matchedVariant.stock === 0}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white px-4 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <ShoppingCart size={18} />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickAddToCart;
