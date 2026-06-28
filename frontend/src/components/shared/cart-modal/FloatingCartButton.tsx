'use client';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { cartMenuToggle } from '@/redux/features/toggleSlice';
import { FaBagShopping } from 'react-icons/fa6';

const FloatingCartButton = () => {
  const dispatch = useAppDispatch();
  const products = useAppSelector((store) => store.cart.products);
  const totalPrice = useAppSelector((store) => store.cart.totalPrice);
  const count = products?.length ?? 0;
  if (count === 0) return null;
  return (
    <button
      onClick={() => dispatch(cartMenuToggle())}
      aria-label={`Open cart — ${count} items`}
      className="fixed right-0 top-1/2 -translate-y-1/2 z-50 group flex flex-col items-center min-w-[70px] bg-white rounded-l-2xl shadow-[-8px_0px_24px_rgba(0,0,0,0.15)] overflow-hidden cursor-pointer  duration-300  border-y border-l border-primary-100"
    >
      {/* Upper Part: Icon & Count */}
      <div className="bg-primary-600 w-full pb-2 px-3 pt-5  flex flex-col items-center gap-1 transition-colors group-hover:bg-primary-700">
        <div className="relative">
          <FaBagShopping className="text-white text-xl transition-transform group-hover:scale-110" />
          {count > 0 && (
            <span className="absolute -top-2 -right-2 bg-white text-primary-600 text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full shadow-sm animate-bounce">
              {count}
            </span>
          )}
        </div>
        <span className="text-[10px] text-white font-semibold uppercase tracking-tighter">
          Cart
        </span>
      </div>

      {/* Lower Part: Total Price */}
      <div className="py-2 px-3 bg-white/90 backdrop-blur-sm w-full flex items-center justify-center">
        <span className="text-[13px] sm:text-sm font-bold text-gray-800 whitespace-nowrap">
          ৳ {Number(totalPrice).toLocaleString()}
        </span>
      </div>
    </button>
  );
};

export default FloatingCartButton;
