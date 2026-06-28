'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Minus, Plus, ChevronDown, Trash2 } from 'lucide-react';
type ProductType = {
  id: string;
  name: string;
  brand?: string;
  price: number;
  discount?: number;
};

type ProductCartItemProps = {
  hasOptions?: boolean;
  product: ProductType;
};

export default function ProductCartItem({ hasOptions, product }: ProductCartItemProps) {
  const { id, name } = product;

  const [quantity, setQuantity] = useState(1);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [size, setSize] = useState('2XL');
  const [color, setColor] = useState('yellow');
  const sizeRef = useRef<HTMLDivElement>(null);
  const colorRef = useRef<HTMLDivElement>(null);

  const numericPrice = Number(product.price) || 0;

  const total = quantity * numericPrice;

  const handleRemove = () => {
    // dispatch(removeFromCart({ id }));
  };

  const handleQuantity = (actionType: 'increment' | 'decrement') => {
    setQuantity((prev) => {
      const newQ = actionType === 'increment' ? prev + 1 : Math.max(1, prev - 1);

      // dispatch(
      //   updatedQuantity({
      //     id,
      //     type: actionType,
      //   })
      // );

      return newQ;
    });
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sizeRef.current && !sizeRef.current.contains(e.target as Node)) setSizeOpen(false);
      if (colorRef.current && !colorRef.current.contains(e.target as Node)) setColorOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="bg-white p-4 ">
      {/* Top section */}
      <div className="flex gap-3">
        <div className="relative h-16 w-16 overflow-hidden rounded">
          <Image src="/product.png" alt={name} fill className="object-cover" />
        </div>

        <div className="flex flex-1 flex-row gap-1">
          <div className="flex justify-between flex-col w-full">
            <h3 className="text-xs font-medium text-gray-700">{name} </h3>
            <p className="text-xs text-gray-500">TK {total}</p>
          </div>

          <div className="mt-2 flex flex-col justify-between items-end gap-2">
            <button
              onClick={handleRemove}
              className="text-[#98A2B3] hover:text-[#EF4444] cursor-pointer"
            >
              <Trash2 size={14} />
            </button>

            <div className="flex h-8 items-center">
              <button
                onClick={() => handleQuantity('decrement')}
                className="flex text-black hover:text-green-bas h-full w-8 items-center justify-center border border-[#9CA3AF] cursor-pointer"
              >
                <Minus size={14} />
              </button>

              <span className="flex w-8 items-center justify-center text-sm font-medium text-[#1D2939] border-y border-[#9CA3AF] h-full">
                {quantity}
              </span>

              <button
                onClick={() => handleQuantity('increment')}
                className="flex h-full w-8 items-center justify-center text-black hover:text-green-base border border-[#9CA3AF] cursor-pointer"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {hasOptions && (
        <div className="mt-3 space-y-2 text-sm">
          {/* Size Selector */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Size:</span>
            <div ref={sizeRef} className="relative w-24">
              <button
                onClick={() => setSizeOpen(!sizeOpen)}
                className="flex justify-between items-center w-full px-3 py-1 bg-gray-100 rounded text-gray-500"
              >
                {size}
                <ChevronDown
                  size={14}
                  className={`transition-transform ${sizeOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {sizeOpen && (
                <div className="absolute top-full left-0 w-full bg-white border rounded shadow z-50">
                  {['XL', '2XL', '3XL'].map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setSize(s);
                        setSizeOpen(false);
                      }}
                      className={`w-full px-3 py-1 text-left hover:bg-gray-100 ${size === s ? 'bg-primary-500 text-white' : ''}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Color Selector */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Color:</span>
            <div ref={colorRef} className="relative w-24">
              <button
                onClick={() => setColorOpen(!colorOpen)}
                className="flex justify-between items-center w-full px-3 py-1 bg-gray-100 rounded text-gray-500"
              >
                <div className="flex items-center gap-1">
                  <span
                    className={`h-3 w-3 rounded-full ${
                      color === 'yellow'
                        ? 'bg-yellow-500'
                        : color === 'black'
                          ? 'bg-black'
                          : 'bg-blue-500'
                    }`}
                  />
                  {color}
                </div>
                <ChevronDown
                  size={14}
                  className={`transition-transform ${colorOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {colorOpen && (
                <div className="absolute top-full left-0 w-full bg-white border rounded shadow z-50">
                  {['yellow', 'black', 'blue'].map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setColor(c);
                        setColorOpen(false);
                      }}
                      className={`flex items-center gap-1 w-full px-3 py-1 text-left hover:bg-gray-100 ${
                        color === c ? 'bg-primary-500 text-white' : ''
                      }`}
                    >
                      <span
                        className={`h-3 w-3 rounded-full ${
                          c === 'yellow'
                            ? 'bg-yellow-500'
                            : c === 'black'
                              ? 'bg-black'
                              : 'bg-blue-500'
                        }`}
                      />
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Total */}
      <div className="mt-3 text-right font-medium text-gray-700">TK {total}</div>
    </div>
  );
}
